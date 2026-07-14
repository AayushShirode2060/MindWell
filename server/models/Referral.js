const mongoose=require('mongoose')

const referralSchema=new mongoose.Schema({
   student:{type:mongoose.Schema.Types.ObjectId, ref:'User',required:true},
   counsellor:{type:mongoose.Schema.Types.ObjectId},
   reason:{type:String},
   severity:{type:Number,required:true},
   status:{
    type:String,
    enum:['unresolved','acknowledged','resolved'],
    default:'unresolved'
   },
   source:{
    type:String,
    enum:['ai_chatbot','screening','manual'],
    required:true
   },
   aiNotes:{type:String}
},{timestamps:true});

referralSchema.index({counsellor:1,status:1});
module.exports=mongoose.model('Referral',referralSchema)