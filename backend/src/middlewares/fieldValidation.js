const mongoose = require('mongoose');

// Validation middleware cho tạo sân mới
const validateCreateField = (req, res, next) => {
  
  const {
    name,
    fieldNumber,
    address,
    purpose,
    openingHours,
    pricePerHour
  } = req.body;

  const errors = [];

  // Kiểm tra các trường bắt buộc
  if (!name || name.trim().length === 0) {
    errors.push('Tên sân là bắt buộc');
  }

  if (!fieldNumber || fieldNumber.trim().length === 0) {
    errors.push('Số sân là bắt buộc');
  }

  if (!address || address.trim().length === 0) {
    errors.push('Địa chỉ là bắt buộc');
  }

  if (!purpose) {
    errors.push('Mục đích sử dụng là bắt buộc');
  } else if (!['event', 'rental'].includes(purpose)) {
    errors.push('Mục đích sử dụng phải là "event" hoặc "rental"');
  }

  // Kiểm tra giờ hoạt động (cần parse từ JSON string trước)
  let parsedOpeningHours;
  if (!openingHours) {
    errors.push('Giờ hoạt động là bắt buộc');
  } else {
    try {
      // Parse openingHours nếu nó là string
      parsedOpeningHours = typeof openingHours === 'string' ? JSON.parse(openingHours) : openingHours;
      
      if (!parsedOpeningHours.start || !parsedOpeningHours.end) {
        errors.push('Giờ bắt đầu và kết thúc là bắt buộc');
      } else {
        // Kiểm tra format giờ (HH:MM)
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(parsedOpeningHours.start) || !timeRegex.test(parsedOpeningHours.end)) {
          errors.push('Giờ hoạt động phải có định dạng HH:MM');
        } else {
          // Kiểm tra giờ bắt đầu phải nhỏ hơn giờ kết thúc
          const startTime = new Date(`2000-01-01 ${parsedOpeningHours.start}`);
          const endTime = new Date(`2000-01-01 ${parsedOpeningHours.end}`);
          if (startTime >= endTime) {
            errors.push('Giờ bắt đầu phải nhỏ hơn giờ kết thúc');
          }
        }
      }
    } catch (parseError) {
      errors.push('Định dạng giờ hoạt động không hợp lệ');
    }
  }

  // Kiểm tra giá thuê cho sân rental
  if (purpose === 'rental') {
    if (!pricePerHour || pricePerHour <= 0) {
      errors.push('Sân thuê phải có giá thuê hợp lệ');
    } else if (pricePerHour < 200000) {
      errors.push('Giá thuê tối thiểu 200,000 VNĐ');
    } else if (pricePerHour > 1000000) { // Giới hạn giá thuê tối đa 1 triệu
      errors.push('Giá thuê không được vượt quá 1,000,000 VNĐ');
    }
  }

  // Kiểm tra trạng thái nếu có
  if (req.body.status && !['active', 'maintenance', 'inactive'].includes(req.body.status)) {
    errors.push('Trạng thái phải là "active", "maintenance" hoặc "inactive"');
  }

  // Không cần validate images nữa vì chúng ta upload trực tiếp qua Cloudinary

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors: errors
    });
  }

  next();
};

// Validation middleware cho cập nhật sân
const validateUpdateField = (req, res, next) => {
  const {
    purpose,
    openingHours,
    pricePerHour,
    status,
    images
  } = req.body;

  const errors = [];

  // Kiểm tra mục đích sử dụng nếu có
  if (purpose && !['event', 'rental'].includes(purpose)) {
    errors.push('Mục đích sử dụng phải là "event" hoặc "rental"');
  }

  // Kiểm tra giờ hoạt động nếu có
  if (openingHours) {
    let parsedOpeningHours = openingHours;
    
    // Parse JSON string nếu cần
    if (typeof openingHours === 'string') {
      try {
        parsedOpeningHours = JSON.parse(openingHours);
      } catch (error) {
        errors.push('Định dạng giờ hoạt động không hợp lệ');
        parsedOpeningHours = null;
      }
    }
    
    if (parsedOpeningHours) {
      if (!parsedOpeningHours.start || !parsedOpeningHours.end) {
        errors.push('Giờ bắt đầu và kết thúc là bắt buộc');
      } else {
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(parsedOpeningHours.start) || !timeRegex.test(parsedOpeningHours.end)) {
          errors.push('Giờ hoạt động phải có định dạng HH:MM');
        } else {
          const startTime = new Date(`2000-01-01 ${parsedOpeningHours.start}`);
          const endTime = new Date(`2000-01-01 ${parsedOpeningHours.end}`);
          if (startTime >= endTime) {
            errors.push('Giờ bắt đầu phải nhỏ hơn giờ kết thúc');
          }
        }
      }
    }
  }

  // Kiểm tra giá thuê cho sân rental
  if (purpose === 'rental' && pricePerHour !== undefined) {
    if (pricePerHour <= 0) {
      errors.push('Giá thuê phải lớn hơn 0');
    } else if (pricePerHour < 200000) {
      errors.push('Giá thuê tối thiểu 200,000 VNĐ');
    } else if (pricePerHour > 1000000) {
      errors.push('Giá thuê không được vượt quá 1,000,000 VNĐ');
    }
  }

  // Kiểm tra trạng thái nếu có
  if (status && !['active', 'maintenance', 'inactive'].includes(status)) {
    errors.push('Trạng thái phải là "active", "maintenance" hoặc "inactive"');
  }

  // Không cần validate images nữa vì chúng ta upload trực tiếp qua Cloudinary

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors: errors
    });
  }

  next();
};

// Validation middleware cho cập nhật trạng thái
const validateFieldStatus = (req, res, next) => {
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({
      success: false,
      message: 'Trạng thái là bắt buộc'
    });
  }

  if (!['active', 'maintenance', 'inactive'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Trạng thái phải là "active", "maintenance" hoặc "inactive"'
    });
  }

  next();
};

// Validation middleware cho ObjectId
const validateObjectId = (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'ID không hợp lệ'
    });
  }

  next();
};

// Validation middleware cho query parameters
const validateFieldQuery = (req, res, next) => {
  const { 
    page, 
    limit, 
    purpose, 
    status, 
    sortBy, 
    sortOrder 
  } = req.query;

  const errors = [];

  // Kiểm tra pagination
  if (page && (isNaN(page) || parseInt(page) < 1)) {
    errors.push('Trang phải là số nguyên dương');
  }

  if (limit && (isNaN(limit) || parseInt(limit) < 1 || parseInt(limit) > 100)) {
    errors.push('Số lượng mỗi trang phải từ 1 đến 100');
  }

  // Kiểm tra purpose
  if (purpose && !['event', 'rental'].includes(purpose)) {
    errors.push('Mục đích phải là "event" hoặc "rental"');
  }

  // Kiểm tra status
  if (status && !['active', 'maintenance', 'inactive'].includes(status)) {
    errors.push('Trạng thái phải là "active", "maintenance" hoặc "inactive"');
  }

  // Kiểm tra sortBy
  const allowedSortFields = ['name', 'fieldNumber', 'createdAt', 'updatedAt', 'pricePerHour'];
  if (sortBy && !allowedSortFields.includes(sortBy)) {
    errors.push(`Trường sắp xếp phải là một trong: ${allowedSortFields.join(', ')}`);
  }

  // Kiểm tra sortOrder
  if (sortOrder && !['asc', 'desc'].includes(sortOrder)) {
    errors.push('Thứ tự sắp xếp phải là "asc" hoặc "desc"');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Tham số truy vấn không hợp lệ',
      errors: errors
    });
  }

  next();
};

module.exports = {
  validateCreateField,
  validateUpdateField,
  validateFieldStatus,
  validateObjectId,
  validateFieldQuery
};
