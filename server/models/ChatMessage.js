const mongoose=require('mongoose');
const chatMessageSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    role:{
        type:String,
        enum:['user','assistant'],
        required:true
    },
    content:{
        type:String,
        required:true,
        maxLength:2000
    },
    detectMood:{
        type:String,
        enum:['anxiety','sadness','anger','stress','insomnia','crisis','neutral',null],
        default:null
    },
    frequency:{
        type:String,
        default:null
    },
    severity:{
        type:Number,
        default:null
    }
},{
    timestamps:true
})

chatMessageSchema.index({user:1,createdAt:-1})
module.exports=mongoose.model('ChatMessage',chatMessageSchema)