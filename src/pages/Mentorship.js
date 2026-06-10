import React, { useState, useEffect } from 'react';
import { mentorshipAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const STATUS_COLOR = { PENDING: '#f57c00', ACCEPTED: '#2e7d32', REJECTED: '#c62828' };
const STATUS_ICON = { PENDING: 'fa-clock', ACCEPTED: 'fa-check-circle', REJECTED: 'fa-times-circle' };

const Mentorship = () => {
  const [sent, setSent] = useState([]);
  const [received, setReceived] = useState([]);
  const [tab, setTab] = useState('received');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sentRes, receivedRes] = await Promise.all([
        mentorshipAPI.getSent(),
        mentorshipAPI.getReceived()
      ]);
      setSent(sentRes.data);
      setReceived(receivedRes.data);
    } catch {} finally { setLoading(false); }
  };

  const handleStatus = async (id, status) => {
    try {
      await mentorshipAPI.updateStatus(id, status);
      loadData();
    } catch { alert('Could not update status.'); }
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';

  const RequestCard = ({ req, isReceived }) => (
    <div className="card request-card" style={{ marginBottom: 16 }}>
      <div className="flex-between mb-2">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="avatar">{getInitials(isReceived ? req.mentee?.fullName : req.mentor?.fullName)}</div>
          <div>
            <div style={{ fontWeight: 700 }}>
              {isReceived ? req.mentee?.fullName : req.mentor?.fullName}
            </div>
            <div className="text-muted text-sm">
              {isReceived
                ? `${req.mentee?.department || ''} · Class of ${req.mentee?.graduationYear || 'N/A'}`
                : `${req.mentor?.jobTitle || ''} @ ${req.mentor?.company || 'N/A'}`}
            </div>
          </div>
        </div>
        <span style={{ color: STATUS_COLOR[req.status], fontWeight: 600, fontSize: '0.85rem' }}>
          <i className={`fas ${STATUS_ICON[req.status]}`} style={{ marginRight: 4 }}></i>
          {req.status}
        </span>
      </div>

      {req.topics && (
        <div className="tag-list mb-2">
          {req.topics.split(',').map((t, i) => (
            <span key={i} className="badge badge-accent">{t.trim()}</span>
          ))}
        </div>
      )}

      <div style={{ background: '#f8faff', borderRadius: 8, padding: '10px 14px', fontSize: '0.9rem', lineHeight: 1.6, borderLeft: '3px solid var(--primary-light)' }}>
        "{req.message}"
      </div>

      <div className="flex-between mt-2">
        <span className="text-muted text-sm">
          <i className="fas fa-calendar" style={{ marginRight: 4 }}></i>
          {new Date(req.createdAt).toLocaleDateString()}
        </span>
        {isReceived && req.status === 'PENDING' && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-sm" style={{ background: '#e8f5e9', color: '#2e7d32', border: 'none', cursor: 'pointer', borderRadius: 6, padding: '6px 14px', fontWeight: 600 }}
              onClick={() => handleStatus(req.id, 'ACCEPTED')}>
              <i className="fas fa-check"></i> Accept
            </button>
            <button className="btn btn-sm btn-danger"
              onClick={() => handleStatus(req.id, 'REJECTED')}>
              <i className="fas fa-times"></i> Decline
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const data = tab === 'received' ? received : sent;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Mentorship</h1>
        <p className="page-subtitle">
          {user?.role === 'ALUMNI'
            ? 'Manage mentorship requests from students'
            : 'Track your mentorship requests to alumni'}
        </p>
      </div>

      {/* Summary cards */}
      <div className="stats-row" style={{ marginBottom: 28 }}>
        <div className="stat-card">
          <div className="stat-number">{received.filter(r => r.status === 'PENDING').length}</div>
          <div className="stat-label">Pending Requests</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#2e7d32' }}>{[...sent, ...received].filter(r => r.status === 'ACCEPTED').length}</div>
          <div className="stat-label">Active Mentorships</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{sent.length}</div>
          <div className="stat-label">Requests Sent</div>
        </div>
      </div>

      {/* How it works — for students */}
      {user?.role === 'STUDENT' && sent.length === 0 && (
        <div className="card mb-4" style={{ background: 'linear-gradient(135deg, #e8eaf6, #fff)', borderLeft: '4px solid var(--primary)' }}>
          <h3 style={{ fontWeight: 700, marginBottom: 8, color: 'var(--primary-dark)' }}>
            <i className="fas fa-lightbulb" style={{ marginRight: 8, color: 'var(--accent)' }}></i>
            How to Request Mentorship
          </h3>
          <p className="text-muted" style={{ lineHeight: 1.7 }}>
            1. Go to <strong>Alumni Network</strong> tab<br />
            2. Find an alumni you'd like as a mentor<br />
            3. Click <strong>"Request Mentor"</strong> on their profile<br />
            4. Write a message explaining what help you need<br />
            5. Wait for their response here!
          </p>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, borderBottom: '2px solid var(--border)', paddingBottom: 0 }}>
        {['received', 'sent'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{
              padding: '10px 20px', border: 'none', cursor: 'pointer', fontWeight: 600,
              fontSize: '0.9rem', background: 'transparent', borderBottom: tab === t ? '3px solid var(--primary)' : '3px solid transparent',
              color: tab === t ? 'var(--primary)' : 'var(--text-muted)', marginBottom: -2,
              transition: 'all 0.2s'
            }}>
            {t === 'received' ? `Received (${received.length})` : `Sent (${sent.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading"><i className="fas fa-spinner fa-spin"></i> Loading...</div>
      ) : data.length === 0 ? (
        <div className="empty-state">
          <i className={`fas ${tab === 'received' ? 'fa-inbox' : 'fa-paper-plane'}`}></i>
          <p>{tab === 'received' ? 'No mentorship requests received yet.' : 'You haven\'t sent any mentorship requests yet.'}</p>
        </div>
      ) : (
        data.map(req => (
          <RequestCard key={req.id} req={req} isReceived={tab === 'received'} />
        ))
      )}
    </div>
  );
};

export default Mentorship;
