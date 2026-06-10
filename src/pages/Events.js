import React, { useState, useEffect } from 'react';
import { eventAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState('upcoming');
  const [form, setForm] = useState({ title: '', description: '', location: '', eventType: 'WEBINAR', eventDate: '', registrationLink: '' });
  const { user } = useAuth();

  useEffect(() => { loadEvents(); }, [tab]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const res = tab === 'upcoming' ? await eventAPI.getUpcoming() : await eventAPI.getAll();
      setEvents(res.data);
    } catch {} finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await eventAPI.create(form);
      setShowForm(false);
      setForm({ title: '', description: '', location: '', eventType: 'WEBINAR', eventDate: '', registrationLink: '' });
      loadEvents();
      alert('Event created!');
    } catch { alert('Failed to create event.'); }
  };

  const handleRegister = async (id) => {
    try { await eventAPI.register(id); alert('Registered for event!'); loadEvents(); }
    catch { alert('Could not register.'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try { await eventAPI.delete(id); loadEvents(); } catch { alert('Could not delete.'); }
  };

  const TYPE_ICONS = { WEBINAR: 'fa-video', MEETUP: 'fa-users', WORKSHOP: 'fa-tools', SEMINAR: 'fa-chalkboard-teacher', REUNION: 'fa-heart' };

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">Events</h1>
          <p className="page-subtitle">Webinars, workshops, reunions and more</p>
        </div>
        {(user?.role === 'ALUMNI' || user?.role === 'ADMIN') && (
          <button className="btn btn-accent" onClick={() => setShowForm(!showForm)}>
            <i className="fas fa-plus"></i> Create Event
          </button>
        )}
      </div>

      {showForm && (
        <div className="card mb-4">
          <h3 style={{ marginBottom: 20, fontWeight: 700 }}>Create New Event</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Event Title *</label>
                <input className="form-control" placeholder="e.g. Alumni Tech Talk 2024" value={form.title}
                  onChange={e => setForm({...form, title: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-control" value={form.eventType} onChange={e => setForm({...form, eventType: e.target.value})}>
                  {['WEBINAR','MEETUP','WORKSHOP','SEMINAR','REUNION'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input className="form-control" placeholder="e.g. Online / Mumbai" value={form.location}
                  onChange={e => setForm({...form, location: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Date & Time *</label>
                <input className="form-control" type="datetime-local" value={form.eventDate}
                  onChange={e => setForm({...form, eventDate: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Registration Link</label>
                <input className="form-control" placeholder="https://..." value={form.registrationLink}
                  onChange={e => setForm({...form, registrationLink: e.target.value})} />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Description</label>
                <textarea className="form-control" rows={3} placeholder="Tell people what this event is about..."
                  value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-primary" type="submit">Create Event</button>
              <button className="btn btn-outline" type="button" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        {['upcoming', 'all'].map(t => (
          <button key={t} className={`btn btn-sm ${tab === t ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab(t)}>
            {t === 'upcoming' ? 'Upcoming Events' : 'All Events'}
          </button>
        ))}
      </div>

      {loading ? <div className="loading"><i className="fas fa-spinner fa-spin"></i> Loading...</div> :
        events.length === 0 ? <div className="empty-state"><i className="fas fa-calendar"></i><p>No events found</p></div> :
        <div className="card-grid">
          {events.map(event => {
            const d = new Date(event.eventDate);
            return (
              <div key={event.id} className="card event-card">
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div className="event-date-box">
                    <div className="day">{d.getDate()}</div>
                    <div className="month">{d.toLocaleString('default', { month: 'short' })}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="flex-between">
                      <span className="badge badge-primary">
                        <i className={`fas ${TYPE_ICONS[event.eventType] || 'fa-calendar'}`} style={{ marginRight: 4 }}></i>
                        {event.eventType}
                      </span>
                      {user?.id === event.organizer?.id && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(event.id)}>
                          <i className="fas fa-trash"></i>
                        </button>
                      )}
                    </div>
                    <h3 style={{ fontWeight: 700, marginTop: 8, marginBottom: 4 }}>{event.title}</h3>
                    <p className="text-muted text-sm">
                      <i className="fas fa-clock"></i> {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {event.location && <> &nbsp;·&nbsp; <i className="fas fa-map-marker-alt"></i> {event.location}</>}
                    </p>
                    {event.description && (
                      <p className="text-sm" style={{ marginTop: 8, lineHeight: 1.6, color: 'var(--text-muted)' }}>
                        {event.description.substring(0, 100)}{event.description.length > 100 ? '...' : ''}
                      </p>
                    )}
                    <p className="text-sm text-muted" style={{ marginTop: 8 }}>
                      Organized by <strong>{event.organizer?.fullName}</strong>
                    </p>
                    <p className="text-sm text-muted">
                      {event.registeredUsers?.length || 0} registered
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                  <button className="btn btn-primary btn-sm" onClick={() => handleRegister(event.id)}>
                    <i className="fas fa-check"></i> Register
                  </button>
                  {event.registrationLink && (
                    <a href={event.registrationLink} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                      <i className="fas fa-external-link-alt"></i> More Info
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      }
    </div>
  );
};

export default Events;
