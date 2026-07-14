const User = require("../models/User");
const College = require("../models/College");
const { sendOTPEmail } = require("../services/emailService");
const jwt=require("jsonwebtoken")
const bcrypt = require('bcryptjs');
//Helper: generate JWT token
const generateToken=(userId)=>{
    return jwt.sign({id:userId},process.env.JWT_SECRET,{expiresIn:"7d"});
}

//helper:generate otp
const generateOTP=()=>{
    return Math.floor(100000+Math.random()*900000).toString();
}


// @desc    Register a new user (sends OTP)
// @route   POST /api/auth/register
// @access  Public
exports.register=async(req,res)=>{
    try{
        const {name,email,password,role,phone,department,enrollmentNo,specialization,college,collegeName,proofUrl}=req.body;

        const existingUser=await User.findOne({email});
        if(existingUser){
            return res.status(400).json({
                success:false,
                message:"User already exists"
            })
        }
        const salt=await bcrypt.genSalt(12);
        const hashedPassword=await bcrypt.hash(password,salt);

        const otp=generateOTP();
        const otpExpires=new Date(Date.now()+ 10*60*1000);

        // Build user data
        const userData = {
            name,
            email,
            password:hashedPassword,
            role:role ||'student',
            phone,
            department,
            enrollmentNo,
            specialization,
            otp,
            otpExpires,
            isVerified:false
        };

        // College assignment — student uses ID from dropdown
        if (college && role !== 'admin') {
            const collegeDoc = await College.findById(college);
            if (collegeDoc) {
                userData.college = college;
                userData.collegeName = collegeDoc.name;
            }
        }

        // Admin-specific: find-or-create college from typed name
        if (role === 'admin') {
            userData.isApproved = false;
            userData.adminVerified = false;
            if (proofUrl) userData.proofUrl = proofUrl;

            if (collegeName && collegeName.trim()) {
                let collegeDoc = await College.findOne({ name: collegeName.trim() });
                if (!collegeDoc) {
                    collegeDoc = await College.create({ name: collegeName.trim() });
                }
                userData.college = collegeDoc._id;
                userData.collegeName = collegeDoc.name;
            }
        }

        //create user not verified yet
        const user=await User.create(userData);

        //sendotp mail
        try{
            await sendOTPEmail(email,name,otp);

        }catch(emailError){
            console.error("Error sending OTP email:",emailError.message);
            //we dont fail registration if email fails -user can resend OTP
        }

        res.status(201).json({
            success:true,
            message:"Registration successful.OTP send to your email",
            user:{
                id:user._id,
                name:user.name,
                email:user.email,
                role:user.role
            }

        })
    }catch(error){
        console.error("Registration error:",error.message);
        res.status(500).json({
            success:false,
            message:"Server error"
        })
    }
}

exports.verifyOTP=async(req,res)=>{
    try{
        const {email,otp}=req.body;
        const user=await User.findOne({email});

        if(!user){
            return res.status(400).json({
                success:false,
                message:"User not found"
            })
        }
        if(user.otp!==otp){
             return res.status(400).json({
                success:false,
                message:"Invalid OTP"
            })
        }

        if(user.otpExpires <Date.now()){
           return res.status(400).json({
                success:false,
                message:"OTP has expired please request a new one"
            })  
        }

        user.isVerified=true;
        user.otp=null;
        user.otpExpires=null;
        await user.save();

        const token=generateToken(user._id);

        res.status(200).json({
            success:true,
            message:"Email verified successfully",
            token,
            user:{
                id:user.id,
                name:user.name,
                email:user.email,
                role:user.role,
                isApproved:user.isApproved
            }
        })
    }catch(error){
        res.status(500).json({
            success:false,
            message:error.message
        })
    }

}

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public

exports.resendOTP=async(req,res)=>{
    try{
        const {email}=req.body;
        const user=await User.findOne({email});

        if(!user){
            return res.status(400).json({ success: false, message: 'User not found' })
        }

        if(user.isVerified){
            return res.status(400).json({
                success:false,
                message:"User is already verified"
            })
        }

        //generate new otp
        const otp=generateOTP();
        user.otp=otp;
        user.otpExpires=new Date(Date.now()+10*60*1000);
        await user.save();

        //send otp email
        try{
            await sendOTPEmail(email,user.name,otp);
        }catch(emailError){
            console.error("Error sending OTP email:",emailError.message);
        }

        res.status(200).json({
            success:true,
            message:"OTP resent successfully"
        })
    }catch(error){
        res.status(500).json({
            success:false,
            message:error.message
        })

    }
}

// @desc    Login user (only verified users)
// @route   POST /api/auth/login
// @access  Public
exports.login=async(req,res)=>{
    try{
        const {email,password}=req.body;

        if(!email || !password){
            return res.status(400).json({
                success:false,
                message:"Please provide email and password"
            })
        }

        const user=await User.findOne({email}).select('+password')

        if(!user){
            return res.status(401).json({
                success:false,
                message:"Invalid email or password"
            })
        }

        if(!user.isActive){
            return res.status(401).json({
                success:false,
                message:"Your account has been deactivated .Contact Admin"
            })
        }

        const isMatch=await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.status(401).json({
                success:false,
                message:"Invalid email or password"
            })
        }


           const token = generateToken(user._id);
            res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                department: user.department,
                isApproved: user.isApproved,
                college: user.college,
                collegeName: user.collegeName,
                adminVerified: user.adminVerified
            }
            });
    } catch(error){
        res.status(500).json({success:false,message:error.message})
    }  
}

// @desc    Get profile
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, department, enrollmentNo } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, department, enrollmentNo },
      { new: true, runValidators: true }
    );
    res.json({ success: true, message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
