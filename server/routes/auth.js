const express=require('express')
const { register, verifyOTP, resendOTP, getProfile, updateProfile, login } = require('../controllers/authController')
const protect = require('../middleware/auth')
const router=express.Router()

//Public routes
router.post('/register',register)
router.post('/login',login)
router.post('/verify-otp',verifyOTP)
router.post('/resend-otp',resendOTP)

//protected routes
router.get('/profile',protect,getProfile);
router.put('/profile',protect,updateProfile)

module.exports=router;