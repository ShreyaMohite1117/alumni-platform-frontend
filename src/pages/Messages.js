import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { messageAPI, userAPI } from '../services/api';

const Messages = () => {
  const [partners, setPartners] = useState([]);
  const [alumni, setAlumni] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => { loadContacts(); }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const toId = params.get('to');
    if (toId) {
      userAPI.getById(toId).then(res => setSelectedUser(res.data)).catch(() => { });
    }
  }, [location]);

  useEffect(() => {
    if (selectedUser) loadConversation();
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadContacts = async () => {
    try {
      const [partsRes, alumniRes] = await Promise.all([messageAPI.getPartners(), userAPI.getAllAlumni()]);
      setPartners(partsRes.data);
      setAlumni(alumniRes.data);
    } catch { }
  };

  const loadConversation = async () => {
    setLoading(true);
    try { const res = await messageAPI.getConversation(selectedUser.id); setMessages(res.data); }
    catch { setMessages([]); } finally { setLoading(false); }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;
    try {
      const res = await messageAPI.send(selectedUser.id, newMessage);
      setMessages([...messages, res.data]);
      setNewMessage('');
      if (!partners.find(p => p.id === selectedUser.id)) {
        setPartners([selectedUser, ...partners]);
      }
    } catch (error) {
      console.log("ERROR:", error);
      console.log("STATUS:", error.response?.status);
      console.log("DATA:", error.response?.data);
      alert(error.response?.data || "Failed");
    }
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
  const allContacts = [...new Map([...partners, ...alumni].map(u => [u.id, u])).values()]
    .filter(u => u.id !== user?.id);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Direct Messages</h1>
        <p className="page-subtitle">Connect one-on-one with alumni and students</p>
      </div>

      <div className="messages-layout">
        {/* Contacts panel */}
        <div className="contacts-panel">
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', fontWeight: 700, background: '#f8faff' }}>
            <i className="fas fa-users" style={{ marginRight: 8 }}></i> Contacts
          </div>
          {allContacts.length === 0 ? (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No contacts yet
            </div>
          ) : allContacts.map(contact => (
            <div key={contact.id}
              className={`contact-item ${selectedUser?.id === contact.id ? 'active' : ''}`}
              onClick={() => setSelectedUser(contact)}>
              <div className="avatar">{getInitials(contact.fullName)}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{contact.fullName}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {contact.jobTitle || contact.role} {contact.company ? `@ ${contact.company}` : ''}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chat panel */}
        <div className="chat-panel">
          {!selectedUser ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexDirection: 'column', gap: 12 }}>
              <i className="fas fa-comments" style={{ fontSize: '3rem', opacity: 0.2 }}></i>
              <p>Select a contact to start chatting</p>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, background: '#f8faff' }}>
                <div className="avatar">{getInitials(selectedUser.fullName)}</div>
                <div>
                  <div style={{ fontWeight: 700 }}>{selectedUser.fullName}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {selectedUser.jobTitle} {selectedUser.company ? `@ ${selectedUser.company}` : ''} · {selectedUser.role}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="chat-messages">
                {loading ? (
                  <div className="loading"><i className="fas fa-spinner fa-spin"></i></div>
                ) : messages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>
                    No messages yet. Say hello!
                  </div>
                ) : messages.map(msg => {
                  const isSent = msg.sender?.id === user?.id || msg.sender?.email === user?.email;
                  return (
                    <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isSent ? 'flex-end' : 'flex-start' }}>
                      <div className={`message-bubble ${isSent ? 'message-sent' : 'message-received'}`}>
                        {msg.content}
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="chat-input-row">
                <input className="form-control" placeholder="Type a message..."
                  value={newMessage} onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()} />
                <button className="btn btn-primary" onClick={sendMessage}>
                  <i className="fas fa-paper-plane"></i>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
