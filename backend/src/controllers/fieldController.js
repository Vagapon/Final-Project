const Field = require('../models/Field');
const mongoose = require('mongoose');
const { cloudinary } = require('../config/cloudinary');
const UserRole = require('../models/UserModel/UserRole');

// Hàm helper để kiểm tra user có phải ADMIN không
const isAdmin = async (userId) => {
  try {
    const userRole = await UserRole.findOne({ user_id: userId }).populate('role_id');
    if (!userRole || !userRole.role_id) return false;
    const roleCode = userRole.role_id.code?.toUpperCase();
    return roleCode === 'ADMIN';
  } catch (error) {
    console.error('Error checking if user is admin:', error);
    return false;
  }
};

// Hàm helper để kiểm tra staff có thể chỉnh sửa/xóa không (staff chỉ có thể chỉnh sửa dữ liệu của mình, không phải dữ liệu của admin)
const canStaffEdit = async (currentUserId, creatorId) => {
  const currentUserIsAdmin = await isAdmin(currentUserId);
  if (currentUserIsAdmin) return true; // Admin có thể chỉnh sửa tất cả
  
  if (!creatorId) return true; // Nếu không có người tạo, cho phép chỉnh sửa (để tương thích ngược)
  
  const creatorIsAdmin = await isAdmin(creatorId);
  if (creatorIsAdmin) return false; // Staff không thể chỉnh sửa dữ liệu của admin
  
  // Staff có thể chỉnh sửa dữ liệu của chính họ
  return creatorId?.toString() === currentUserId?.toString();
};

const getAllFields = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      purpose, 
      status, 
      location, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Tạo filter object
    const filter = {};
    
    if (purpose) filter.purpose = purpose;
    if (status) filter.status = status;
    if (location) filter.location = new RegExp(location, 'i');
    
    // Tìm kiếm theo text
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { fieldNumber: new RegExp(search, 'i') },
        { address: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }

    // Tạo sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Tính toán pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Lấy fields với populate thông tin managedBy
    const fields = await Field.find(filter)
      .populate('managedBy', 'name email')
      .populate('sportTypeId', 'name code')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Đếm tổng số fields
    const total = await Field.countDocuments(filter);

    // Populate managedBy role để kiểm tra quyền
    const fieldsWithRole = await Promise.all(fields.map(async (field) => {
      const fieldObj = field.toObject();
      if (fieldObj.managedBy) {
        const managedByRole = await UserRole.findOne({ user_id: fieldObj.managedBy._id || fieldObj.managedBy }).populate('role_id');
        const roleCode = managedByRole?.role_id?.code || null;
        fieldObj.managedByRole = roleCode;
      }
      return fieldObj;
    }));

    res.status(200).json({
      success: true,
      data: fieldsWithRole,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error getting fields:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách sân',
      error: error.message
    });
  }
}

const getFieldById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID sân không hợp lệ'
      });
    }

    const field = await Field.findById(id)
      .populate('managedBy', 'name email phone')
      .populate('sportTypeId', 'name code');

    if (!field) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sân'
      });
    }

    res.status(200).json({
      success: true,
      data: field
    });
  } catch (error) {
    console.error('Error getting field by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thông tin sân',
      error: error.message
    });
  }
}

// @desc    Tạo sân mới
// @route   POST /api/fields
// @access  Private (Admin/Staff)
const createField = async (req, res) => {
  try {

    const {
      name,
      fieldNumber,
      address,
      location,
      sportTypeId,
      purpose,
      pricePerHour,
      status = 'active',
      description
    } = req.body;

    // Parse openingHours từ JSON string
    let openingHours;
    try {
      openingHours = req.body.openingHours ? JSON.parse(req.body.openingHours) : null;
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Định dạng giờ hoạt động không hợp lệ'
      });
    }

    // Validation cơ bản
    if (!name || !fieldNumber || !address || !purpose || !sportTypeId || !openingHours?.start || !openingHours?.end) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc'
      });
    }

    // Kiểm tra sportTypeId hợp lệ
    if (!mongoose.Types.ObjectId.isValid(sportTypeId)) {
      return res.status(400).json({
        success: false,
        message: 'Sport Type ID không hợp lệ'
      });
    }

    // Kiểm tra sân đã tồn tại chưa
    const existingField = await Field.findOne({
      name: name,
      fieldNumber: fieldNumber,
      address: address
    });

    if (existingField) {
      return res.status(400).json({
        success: false,
        message: 'Sân này đã tồn tại'
      });
    }

    // Validation cho purpose và pricePerHour
    if (purpose === 'rental') {
      if (!pricePerHour || pricePerHour <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Sân thuê phải có giá thuê hợp lệ'
        });
      }
      if (pricePerHour < 1000) {
        return res.status(400).json({
          success: false,
          message: 'Giá thuê tối thiểu 1000 VNĐ'
        });
      }
      if (pricePerHour > 1000000) {
        return res.status(400).json({
          success: false,
          message: 'Giá thuê không được vượt quá 1,000,000 VNĐ'
        });
      }
    }

    // Xử lý upload ảnh từ Cloudinary
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => file.path);
    }

    // Tạo field mới
    const newField = new Field({
      name,
      fieldNumber,
      address,
      location,
      sportTypeId,
      purpose,
      pricePerHour: purpose === 'rental' ? pricePerHour : undefined,
      openingHours,
      status,
      managedBy: req.user.id, // Lấy từ middleware auth
      images,
      description
    });

    const savedField = await newField.save();
    await savedField.populate('managedBy', 'name email');
    await savedField.populate('sportTypeId', 'name code');

    res.status(201).json({
      success: true,
      message: 'Tạo sân thành công',
      data: savedField
    });
  } catch (error) {
    console.error('Error creating field:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo sân',
      error: error.message
    });
  }
}

// @desc    Cập nhật thông tin sân
// @route   PUT /api/fields/:id
// @access  Private (Admin/Staff)
const updateField = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    console.log('Update field data:', updateData);

    // Parse openingHours từ JSON string nếu có
    if (updateData.openingHours && typeof updateData.openingHours === 'string') {
      try {
        updateData.openingHours = JSON.parse(updateData.openingHours);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Định dạng giờ hoạt động không hợp lệ'
        });
      }
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID sân không hợp lệ'
      });
    }

    // Kiểm tra sportTypeId nếu có
    if (updateData.sportTypeId && !mongoose.Types.ObjectId.isValid(updateData.sportTypeId)) {
      return res.status(400).json({
        success: false,
        message: 'Sport Type ID không hợp lệ'
      });
    }

    // Kiểm tra sân có tồn tại không
    const existingField = await Field.findById(id);
    if (!existingField) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sân'
      });
    }

    // Kiểm tra quyền: Staff không thể chỉnh sửa/xóa sân được tạo bởi Admin
    const canEdit = await canStaffEdit(req.user.id, existingField.managedBy);
    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền chỉnh sửa sân này. Chỉ có thể xem.'
      });
    }

    // Validation cho purpose và pricePerHour
    if (updateData.purpose === 'rental') {
      const pricePerHour = parseFloat(updateData.pricePerHour);
      if (!pricePerHour || pricePerHour <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Sân thuê phải có giá thuê hợp lệ'
        });
      }
      if (pricePerHour < 1000) {
        return res.status(400).json({
          success: false,
          message: 'Giá thuê tối thiểu 1,000 VNĐ'
        });
      }
      if (pricePerHour > 1000000) {
        return res.status(400).json({
          success: false,
          message: 'Giá thuê không được vượt quá 1,000,000 VNĐ'
        });
      }
      updateData.pricePerHour = pricePerHour;
    }

    // Nếu đổi purpose từ rental sang event, xóa pricePerHour
    if (updateData.purpose === 'event') {
      updateData.pricePerHour = undefined;
    }

    // Xử lý ảnh
    let finalImages = [];
    
    // Thêm ảnh mới nếu có
    if (req.files && req.files.length > 0) {
      finalImages = req.files.map(file => file.path);
    }
    
    // Xử lý ảnh existing nếu có
    if (updateData.existingImages) {
      let existingImages = [];
      try {
        existingImages = JSON.parse(updateData.existingImages);
        finalImages = [...finalImages, ...existingImages];
      } catch (error) {
        console.error('Error parsing existing images:', error);
      }
    }
    
    // Nếu có ảnh mới hoặc existing, cập nhật
    if (finalImages.length > 0) {
      // Xóa ảnh cũ khỏi Cloudinary (chỉ những ảnh không được giữ lại)
      if (existingField.images && existingField.images.length > 0) {
        const existingImages = updateData.existingImages ? JSON.parse(updateData.existingImages) : [];
        
        for (const imageUrl of existingField.images) {
          // Chỉ xóa nếu ảnh không được giữ lại
          if (!existingImages.includes(imageUrl)) {
            try {
              // Extract public_id từ URL
              const publicId = imageUrl.split('/').pop().split('.')[0];
              await cloudinary.uploader.destroy(`field_images/${publicId}`);
            } catch (error) {
              console.error('Error deleting old image:', error);
            }
          }
        }
      }
      
      updateData.images = finalImages;
    }
    
    // Xóa trường existingImages khỏi updateData
    delete updateData.existingImages;

    // Cập nhật field
    const updatedField = await Field.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('managedBy', 'name email')
     .populate('sportTypeId', 'name code');

    res.status(200).json({
      success: true,
      message: 'Cập nhật sân thành công',
      data: updatedField
    });
  } catch (error) {
    console.error('Error updating field:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật sân',
      error: error.message
    });
  }
}

// @desc    Xóa sân
// @route   DELETE /api/fields/:id
// @access  Private (Admin only)
const deleteField = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID sân không hợp lệ'
      });
    }

    // Kiểm tra sân có tồn tại không
    const field = await Field.findById(id);
    if (!field) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sân'
      });
    }

    // Check permission: Staff cannot delete fields created by Admin
    const canDelete = await canStaffEdit(req.user.id, field.managedBy);
    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa sân này. Chỉ có thể xem.'
      });
    }

    // Xóa ảnh khỏi Cloudinary trước khi xóa field
    if (field.images && field.images.length > 0) {
      for (const imageUrl of field.images) {
        try {
          // Extract public_id từ URL
          const publicId = imageUrl.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`field_images/${publicId}`);
        } catch (error) {
          console.error('Error deleting image from Cloudinary:', error);
        }
      }
    }

    // TODO: Kiểm tra xem sân có đang được sử dụng trong booking hoặc event không
    // Nếu có thì không cho xóa, chỉ cho inactive

    await Field.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Xóa sân thành công'
    });
  } catch (error) {
    console.error('Error deleting field:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa sân',
      error: error.message
    });
  }
}

// @desc    Cập nhật trạng thái sân
// @route   PATCH /api/fields/:id/status
// @access  Private (Admin/Staff)
const updateFieldStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID sân không hợp lệ'
      });
    }

    if (!['active', 'maintenance', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ'
      });
    }

    // Check if field exists and permission
    const existingField = await Field.findById(id);
    if (!existingField) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sân'
      });
    }

    // Check permission: Staff cannot update status of fields created by Admin
    const canUpdate = await canStaffEdit(req.user.id, existingField.managedBy);
    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền cập nhật trạng thái sân này. Chỉ có thể xem.'
      });
    }

    const updatedField = await Field.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).populate('managedBy', 'name email');

    if (!updatedField) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sân'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cập nhật trạng thái sân thành công',
      data: updatedField
    });
  } catch (error) {
    console.error('Error updating field status:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật trạng thái sân',
      error: error.message
    });
  }
}

// @desc    Lấy danh sách sân theo mục đích
// @route   GET /api/fields/purpose/:purpose
// @access  Public
const getFieldsByPurpose = async (req, res) => {
  try {
    const { purpose } = req.params;
    const { status = 'active' } = req.query;

    if (!['event', 'rental'].includes(purpose)) {
      return res.status(400).json({
        success: false,
        message: 'Mục đích sân không hợp lệ'
      });
    }

    const fields = await Field.find({ 
      purpose, 
      status 
    }).populate('managedBy', 'name email');

    res.status(200).json({
      success: true,
      data: fields,
      count: fields.length
    });
  } catch (error) {
    console.error('Error getting fields by purpose:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách sân theo mục đích',
      error: error.message
    });
  }
}

// @desc    Lấy thống kê sân
// @route   GET /api/fields/stats
// @access  Private (Admin/Staff)
const getFieldStats = async (req, res) => {
  try {
    const stats = await Field.aggregate([
      {
        $group: {
          _id: null,
          totalFields: { $sum: 1 },
          activeFields: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          maintenanceFields: {
            $sum: { $cond: [{ $eq: ['$status', 'maintenance'] }, 1, 0] }
          },
          inactiveFields: {
            $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] }
          },
          eventFields: {
            $sum: { $cond: [{ $eq: ['$purpose', 'event'] }, 1, 0] }
          },
          rentalFields: {
            $sum: { $cond: [{ $eq: ['$purpose', 'rental'] }, 1, 0] }
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalFields: 0,
      activeFields: 0,
      maintenanceFields: 0,
      inactiveFields: 0,
      eventFields: 0,
      rentalFields: 0
    };

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting field stats:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thống kê sân',
      error: error.message
    });
  }
}

module.exports = {
  getAllFields,
  getFieldById,
  createField,
  updateField,
  deleteField,
  updateFieldStatus,
  getFieldsByPurpose,
  getFieldStats
}
