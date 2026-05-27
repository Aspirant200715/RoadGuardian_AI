import { useState } from 'react';
import { Shield, Menu, X, User as UserIcon } from 'lucide-react';
import AuthModal from '../Auth/AuthModal';

const Navbar = ({ user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authModal, setAuthModal] = useState({ isOpen: false, view: 'login' });

  const openAuth = (view) => setAuthModal({ isOpen: true, view });
  const closeAuth = () => setAuthModal({ isOpen: false, view: 'login' });

  return (
    <>
      <nav className="navbar glass">
        <div className="nav-brand">
          <Shield style={{ color: 'var(--accent-primary)' }} size={32} />
          <div>
            <h1>RoadGuardian AI</h1>
            <span>Community Safety Hub</span>
          </div>
        </div>

        <div className="nav-links">
          <a href="/#features">Features</a>
          <a href="/#map-view">Live Map</a>
          {user && <a href="/dashboard" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Dashboard</a>}
        </div>

        <div className="nav-actions">
          {user ? (
            <>
              <div className="nav-user-badge">
                <UserIcon size={16} style={{ color: 'var(--text-secondary)' }} />
                <span>{user.full_name || user.email}</span>
                <span className="nav-points">{user.points || 0} pts</span>
              </div>
              <button onClick={onLogout} className="btn btn-outline" style={{ padding: '0.4rem 1rem' }}>Sign Out</button>
            </>
          ) : (
            <>
              <button onClick={() => openAuth('login')} className="btn btn-outline">Sign In</button>
              <button onClick={() => openAuth('register')} className="btn btn-primary">Create Account</button>
            </>
          )}
        </div>

        <button className="nav-mobile-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {isMenuOpen && (
        <div className="mobile-menu glass">
          <a href="/#features" onClick={() => setIsMenuOpen(false)}>Features</a>
          <a href="/#map-view" onClick={() => setIsMenuOpen(false)}>Live Map</a>
          {user && <a href="/dashboard" onClick={() => setIsMenuOpen(false)}>Dashboard</a>}
          <hr style={{ borderColor: 'var(--border-color)', margin: '0.5rem 0' }} />
          {user ? (
            <button onClick={() => { onLogout(); setIsMenuOpen(false); }} className="btn btn-outline">Sign Out</button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button onClick={() => { openAuth('login'); setIsMenuOpen(false); }} className="btn btn-outline">Sign In</button>
              <button onClick={() => { openAuth('register'); setIsMenuOpen(false); }} className="btn btn-primary">Create Account</button>
            </div>
          )}
        </div>
      )}

      {authModal.isOpen && (
        <AuthModal 
          initialView={authModal.view} 
          onClose={closeAuth} 
          onSuccess={() => {
            closeAuth();
            window.location.reload(); 
          }} 
        />
      )}
    </>
  );
};

export default Navbar;
