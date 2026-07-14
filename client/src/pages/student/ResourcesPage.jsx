import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { resourceEndpoints } from '../../api/endpoints';
import {
  BookOpen, Zap, Video, Package, Phone, Search, Bookmark, Clock,
  Star, ChevronRight, X, ExternalLink, Play, ArrowRight, Brain, BarChart3
} from 'lucide-react';

const categoryConfig = {
  article: { icon: BookOpen, color: 'bg-blue-50 text-blue-600', label: 'Articles' },
  guide: { icon: Zap, color: 'bg-emerald-50 text-emerald-600', label: 'Quick Guides' },
  video: { icon: Video, color: 'bg-purple-50 text-purple-600', label: 'Videos' },
  toolkit: { icon: Package, color: 'bg-amber-50 text-amber-600', label: 'Toolkits' },
  helpline: { icon: Phone, color: 'bg-red-50 text-red-600', label: 'Emergency Help' },
};

const tagColors = {
  stress: 'bg-orange-50 text-orange-600',
  anxiety: 'bg-blue-50 text-blue-600',
  sleep: 'bg-indigo-50 text-indigo-600',
  focus: 'bg-emerald-50 text-emerald-600',
  depression: 'bg-violet-50 text-violet-600',
  'self-care': 'bg-pink-50 text-pink-600',
};

const ResourcesPage = () => {
  const [resources, setResources] = useState([]);
  const [interactions, setInteractions] = useState({});
  const [recommendations, setRecommendations] = useState({ mood: '', resources: [] });
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [stats, setStats] = useState({ totalViewed: 0, bookmarked: 0, viewedToday: 0 });

  // Filters
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeTag, setActiveTag] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [guideStep, setGuideStep] = useState(0);
  const [expandedToolkit, setExpandedToolkit] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [resAll, resInteractions, resRec, resRecent, resStats] = await Promise.all([
        API.get(resourceEndpoints.GET_ALL_RESOURCES_API),
        API.get(resourceEndpoints.GET_INTERACTIONS_API),
        API.get(resourceEndpoints.GET_RECOMMENDATIONS_API),
        API.get(resourceEndpoints.GET_RECENT_API),
        API.get(resourceEndpoints.GET_STATS_API),
      ]);
      setResources(resAll.data.resources);
      setInteractions(resInteractions.data.interactions || {});
      setRecommendations(resRec.data);
      setRecentlyViewed(resRecent.data.resources);
      setStats(resStats.data.stats);
    } catch (err) { console.error(err); }
  };

  const handleBookmark = async (id) => {
    try {
      const res = await API.post(`${resourceEndpoints.TOGGLE_BOOKMARK_API}/${id}/bookmark`);
      setInteractions(prev => ({ ...prev, [id]: { ...prev[id], bookmarked: res.data.bookmarked } }));
    } catch (err) { console.error(err); }
  };

  const handleView = async (resource) => {
    try { await API.post(`${resourceEndpoints.MARK_VIEWED_API}/${resource._id}/view`); } catch (e) {}
    if (resource.category === 'article') setSelectedArticle(resource);
    else if (resource.category === 'guide') { setSelectedGuide(resource); setGuideStep(0); }
    else if (resource.category === 'toolkit') setExpandedToolkit(expandedToolkit === resource._id ? null : resource._id);
    else if (resource.category === 'video' && resource.videoUrl) window.open(resource.videoUrl.replace('/embed/', '/watch?v='), '_blank');
    else if (resource.category === 'helpline' && resource.helplineNumber) window.open(`tel:${resource.helplineNumber}`);
  };

  // Filter resources
  const filtered = resources.filter(r => {
    if (activeCategory !== 'all' && r.category !== activeCategory) return false;
    if (activeTag && !r.tags?.includes(activeTag)) return false;
    if (searchQuery && !r.title.toLowerCase().includes(searchQuery.toLowerCase()) && !r.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const allTags = [...new Set(resources.flatMap(r => r.tags || []))];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-text-main">Resources</h1>
          <p className="text-text-muted mt-1">Articles, guides, toolkits & emergency help</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-full">
            <BarChart3 size={14} className="text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-600">{stats.viewedToday} read today</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 rounded-full">
            <Bookmark size={14} className="text-yellow-600" />
            <span className="text-xs font-semibold text-yellow-600">{stats.bookmarked} saved</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search resources..."
          className="w-full pl-11 pr-4 py-3 border-2 border-border-custom rounded-xl text-sm bg-white focus:border-dark outline-none" />
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        <button onClick={() => setActiveCategory('all')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold cursor-pointer border-2 whitespace-nowrap transition-all
          ${activeCategory === 'all' ? 'bg-dark text-white border-dark' : 'bg-white border-border-custom hover:border-dark'}`}>
          All
        </button>
        {Object.entries(categoryConfig).map(([key, cfg]) => (
          <button key={key} onClick={() => setActiveCategory(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold cursor-pointer border-2 whitespace-nowrap transition-all
            ${activeCategory === key ? 'bg-dark text-white border-dark' : 'bg-white border-border-custom hover:border-dark'}`}>
            <cfg.icon size={13} /> {cfg.label}
          </button>
        ))}
      </div>

      {/* Tag Filters */}
      <div className="flex gap-1.5 mb-6 flex-wrap">
        {allTags.map(tag => (
          <button key={tag} onClick={() => setActiveTag(activeTag === tag ? '' : tag)}
            className={`px-3 py-1 rounded-full text-[11px] font-semibold cursor-pointer border transition-all capitalize
            ${activeTag === tag ? 'bg-dark text-white border-dark' : `${tagColors[tag] || 'bg-gray-50 text-gray-600'} border-transparent`}`}>
            {tag}
          </button>
        ))}
      </div>

      {/* AI Recommendations */}
      {recommendations.resources?.length > 0 && activeCategory === 'all' && !searchQuery && (
        <div className="mb-6 p-5 rounded-2xl border-2 border-indigo-100" style={{ background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Brain size={16} className="text-indigo-500" />
            <span className="text-xs font-bold uppercase text-indigo-400">
              Recommended for you {recommendations.mood && `(feeling ${recommendations.mood})`}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {recommendations.resources.map(r => (
              <button key={r._id} onClick={() => handleView(r)}
                className="text-left p-3 bg-white rounded-xl border border-indigo-100 cursor-pointer hover:shadow-sm transition-all">
                <div className="text-lg mb-1">{r.thumbnailEmoji}</div>
                <div className="text-xs font-bold">{r.title}</div>
                <div className="text-[10px] text-text-muted mt-0.5 capitalize">{r.category} · {r.readTime || 2} min</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && activeCategory === 'all' && !searchQuery && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={14} className="text-text-muted" />
            <span className="text-xs font-bold uppercase text-text-muted">Recently Viewed</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {recentlyViewed.map(r => (
              <button key={r._id} onClick={() => handleView(r)}
                className="flex-shrink-0 w-40 text-left p-3 bg-white rounded-xl border border-border-custom cursor-pointer hover:shadow-sm transition-all">
                <div className="text-lg mb-1">{r.thumbnailEmoji}</div>
                <div className="text-xs font-bold truncate">{r.title}</div>
                <div className="text-[10px] text-text-muted capitalize">{r.category}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── HELPLINES (always visible at top when category is helpline) ── */}
      {(activeCategory === 'helpline' || activeCategory === 'all') && (
        <>
          {activeCategory === 'helpline' && (
            <div className="bg-red-50 border-2 border-red-100 rounded-2xl p-5 mb-6">
              <h3 className="text-lg font-bold text-red-700 mb-1">🚨 Need Immediate Help?</h3>
              <p className="text-xs text-red-600 mb-4">These helplines are confidential and free. You are not alone.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {resources.filter(r => r.category === 'helpline').map(h => (
                  <div key={h._id} className="bg-white rounded-xl p-4 border border-red-100">
                    <div className="text-2xl mb-2">{h.thumbnailEmoji}</div>
                    <div className="font-bold text-sm mb-0.5">{h.title}</div>
                    <div className="text-xs text-text-muted mb-2">{h.description}</div>
                    <a href={`tel:${h.helplineNumber}`}
                      className="flex items-center gap-1.5 text-sm font-bold text-red-600 hover:underline">
                      <Phone size={14} /> {h.helplineNumber}
                    </a>
                    <div className="text-[10px] text-text-muted mt-1">{h.helplineHours}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── RESOURCE GRID ── */}
      {filtered.filter(r => activeCategory === 'helpline' ? false : true).length === 0 && activeCategory !== 'helpline' ? (
        <p className="text-text-muted text-center py-12 text-sm">No resources found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.filter(r => r.category !== 'helpline' || activeCategory !== 'helpline').map(r => {
            const cfg = categoryConfig[r.category] || categoryConfig.article;
            const Icon = cfg.icon;
            const isBookmarked = interactions[r._id]?.bookmarked;

            return (
              <div key={r._id} className="bg-white rounded-2xl p-5 border border-border-custom hover:shadow-sm transition-all group relative">
                {/* Bookmark */}
                <button onClick={(e) => { e.stopPropagation(); handleBookmark(r._id); }}
                  className="absolute top-4 right-4 cursor-pointer bg-transparent border-none">
                  <Bookmark size={16} className={isBookmarked ? 'fill-yellow-400 text-yellow-400' : 'text-text-muted opacity-0 group-hover:opacity-100 transition-opacity'} />
                </button>

                {/* Category badge + emoji */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{r.thumbnailEmoji}</span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${cfg.color}`}>
                    {r.category}
                  </span>
                  {r.readTime && <span className="text-[10px] text-text-muted">{r.readTime} min read</span>}
                  {r.duration && <span className="text-[10px] text-text-muted">{r.duration}</span>}
                </div>

                <h3 className="font-bold text-sm mb-1">{r.title}</h3>
                <p className="text-xs text-text-muted leading-relaxed mb-3 line-clamp-2">{r.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {r.tags?.map(t => (
                    <span key={t} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${tagColors[t] || 'bg-gray-50 text-gray-500'}`}>{t}</span>
                  ))}
                </div>

                {/* Action button */}
                <button onClick={() => handleView(r)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-dark cursor-pointer bg-transparent border-none hover:underline">
                  {r.category === 'article' && <><BookOpen size={12} /> Read Article →</>}
                  {r.category === 'guide' && <><Zap size={12} /> Start Guide →</>}
                  {r.category === 'video' && <><Play size={12} /> Watch Video →</>}
                  {r.category === 'toolkit' && <><Package size={12} /> Open Toolkit →</>}
                  {r.category === 'helpline' && <><Phone size={12} /> Call Now →</>}
                </button>

                {/* Toolkit expansion */}
                {r.category === 'toolkit' && expandedToolkit === r._id && (
                  <div className="mt-4 pt-4 border-t border-border-custom space-y-2">
                    {r.items?.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 bg-surface rounded-lg">
                        <span className="text-lg">{item.icon}</span>
                        <div>
                          <div className="text-xs font-bold">{item.title}</div>
                          <div className="text-[10px] text-text-muted">{item.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── ARTICLE READER MODAL ── */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-dark/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[80vh] mx-4 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-custom">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{selectedArticle.thumbnailEmoji}</span>
                  <span className="text-[10px] font-bold uppercase text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">Article</span>
                  <span className="text-[10px] text-text-muted">{selectedArticle.readTime} min read</span>
                </div>
                <h2 className="text-lg font-extrabold">{selectedArticle.title}</h2>
              </div>
              <button onClick={() => setSelectedArticle(null)}
                className="w-8 h-8 rounded-full bg-surface flex items-center justify-center border border-border-custom cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="text-sm text-text-main leading-relaxed whitespace-pre-line">
                {selectedArticle.content}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── GUIDE STEPPER MODAL ── */}
      {selectedGuide && (
        <div className="fixed inset-0 bg-dark/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md mx-4 p-8 text-center">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-bold text-text-muted uppercase">
                Step {guideStep + 1} of {selectedGuide.steps?.length}
              </span>
              <button onClick={() => setSelectedGuide(null)}
                className="w-8 h-8 rounded-full bg-surface flex items-center justify-center border border-border-custom cursor-pointer">
                <X size={16} />
              </button>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-surface rounded-full mb-6">
              <div className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${((guideStep + 1) / (selectedGuide.steps?.length || 1)) * 100}%` }} />
            </div>

            <div className="text-4xl mb-4">{selectedGuide.thumbnailEmoji}</div>
            <h3 className="text-xl font-extrabold mb-2">{selectedGuide.steps?.[guideStep]?.title}</h3>
            <p className="text-sm text-text-muted mb-8">{selectedGuide.steps?.[guideStep]?.description}</p>

            <div className="flex gap-3 justify-center">
              {guideStep > 0 && (
                <button onClick={() => setGuideStep(guideStep - 1)}
                  className="px-5 py-2.5 rounded-full text-sm font-semibold bg-surface border border-border-custom cursor-pointer">
                  ← Back
                </button>
              )}
              {guideStep < (selectedGuide.steps?.length || 1) - 1 ? (
                <button onClick={() => setGuideStep(guideStep + 1)}
                  className="px-6 py-2.5 rounded-full bg-dark text-white text-sm font-semibold border-none cursor-pointer">
                  Next Step →
                </button>
              ) : (
                <button onClick={() => { setSelectedGuide(null); fetchAll(); }}
                  className="px-6 py-2.5 rounded-full bg-primary text-dark text-sm font-semibold border-none cursor-pointer">
                  ✅ Done!
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourcesPage;
