const express=require('express')
const router=express.Router()
const protect=require('../middleware/auth')

const roleCheck = require('../middleware/roleCheck')
const { getCounsellorReferrals, updateReferralStatus } = require('../controllers/referralController')

router.get('/counsellor',protect,roleCheck('counsellor'),getCounsellorReferrals)
router.put('/:id',protect,roleCheck('counsellor'),updateReferralStatus);

module.exports=router;