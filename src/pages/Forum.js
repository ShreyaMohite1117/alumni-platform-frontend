import React, { useState, useEffect } from 'react';
import { forumAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['ALL', 'GENERAL', 'CAREER', 'ACADEMIC', 'EVENTS', 'ALUMNI'];
const CAT_COLORS = { GENERAL: 'badge-muted', CAREER: 'badge-accent', ACADEMIC: 'badge-primary', EVENTS: 'badge-success', ALUMNI: 'badge-primary' };

const Forum = () => {
  const [posts, setPosts] = useState([]);
  const [category, setCategory] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [form, setForm] = useState({ title: '', content: '', category: 'GENERAL' });
  const { user } = useAuth();

  useEffect(() => { loadPosts(); }, [category]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const res = category === 'ALL' ? await forumAPI.getAllPosts() : await forumAPI.getByCategory(category);
      setPosts(res.data);
    } catch {} finally { setLoading(false); }
  };

  const handleSearch = async () => {
    if (!search.trim()) { loadPosts(); return; }
    setLoading(true);
    try { const res = await forumAPI.search(search); setPosts(res.data); }
    catch {} finally { setLoading(false); }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      await forumAPI.create(form);
      setShowForm(false);
      setForm({ title: '', content: '', category: 'GENERAL' });
      loadPosts();
    } catch { alert('Failed to create post.'); }
  };

  const openPost = async (post) => {
    setSelectedPost(post);
    try { const res = await forumAPI.getComments(post.id); setComments(res.data); }
    catch { setComments([]); }
  };

  const addComment = async () => {
    if (!commentText.trim()) return;
    try {
      const res = await forumAPI.addComment(selectedPost.id, commentText);
      setComments([...comments, res.data]);
      setCommentText('');
    } catch { alert('Could not add comment.'); }
  };

  const handleLike = async (e, postId) => {
    e.stopPropagation();
    try {
      const res = await forumAPI.like(postId);
      setPosts(posts.map(p => p.id === postId ? res.data : p));
    } catch {}
  };

  const handleDelete = async (e, postId) => {
    e.stopPropagation();
    if (!window.confirm('Delete this post?')) return;
    try { await forumAPI.delete(postId); loadPosts(); } catch { alert('Could not delete.'); }
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';

  if (selectedPost) {
    return (
      <div>
        <button className="btn btn-outline btn-sm mb-4" onClick={() => setSelectedPost(null)}>
          <i className="fas fa-arrow-left"></i> Back to Forum
        </button>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className={`badge ${CAT_COLORS[selectedPost.category] || 'badge-muted'}`}>{selectedPost.category}</span>
            <span className="text-muted text-sm">{new Date(selectedPost.createdAt).toLocaleDateString()}</span>
          </div>
          <h2 style={{ fontWeight: 800, fontSize: '1.4rem', margin: '12px 0', color: 'var(--primary-dark)' }}>{selectedPost.title}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div className="avatar avatar-sm">{getInitials(selectedPost.author?.fullName)}</div>
            <span className="text-sm text-muted">by <strong>{selectedPost.author?.fullName}</strong> · {selectedPost.author?.role}</span>
          </div>
          <p style={{ lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{selectedPost.content}</p>
          <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
            <button className="btn btn-outline btn-sm" onClick={(e) => handleLike(e, selectedPost.id)}>
              <i className="fas fa-thumbs-up"></i> {selectedPost.likesCount} Likes
            </button>
          </div>
        </div>

        <div className="card mt-4">
          <h3 style={{ fontWeight: 700, marginBottom: 20 }}><i className="fas fa-comments"></i> Comments ({comments.length})</h3>
          {comments.map(c => (
            <div key={c.id} style={{ display: 'flex', gap: 12, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
              <div className="avatar avatar-sm">{getInitials(c.author?.fullName)}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{c.author?.fullName} <span className="text-muted text-sm">· {new Date(c.createdAt).toLocaleDateString()}</span></div>
                <p style={{ marginTop: 4, fontSize: '0.9rem', lineHeight: 1.6 }}>{c.content}</p>
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <input className="form-control" placeholder="Write a comment..."
              value={commentText} onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addComment()} />
            <button className="btn btn-primary" onClick={addComment}><i className="fas fa-paper-plane"></i></button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">Discussion Forum</h1>
          <p className="page-subtitle">Share ideas, ask questions, engage with the community</p>
        </div>
        <button className="btn btn-accent" onClick={() => setShowForm(!showForm)}>
          <i className="fas fa-pen"></i> New Post
        </button>
      </div>

      {showForm && (
        <div className="card mb-4">
          <h3 style={{ marginBottom: 20, fontWeight: 700 }}>Create New Post</h3>
          <form onSubmit={handleCreatePost}>
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input className="form-control" placeholder="What's on your mind?" value={form.title}
                onChange={e => setForm({...form, title: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-control" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                {['GENERAL','CAREER','ACADEMIC','EVENTS','ALUMNI'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Content *</label>
              <textarea className="form-control" rows={5} placeholder="Share your thoughts..."
                value={form.content} onChange={e => setForm({...form, content: e.target.value})} required />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-primary" type="submit">Post</button>
              <button className="btn btn-outline" type="button" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Search & Filter */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <input className="form-control" style={{ flex: 1, minWidth: 200 }} placeholder="Search posts..."
          value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
        <button className="btn btn-primary btn-sm" onClick={handleSearch}><i className="fas fa-search"></i></button>
        {CATEGORIES.map(c => (
          <button key={c} className={`btn btn-sm ${category === c ? 'btn-primary' : 'btn-outline'}`} onClick={() => setCategory(c)}>{c}</button>
        ))}
      </div>

      {loading ? <div className="loading"><i className="fas fa-spinner fa-spin"></i> Loading...</div> :
        posts.length === 0 ? <div className="empty-state"><i className="fas fa-comments"></i><p>No posts yet. Start a discussion!</p></div> :
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {posts.map(post => (
            <div key={post.id} className="card post-card" onClick={() => openPost(post)}>
              <div className="flex-between mb-2">
                <span className={`badge ${CAT_COLORS[post.category] || 'badge-muted'}`}>{post.category}</span>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span className="text-sm text-muted">{new Date(post.createdAt).toLocaleDateString()}</span>
                  {user?.id === post.author?.id && (
                    <button className="btn btn-danger btn-sm" onClick={(e) => handleDelete(e, post.id)}>
                      <i className="fas fa-trash"></i>
                    </button>
                  )}
                </div>
              </div>
              <h3 style={{ fontWeight: 700, marginBottom: 8 }}>{post.title}</h3>
              <p className="text-sm text-muted" style={{ lineHeight: 1.6, marginBottom: 12 }}>
                {post.content?.substring(0, 180)}{post.content?.length > 180 ? '...' : ''}
              </p>
              <div className="post-meta">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div className="avatar avatar-sm">{getInitials(post.author?.fullName)}</div>
                  <span>{post.author?.fullName}</span>
                </div>
                <span><i className="fas fa-thumbs-up"></i> {post.likesCount}</span>
                <span><i className="fas fa-comments"></i> {post.comments?.length || 0} comments</span>
                <button className="btn btn-outline btn-sm" onClick={(e) => handleLike(e, post.id)}>
                  <i className="fas fa-thumbs-up"></i> Like
                </button>
              </div>
            </div>
          ))}
        </div>
      }
    </div>
  );
};

export default Forum;
