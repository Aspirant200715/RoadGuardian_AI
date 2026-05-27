import { ArrowRight, Camera, AlertTriangle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LiveMap from '../components/Map/LiveMap';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div>
      <section className="hero-section">
        <div className="hero-bg"></div>
        <h1 className="hero-title">
          <span className="text-gradient" style={{ display: 'block', marginBottom: '0.5rem' }}>Safer Roads, Together.</span>
          Report Hazards in Seconds.
        </h1>
        <p className="hero-subtitle">
          Use AI-powered tools to report potholes, waterlogging, and other dangers. 
          Help authorities respond faster and make your community safer.
        </p>
        <div className="hero-cta">
          <button className="btn btn-primary btn-large" onClick={() => navigate('/dashboard')}>
            Report a Hazard <ArrowRight size={20} />
          </button>
          <a href="#map-view" className="btn btn-outline btn-large">
            View Live Map
          </a>
        </div>
      </section>

      <section id="features" className="section-container">
        <div className="features-grid">
          <div className="feature-card glass">
            <div className="feature-icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.2)' }}>
              <Camera style={{ color: 'var(--accent-primary)' }} size={32} />
            </div>
            <span className="feature-tag" style={{ color: 'var(--accent-primary)' }}>Capture</span>
            <h3>Effortless Reporting</h3>
            <p>Submit hazards using photos or voice notes. Our AI analyzes the severity and categorizes it automatically.</p>
          </div>
          
          <div className="feature-card glass">
            <div className="feature-icon-wrapper" style={{ background: 'rgba(168, 85, 247, 0.2)' }}>
              <AlertTriangle style={{ color: '#a855f7' }} size={32} />
            </div>
            <span className="feature-tag" style={{ color: '#a855f7' }}>Analyze</span>
            <h3>Smart Prioritization</h3>
            <p>Hazards are scored based on type, location, and potential risk to help authorities act on critical issues first.</p>
          </div>

          <div className="feature-card glass">
            <div className="feature-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.2)' }}>
              <CheckCircle style={{ color: 'var(--success)' }} size={32} />
            </div>
            <span className="feature-tag" style={{ color: 'var(--success)' }}>Resolve</span>
            <h3>Transparent Workflow</h3>
            <p>Track the status of your reports from submission to resolution with real-time updates on your personal dashboard.</p>
          </div>
        </div>
      </section>

      <section id="map-view" className="section-container">
        <div className="map-preview-card glass">
          <div className="map-preview-header">
            <div>
              <h2 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>Citywide Hazard Map</h2>
              <p style={{ color: 'var(--text-secondary)' }}>A real-time view of all reported incidents and severity heatmaps.</p>
            </div>
            <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
              Dashboard
            </button>
          </div>
          <div className="map-preview-body">
             <LiveMap />
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
