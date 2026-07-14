const twilio=require('twilio');
exports.sendReferralWhatsApp=async(counsellorPhone,studentName)=>{
    if(!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN){
        console.log(`[MOCK Whatsapp] To: ${counsellorPhone} | Alert Crisis detected for ${studentName}`)
        return
    }

    try{
        const client=twilio(process.env.TWILIO_ACCOUNT_SID,process.env.TWILIO_AUTH_TOKEN);
        await client.messages.create({
            body:`🚨 MindWell Alert: Immediate intervention required for ${studentName}. AI detected crisis-level distress. Please check your dashboard.`,
            from:process.env.TWILIO_WHATSAPP_PHONE,
            to:`whatsapp:${counsellorPhone}`
        })
        console.log('whatsapp alert sent!')
    }catch(error){
        console.error('Whatsapp failed',error.message)
    }
}