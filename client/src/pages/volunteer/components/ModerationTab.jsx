import { useState, useEffect } from 'react';
import API from '../../../api/axios';
import { forumEndpoints } from '../../../api/endpoints';
import { Flag, Eye, EyeOff } from 'lucide-react';

const ModerationTab = () => {
  const [flagged, setFlagged] = useState([]);

  useEffect(() => { fetchFlagged(); }, []);

  const fetchFlagged = async () => {
    try {
      const res = await API.get(forumEndpoints.GET_FLAGGED_API);
      setFlagged(res.data.posts);
    } catch (err) { console.error(err); }
  };

  const moderate = async (id, action) => {
    try {
      await API.put(`${forumEndpoints.MODERATE_POST_API}/${id}/moderate`, { action });
      fetchFlagged();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-xl font-bold">Community Moderation</h2>
          <p className="text-sm text-text-muted">Review flagged forum posts from students to keep the community safe.</p>
        </div>
      </div>
      
      {flagged.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border-custom p-10 text-center">
          <p className="text-text-muted">No flagged posts. Community is healthy! ✅</p>
        </div>
      ) : flagged.map(post => (
        <div key={post._id} className="p-5 rounded-2xl border border-yellow-300 bg-yellow-50/50">
          <div className="flex justify-between items-center mb-3">
            <div className="font-bold">{post.author?.name || 'Anonymous Student'}</div>
            <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-bold">FLAGGED</span>
          </div>
          <p className="text-sm mb-3 p-3 bg-white rounded-xl border border-yellow-200">{post.content}</p>
          <div className="text-xs font-semibold text-red-600 mb-4 flex items-center gap-1 bg-red-50 p-2 rounded-lg inline-flex">
            <Flag size={14} />
            Reason: {post.flagReason}
          </div>
          <div className="flex gap-2 border-t border-yellow-200 pt-3">
            <button onClick={() => moderate(post._id, 'hide')}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-bold transition-colors">
              <EyeOff size={16} /> Hide Post
            </button>
            <button onClick={() => moderate(post._id, 'unhide')}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-text-main border border-gray-200 rounded-lg text-sm font-bold transition-colors">
              <Eye size={16} /> Dismiss Flag
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ModerationTab;
