const express=require('express')
const router=express.Router()
const { createPost, getAllPosts, toggleUpvote, addReply, flagPost, getFlaggedPOsts, moderatePost } = require('../controllers/forumController')
const protect=require('../middleware/auth')
const roleCheck=require('../middleware/roleCheck')

router.post('/',protect,createPost)
router.get('/',protect,getAllPosts)
router.put('/:id/upvote', protect, toggleUpvote);
router.post('/:id/reply', protect, addReply);
router.put('/:id/flag', protect, flagPost);
router.get('/flagged', protect, roleCheck('volunteer', 'admin', 'superadmin'), getFlaggedPOsts);
router.put('/:id/moderate', protect, roleCheck('volunteer', 'admin', 'superadmin'), moderatePost);

module.exports=router;