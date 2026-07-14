// Base layout wrapper for all emails
const baseTemplate = (content) => `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
    <div style="background: linear-gradient(135deg, #6C63FF, #4ECDC4); padding: 30px; text-align: center;">
      <h1 style="color: #fff; margin: 0; font-size: 24px;">🧠 MindWell</h1>
      <p style="color: rgba(255,255,255,0.85); margin: 5px 0 0; font-size: 13px;">Digital Mental Health Support</p>
    </div>
    <div style="padding: 30px;">
      ${content}
    </div>
    <div style="background: #f8f9fa; padding: 15px; text-align: center; border-top: 1px solid #eee;">
      <p style="color: #999; font-size: 11px; margin: 0;">© MindWell - Your Mental Health Matters</p>
    </div>
  </div>
`;

// OTP Verification Email
const otpTemplate = (name, otp) => {
  const content = `
    <h2 style="color: #333; margin-top: 0;">Welcome, ${name}! 👋</h2>
    <p style="color: #555; line-height: 1.6;">Your OTP for email verification is:</p>
    <div style="background: linear-gradient(135deg, #f0f0ff, #e8faf8); padding: 25px; text-align: center; border-radius: 10px; margin: 20px 0; border: 2px dashed #6C63FF;">
      <h1 style="color: #6C63FF; letter-spacing: 10px; margin: 0; font-size: 36px;">${otp}</h1>
    </div>
    <p style="color: #555;">⏰ This OTP is valid for <strong>10 minutes</strong>.</p>
    <p style="color: #999; font-size: 13px;">If you didn't request this, please ignore this email.</p>
  `;
  return baseTemplate(content);
};

// Referral Alert Email (for counsellors — we'll use this in Phase 8)
const referralAlertTemplate = (counsellorName, studentId, crisisSummary) => {
  const content = `
    <h2 style="color: #e74c3c; margin-top: 0;">🚨 Crisis Referral Alert</h2>
    <p style="color: #555;">Dear <strong>${counsellorName}</strong>,</p>
    <p style="color: #555; line-height: 1.6;">A student has been flagged by the AI chatbot and needs immediate attention.</p>
    <div style="background: #fff5f5; padding: 15px; border-radius: 8px; border-left: 4px solid #e74c3c; margin: 20px 0;">
      <p style="margin: 5px 0; color: #555;"><strong>Student ID:</strong> ${studentId}</p>
      <p style="margin: 5px 0; color: #555;"><strong>Crisis Summary:</strong> ${crisisSummary}</p>
    </div>
    <p style="color: #555;">Please log in to your dashboard to review and take action.</p>
  `;
  return baseTemplate(content);
};

// Welcome Email (after verification)
const welcomeTemplate = (name, role) => {
  const content = `
    <h2 style="color: #333; margin-top: 0;">You're All Set, ${name}! 🎉</h2>
    <p style="color: #555; line-height: 1.6;">Your email has been verified and your <strong>${role}</strong> account is now active.</p>
    <div style="text-align: center; margin: 25px 0;">
      <a href="${process.env.CLIENT_URL}" style="background: linear-gradient(135deg, #6C63FF, #4ECDC4); color: #fff; padding: 12px 30px; border-radius: 25px; text-decoration: none; font-weight: bold; display: inline-block;">Go to MindWell →</a>
    </div>
    <p style="color: #999; font-size: 13px;">Remember, seeking help is a sign of strength. 💪</p>
  `;
  return baseTemplate(content);
};

const bookingConfirmTemplate = (studentName, counsellorName, date, time, sessionType, jitsiRoomId) => `
<div style="font-family:sans-serif;max-width:500px;margin:auto;padding:20px">
  <h2>📅 Appointment Confirmed!</h2>
  <p>Hi <strong>${studentName}</strong>,</p>
  <p>Your session is booked:</p>
  <table style="width:100%;border-collapse:collapse;margin:16px 0">
    <tr><td style="padding:8px;border-bottom:1px solid #eee"><strong>Counsellor</strong></td><td style="padding:8px;border-bottom:1px solid #eee">${counsellorName}</td></tr>
    <tr><td style="padding:8px;border-bottom:1px solid #eee"><strong>Date</strong></td><td style="padding:8px;border-bottom:1px solid #eee">${date}</td></tr>
    <tr><td style="padding:8px;border-bottom:1px solid #eee"><strong>Time</strong></td><td style="padding:8px;border-bottom:1px solid #eee">${time}</td></tr>
    <tr><td style="padding:8px;border-bottom:1px solid #eee"><strong>Mode</strong></td><td style="padding:8px;border-bottom:1px solid #eee">${sessionType === 'video' ? '🎥 Video Call' : sessionType === 'audio' ? '📞 Audio Call' : '💬 Chat'}</td></tr>
  </table>
  ${jitsiRoomId ? `<p><strong>🎥 Join Video:</strong> <a href="https://meet.jit.si/${jitsiRoomId}">https://meet.jit.si/${jitsiRoomId}</a></p>` : ''}
  <p style="color:#888;font-size:12px">— MindWell Team</p>
</div>`;

const jitsiLinkTemplate = (counsellorName, jitsiRoomId, time, date) => `
<div style="font-family:sans-serif;max-width:500px;margin:auto;padding:20px">
  <h2>🎥 Video Session Scheduled</h2>
  <p>Hi <strong>${counsellorName}</strong>,</p>
  <p>A student has booked a video session with you.</p>
  <p><strong>Date:</strong> ${date} at ${time}</p>
  <p><strong>Join link:</strong> <a href="https://meet.jit.si/${jitsiRoomId}">https://meet.jit.si/${jitsiRoomId}</a></p>
  <p style="color:#888;font-size:12px">— MindWell System</p>
</div>`;


module.exports = { otpTemplate, referralAlertTemplate, welcomeTemplate ,bookingConfirmTemplate,jitsiLinkTemplate};
