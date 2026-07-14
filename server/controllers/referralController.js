const Referral = require("../models/Referral")

//GET /api/referrals/counsellor-counsellor's referrals
exports.getCounsellorReferrals=async(req,res)=>{
    try{
        const referrals=await Referral.find({counsellor:req.user._id})
        .populate('student','name email')
        .sort({createdAt:-1});

        res.json({success:true,referrals})
    }catch(error){
        res.status(500).json({success:false,message:error.message})
    }
}


//PUT /api/referrals/:id -update status

exports.updateReferralStatus=async(req,res)=>{
    try{
        const {status}=req.body;
        const referral=await Referral.findByIdAndUpdate(
            req.params.id,
            {status},
            {new:true}
        )

        res.json({success:true,referral})

    }catch(error){
        res.status(500).json({success:false,message:error.message})
    }
}
