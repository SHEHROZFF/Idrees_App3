// controllers/authController.js

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const path = require('path');
const fs = require('fs');

// @desc    Register a new admin
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;
console.log("check1");
console.log(name, email, password, role);


  try {
    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      return res
        .status(400)
        .json({ success: false, message: 'User already exists' });
    }
console.log("check2");

    // Create user
    user = await User.create({
      name,
      email,
      password,
      role
    });
    console.log("check3");
    
    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.log(error);
    
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Login admin
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  console.log(email);
  

  // Validate email & password
  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: 'Please provide email and password' });
  }

  try {
    // Check for user
    const user = await User.findOne({ email }).select('+password');
console.log(user);

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get current logged in admin
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  const payload = {
    id: user._id,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });

  res.status(statusCode).json({
    success: true,
    token,
  });
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
// controllers/authController.js
const forgotPassword = async (req, res) => {
  const { email, role } = req.body;

  try {
    const user = await User.findOne({ email });
console.log(user);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'There is no user with that email' });
    }

    if (role === 'admin') {
      // Generate reset token
      console.log(user);
      
      const resetToken = user.getResetPasswordToken();

      await user.save({ validateBeforeSave: false });

      // Create reset URL
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

      // Read admin reset password HTML template
      const templatePath = path.join(__dirname, '..', 'emails', 'adminResetPassword.html');
      let htmlMessage = fs.readFileSync(templatePath, 'utf8');

      // Replace placeholders with actual values
      htmlMessage = htmlMessage.replace('{{resetUrl}}', resetUrl);
      htmlMessage = htmlMessage.replace('{{userName}}', user.name);
      htmlMessage = htmlMessage.replace('{{currentYear}}', new Date().getFullYear());

      try {
        await sendEmail({
          email: user.email,
          subject: 'Admin Password Reset Request',
          html: htmlMessage,
        });

        res.status(200).json({ success: true, message: 'Password reset email sent successfully.' });
      } catch (err) {
        console.error(err);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        res.status(500).json({ success: false, message: 'Email could not be sent. Please try again later.' });
      }
    } else if (role === 'user') {
      // Generate OTP
      const otp = user.generateOTP();

      await user.save({ validateBeforeSave: false });

      // Read user reset password HTML template
      const templatePath = path.join(__dirname, '..', 'emails', 'userResetPassword.html');
      let htmlMessage = fs.readFileSync(templatePath, 'utf8');

      // Replace placeholders with actual values
      htmlMessage = htmlMessage.replace('{{otp}}', otp);
      htmlMessage = htmlMessage.replace('{{userName}}', user.name);
      htmlMessage = htmlMessage.replace('{{currentYear}}', new Date().getFullYear());

      try {
        await sendEmail({
          email: user.email,
          subject: 'Your OTP for Password Reset',
          html: htmlMessage,
        });

        res.status(200).json({ success: true, message: 'OTP sent to your email successfully.' });
      } catch (err) {
        console.error(err);
        user.otp = undefined;
        user.otpExpire = undefined;

        await user.save({ validateBeforeSave: false });

        res.status(500).json({ success: false, message: 'OTP could not be sent. Please try again later.' });
      }
    } else {
      res.status(400).json({ success: false, message: 'Invalid role specified.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
}

// const forgotPassword = async (req, res) => {
//   const { email, role } = req.body;
  
//   try {
//     const user = await User.findOne({ email });

//     if (!user) {
//       return res
//         .status(404)
//         .json({ success: false, message: 'There is no user with that email' });
//     }

//     // Get reset token
//     const resetToken = user.getResetPasswordToken();
    
//     await user.save({ validateBeforeSave: false });

//     // Create reset URL
//     const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

//     // HTML email content
//     const htmlMessage = `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <meta charset="UTF-8">
//         <title>Password Reset Request</title>
//       </head>
//       <body style="margin:0; padding:0; background-color:#f4f4f4;">
//         <table border="0" cellpadding="0" cellspacing="0" width="100%">
//           <tr>
//             <td style="padding: 20px 0 30px 0;">
//               <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; background-color: #ffffff;">
//                 <!-- Header -->
//                 <tr>
//                   <td align="center" bgcolor="#1a82e2" style="padding: 40px 0 30px 0;">
//                     <img src="https://th.bing.com/th/id/OIP.5ExJCg7WbRwQ9iqg27MdAwAAAA?rs=1&pid=ImgDetMain" alt="YourAppName" width="200" style="display: block;" />
//                   </td>
//                 </tr>
//                 <!-- Body -->
//                 <tr>
//                   <td style="padding: 40px 30px 40px 30px;">
//                     <table border="0" cellpadding="0" cellspacing="0" width="100%">
//                       <tr>
//                         <td style="color: #153643; font-family: Arial, sans-serif;">
//                           <h1 style="font-size: 24px; margin: 0;">Password Reset Request</h1>
//                         </td>
//                       </tr>
//                       <tr>
//                         <td style="padding: 20px 0 30px 0; color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px;">
//                           <p style="margin: 0;">Hi ${user.name},</p>
//                           <p style="margin: 20px 0 0 0;">We received a request to reset your password for your <strong>YourAppName</strong> account.</p>
//                           <p style="margin: 20px 0 0 0;">Click the button below to reset it:</p>
//                         </td>
//                       </tr>
//                       <tr>
//                         <td align="center">
//                           <a href="${resetUrl}" style="
//                             background-color: #1a82e2;
//                             color: #ffffff;
//                             padding: 15px 25px;
//                             text-decoration: none;
//                             border-radius: 5px;
//                             display: inline-block;
//                             font-size: 16px;
//                             font-family: Arial, sans-serif;
//                           ">Reset Password</a>
//                         </td>
//                       </tr>
//                       <tr>
//                         <td style="padding: 30px 0 0 0; color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px;">
//                           <p style="margin: 20px 0 0 0;">If you did not request a password reset, please ignore this email or contact support if you have questions.</p>
//                           <p style="margin: 20px 0 0 0;">Thanks,<br/>The YourAppName Team</p>
//                         </td>
//                       </tr>
//                     </table>
//                   </td>
//                 </tr>
//                 <!-- Footer -->
//                 <tr>
//                   <td bgcolor="#f4f4f4" style="padding: 30px 30px;">
//                     <table border="0" cellpadding="0" cellspacing="0" width="100%">
//                       <tr>
//                         <td style="color: #666666; font-family: Arial, sans-serif; font-size: 14px;">
//                           &copy; ${new Date().getFullYear()} YourAppName. All rights reserved.
//                         </td>
//                       </tr>
//                       <tr>
//                         <td style="padding: 20px 0 0 0;">
//                           <a href="https://yourapp.com" style="color: #1a82e2; text-decoration: none;">YourAppName</a> | 
//                           <a href="mailto:support@yourapp.com" style="color: #1a82e2; text-decoration: none;">Support</a>
//                         </td>
//                       </tr>
//                     </table>
//                   </td>
//                 </tr>
//               </table>
//             </td>
//           </tr>
//         </table>
//       </body>
//       </html>
//     `;

//     try {
//       await sendEmail({
//         email: user.email,
//         subject: 'Reset Your Password',
//         html: htmlMessage,     // HTML version
//       });

//       res.status(200).json({ success: true, message: 'Password reset email sent successfully.' });
//     } catch (err) {
//       console.error(err);
//       user.resetPasswordToken = undefined;
//       user.resetPasswordExpire = undefined;

//       await user.save({ validateBeforeSave: false });

//       res.status(500).json({ success: false, message: 'Email could not be sent. Please try again later.' });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: 'Server Error' });
//   }
// };


// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resetToken
// @access  Public
const resetPasswordLink = async (req, res) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resetToken)
    .digest('hex');

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid token' });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
const verifyOTP = async (req, res) => {
  const { email, role, otp } = req.body;

  // Validate input
  if (!email || !role || !otp) {
    return res.status(400).json({ success: false, message: 'Please provide email, role, and OTP.' });
  }

  try {
    const user = await User.findOne({ email, role });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Invalid email or role.' });
    }

    if (!user.otp || !user.otpExpire) {
      return res.status(400).json({ success: false, message: 'OTP not set. Please request a new OTP.' });
    }

    if (user.otpExpire < Date.now()) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new OTP.' });
    }

    // Hash the provided OTP to compare with stored hash
    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

    if (hashedOTP !== user.otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP.' });
    }

    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    // OTP is valid, allow password reset
    // Optionally, you can generate a reset token here and send it
    // For simplicity, respond with success and allow password reset
    res.status(200).json({ success: true, message: 'OTP verified successfully. You can now reset your password.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Reset password for user after OTP verification
// @route   POST /api/auth/reset-password
// @access  Public
const resetPasswordOtp = async (req, res) => {
  const { email, role, newPassword } = req.body;
  

  // Validate input
  if (!email || !role || !newPassword) {
    console.log("sheheheeh");
  
    return res.status(400).json({ success: false, message: 'Please provide email, role, OTP, and new password.' });
  }

  try {
    const user = await User.findOne({ email, role });

    if (!user) {
      console.log("heheheh");
      return res.status(404).json({ success: false, message: 'Invalid email or role.' });
    }
    // OTP is valid, proceed to reset password
    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password has been reset successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};


// ... existing sendTokenResponse function ...

module.exports = {
  registerUser,
  loginUser,
  getMe,
  forgotPassword,
  resetPasswordLink,
  verifyOTP,
  resetPasswordOtp,
};