// const connectDB = require("./config/db");
// const dotenv=require("dotenv");
// const express=require("express");
// const cors=require("cors");
// //Load environment variables from .env file
// dotenv.config();

// //connect to database
// connectDB();

// //Create express app
// const app=express();

// //------MiddleWare-------
// //Cors-allow requests from react frontend

// app.use(cors({
//     origin:process.env.CLIENT_URI || 'http://localhost:5173',
//     credentials:true
// }));

// //Body Parser -Pardse JSON request bodies (when frontend sends JSON data)
// app.use(express.json());


// //Parse URL-encoded form data
// app.use(express.urlencoded({extended:true}));

// //--------------API routes------------
// //Helath check  route-test if server is running
// app.get('/',(req,res)=>{
//     res.json({
//         success:true,
//         message:'Mindwell server is running',
//         version:'1.0.0',
//         timestamp:new Date().toString()

//     })
// })


// // Future routes will be added here as we build each phase:
// app.use('/api/auth', require('./routes/auth'));           // Phase 2
// app.use('/api/mood', require('./routes/mood'));           // Phase 4
// app.use('/api/screenings', require('./routes/screenings')); // Phase 5
// app.use('/api/chat', require('./routes/chat'));           // Phase 6
// app.use('/api/appointments', require('./routes/appointments')); // Phase 7
// app.use('/api/referrals', require('./routes/referrals')); // Phase 8
// app.use('/api/forum', require('./routes/forum'));         // Phase 9
// app.use('/api/resources', require('./routes/resources')); // Phase 9
// app.use('/api/admin', require('./routes/admin'));         // Phase 10
// app.use('/api/users', require('./routes/user'));         // Phase 10
// app.use('/api/games', require('./routes/games'));

// // --------------- ERROR HANDLING ---------------

// app.use((req,res)=>{
//     res.status(404).json({
//         success:false,
//         message:`Route ${req.originalUrl} not found`
//     });
// });

// //Global error handler-ctaches any unhandled errors
// app.use((err,req,res,next)=>{
//     console.error('Server failed:',err.stack);
//     res.status(err.status || 500).json({
//         success:false,
//         message:err.message || 'Internal server error'
//     })
// })


// //Start the server
// const PORT=process.env.PORT ||5000;

// app.listen(PORT,()=>{
//       console.log(`\n🚀 MindWell Server running on port ${PORT}`);
//   console.log(`📡 API: http://localhost:${PORT}`);
//   console.log(`🌐 Client: ${process.env.CLIENT_URI || 'http://localhost:5173'}`);
//   console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}\n`);
// })






const connectDB = require("./config/db");
const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const http = require('http');
const { Server } = require('socket.io');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Create express app
const app = express();

// ── MIDDLEWARE ──
app.use(cors({
    origin: process.env.CLIENT_URI || 'http://localhost:5173',
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── API ROUTES ──
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Mindwell server is running',
        version: '1.0.0',
        timestamp: new Date().toString()
    });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/mood', require('./routes/mood'));
app.use('/api/screenings', require('./routes/screenings'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/referrals', require('./routes/referrals'));
app.use('/api/forum', require('./routes/forum'));
app.use('/api/resources', require('./routes/resources'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/users', require('./routes/user'));
app.use('/api/games', require('./routes/games'));
app.use('/api/session-chat', require('./routes/sessionChat'));
app.use('/api/counsellor-tasks', require('./routes/counsellorTasks'));
app.use('/api/counsellor-events', require('./routes/counsellorEvents'));
app.use('/api/colleges', require('./routes/colleges'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/help-requests', require('./routes/helpRequests'));
app.use('/api/volunteer-chat', require('./routes/volunteerChat'));
app.use('/api/counsellor-escalated', require('./routes/counsellorEscalated'));

// ── ERROR HANDLING ──
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

app.use((err, req, res, next) => {
    console.error('Server failed:', err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error'
    });
});

// ── HTTP SERVER + SOCKET.IO ──
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URI || 'http://localhost:5173',
        credentials: true
    }
});

// Make io accessible in routes
app.set('io', io);

// Initialize socket handler
require('./socket/chatSocket')(io);

// Start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`\n🚀 MindWell Server running on port ${PORT}`);
    console.log(`📡 API: http://localhost:${PORT}`);
    console.log(`🔌 Socket.IO: enabled`);
    console.log(`🌐 Client: ${process.env.CLIENT_URI || 'http://localhost:5173'}`);
    console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});
