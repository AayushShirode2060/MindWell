require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Models
const User = require('../models/User');
const MoodEntry = require('../models/MoodEntry');
const Screening = require('../models/Screening');
const Appointment = require('../models/Appointment');
const ForumPost = require('../models/ForumPost');
const Resource = require('../models/Resource');
const Referral = require('../models/Referral');

const connectDB = require('../config/db');

const seedData = async () => {
  try {
    await connectDB();
    console.log('🌱 Starting seed...\n');

    // ───── CLEAR EXISTING DATA ─────
    await User.deleteMany({});
    await MoodEntry.deleteMany({});
    await Screening.deleteMany({});
    await Appointment.deleteMany({});
    await ForumPost.deleteMany({});
    await Resource.deleteMany({});
    await Referral.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // ───── USERS ─────
    const hashedPassword = await bcrypt.hash('Test@123', 10);

    const [student, counsellor, volunteer, admin, superadmin] = await User.create([
      {
        name: 'Aarav Sharma',
        email: 'aayush.22311361@viit.ac.in',
        password: hashedPassword,
        role: 'student',
        department: 'Computer Science',
        enrollmentNo: 'CS2024001',
        isVerified: true,
        isApproved: true,
        isActive: true
      },
      {
        name: 'Dr. Priya Mehta',
        email: 'ayushshirode2060@gmail.com',
        password: hashedPassword,
        role: 'counsellor',
        specialization: 'Anxiety & Depression',
        phone: '+919876543210',
        isVerified: true,
        isApproved: true,
        isActive: true
      },
      {
        name: 'Riya Patel',
        email: 'ayushshirode2023@gmail.com',
        password: hashedPassword,
        role: 'volunteer',
        department: 'Psychology',
        isVerified: true,
        isApproved: true,
        isActive: true
      },
      {
        name: 'Admin MindWell',
        email: 'aayushsshirode@gmail.com',
        password: hashedPassword,
        role: 'admin',
        isVerified: true,
        isApproved: true,
        isActive: true
      },
      {
        name: 'Super Admin',
        email: 'roko7398@gmail.com',
        password: hashedPassword,
        role: 'superadmin',
        isVerified: true,
        isApproved: true,
        isActive: true
      }
    ]);
    console.log('👥 Created 5 users');

    // ───── MOOD ENTRIES (7 days) ─────
    const moods = ['great', 'good', 'okay', 'low', 'terrible'];
    const moodScores = { great: 5, good: 4, okay: 3, low: 2, terrible: 1 };
    const activities = ['exercise', 'study', 'social', 'sleep', 'meditation', 'music', 'nature'];

    const moodData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const mood = moods[Math.floor(Math.random() * moods.length)];
      moodData.push({
        user: student._id,
        mood,
        moodScore: moodScores[mood],
        note: [`Feeling ${mood} today`, 'Had a productive day', 'Stressed about exams', 'Great session with friends', 'Couldn\'t sleep well', 'Completed my assignments', 'Feeling motivated'][i],
        activities: activities.sort(() => 0.5 - Math.random()).slice(0, 2),
        sleepHours: Math.floor(Math.random() * 4) + 5,
        createdAt: date
      });
    }
    await MoodEntry.insertMany(moodData);
    console.log('😊 Created 7 mood entries');

    // ───── SCREENINGS ─────
    await Screening.create([
      {
        user: student._id,
        type: 'PHQ-9',
        answers: Array.from({ length: 9 }, (_, i) => ({ questionIndex: i, score: Math.floor(Math.random() * 3) })),
        totalScore: 12,
        severity: 'Moderate',
        recommendation: 'Consider speaking with a counsellor about your feelings.'
      },
      {
        user: student._id,
        type: 'GAD-7',
        answers: Array.from({ length: 7 }, (_, i) => ({ questionIndex: i, score: Math.floor(Math.random() * 3) })),
        totalScore: 8,
        severity: 'Mild',
        recommendation: 'Practice relaxation techniques and mindfulness.'
      }
    ]);
    console.log('📋 Created 2 screenings');

    // ───── APPOINTMENTS ─────
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 5);

    await Appointment.create([
      {
        student: student._id,
        counsellor: counsellor._id,
        date: tomorrow,
        timeSlot: '10:00 AM',
        status: 'pending',
        reason: 'Feeling anxious about upcoming exams'
      },
      {
        student: student._id,
        counsellor: counsellor._id,
        date: lastWeek,
        timeSlot: '2:00 PM',
        status: 'completed',
        reason: 'Follow-up session',
        notes: 'Student showed improvement. Continue current strategies.'
      }
    ]);
    console.log('📅 Created 2 appointments');

    // ───── FORUM POSTS ─────
    const post1 = await ForumPost.create({
      author: student._id,
      content: 'Does anyone else feel overwhelmed during exam season? I find it hard to focus and my sleep has been terrible. Looking for study tips that actually work.',
      isAnonymous: true,
      tags: ['stress', 'insomnia'],
      upvotes: [counsellor._id, volunteer._id],
      replies: [
        { author: volunteer._id, content: 'You\'re not alone! Try the Pomodoro technique — 25 min study, 5 min break. It helped me a lot! 💪' },
        { author: counsellor._id, content: 'As a counsellor, I recommend also scheduling some relaxation time. Your mental health matters more than any grade.' }
      ]
    });

    await ForumPost.create({
      author: volunteer._id,
      content: 'Sharing a tip that changed my life: 5-4-3-2-1 grounding technique. Name 5 things you see, 4 you hear, 3 you touch, 2 you smell, 1 you taste. Works wonders for anxiety!',
      isAnonymous: false,
      tags: ['tips', 'anxiety'],
      upvotes: [student._id]
    });

    await ForumPost.create({
      author: student._id,
      content: 'I just completed my first screening on MindWell and booked an appointment. Taking the first step feels scary but also empowering. 🌟',
      isAnonymous: true,
      tags: ['gratitude', 'general'],
      upvotes: [volunteer._id, counsellor._id, admin._id]
    });
    console.log('💬 Created 3 forum posts');

    // ───── RESOURCES ─────
    await Resource.create([
      {
        title: 'Understanding Anxiety: A Student Guide',
        description: 'Learn what anxiety is, how it affects students, and evidence-based strategies to manage it effectively.',
        category: 'article',
        url: 'https://www.nimh.nih.gov/health/topics/anxiety-disorders',
        tags: ['anxiety', 'self-help'],
        createdBy: counsellor._id
      },
      {
        title: 'Guided Breathing Exercise (10 min)',
        description: 'A calming breathing exercise designed for students. Follow along to reduce stress and improve focus.',
        category: 'exercise',
        tags: ['breathing', 'relaxation'],
        createdBy: counsellor._id
      },
      {
        title: 'The Science of Sleep & Mental Health',
        description: 'Discover how sleep impacts your brain, mood, and academic performance. Includes tips for better sleep hygiene.',
        category: 'video',
        url: 'https://www.youtube.com/watch?v=5MuIMqhT8DM',
        tags: ['sleep', 'wellbeing'],
        createdBy: admin._id
      },
      {
        title: 'iCall Helpline',
        description: 'India\'s leading psychosocial helpline. Call 9152987821 (Mon-Sat, 8am-10pm). Free, confidential support.',
        category: 'helpline',
        url: 'https://icallhelpline.org',
        tags: ['crisis', 'helpline', 'india'],
        createdBy: counsellor._id
      }
    ]);
    console.log('📚 Created 4 resources');

    // ───── REFERRAL ─────
    await Referral.create({
      student: student._id,
      counsellor: counsellor._id,
      reason: 'AI detected crisis in chat',
      severity: 5,
      status: 'unresolved',
      source: 'ai_chatbot',
      aiNotes: 'Student expressed feelings of hopelessness and mentioned not wanting to continue.'
    });
    console.log('🚨 Created 1 referral');

    // ───── DONE ─────
    console.log('\n✅ Seed complete! Here are your demo logins:\n');
    console.log('  📧 student@mindwell.com     / Test@123');
    console.log('  📧 counsellor@mindwell.com  / Test@123');
    console.log('  📧 volunteer@mindwell.com   / Test@123');
    console.log('  📧 admin@mindwell.com       / Test@123');
    console.log('  📧 superadmin@mindwell.com  / Test@123');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
};

seedData();
