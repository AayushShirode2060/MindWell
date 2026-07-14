const MoodEntry = require("../models/MoodEntry");

const moodScoreMap={great:5,good:4,okay:3,low:2,terrible:1};

//Post /api/mood
exports.createMood=async(req,res)=>{
    try{
        const {mood,note,activities,sleepHours}=req.body;
        if(!mood ||!moodScoreMap[mood]){
            return res.status(400).json({
                success:false,
                message:'Valid mood js required (great,good,okay ,low,terrible)'
            })
        }

        const entry=await MoodEntry.create({
            user:req.user.id,
            mood,
            moodScore:moodScoreMap[mood],
            note:note || '',
            activities:activities || [],
            sleepHours:sleepHours || null
        })

        res.status(201).json({
            success:true,
            message:"Mood logged successfully",
            entry
        })

    }catch(error){
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

//Get /api/mood?days=30

exports.getMoodHistory=async(req,res)=>{
    try{
        const days=parseInt(req.query.days) ||30;
        const startDate=new Date();
        startDate.setDate(startDate.getDate()-days);

        const entries=await MoodEntry.find({
            user:req.user._id,
            createdAt:{$gte:startDate}
        }).sort({createdAt:-1});

        const totalEntries=entries.length;
        const avgScore=totalEntries>0
        ?(entries.reduce((sum,e)=>sum+e.moodScore,0)/totalEntries).toFixed(1)
        :0;

        const moodCounts={};

        entries.forEach(e=>{moodCounts[e.mood]=(moodCounts[e.mood] ||0 )+1});
        res.json({success:true,stats:{totalEntries,avgScore,moodCounts},entries})
    }catch(error){
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

//DELETE /api/mood/:id

exports.deleteMood=async(req,res)=>{
    try{
        const entry=await MoodEntry.findById(req.params.id)
        if(!entry)return res.status(404).json({success:false,message:'Entry not found'})

        if (entry.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await entry.deleteOne();
     res.json({ success: true, message: 'Mood entry deleted' });
        }catch(error){

             res.status(500).json({ success: false, message: error.message });

    }
}