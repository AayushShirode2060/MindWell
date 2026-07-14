const {mongoose} = require("mongoose");

const replySchema=new mongoose.Schema({
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    content:{
        type:String,
        required:true,
        maxlength:1000
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
})

const forumPostSchema=new mongoose.Schema({
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    content:{
        type:String,
        required:true,
        maxlength:2000
    },
    isAnonymous:{
        type:Boolean,
        default:true
    },
    tags:[{
        type:String,
        enum:['anxiety','stress','sadness','anger','insomnia','general','tips','gratitude']
    }],
    upvotes:[{type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }],
    replies:[replySchema],
    isFlagged:{type:Boolean,
        default:false
    },
    flagReason:{type:String,
        default:''
    },
    flaggedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    isHidden:{type:Boolean,default:false}

},{
    timestamps:true
}
)

module.exports=mongoose.model('ForumPost',forumPostSchema);


