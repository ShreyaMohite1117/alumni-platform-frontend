import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', role: 'STUDENT',
    graduationYear: '', degree: '', department: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">Alumni<span>Connect</span></div>
        <h2 style={{ textAlign: 'center', marginBottom: 24, fontSize: '1.1rem', color: '#555' }}>Create Your Account</h2>
        {error && <div style={{ background: '#ffebee', color: '#c62828', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: '0.9rem' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-control" placeholder="John Doe"
              value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-control" type="email" placeholder="your@email.com"
              value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-control" type="password" placeholder="Min 6 characters"
              value={form.password} onChange={e => setForm({...form, password: e.target.value})} required minLength={6} />
          </div>
          <div className="form-group">
            <label className="form-label">I am a</label>
            <select className="form-control" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
              <option value="STUDENT">Student</option>
              <option value="ALUMNI">Alumni</option>
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Department</label>
              <input className="form-control" placeholder="e.g. Computer Science"
                value={form.department} onChange={e => setForm({...form, department: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Graduation Year</label>
              <input className="form-control" placeholder="e.g. 2022"
                value={form.graduationYear} onChange={e => setForm({...form, graduationYear: e.target.value})} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Degree</label>
            <input className="form-control" placeholder="e.g. B.Tech, M.Tech"
              value={form.degree} onChange={e => setForm({...form, degree: e.target.value})} />
          </div>
          <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <div className="auth-switch">
          Already have an account? <a onClick={() => navigate('/login')}>Sign In</a>
        </div>
      </div>
    </div>
  );
};

export default Register;
