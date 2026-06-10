import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI, mentorshipAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Alumni = () => {
  const [alumni, setAlumni] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { loadAlumni(); }, []);

  const loadAlumni = async () => {
    setLoading(true);
    try {
      const res = await userAPI.getAllAlumni();
      setAlumni(res.data);
    } catch {} finally { setLoading(false); }
  };

  const handleSearch = async () => {
    if (!search.trim()) { loadAlumni(); return; }
    setLoading(true);
    try {
      let res;
      if (filter === 'company') res = await userAPI.getAlumniByCompany(search);
      else if (filter === 'domain') res = await userAPI.getAlumniByDomain(search);
      else res = await userAPI.searchAlumni(search);
      setAlumni(res.data);
    } catch {} finally { setLoading(false); }
  };

  const requestMentorship = async (alumniId) => {
    const message = prompt('Enter your mentorship request message:');
    if (!message) return;
    const topics = prompt('What topics do you need help with? (e.g. career, resume, interviews)');
    try {
      await mentorshipAPI.sendRequest(alumniId, { message, topics });
      alert('Mentorship request sent!');
    } catch { alert('Could not send request.'); }
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'A';

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Alumni Network</h1>
        <p className="page-subtitle">Connect with {alumni.length} alumni from your institution</p>
      </div>

      <div className="search-bar">
        <input className="form-control search-input" placeholder="Search by name, company, skills..."
          value={search} onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()} />
        <select className="form-control" style={{ width: 160 }} value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All Fields</option>
          <option value="company">By Company</option>
          <option value="domain">By Domain</option>
        </select>
        <button className="btn btn-primary" onClick={handleSearch}><i className="fas fa-search"></i> Search</button>
        <button className="btn btn-outline" onClick={loadAlumni}><i className="fas fa-refresh"></i> Reset</button>
      </div>

      {loading ? <div className="loading"><i className="fas fa-spinner fa-spin"></i> Loading alumni...</div> :
        alumni.length === 0 ? (
          <div className="empty-state"><i className="fas fa-users"></i><p>No alumni found</p></div>
        ) : (
          <div className="card-grid">
            {alumni.map(a => (
              <div key={a.id} className="card">
                <div className="profile-card">
                  <div className="avatar avatar-lg">{getInitials(a.fullName)}</div>
                  <div className="profile-info" style={{ flex: 1 }}>
                    <h3>{a.fullName}</h3>
                    <p>{a.jobTitle || 'Alumni'} {a.company ? `@ ${a.company}` : ''}</p>
                    <p className="text-muted text-sm">{a.department} · Class of {a.graduationYear}</p>
                    {a.location && <p className="text-muted text-sm"><i className="fas fa-map-marker-alt"></i> {a.location}</p>}
                  </div>
                </div>
                {a.bio && <p className="text-sm text-muted mt-2" style={{ lineHeight: 1.5 }}>{a.bio.substring(0, 100)}{a.bio.length > 100 ? '...' : ''}</p>}
                {a.skills && (
                  <div className="tag-list">
                    {a.skills.split(',').slice(0, 4).map((s, i) => (
                      <span key={i} className="badge badge-primary">{s.trim()}</span>
                    ))}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  <button className="btn btn-primary btn-sm" onClick={() => navigate(`/messages?to=${a.id}`)}>
                    <i className="fas fa-comment"></i> Message
                  </button>
                  {user?.role === 'STUDENT' && (
                    <button className="btn btn-outline btn-sm" onClick={() => requestMentorship(a.id)}>
                      <i className="fas fa-hands-helping"></i> Request Mentor
                    </button>
                  )}
                  {a.linkedinUrl && (
                    <a href={a.linkedinUrl} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                      <i className="fab fa-linkedin"></i>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      }
    </div>
  );
};

export default Alumni;
