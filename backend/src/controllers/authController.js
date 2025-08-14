  const User = require("../models/UserModel/User");
  const UserRole = require("../models/UserModel/UserRole");
  const Role = require("../models/UserModel/Role");
  const bcrypt = require("bcryptjs");
  const jwt = require("jsonwebtoken");
  const { OAuth2Client } = require('google-auth-library');

  // Validate Google Client ID format
  const validateGoogleClientId = (clientId) => {
    if (!clientId) return false;
    // Google Client ID format: numbers-letters.apps.googleusercontent.com
    const googleClientIdPattern = /^\d+-\w+\.apps\.googleusercontent\.com$/;
    return googleClientIdPattern.test(clientId);
  };

  // Retry function for network operations
  const retryOperation = async (operation, maxRetries = 3, delay = 1000) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        
        // Only retry on network errors
        if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('timeout')) {
          console.log(`Retry attempt ${i + 1}/${maxRetries} after ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; // Exponential backoff
        } else {
          throw error;
        }
      }
    }
  };

  // Google OAuth client with retry mechanism
  const createGoogleClient = () => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      throw new Error("Google Client ID not configured");
    }
    
    if (!validateGoogleClientId(clientId)) {
      throw new Error("Invalid Google Client ID format");
    }
    
    return new OAuth2Client(clientId);
  };

  // Google Login function
  exports.googleLogin = async (req, res) => {
    try {
      const { idToken } = req.body;
      
      if (!idToken) {
        return res.status(400).json({ message: "Google ID token is required" });
      }

      console.log("Google Client ID:", process.env.GOOGLE_CLIENT_ID); // Debug log

      if (!process.env.GOOGLE_CLIENT_ID) {
        return res.status(500).json({ message: "Google Client ID not configured" });
      }

      // Create Google client with validation
      let googleClient;
      try {
        googleClient = createGoogleClient();
      } catch (clientError) {
        console.error("Google client creation error:", clientError);
        return res.status(500).json({ 
          message: "Google OAuth configuration error",
          error: clientError.message
        });
      }
      
      // Verify Google ID token with retry mechanism
      let ticket;
      try {
        ticket = await retryOperation(async () => {
          return await googleClient.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID
          });
        });
      } catch (verifyError) {
        console.error("Token verification error:", verifyError);
        
        // Check if it's a PEM error (common with expired or invalid tokens)
        if (verifyError.message.includes('No pem found for envelope')) {
          return res.status(401).json({ 
            message: "Invalid or expired Google token. Please try logging in again.",
            error: "TOKEN_INVALID"
          });
        }
        
        // Check if it's an audience mismatch
        if (verifyError.message.includes('Wrong number of segments')) {
          return res.status(401).json({ 
            message: "Invalid token format",
            error: "TOKEN_FORMAT_ERROR"
          });
        }
        
        // Check if it's a network or Google API error
        if (verifyError.message.includes('fetch') || verifyError.message.includes('network')) {
          return res.status(503).json({ 
            message: "Unable to verify Google token. Please try again later.",
            error: "NETWORK_ERROR"
          });
        }
        
        return res.status(401).json({ 
          message: "Google token verification failed",
          error: verifyError.message
        });
      }
      
      const payload = ticket.getPayload();
      console.log("Google payload:", payload); // Debug log
      
      // Tìm user trong database
      let user = await User.findOne({ email: payload.email });
      
      if (!user) {
        // Tạo user mới nếu chưa tồn tại
        user = new User({
          name: payload.name,
          email: payload.email,
          avatar: payload.picture,
          provider: 'google',
          googleId: payload.sub
        });
        
        await user.save();
        console.log("New Google user created:", user.email); // Debug log
        
        // Gán role mặc định (User)
        const defaultRole = await Role.findOne({ name: "User" });
        if (defaultRole) {
          await new UserRole({
            user_id: user._id,
            role_id: defaultRole._id
          }).save();
        }
      } else {
        console.log("Existing Google user found:", user.email); // Debug log
      }
      
      // Lấy role của user
      const userRole = await UserRole.findOne({ user_id: user._id }).populate("role_id");
      const role = userRole?.role_id;
      
      // Tạo JWT token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
      
      res.status(200).json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: role?.name || "User"
        }
      });
    } catch (error) {
      console.error("Google login error:", error);
      res.status(500).json({ message: "Google login failed", error: error.message });
    }
  };

  // Check Google OAuth configuration status
  exports.checkGoogleOAuthStatus = async (req, res) => {
    try {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      
      if (!clientId) {
        return res.status(500).json({
          status: "error",
          message: "Google Client ID not configured",
          configured: false
        });
      }
      
      if (!validateGoogleClientId(clientId)) {
        return res.status(500).json({
          status: "error", 
          message: "Invalid Google Client ID format",
          configured: false,
          clientId: clientId
        });
      }
      
      return res.status(200).json({
        status: "success",
        message: "Google OAuth is properly configured",
        configured: true,
        clientId: clientId
      });
    } catch (error) {
      console.error("Google OAuth status check error:", error);
      return res.status(500).json({
        status: "error",
        message: "Failed to check Google OAuth status",
        error: error.message
      });
    }
  };

  exports.register = async (req, res) => {
    const { name, email, password, confirmPassword, phone_number } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Mật khẩu xác nhận không khớp" });
    }

    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ message: "Email đã tồn tại" });

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        phone_number
      });

      await newUser.save();
      const userRole = await Role.findOne({ name: "User" });
      if (!userRole) {
        return res.status(500).json({ message: "Không tìm thấy vai trò người dùng" });
        newUser.roles.push(userRole._id);
        await newUser.save();
      }
    await new UserRole({
        user_id: newUser._id, role_id: userRole._id
      }).save();
      res.status(201).json({
        message: "Đăng ký thành công"});
    }
      catch (err) {
      res.status(500).json({ message: "Lỗi server", error: err.message });
    }
  };

  // Thêm function tạo Staff (chỉ Admin mới được)
  exports.createStaff = async (req, res) => {
    const { name, email, password, phone_number } = req.body;

    try {
      // Kiểm tra email đã tồn tại chưa
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ message: "Email đã tồn tại" });

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Tạo user mới
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        phone_number
      });

      await newUser.save();

      // Tìm role STAFF
      const staffRole = await Role.findOne({ code: "STAFF" });
      if (!staffRole) {
        return res.status(500).json({ message: "Không tìm thấy vai trò Staff" });
      }

      // Tạo UserRole cho Staff
      await new UserRole({
        user_id: newUser._id,
        role_id: staffRole._id
      }).save();

      res.status(201).json({
        message: "Tạo tài khoản Staff thành công",
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          phone_number: newUser.phone_number,
          role: "STAFF"
        }
      });
    } catch (err) {
      res.status(500).json({ message: "Lỗi server", error: err.message });
    }
  };

  exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: "Sai email hoặc mật khẩu" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: "Sai email hoặc mật khẩu" });
      const userRole = await UserRole.findOne({ user_id: user._id }).populate("role_id");
      const role = await Role.findById(userRole.role_id);
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

      res.status(200).json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone_number,
          role: role.name // Lấy tên vai trò
        }
      });
    } catch (err) {
      res.status(500).json({ message: "Lỗi server", error: err.message });
    }
  };

  exports.getMe = async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select("-password");

      // Lấy role từ UserRole
      const userRole = await UserRole.findOne({ user_id: user._id }).populate("role_id");

      if (!userRole) {
        return res.status(404).json({ message: "Không tìm thấy vai trò người dùng" });
      }

      const roleName = userRole.role_id.name.toUpperCase(); // ví dụ: "ADMIN"

      res.json({
        id: user._id,
        name: user.name,
        email: user.email,
        phone_number: user.phone_number,
        avatar: user.avatar || "",
        created_date: user.created_date,
        updated_date: user.updated_date,
        role: roleName, // ✅ thêm role ở đây
      });
    } catch (err) {
      res.status(500).json({ message: "Lỗi server", error: err.message });
    }
  };

