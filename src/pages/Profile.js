import React, { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await userAPI.getMe();
      setProfile(res.data);
      setForm(res.data);
    } catch {} finally { setLoading(false); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await userAPI.updateProfile(form);
      setProfile(res.data);
      setEditing(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch { alert('Failed to update profile.'); } finally { setSaving(false); }
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  if (loading) return <div className="loading"><i className="fas fa-spinner fa-spin"></i> Loading profile...</div>;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div className="page-header flex-between">
        <h1 className="page-title">My Profile</h1>
        <button className="btn btn-primary" onClick={() => setEditing(!editing)}>
          <i className={`fas ${editing ? 'fa-times' : 'fa-edit'}`}></i>
          {editing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {success && (
        <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: '12px 16px', borderRadius: 8, marginBottom: 20, fontWeight: 600 }}>
          <i className="fas fa-check-circle" style={{ marginRight: 8 }}></i>{success}
        </div>
      )}

      {/* Profile header card */}
      <div className="card mb-4" style={{ background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)', color: 'white' }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <div className="avatar avatar-lg" style={{ background: 'rgba(255,255,255,0.2)', fontSize: '2rem', width: 80, height: 80 }}>
            {getInitials(profile?.fullName)}
          </div>
          <div>
            <h2 style={{ fontWeight: 800, fontSize: '1.6rem' }}>{profile?.fullName}</h2>
            <p style={{ opacity: 0.85, marginTop: 4 }}>
              {profile?.jobTitle && `${profile.jobTitle}`}
              {profile?.company && ` @ ${profile.company}`}
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '3px 12px', borderRadius: 20, fontSize: '0.8rem' }}>
                {profile?.role}
              </span>
              {profile?.department && (
                <span style={{ background: 'rgba(255,255,255,0.2)', padding: '3px 12px', borderRadius: 20, fontSize: '0.8rem' }}>
                  {profile?.department}
                </span>
              )}
              {profile?.graduationYear && (
                <span style={{ background: 'rgba(255,255,255,0.2)', padding: '3px 12px', borderRadius: 20, fontSize: '0.8rem' }}>
                  Class of {profile?.graduationYear}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {editing ? (
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 20, color: 'var(--primary-dark)' }}>Edit Your Information</h3>
          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-control" value={form.fullName || ''}
                  onChange={e => setForm({...form, fullName: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-control" placeholder="+91 XXXXX XXXXX" value={form.phone || ''}
                  onChange={e => setForm({...form, phone: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Job Title</label>
                <input className="form-control" placeholder="e.g. Software Engineer" value={form.jobTitle || ''}
                  onChange={e => setForm({...form, jobTitle: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Company</label>
                <input className="form-control" placeholder="e.g. Google" value={form.company || ''}
                  onChange={e => setForm({...form, company: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input className="form-control" placeholder="e.g. Bangalore, India" value={form.location || ''}
                  onChange={e => setForm({...form, location: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Department</label>
                <input className="form-control" placeholder="e.g. Computer Science" value={form.department || ''}
                  onChange={e => setForm({...form, department: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Degree</label>
                <input className="form-control" placeholder="e.g. B.Tech, M.Tech" value={form.degree || ''}
                  onChange={e => setForm({...form, degree: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Graduation Year</label>
                <input className="form-control" placeholder="e.g. 2022" value={form.graduationYear || ''}
                  onChange={e => setForm({...form, graduationYear: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">LinkedIn URL</label>
                <input className="form-control" placeholder="https://linkedin.com/in/..." value={form.linkedinUrl || ''}
                  onChange={e => setForm({...form, linkedinUrl: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Skills <span className="text-muted">(comma separated)</span></label>
                <input className="form-control" placeholder="React, Java, Python..." value={form.skills || ''}
                  onChange={e => setForm({...form, skills: e.target.value})} />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Bio</label>
                <textarea className="form-control" rows={4} placeholder="Tell others about yourself..."
                  value={form.bio || ''} onChange={e => setForm({...form, bio: e.target.value})} />
              </div>
            </div>
            <button className="btn btn-primary" type="submit" disabled={saving}>
              <i className="fas fa-save"></i> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Info sections */}
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: 16, color: 'var(--primary-dark)' }}>
              <i className="fas fa-user" style={{ marginRight: 8 }}></i>About
            </h3>
            {profile?.bio ? (
              <p style={{ lineHeight: 1.8, color: 'var(--text)' }}>{profile.bio}</p>
            ) : (
              <p className="text-muted text-sm">No bio added yet. Click "Edit Profile" to add one.</p>
            )}
          </div>

          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: 16, color: 'var(--primary-dark)' }}>
              <i className="fas fa-briefcase" style={{ marginRight: 8 }}></i>Professional Info
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { label: 'Email', val: profile?.email, icon: 'fa-envelope' },
                { label: 'Phone', val: profile?.phone, icon: 'fa-phone' },
                { label: 'Job Title', val: profile?.jobTitle, icon: 'fa-id-badge' },
                { label: 'Company', val: profile?.company, icon: 'fa-building' },
                { label: 'Location', val: profile?.location, icon: 'fa-map-marker-alt' },
                { label: 'Department', val: profile?.department, icon: 'fa-graduation-cap' },
                { label: 'Degree', val: profile?.degree, icon: 'fa-scroll' },
                { label: 'Graduation Year', val: profile?.graduationYear, icon: 'fa-calendar' },
              ].map(({ label, val, icon }) => val && (
                <div key={label} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <i className={`fas ${icon}`} style={{ color: 'var(--primary)', marginTop: 2, width: 16 }}></i>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
                    <div style={{ fontWeight: 500 }}>{val}</div>
                  </div>
                </div>
              ))}
            </div>
            {profile?.linkedinUrl && (
              <div style={{ marginTop: 16 }}>
                <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                  <i className="fab fa-linkedin"></i> View LinkedIn
                </a>
              </div>
            )}
          </div>

          {profile?.skills && (
            <div className="card">
              <h3 style={{ fontWeight: 700, marginBottom: 16, color: 'var(--primary-dark)' }}>
                <i className="fas fa-code" style={{ marginRight: 8 }}></i>Skills
              </h3>
              <div className="tag-list">
                {profile.skills.split(',').map((s, i) => (
                  <span key={i} className="badge badge-primary" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
                    {s.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
