const User = require("../models/User");
const jwt=require("jsonwebtoken");
const protect=async(req,res,next)=>{
    let token;
    if(req.headers.authorization &&req.headers.authorization.startsWith('Bearer')){
        token=req.headers.authorization.split(' ')[1];
    }
    if(!token){
        return res.status(401).json({
            success:false,
            message:'Not authorized-no token provided'
        })
    }

    try{
        //verify token and extract user id
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        //Find user and attach to request object
        req.user=await User.findById(decoded.id);

        if(!req.user){
            return res.status(401).json({
                success:false,
                message:'User belonging to this token no longer exists'
            })
        }

        if(!req.user.isActive){
            return res.status(401).json({
                success:false,
                message:'your account has been deactivated'
            })
        }

        next();
    }
    catch(error){
        console.error('Token verification failed:',error);
        res.status(401).json({
            success:false,
            message:'Not authorized-invalid token'
        })
    }
};

module.exports=protect;