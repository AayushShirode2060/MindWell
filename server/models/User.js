const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false
    },
    role: {
        type: String,
        enum: ['student', 'counsellor', 'volunteer', 'admin', 'superadmin'],
        default: 'student'
    },
    phone: { type: String, default: '' },
    department: { type: String, default: '' },
    enrollmentNo: { type: String, default: '' },
    specialization: { type: String, default: '' },
    college: { type: mongoose.Schema.Types.ObjectId, ref: 'College', default: null },
    collegeName: { type: String, default: '' },
    proofUrl: { type: String, default: '' },
    adminVerified: { type: Boolean, default: false },
    availableSlots: [{
        day: String,
        startTime: String,
        endTime: String
    }],
    isActive: { type: Boolean, default: true },
    isApproved: {
        type: Boolean,
        default: function () {
            return this.role === 'student';
        }
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    otp:{type:String,default:null},
    otpExpires:{type:Date,default:null},
    
    // For Volunteers
    availabilityStatus: {
        type: String,
        enum: ['available', 'busy', 'offline'],
        default: 'offline'
    },
    gamification: {
        points: { type: Number, default: 0 },
        level: { type: Number, default: 1 },
        badges: [{ type: String }]
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
