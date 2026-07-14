import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { forumEndpoints } from '../../api/endpoints';
import { Heart, MessageSquare, Flag, Send } from 'lucide-react';

const tagColors = {
  anxiety: 'bg-blue-100 text-blue-700', stress: 'bg-orange-100 text-orange-700',
  sadness: 'bg-indigo-100 text-indigo-700', anger: 'bg-red-100 text-red-700',
  insomnia: 'bg-purple-100 text-purple-700', general: 'bg-gray-100 text-gray-600',
  tips: 'bg-emerald-100 text-emerald-700', gratitude: 'bg-yellow-100 text-yellow-700',
};

const ForumPage = () => {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    try {
      const res = await API.get(forumEndpoints.GET_ALL_POSTS_API);
      setPosts(res.data.posts);
    } catch (err) { console.error(err); }
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    try {
      await API.post(forumEndpoints.CREATE_POST_API, { content, tags: selectedTags });
      setContent(''); setSelectedTags([]);
      fetchPosts();
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleUpvote = async (id) => {
    try {
      await API.put(`${forumEndpoints.UPVOTE_POST_API}/${id}/upvote`);
      fetchPosts();
    } catch (err) { console.error(err); }
  };

  const handleReply = async (id) => {
    if (!replyContent.trim()) return;
    try {
      await API.post(`${forumEndpoints.REPLY_POST_API}/${id}/reply`, { content: replyContent });
      setReplyContent(''); setReplyingTo(null);
      fetchPosts();
    } catch (err) { console.error(err); }
  };

  const handleFlag = async (id) => {
    if (!confirm('Flag this post for review?')) return;
    try {
      await API.put(`${forumEndpoints.FLAG_POST_API}/${id}/flag`, { reason: 'Reported by user' });
      alert('Post flagged for moderator review.');
    } catch (err) { console.error(err); }
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const allTags = ['anxiety', 'stress', 'sadness', 'tips', 'gratitude', 'general'];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-text-main">Peer Forum</h1>
        <p className="text-text-muted mt-1">Share anonymously. Support each other.</p>
      </div>

      {/* Create Post */}
      <form onSubmit={handlePost} className="bg-white rounded-2xl p-5 border border-border-custom mb-6">
        <textarea value={content} onChange={(e) => setContent(e.target.value)}
          placeholder="Share your thoughts anonymously..." rows={3} maxLength={2000}
          className="w-full px-4 py-3 border-2 border-border-custom rounded-xl text-sm bg-surface focus:border-dark transition-all outline-none resize-none font-inter" />
        <div className="flex flex-wrap gap-2 mt-3 mb-3">
          {allTags.map(tag => (
            <button key={tag} type="button" onClick={() => toggleTag(tag)}
              className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer border transition-all
              ${selectedTags.includes(tag) ? 'bg-dark text-white border-dark' : 'bg-surface text-text-muted border-border-custom hover:border-dark'}`}>
              {tag}
            </button>
          ))}
        </div>
        <button type="submit" disabled={loading || !content.trim()}
          className="px-6 py-2.5 rounded-full bg-primary text-dark font-semibold text-sm hover:shadow-glow transition-all disabled:opacity-40 border-none cursor-pointer">
          {loading ? 'Posting...' : 'Post Anonymously'}
        </button>
      </form>

      {/* Posts */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <p className="text-text-muted text-center py-12">No posts yet. Be the first to share!</p>
        ) : posts.map(post => (
          <div key={post._id} className="bg-white rounded-2xl p-5 border border-border-custom">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-sm font-bold flex-shrink-0">
                {post.isAnonymous ? '?' : post.author?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold">{post.isAnonymous ? 'Anonymous' : post.author?.name}</div>
                <div className="text-xs text-text-muted">{new Date(post.createdAt).toLocaleString('en-IN')}</div>
              </div>
              <button onClick={() => handleFlag(post._id)}
                className="text-text-muted hover:text-red-500 transition-all bg-transparent border-none cursor-pointer">
                <Flag size={14} />
              </button>
            </div>

            <p className="text-sm text-text-main leading-relaxed mb-3">{post.content}</p>

            {post.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {post.tags.map(tag => (
                  <span key={tag} className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${tagColors[tag] || tagColors.general}`}>{tag}</span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-4 pt-2 border-t border-border-custom">
              <button onClick={() => handleUpvote(post._id)}
                className="flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-red-500 transition-all bg-transparent border-none cursor-pointer">
                <Heart size={14} /> {post.upvotes?.length || 0}
              </button>
              <button onClick={() => setReplyingTo(replyingTo === post._id ? null : post._id)}
                className="flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-dark transition-all bg-transparent border-none cursor-pointer">
                <MessageSquare size={14} /> {post.replies?.length || 0} replies
              </button>
            </div>

            {/* Replies */}
            {replyingTo === post._id && (
              <div className="mt-3 pl-4 border-l-2 border-border-custom space-y-2">
                {post.replies?.map((reply, i) => (
                  <div key={i} className="text-sm">
                    <span className="font-semibold text-text-main">{reply.author?.name || 'User'}: </span>
                    <span className="text-text-light">{reply.content}</span>
                  </div>
                ))}
                <div className="flex gap-2 mt-2">
                  <input type="text" value={replyContent} onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write a supportive reply..."
                    className="flex-1 px-3 py-2 rounded-lg border border-border-custom text-sm outline-none focus:border-dark" />
                  <button onClick={() => handleReply(post._id)}
                    className="w-8 h-8 rounded-full bg-primary text-dark flex items-center justify-center border-none cursor-pointer">
                    <Send size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ForumPage;
