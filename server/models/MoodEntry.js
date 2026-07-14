const mongoose=require('mongoose')

const moodEntrySchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    mood:{
        type:String,
        enum:['great','good','okay','low','terrible'],
        required:[true,'Mood is required']
    },
    moodScore:{
        type:Number,
        min:1,
        max:5,
        required:true
    },
    note:{
        type:String,
        maxLength:[500,'Note cannot exceeded 500 characters'],
        default:''
    },
    activities:[{
        type:String,
        enum:['exercise','study','social','sleep','meditation','therapy','creative','nature','music','other']
    }],
    sleepHours:{
        type:Number,
        min:0,
        max:24,
        default:null
    }
},{
    timestamps:true
})

//One mood entry per user per day
moodEntrySchema.index({user:1,createdAt:-1});
module.exports=mongoose.model('MoodEntry',moodEntrySchema);