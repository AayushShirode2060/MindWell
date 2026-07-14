const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const Resource = require('../models/Resource');

dotenv.config();
connectDB();

const resources = [
  // ── ARTICLES ──
  {
    title: 'How to Handle Exam Stress',
    description: 'Simple strategies to manage exam anxiety and perform your best.',
    category: 'article', tags: ['stress', 'focus'],
    thumbnailEmoji: '📝', readTime: 3, featured: true,
    content: `**Exam stress is normal** — here's how to manage it:\n\n• **Start early** — avoid last-minute cramming\n• **Break it down** — study in 25-minute chunks (Pomodoro)\n• **Move your body** — even a 5-min walk helps\n• **Sleep matters** — 7-8 hours is non-negotiable\n• **Breathe** — try 4-7-8 breathing before the exam\n• **Positive self-talk** — replace "I'll fail" with "I'm prepared"\n\n> Remember: One exam doesn't define your life.`
  },
  {
    title: 'Understanding Anxiety',
    description: 'What anxiety actually is, why it happens, and when to seek help.',
    category: 'article', tags: ['anxiety'],
    thumbnailEmoji: '🧠', readTime: 4,
    content: `**Anxiety is your body's alarm system** — sometimes it misfires.\n\n**Common signs:**\n• Racing heart\n• Difficulty breathing\n• Constant worry\n• Trouble sleeping\n• Avoiding situations\n\n**Why it happens:**\n• Overthinking the future\n• Past traumatic experiences\n• Academic or social pressure\n\n**When to seek help:**\n• It affects your daily life\n• You avoid activities you enjoy\n• Physical symptoms persist\n\n> You're not weak for feeling anxious. You're human.`
  },
  {
    title: 'Breaking the Overthinking Cycle',
    description: 'Practical tips to stop spiraling thoughts and regain control.',
    category: 'article', tags: ['anxiety', 'stress'],
    thumbnailEmoji: '🔄', readTime: 3,
    content: `**Overthinking trick:** Your brain replays problems without solving them.\n\n**How to break free:**\n• **Name it** — "I'm overthinking right now"\n• **Set a worry timer** — 5 minutes, then stop\n• **Write it down** — journal your thoughts\n• **5-4-3-2-1 grounding** — notice 5 things you see, 4 you touch...\n• **Move** — change your physical state\n• **Talk to someone** — share what's on your mind`
  },
  {
    title: 'Depression: What You Should Know',
    description: 'Understanding depression beyond "just feeling sad".',
    category: 'article', tags: ['depression', 'self-care'],
    thumbnailEmoji: '💙', readTime: 5,
    content: `**Depression is not just sadness** — it's a persistent state.\n\n**Signs:**\n• Loss of interest in everything\n• Fatigue even after sleeping\n• Feeling worthless\n• Changes in appetite\n• Difficulty concentrating\n\n**What helps:**\n• Small daily routines\n• Gentle exercise\n• Connecting with one person\n• Professional support\n• Being patient with yourself\n\n> Depression lies to you. You are not a burden.`
  },
  {
    title: 'Dealing with Burnout',
    description: 'How to recognize burnout and recover from it.',
    category: 'article', tags: ['stress', 'self-care'],
    thumbnailEmoji: '🔥', readTime: 4,
    content: `**Burnout = exhaustion + detachment + reduced performance**\n\n**Signs you're burned out:**\n• Dreading every morning\n• Nothing feels rewarding\n• Constant fatigue\n• Irritability\n• Physical symptoms (headaches, stomach issues)\n\n**Recovery steps:**\n• **Say no** to one thing this week\n• **Rest without guilt**\n• **Set boundaries** with study/work hours\n• **Do something just for fun**\n• **Talk to a counsellor** if it persists`
  },
  {
    title: 'Better Sleep Guide',
    description: 'Why sleep matters and how to improve yours tonight.',
    category: 'article', tags: ['sleep', 'self-care'],
    thumbnailEmoji: '🌙', readTime: 3,
    content: `**Sleep is your brain's reset button.**\n\n**Quick wins:**\n• Same bedtime every night (±30 min)\n• No screens 30 min before bed\n• Cool, dark room\n• No caffeine after 2 PM\n• Try 4-7-8 breathing in bed\n• Write tomorrow's to-do list before sleeping\n\n**Sleep myths busted:**\n• ❌ "I'll catch up on weekends" — doesn't work\n• ❌ "I only need 4 hours" — your brain disagrees`
  },

  // ── QUICK GUIDES ──
  {
    title: 'Calm Anxiety in 2 Minutes',
    description: 'A quick breathing technique to calm down fast.',
    category: 'guide', tags: ['anxiety', 'stress'],
    thumbnailEmoji: '🫁', readTime: 2, featured: true,
    steps: [
      { step: 1, title: 'Stop & Sit', description: 'Find a comfortable position. Close your eyes.' },
      { step: 2, title: 'Inhale 4 seconds', description: 'Breathe in slowly through your nose for 4 counts.' },
      { step: 3, title: 'Hold 7 seconds', description: 'Hold your breath gently for 7 counts.' },
      { step: 4, title: 'Exhale 8 seconds', description: 'Breathe out through your mouth for 8 counts.' },
      { step: 5, title: 'Repeat 3 times', description: 'Do this cycle 3 times. Notice the calm.' }
    ]
  },
  {
    title: 'Stop Overthinking Instantly',
    description: 'Ground yourself in 60 seconds with the 5-4-3-2-1 method.',
    category: 'guide', tags: ['anxiety', 'focus'],
    thumbnailEmoji: '🛑', readTime: 1,
    steps: [
      { step: 1, title: '5 things you SEE', description: 'Look around. Name 5 things you can see.' },
      { step: 2, title: '4 things you TOUCH', description: 'Feel 4 textures around you.' },
      { step: 3, title: '3 things you HEAR', description: 'Listen for 3 sounds.' },
      { step: 4, title: '2 things you SMELL', description: 'Notice 2 scents.' },
      { step: 5, title: '1 thing you TASTE', description: 'Focus on 1 taste in your mouth.' }
    ]
  },
  {
    title: 'Focus During Study',
    description: 'Pomodoro technique — study smarter, not harder.',
    category: 'guide', tags: ['focus', 'stress'],
    thumbnailEmoji: '🎯', readTime: 2,
    steps: [
      { step: 1, title: 'Pick ONE task', description: 'Choose a single task to focus on.' },
      { step: 2, title: 'Set 25-min timer', description: 'Work with full focus for 25 minutes.' },
      { step: 3, title: '5-min break', description: 'Stand up, stretch, drink water.' },
      { step: 4, title: 'Repeat 4 times', description: 'After 4 rounds, take a 15-min break.' },
      { step: 5, title: 'Reward yourself', description: 'Celebrate small wins!' }
    ]
  },
  {
    title: 'Quick Morning Reset',
    description: 'Start your day with clarity in under 3 minutes.',
    category: 'guide', tags: ['self-care', 'focus'],
    thumbnailEmoji: '☀️', readTime: 3,
    steps: [
      { step: 1, title: 'Stretch in bed', description: 'Stretch your arms and legs for 30 seconds.' },
      { step: 2, title: '3 deep breaths', description: 'Inhale deeply 3 times.' },
      { step: 3, title: 'Set 1 intention', description: 'What\'s ONE thing you want to do today?' },
      { step: 4, title: 'Drink water', description: 'Hydrate before anything else.' },
      { step: 5, title: 'Smile', description: 'Seriously. It activates happy chemicals.' }
    ]
  },

  // ── VIDEOS ──
  {
    title: '5-Minute Guided Meditation',
    description: 'A calm meditation to center your mind.',
    category: 'video', tags: ['anxiety', 'self-care'],
    thumbnailEmoji: '🧘', duration: '5 min',
    videoUrl: 'https://www.youtube.com/embed/inpok4MKVLM'
  },
  {
    title: 'Box Breathing Exercise',
    description: 'Learn box breathing used by Navy SEALs for calm under pressure.',
    category: 'video', tags: ['anxiety', 'stress'],
    thumbnailEmoji: '📦', duration: '4 min',
    videoUrl: 'https://www.youtube.com/embed/tEmt1Znux58'
  },
  {
    title: 'How to Study Effectively',
    description: 'Science-backed study techniques in under 5 minutes.',
    category: 'video', tags: ['focus', 'stress'],
    thumbnailEmoji: '📚', duration: '5 min',
    videoUrl: 'https://www.youtube.com/embed/IlU-zDU6aQ0'
  },

  // ── TOOLKITS ──
  {
    title: 'Exam Stress Toolkit',
    description: 'Everything you need to survive exam season.',
    category: 'toolkit', tags: ['stress', 'focus'],
    thumbnailEmoji: '📦', featured: true,
    items: [
      { title: 'Breathing Exercise', description: 'Try 4-7-8 breathing before studying', icon: '🫁' },
      { title: 'Study Schedule', description: 'Break subjects into 25-min blocks', icon: '📅' },
      { title: 'Sleep Guide', description: 'Get 7-8 hours — no negotiation', icon: '🌙' },
      { title: 'Movement Break', description: '5-min walk between study sessions', icon: '🚶' },
      { title: 'Positive Affirmation', description: '"I am prepared and capable"', icon: '💪' }
    ]
  },
  {
    title: 'Anxiety Toolkit',
    description: 'Practical tools to manage anxiety day by day.',
    category: 'toolkit', tags: ['anxiety'],
    thumbnailEmoji: '🧰',
    items: [
      { title: 'Grounding (5-4-3-2-1)', description: 'Use your 5 senses to anchor yourself', icon: '🌍' },
      { title: 'Bubble Pop Game', description: 'Play the calming bubble pop game', icon: '🫧' },
      { title: 'Journal Prompt', description: 'Write: "What am I actually afraid of?"', icon: '📓' },
      { title: 'Talk to Someone', description: 'Book a counsellor or call a helpline', icon: '📞' },
      { title: 'Body Scan', description: 'Relax each body part from toes to head', icon: '🧘' }
    ]
  },
  {
    title: 'Self-Care Starter Kit',
    description: 'Daily self-care habits that actually work.',
    category: 'toolkit', tags: ['self-care'],
    thumbnailEmoji: '💚',
    items: [
      { title: 'Hydrate', description: 'Drink 8 glasses of water daily', icon: '💧' },
      { title: 'Move', description: '15 minutes of exercise — any kind', icon: '🏃' },
      { title: 'Connect', description: 'Talk to one person you care about', icon: '👋' },
      { title: 'Limit Screen Time', description: 'No phone 30 min before bed', icon: '📵' },
      { title: 'Gratitude', description: 'Write 3 things you\'re grateful for', icon: '🙏' }
    ]
  },

  // ── HELPLINES ──
  {
    title: 'Kiran Mental Health Helpline',
    description: 'Government of India 24/7 mental health helpline.',
    category: 'helpline', tags: ['anxiety', 'depression', 'stress'],
    thumbnailEmoji: '📞',
    helplineNumber: '1800-599-0019', helplineHours: '24/7 (Toll-Free)'
  },
  {
    title: 'Vandrevala Foundation',
    description: 'Free professional counselling — multilingual support.',
    category: 'helpline', tags: ['anxiety', 'depression'],
    thumbnailEmoji: '🤝',
    helplineNumber: '1860-2662-345', helplineHours: '24/7'
  },
  {
    title: 'iCall (TISS)',
    description: 'Psychosocial helpline by Tata Institute of Social Sciences.',
    category: 'helpline', tags: ['stress', 'depression'],
    thumbnailEmoji: '🏫',
    helplineNumber: '9152987821', helplineHours: 'Mon-Sat 8AM-10PM'
  }
];

const seedResources = async () => {
  try {
    await Resource.deleteMany({});
    await Resource.insertMany(resources);
    console.log('✅ Resources seeded! (' + resources.length + ' items)');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seedResources();
