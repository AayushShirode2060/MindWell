const express=require('express')
const router=express.Router()
const { submitScreening, getMyScreenings, getScreeningById } = require('../controllers/screeeningController')
const protect=require('../middleware/auth')


router.post('/',protect,submitScreening)
router.get('/my',protect,getMyScreenings)
router.get('/:id',protect,getScreeningById);

module.exports=router;