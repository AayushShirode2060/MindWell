const mongoose=require('mongoose')

const screeningSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    type:{
        type:String,
        enum:['PHQ-9','GAD-7'],
        required:true
    },
    answers:[{
        questionIndex:Number,
        score:{type:Number,min:0,max:3}
    }],
    totalScore:{
        type:Number,
        required:true
    },
    severity:{
        type:String,
        enum:['Minimal','Mild','Moderate','Moderately Severe','Severe'],
        required:true
    },
    recommendation:{
        type:String,
        default:''
    }
},{
    timestamps:true
})

screeningSchema.index({user:1,createdAt:-1});
module.exports=mongoose.model('Screening',screeningSchema);