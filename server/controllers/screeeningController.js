const Screening = require("../models/Screening");

const getSeverity=(type,score)=>{
    if(type==='PHQ-9'){
        if(score<=4)return {severity:'Minimal',recommendation:'No treatment needed Continue self-care practices.'}
        if(score<=9)return { severity: 'Mild', recommendation: 'Consider self-help resources and mood tracking. Monitor symptoms.' };
        if (score <= 14) return { severity: 'Moderate', recommendation: 'Consider scheduling a session with a counsellor.' };
        if (score <= 19) return { severity: 'Moderately Severe', recommendation: 'Active treatment recommended. Please book a counselling session.' };
    return { severity: 'Severe', recommendation: 'Immediate intervention recommended. Please reach out to a counsellor urgently.' };
  }

   if (type === 'GAD-7') {
    if (score <= 4) return { severity: 'Minimal', recommendation: 'No treatment needed. Continue relaxation practices.' };
    if (score <= 9) return { severity: 'Mild', recommendation: 'Consider mindfulness and stress management resources.' };
    if (score <= 14) return { severity: 'Moderate', recommendation: 'Consider scheduling a session with a counsellor.' };
    return { severity: 'Severe', recommendation: 'Active treatment recommended. Please book a counselling session.' };
  }
  
}

//Post /api/screenings
exports.submitScreening=async (req,res)=>{
    try{
        const {type,answers}=req.body;

        if(!type || !['PHQ-9','GAD-7'].includes(type)){
            return res.status(400).json({success:false,message:'Valid screening type required (PHQ-9 or GAD-7)'})
        }
        const expectedLength=type=='PHQ-9'?9:7;
        if(!answers ||answers.length!=expectedLength){
            return res.status(400).json({
                success:false,
                message:`${type} requires ${expectedLength} answers`
            })
        }

        const totalScore=answers.reduce((sum,a)=>sum+a.score,0);
        const {severity,recommendation}=getSeverity(type,totalScore);

        const screening=await Screening.create({
            user:req.user._id,
            type,
            answers,
            totalScore,
            severity,
            recommendation
        })

        res.status(201).json({
            success:true,
            message:'Screening completed',
            screening
        })
    }catch(error){
        res.status(500).json({ success: false, message: error.message });

    }
}

//GET /api/screenings/my
exports.getMyScreenings=async(req,res)=>{
    try{
        const screenings=await Screening.find({user:req.user._id})
        .sort({createdAt:-1})
        .limit(20);

        res.json({success:true,screenings})
    }catch(error){
        res.status(500).json({success:false,message:error.message})
    }
}

//GET /api/screenings/:id
exports.getScreeningById=async(req,res)=>{
    try{
     const screening=await Screening.findById(req.params.id);
     if(!screening)return res.status(404).json({success:false,
        message:'Not found'
     })
     if(screening.user.toString()!==req.user._id.toString()){
        return res.status(403).json({ success: false, message: 'Not authorized' });
     }
     res.json({success:true,screening})
    }catch(error){
        res.status(403).json({
            success:false,
            message:error.message
        })
    }
}