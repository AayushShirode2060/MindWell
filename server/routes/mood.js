const express=require('express')
const { createMood, getMoodHistory, deleteMood } = require('../controllers/moodController')
const router=express.Router();
const protect=require("../middleware/auth")
const roleCheck=require("../middleware/roleCheck")

router.post('/',protect,roleCheck('student'),createMood);
router.get('/',protect,getMoodHistory)
router.delete('/:id',protect,deleteMood)

module.exports=router;