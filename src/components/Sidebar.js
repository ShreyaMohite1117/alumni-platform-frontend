import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { messageAPI } from '../services/api';

const navItems = [
  { path: '/dashboard', icon: 'fa-home', label: 'Dashboard' },
  { path: '/alumni', icon: 'fa-users', label: 'Alumni Network' },
  { path: '/jobs', icon: 'fa-briefcase', label: 'Jobs & Internships' },
  { path: '/forum', icon: 'fa-comments', label: 'Discussion Forum' },
  { path: '/events', icon: 'fa-calendar', label: 'Events' },
  { path: '/messages', icon: 'fa-envelope', label: 'Messages' },
  { path: '/mentorship', icon: 'fa-hands-helping', label: 'Mentorship' },
  { path: '/profile', icon: 'fa-user-circle', label: 'My Profile' },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadUnreadCount();

    const interval = setInterval(() => {
      loadUnreadCount();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadUnreadCount = async () => {
    try {
      const res = await messageAPI.getUnreadCount();
      setUnreadCount(res.data.count || 0);
    } catch (error) {
      console.error('Failed to load unread count');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials =
    user?.fullName
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase() || 'U';

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        Alumni<span>Connect</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <i className={`fas ${item.icon}`}></i>

            <span>{item.label}</span>

            {item.path === '/messages' && unreadCount > 0 && (
              <span
                style={{
                  background: '#ef4444',
                  color: '#fff',
                  borderRadius: '50%',
                  minWidth: '22px',
                  height: '22px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  marginLeft: 'auto',
                }}
              >
                {unreadCount}
              </span>
            )}
          </NavLink>
        ))}

        <div
          className="nav-item"
          onClick={handleLogout}
          style={{ cursor: 'pointer', marginTop: 'auto' }}
        >
          <i className="fas fa-sign-out-alt"></i>
          Logout
        </div>
      </nav>

      <div className="sidebar-user">
        <div className="avatar">{initials}</div>
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>
            {user?.fullName}
          </div>
          <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>
            {user?.role}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;