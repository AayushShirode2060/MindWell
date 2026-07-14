const ChatMessage = require("../models/ChatMessage");
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const User = require('../models/User');
const { sendReferralAlert } = require('../services/emailService');
const Referral = require("../models/Referral");
const { sendReferralWhatsApp } = require("../services/whatsappService");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';
//call python  ml service for mood classification
const classifyMood=async(text)=>{
    try{
        const res=await axios.post(`${ML_SERVICE_URL}/predict`,{text});
        return res.data; //{mood,confidence,severity,frequency,isCrisis}
    }catch(error){
        console.error('ML service error:',error.message)
        return {mood:'neutral',confidence:0,severity:1,frequency:null,isCrisis:false}
    }
}

//POST /api/chat/send
exports.sendMessage=async(req,res)=>{
    try{
        const {message}=req.body;
        if(!message || !message.trim()){
            return res.status(400).json({success:false,message:"Messag eis required"});
        }

        //Step 1:ML classficiation
        const mlResult=await classifyMood(message);
        const {mood:detectedMood,confidence,severity,frequency,isCrisis}=mlResult;

        //Step 2:Save user message
        await ChatMessage.create({
            user:req.user._id,
            role:'user',
            content:message,
            detectedMood:detectedMood!=='neutral'?detectedMood:null,
            confidence,
            severity
        })

        //Step3 :Get recent chat history for context
        const recentMessages=await ChatMessage.find({user:req.user._id})
        .sort({createdAt:-1})
        .limit(10);

        const chatHistory=await recentMessages.reverse().map(m=>({
            role:m.role==='user'?'user':'model',
            parts:[{text:m.content}]
        }))

        //Step:4 Build System prompt
         const systemPrompt = `You are MindWell AI, a compassionate mental health support assistant for university students. 
            Rules:
            - Be warm, empathetic, and non-judgmental
            - You are NOT a replacement for professional help — always clarify this
            - Provide evidence-based coping strategies
            - Keep responses concise (2-4 short paragraphs max)
            - If user mentions crisis/self-harm, acknowledge their feelings, provide hope, and strongly recommend professional help
            - Never diagnose conditions
            - Use simple, supportive language
            ${isCrisis ? '\n⚠️ CRISIS DETECTED: The user may be in danger. Respond with immediate empathy, validate feelings, and urge them to reach out to emergency services or their campus counsellor. Include helpline: iCall (9152987821).' : ''}
            ${detectedMood !== 'neutral' && !isCrisis ? `\nML detected mood: ${detectedMood} (confidence: ${confidence}%, severity: ${severity}/5). Tailor your response accordingly and suggest relevant coping strategies.` : ''}`;
           
         //Step 5:Call Gemini AI
         const model=genAI.getGenerativeModel({
            model:'gemini-2.5-flash',
             systemInstruction: { parts: [{ text: systemPrompt }] }
        
        });
         const chat=model.startChat({
            history:chatHistory.slice(0,-1)
         })   

         const result=await chat.sendMessage(message);
         const aiResponse=result.response.text()

         //Step:6 Save AI Response
         await ChatMessage.create({
            user:req.user._id,
            role:'assistant',
            content:aiResponse,
            detectedMood:detectedMood !== 'neutral' ? detectedMood : null,
            frequency:frequency?frequency.freq:null,
            confidence,
            severity
         })

         //Phase 8:auto-referral on crisis
          if(isCrisis){
            const counsellor=await User.findOne({role:'counsellor'})
            if(counsellor){
                const existingReferral=await Referral.findOne({
                    student:req.user._id,
                    status:{$in:['unresolved','acknowledged']}
                })
                if(!existingReferral){
                    await Referral.create({
                        student:req.user._id,
                        counsellor:counsellor._id,
                        reason:`AI detected ${detectedMood} in chat`,
                        severity,
                        source:'ai_chatbot',
                        aiNotes:message
                    })
                    //emial reuses phase2 email service
                    await sendReferralAlert(counsellor.email,counsellor.name,req.user._id,`AI detected ${detectedMood} (Severity: ${severity}/5)`)
        
                    //Email(reuses your phase 2 emailService)
                    await sendReferralWhatsApp(counsellor.phone || '+918888888888',req.user.name);
                    
                    console.log('🚨 Crisis referal created +notfication sent')
                }
            }

          }

         //Step 7 :Send response
         res.json({
            success:true,
            reply:{
                content: aiResponse,
                detectedMood: detectedMood !== 'neutral' ? detectedMood : null,
                frequency,
                isCrisis,
                confidence,
                severity,
            }
         })
    }catch(error){
        console.error('Chat error',error);
        res.status(500).json({success:false,message:error.message})
    }
}


// Get /api/chat/history
exports.getChatHistory=async(req,res)=>{
    try{
        const messages=await ChatMessage.find({user:req.user._id})
        .sort({createdAt:-1})
        .limit(50)

        res.json({success:true,messages:messages.reverse()})
    }catch(error){
         res.status(500).json({ success: false, message: error.message });
    }
}

//Delete /api/chat/clear
exports.clearChat=async(req,res)=>{
  try{
    await ChatMessage.deleteMany({user:req.user._id})
    res.json({success:true,message:'Chat Histroy cleared'})
  }catch(error){
    res.status(500).json({success:false,message:error.message})

  }
}