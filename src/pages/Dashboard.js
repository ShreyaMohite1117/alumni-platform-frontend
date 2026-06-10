import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI, jobAPI, eventAPI, forumAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ alumni: 0, jobs: 0, events: 0, posts: 0 });
  const [recentJobs, setRecentJobs] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [alumni, jobs, events, posts] = await Promise.all([
          userAPI.getAllAlumni(), jobAPI.getAll(), eventAPI.getUpcoming(), forumAPI.getAllPosts()
        ]);
        setStats({
          alumni: alumni.data.length,
          jobs: jobs.data.length,
          events: events.data.length,
          posts: posts.data.length,
        });
        setRecentJobs(jobs.data.slice(0, 3));
        setUpcomingEvents(events.data.slice(0, 3));
      } catch (e) {}
    };
    load();
  }, []);

  const initials = user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  return (
    <div>
      {/* Welcome banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)',
        borderRadius: 16, padding: '28px 32px', marginBottom: 28, color: 'white',
        display: 'flex', alignItems: 'center', gap: 20
      }}>
        <div className="avatar avatar-lg">{initials}</div>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Welcome back, {user?.fullName?.split(' ')[0]}! 👋</h1>
          <p style={{ opacity: 0.8, marginTop: 4 }}>
            {user?.role === 'ALUMNI' ? 'Help students grow — share opportunities & mentor!' : 'Connect with alumni, find internships & grow your career.'}
          </p>
          <div style={{ marginTop: 12, display: 'flex', gap: 10 }}>
            <span style={{ background: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: 20, fontSize: '0.8rem' }}>
              {user?.role}
            </span>
            {user?.department && <span style={{ background: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: 20, fontSize: '0.8rem' }}>{user?.department}</span>}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card" onClick={() => navigate('/alumni')} style={{ cursor: 'pointer' }}>
          <div className="stat-number">{stats.alumni}</div>
          <div className="stat-label"><i className="fas fa-users" style={{ marginRight: 4 }}></i>Alumni</div>
        </div>
        <div className="stat-card" onClick={() => navigate('/jobs')} style={{ cursor: 'pointer' }}>
          <div className="stat-number">{stats.jobs}</div>
          <div className="stat-label"><i className="fas fa-briefcase" style={{ marginRight: 4 }}></i>Opportunities</div>
        </div>
        <div className="stat-card" onClick={() => navigate('/events')} style={{ cursor: 'pointer' }}>
          <div className="stat-number">{stats.events}</div>
          <div className="stat-label"><i className="fas fa-calendar" style={{ marginRight: 4 }}></i>Upcoming Events</div>
        </div>
        <div className="stat-card" onClick={() => navigate('/forum')} style={{ cursor: 'pointer' }}>
          <div className="stat-number">{stats.posts}</div>
          <div className="stat-label"><i className="fas fa-comments" style={{ marginRight: 4 }}></i>Forum Posts</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Recent Jobs */}
        <div className="card">
          <div className="flex-between mb-4">
            <h3 style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>Recent Opportunities</h3>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/jobs')}>View All</button>
          </div>
          {recentJobs.length === 0 ? <p className="text-muted text-sm">No jobs posted yet.</p> :
            recentJobs.map(job => (
              <div key={job.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}
                   onClick={() => navigate('/jobs')} className="post-card">
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{job.title}</div>
                <div className="text-muted text-sm">{job.company} · {job.location}</div>
                <span className="badge badge-accent mt-2">{job.type}</span>
              </div>
            ))}
        </div>

        {/* Upcoming Events */}
        <div className="card">
          <div className="flex-between mb-4">
            <h3 style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>Upcoming Events</h3>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/events')}>View All</button>
          </div>
          {upcomingEvents.length === 0 ? <p className="text-muted text-sm">No upcoming events.</p> :
            upcomingEvents.map(event => (
              <div key={event.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div className="event-date-box">
                  <div className="day">{new Date(event.eventDate).getDate()}</div>
                  <div className="month">{new Date(event.eventDate).toLocaleString('default', {month:'short'})}</div>
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>{event.title}</div>
                  <div className="text-muted text-sm">{event.eventType} · {event.location}</div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="card mt-4">
        <h3 style={{ fontWeight: 700, color: 'var(--primary-dark)', marginBottom: 16 }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => navigate('/alumni')}><i className="fas fa-search"></i> Find Alumni</button>
          {user?.role === 'ALUMNI' && <button className="btn btn-accent" onClick={() => navigate('/jobs')}><i className="fas fa-plus"></i> Post Job</button>}
          <button className="btn btn-outline" onClick={() => navigate('/forum')}><i className="fas fa-pen"></i> Start Discussion</button>
          <button className="btn btn-outline" onClick={() => navigate('/mentorship')}><i className="fas fa-hands-helping"></i> Find Mentor</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
