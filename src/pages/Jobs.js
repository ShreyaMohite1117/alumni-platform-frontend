import React, { useState, useEffect } from 'react';
import { jobAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const TYPE_COLORS = { FULL_TIME: 'badge-primary', INTERNSHIP: 'badge-accent', PART_TIME: 'badge-success', CONTRACT: 'badge-muted' };

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', company: '', description: '', location: '', salary: '', type: 'FULL_TIME', applyLink: '', skills: '', domain: '' });
  const { user } = useAuth();

  useEffect(() => { loadJobs(); }, []);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const res = await jobAPI.getAll();
      setJobs(res.data);
    } catch {} finally { setLoading(false); }
  };

  const handleSearch = async () => {
    if (!search.trim()) { loadJobs(); return; }
    setLoading(true);
    try {
      const res = await jobAPI.search(search);
      setJobs(res.data);
    } catch {} finally { setLoading(false); }
  };

  const handleTypeFilter = async (type) => {
    setTypeFilter(type);
    setLoading(true);
    try {
      const res = type === 'ALL' ? await jobAPI.getAll() : await jobAPI.getByType(type);
      setJobs(res.data);
    } catch {} finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await jobAPI.create(form);
      setShowForm(false);
      setForm({ title: '', company: '', description: '', location: '', salary: '', type: 'FULL_TIME', applyLink: '', skills: '', domain: '' });
      loadJobs();
      alert('Job posted successfully!');
    } catch { alert('Failed to post job.'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job posting?')) return;
    try { await jobAPI.delete(id); loadJobs(); } catch { alert('Could not delete.'); }
  };

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">Jobs & Internships</h1>
          <p className="page-subtitle">{jobs.length} opportunities available</p>
        </div>
        {(user?.role === 'ALUMNI' || user?.role === 'ADMIN') && (
          <button className="btn btn-accent" onClick={() => setShowForm(!showForm)}>
            <i className="fas fa-plus"></i> Post Opportunity
          </button>
        )}
      </div>

      {/* Post Job Form */}
      {showForm && (
        <div className="card mb-4">
          <h3 style={{ marginBottom: 20, fontWeight: 700, color: 'var(--primary-dark)' }}>Post a New Opportunity</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Job Title *</label>
                <input className="form-control" placeholder="e.g. Software Engineer" value={form.title}
                  onChange={e => setForm({...form, title: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Company *</label>
                <input className="form-control" placeholder="e.g. Google" value={form.company}
                  onChange={e => setForm({...form, company: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input className="form-control" placeholder="e.g. Bangalore, Remote" value={form.location}
                  onChange={e => setForm({...form, location: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Type *</label>
                <select className="form-control" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                  <option value="FULL_TIME">Full Time</option>
                  <option value="INTERNSHIP">Internship</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="CONTRACT">Contract</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Salary / Stipend</label>
                <input className="form-control" placeholder="e.g. ₹8-12 LPA" value={form.salary}
                  onChange={e => setForm({...form, salary: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Domain</label>
                <input className="form-control" placeholder="e.g. Software, Data Science" value={form.domain}
                  onChange={e => setForm({...form, domain: e.target.value})} />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Apply Link *</label>
                <input className="form-control" placeholder="https://..." value={form.applyLink}
                  onChange={e => setForm({...form, applyLink: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Required Skills</label>
                <input className="form-control" placeholder="React, Java, Python (comma separated)" value={form.skills}
                  onChange={e => setForm({...form, skills: e.target.value})} />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Description *</label>
                <textarea className="form-control" rows={4} placeholder="Job description, responsibilities, requirements..."
                  value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-primary" type="submit"><i className="fas fa-paper-plane"></i> Post Job</button>
              <button className="btn btn-outline" type="button" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <input className="form-control" style={{ flex: 1, minWidth: 200 }} placeholder="Search jobs..."
          value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
        <button className="btn btn-primary btn-sm" onClick={handleSearch}><i className="fas fa-search"></i> Search</button>
        {['ALL','FULL_TIME','INTERNSHIP','PART_TIME','CONTRACT'].map(type => (
          <button key={type} className={`btn btn-sm ${typeFilter === type ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => handleTypeFilter(type)}>
            {type === 'ALL' ? 'All' : type.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? <div className="loading"><i className="fas fa-spinner fa-spin"></i> Loading...</div> :
        jobs.length === 0 ? <div className="empty-state"><i className="fas fa-briefcase"></i><p>No jobs found</p></div> :
        <div className="card-grid">
          {jobs.map(job => (
            <div key={job.id} className={`card job-card ${job.type === 'INTERNSHIP' ? 'internship-card' : ''}`}>
              <div className="flex-between mb-2">
                <span className={`badge ${TYPE_COLORS[job.type] || 'badge-muted'}`}>{job.type?.replace('_', ' ')}</span>
                {user?.id === job.postedBy?.id && (
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(job.id)}>
                    <i className="fas fa-trash"></i>
                  </button>
                )}
              </div>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>{job.title}</h3>
              <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem' }}>{job.company}</p>
              <div style={{ display: 'flex', gap: 12, margin: '8px 0', color: 'var(--text-muted)', fontSize: '0.82rem', flexWrap: 'wrap' }}>
                {job.location && <span><i className="fas fa-map-marker-alt"></i> {job.location}</span>}
                {job.salary && <span><i className="fas fa-money-bill-wave"></i> {job.salary}</span>}
                {job.domain && <span><i className="fas fa-tag"></i> {job.domain}</span>}
              </div>
              <p className="text-sm text-muted" style={{ lineHeight: 1.6, marginBottom: 12 }}>
                {job.description?.substring(0, 120)}{job.description?.length > 120 ? '...' : ''}
              </p>
              {job.skills && (
                <div className="tag-list mb-2">
                  {job.skills.split(',').slice(0, 4).map((s, i) => (
                    <span key={i} className="badge badge-primary">{s.trim()}</span>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                <span className="text-sm text-muted">
                  Posted by {job.postedBy?.fullName}
                </span>
                <a href={job.applyLink} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">
                  <i className="fas fa-external-link-alt"></i> Apply
                </a>
              </div>
            </div>
          ))}
        </div>
      }
    </div>
  );
};

export default Jobs;
