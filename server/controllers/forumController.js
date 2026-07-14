const ForumPost = require("../models/ForumPost");

//POST /api/forum-create post
exports.createPost=async(req,res)=>{
    try{
        const {content,tags,isAnonymous}=req.body;
        if(!content || !content.trim()){
            return res.status(400).json({success:false,message:"content is required"})
        }

        const post=await ForumPost.create({
            author:req.user._id,
            content,
            tags:tags || [],
            isAnonymous:isAnonymous !==false
        })

        res.status(201).json({success:true,post})
    }catch(error){
         res.status(500).json({ success: false, message: error.message });
    }
}


//GET /api/forum -all posts(non-hidden)
exports.getAllPosts=async(req,res)=>{
    try{
        const posts=await ForumPost.find({isHidden:false})
        .populate('author','name role')
        .populate('replies.author','name role')
        .sort({createdAt:-1});

        //Hide author info for anonymous posts
        const safePosts=posts.map(post=>{
            const p=post.toObject();
            if(p.isAnonymous){
                p.author={name:'Anonymous',id:null}
            }
            return p;

        })
        res.json({success:true,
            posts:safePosts
        })
    }catch(error){
        res.status(500).json({success:false,message:error.message})
    }
}

//PUT /api/forum/:id/upvote -toggle upvote
exports.toggleUpvote=async(req,res)=>{
    try{
        const post=await ForumPost.findById(req.params.id);
        if(!post)return res.status(404).json({
            success:false,
            message:'Post not found'
        })
        const idx=post.upvotes.indexOf(req.user._id);
        if(idx==-1){
            post.upvotes.push(req.user._id);
        }else{
            post.upvotes.splice(idx,1);
        }

        await post.save();
        res.json({success:true,upvotes:post.upvotes.length})
    }catch(error){
        res.status(500).json({ success: false, message: error.message });
    }
}

//Post /api/forum/:id/reply -add reply
exports.addReply=async(req,res)=>{
    try{
     const {content}=req.body;
     if(!content || !content.trim()){
        return res.status(400).json({
          success:false,
          message:"reply content is required"
        })
     }
     const post=await ForumPost.findById(req.params.id)
     if(!post)return res.status(404).json({success:false,message:'Post not found'})
     
     post.replies.push({author:req.user._id,content});
     await post.save();  
     
     res.json({success:true,message:'reply added',replies:post.replies});
    }catch(error){
        res.status(500).json({success:false,message:error.message})
    }
}

//PUT /api/forum/:id/flag -flag a post
exports.flagPost=async(req,res)=>{
    try{
      const {reason}=req.body;
      const post=await ForumPost.findByIdAndUpdate(
        req.params.id,
        {isFlagged:true, flagReason:reason || 'Inappropriate content',flaggedBy:req.user._id},
        res.json({succes:true,message:'Post flagged for review'})
      )
    }catch(error){
         res.status(500).json({ success: false, message: error.message });
    }
}

// GET /api/forum/flagged — volunteer gets flagged posts
exports.getFlaggedPOsts=async(req,res)=>{
    try{
        const posts=await ForumPost.find({isFlagged:true,isHidden:false})
            .populate('author','name email')
            .populate('flaggedBy','name')
            .sort({createdAt:-1});
        res.json({success:true,posts})
    }catch(error){
         res.status(500).json({ success: false, message: error.message });
    }
}

//PUT /api/forum/:id/moderate-volunteer hides/unhides post
exports.moderatePost=async(req,res)=>{
    try{
        const {action}=req.body//'hide' or 'unhide'
        const posts=await ForumPost.findByIdAndUpdate(
            req.params.id,
            {isHidden:action==='hide',isFlagged:false},
            {new:true}
        )
        res.json({success:true, message: `Post ${action === 'hide' ? 'hidden' : 'restored'}` })
    }catch(error){
        res.status(500).json({ success: false, message: error.message });
    }
}