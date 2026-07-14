// AUTH
export const authEndpoints = {
  REGISTER_API: "/auth/register",
  LOGIN_API: "/auth/login",
  VERIFY_OTP_API: "/auth/verify-otp",
  RESEND_OTP_API: "/auth/resend-otp",
  GET_PROFILE_API: "/auth/profile",
  UPDATE_PROFILE_API: "/auth/profile",
};

// MOOD (Phase 4)
export const moodEndpoints = {
  CREATE_MOOD_API: "/mood",
  GET_MOOD_HISTORY_API: "/mood",
};

// SCREENING (Phase 5)
export const screeningEndpoints = {
  SUBMIT_SCREENING_API: "/screenings",
  GET_MY_SCREENINGS_API: "/screenings/my",
};

// CHAT (Phase 6 & 7.5)
export const chatEndpoints = {
  SAVE_CHAT_API: "/chat",
  GET_CHAT_HISTORY_API: "/chat/history",
  SEND_MESSAGE_API: "/chat/send",
  CLEAR_CHAT_API: "/chat/clear",
  GET_CONVERSATION_API: "/chat/conversation",
};


// APPOINTMENTS (Redesigned)
export const appointmentEndpoints = {
  CREATE_APPOINTMENT_API: "/appointments",
  GET_MY_APPOINTMENTS_API: "/appointments/my",
  GET_COUNSELLORS_API: "/appointments/counsellors",
  GET_AVAILABLE_SLOTS_API: "/appointments/slots",
  UPDATE_APPOINTMENT_API: "/appointments",
  RECOMMEND_COUNSELLOR_API: "/appointments/recommend-counsellor",
  EMERGENCY_BOOKING_API: "/appointments/emergency",
  SUBMIT_FEEDBACK_API: "/appointments",       // append /:id/feedback
  UPDATE_TASK_API: "/appointments",           // append /:id/task
  GET_COUNSELLOR_APPOINTMENTS_API: "/appointments/counsellor",
  GET_COUNSELLOR_STATS_API: "/appointments/counsellor/stats",
  GET_STUDENT_HISTORY_API: "/appointments/counsellor/student", // append /:studentId
};



// REFERRALS (Phase 8)
export const referralEndpoints = {
  GET_COUNSELLOR_REFERRALS_API: "/referrals/counsellor",
  UPDATE_REFERRAL_API: "/referrals",
};

// FORUM (Phase 9)
export const forumEndpoints = {
  CREATE_POST_API: "/forum",
  GET_ALL_POSTS_API: "/forum",
  UPVOTE_POST_API: "/forum",      // append /:id/upvote
  REPLY_POST_API: "/forum",       // append /:id/reply
  FLAG_POST_API: "/forum",        // append /:id/flag
  GET_FLAGGED_API: "/forum/flagged",
  MODERATE_POST_API: "/forum",    // append /:id/moderate
};

// RESOURCES (Redesigned)
export const resourceEndpoints = {
  GET_ALL_RESOURCES_API: "/resources",
  CREATE_RESOURCE_API: "/resources",
  GET_BOOKMARKS_API: "/resources/bookmarks",
  GET_RECENT_API: "/resources/recent",
  GET_RECOMMENDATIONS_API: "/resources/recommend",
  GET_STATS_API: "/resources/stats",
  GET_INTERACTIONS_API: "/resources/interactions",
  TOGGLE_BOOKMARK_API: "/resources",    // append /:id/bookmark
  MARK_VIEWED_API: "/resources",        // append /:id/view
};



export const adminEndpoints = {
  GET_ANALYTICS_API: "/admin/analytics",
  GET_ALL_USERS_API: "/users",
  APPROVE_USER_API: "/users",       // append /:id/approve
  DEACTIVATE_USER_API: "/users",    // append /:id/deactivate
  ACTIVATE_USER_API: "/users",      // append /:id/activate
  UPLOAD_PROOF_API: "/users/upload-proof",
  GET_PENDING_ADMINS_API: "/admin/pending-admins",
  VERIFY_ADMIN_API: "/admin/verify-admin",   // append /:id
  REJECT_ADMIN_API: "/admin/reject-admin",   // append /:id
};

// COLLEGES
export const collegeEndpoints = {
  GET_COLLEGES_API: "/colleges",
  CREATE_COLLEGE_API: "/colleges",
  UPDATE_COLLEGE_API: "/colleges",   // append /:id
  DELETE_COLLEGE_API: "/colleges",   // append /:id
};

// Notifications API
// Notifications API
export const notificationEndpoints = {
  GET_NOTIFICATIONS_API: '/notifications',
  GET_ADMIN_NOTIFICATIONS_API: '/notifications/admin',
  CREATE_NOTIFICATION_API: '/notifications',
  DELETE_NOTIFICATION_API: '/notifications',
  MARK_READ_API: '/notifications',
};

// Help Request (Volunteer) API
export const helpRequestEndpoints = {
  CREATE_REQUEST_API: '/help-requests',
  GET_PENDING_API: '/help-requests/pending',
  ACCEPT_REQUEST_API: '/help-requests', // + :id/accept
  ESCALATE_REQUEST_API: '/help-requests', // + :id/escalate
  COMPLETE_REQUEST_API: '/help-requests', // + :id/complete
  GET_ACTIVE_API: '/help-requests/active',
};

export const volunteerChatEndpoints = {
  GET_CHAT_HISTORY_API: '/volunteer-chat', // + :id
};

export const counsellorEscalatedEndpoints = {
  GET_ESCALATED_API: '/counsellor-escalated',
  ACCEPT_ESCALATED_API: '/counsellor-escalated', // + :id/accept
  COMPLETE_ESCALATED_API: '/counsellor-escalated', // + :id/complete
};

// SESSION CHAT
export const sessionChatEndpoints = {
  GET_CHAT_HISTORY_API: "/session-chat", // append /:appointmentId
};


// GAMES
export const gameEndpoints = {
  SAVE_SESSION_API: "/games/session",
  GET_STATS_API: "/games/stats",
  GET_RECOMMENDATION_API: "/games/recommend",
};

// COUNSELLOR TASKS (Kanban)
export const counsellorTaskEndpoints = {
  GET_TASKS_API: "/counsellor-tasks",
  CREATE_TASK_API: "/counsellor-tasks",
  UPDATE_TASK_API: "/counsellor-tasks",       // append /:id
  DELETE_TASK_API: "/counsellor-tasks",       // append /:id
  REORDER_TASKS_API: "/counsellor-tasks/reorder",
};

// COUNSELLOR EVENTS (Calendar)
export const counsellorEventEndpoints = {
  GET_EVENTS_API: "/counsellor-events",
  CREATE_EVENT_API: "/counsellor-events",
  UPDATE_EVENT_API: "/counsellor-events",     // append /:id
  DELETE_EVENT_API: "/counsellor-events",     // append /:id
};
