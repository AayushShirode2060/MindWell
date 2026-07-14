const nodemailer=require("nodemailer");
const { otpTemplate, referralAlertTemplate, welcomeTemplate } = require("./emailTemplates");

const transporter=nodemailer.createTransport({
    host:process.env.SMTP_HOST,
    // port:process.env.SMTP_PORT,
    // secure:false,
    auth:{
        user:process.env.SMTP_USER,
        pass:process.env.SMTP_PASS,
    }
})

//generic send function
const sendEmail=async(to,subject,html)=>{
    const mailOptions={
        from:`"MindWell Support" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html
    }

    await transporter.sendMail(mailOptions);
}


//specific email function (use templates)

const sendOTPEmail = async (email, name, otp) => {
  await sendEmail(email, '🔐 MindWell - Email Verification OTP', otpTemplate(name, otp));
};
const sendReferralAlert = async (email, counsellorName, studentId, crisisSummary) => {
  await sendEmail(email, '🚨 MindWell - Crisis Referral Alert', referralAlertTemplate(counsellorName, studentId, crisisSummary));
};
const sendWelcomeEmail = async (email, name, role) => {
  await sendEmail(email, '🎉 Welcome to MindWell!', welcomeTemplate(name, role));
};

module.exports={
    sendOTPEmail,
    sendReferralAlert,
    sendWelcomeEmail,
    sendEmail
};
