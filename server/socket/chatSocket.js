const jwt = require('jsonwebtoken');
const User = require('../models/User');
const SessionChatMessage = require('../models/SessionChatMessage');

module.exports = (io) => {
  // Authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) return next(new Error('User not found'));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 ${socket.user.name} connected (${socket.user.role})`);

    // Join appointment room
    socket.on('join-room', (roomId) => {
      socket.join(roomId);
      console.log(`📍 ${socket.user.name} joined room ${roomId}`);
    });

    // Leave room
    socket.on('leave-room', (roomId) => {
      socket.leave(roomId);
    });

    // Send Appointment message
    socket.on('send-message', async ({ appointmentId, content }) => {
      try {
        const message = await SessionChatMessage.create({
          appointment: appointmentId,
          sender: socket.user._id,
          senderRole: socket.user.role,
          content,
          readBy: [socket.user._id]
        });

        const populated = await message.populate('sender', 'name role');
        io.to(appointmentId).emit('new-message', {
          _id: populated._id,
          appointment: appointmentId,
          sender: populated.sender,
          senderRole: populated.senderRole,
          content: populated.content,
          createdAt: populated.createdAt
        });
      } catch (err) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Send Volunteer Help Request message
    const VolunteerChatMessage = require('../models/VolunteerChatMessage');
    socket.on('send-volunteer-message', async ({ helpRequestId, content }) => {
      try {
        const message = await VolunteerChatMessage.create({
          helpRequest: helpRequestId,
          sender: socket.user._id,
          senderRole: socket.user.role,
          content,
          readBy: [socket.user._id]
        });

        const populated = await message.populate('sender', 'name role');
        
        // Critical safety feature: AI-based warning text scan (simple implementation)
        const riskyWords = ['suicide', 'kill', 'hurt', 'die', 'end it all', 'worthless'];
        const isRisky = riskyWords.some(word => content.toLowerCase().includes(word));

        io.to(helpRequestId).emit('new-volunteer-message', {
          _id: populated._id,
          helpRequest: helpRequestId,
          sender: populated.sender,
          senderRole: populated.senderRole,
          content: populated.content,
          createdAt: populated.createdAt,
          isRisky // The frontend will use this to show the warning
        });
      } catch (err) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing', (roomId) => {
      socket.to(roomId).emit('user-typing', {
        name: socket.user.name,
        role: socket.user.role
      });
    });

    socket.on('stop-typing', (roomId) => {
      socket.to(roomId).emit('user-stop-typing');
    });

    // Counsellor joins the escalated help-request room
    socket.on('join-escalated-chat', ({ helpRequestId }) => {
      socket.join(helpRequestId);
      socket.to(helpRequestId).emit('counsellor-joined', {
        counsellorName: socket.user.name
      });
      console.log(`🩺 Counsellor ${socket.user.name} joined escalated chat ${helpRequestId}`);
    });

    // Escalation: volunteer tells the room (student) that the chat has been escalated
    socket.on('chat-escalated', ({ helpRequestId }) => {
      socket.to(helpRequestId).emit('chat-escalated');
      console.log(`🚨 Chat ${helpRequestId} escalated by ${socket.user.name}`);
    });

    // Typing indicator
    socket.on('typing', (appointmentId) => {
      socket.to(appointmentId).emit('user-typing', {
        name: socket.user.name,
        role: socket.user.role
      });
    });

    socket.on('stop-typing', (appointmentId) => {
      socket.to(appointmentId).emit('user-stop-typing');
    });

    socket.on('disconnect', () => {
      console.log(`❌ ${socket.user.name} disconnected`);
    });
  });
};
