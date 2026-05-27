import { useState, useEffect } from 'react';
import { Activity, AlertTriangle, CheckCircle, Target, Plus } from 'lucide-react';
import LiveMap from '../components/Map/LiveMap';
import ReportHazardModal from '../components/Hazards/ReportHazardModal';
import { hazardService } from '../services/api';

const StatCard = ({ title, value, icon: Icon, colorClass, iconColor }) => (
  <div className="stat-card glass">
    <div>
      <p className="stat-card-title">{title}</p>
      <h4 className="stat-card-value text-white">{value}</h4>
    </div>
    <div className={`stat-card-icon`} style={{ backgroundColor: colorClass }}>
      <Icon size={24} style={{ color: iconColor, opacity: 0.9 }} />
    </div>
  </div>
);

const DashboardPage = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const data = await hazardService.getDashboard();
      setStats(data);
    } catch (error) {
      console.error("Failed to load dashboard stats", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading dashboard...</div>;
  }

  const recentHazards = stats?.recent_hazards || [];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h2>Dashboard</h2>
          <p>Overview of community safety metrics</p>
        </div>
        <button className="btn btn-primary shadow-glow" onClick={() => setIsReportModalOpen(true)}>
          <Plus size={20} /> Report New Hazard
        </button>
      </div>

      <div className="stats-grid">
        <StatCard 
          title="Total Reports" 
          value={stats?.total_hazards || 0} 
          icon={Activity} 
          colorClass="rgba(59, 130, 246, 0.2)"
          iconColor="#60a5fa"
        />
        <StatCard 
          title="Avg. Severity" 
          value={(stats?.avg_severity || 0).toFixed(1)} 
          icon={AlertTriangle} 
          colorClass="rgba(239, 68, 68, 0.2)"
          iconColor="#f87171"
        />
        <StatCard 
          title="Resolved Cases" 
          value={stats?.resolved_count || 0} 
          icon={CheckCircle} 
          colorClass="rgba(16, 185, 129, 0.2)"
          iconColor="#34d399"
        />
        <StatCard 
          title="Your Points" 
          value={user?.points || 0} 
          icon={Target} 
          colorClass="rgba(168, 85, 247, 0.2)"
          iconColor="#c084fc"
        />
      </div>

      <div className="dashboard-main-grid">
        
        <div className="dashboard-map-panel glass">
          <h3 className="panel-title">
            <AlertTriangle size={20} style={{ color: 'var(--accent-primary)' }} /> Live Hazard Map
          </h3>
          <div className="map-container-wrapper">
             <LiveMap />
          </div>
        </div>

        <div className="dashboard-feed-panel glass">
          <h3 className="panel-title" style={{ marginBottom: '1.5rem' }}>Recent Activity</h3>
          <div className="feed-list">
            {recentHazards.length > 0 ? (
              recentHazards.map((h, i) => {
                let severityColor = h.urgency_level === 'HIGH' ? 'var(--danger)' : h.urgency_level === 'MEDIUM' ? 'var(--warning)' : 'var(--success)';
                let severityBg = h.urgency_level === 'HIGH' ? 'rgba(239,68,68,0.2)' : h.urgency_level === 'MEDIUM' ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)';
                
                return (
                  <div key={i} className="feed-item">
                    <div className="feed-item-header">
                      <span className="feed-item-type text-white">{h.hazard_type.replace('_', ' ')}</span>
                      <span className="feed-item-severity" style={{ backgroundColor: severityBg, color: severityColor }}>
                        {h.severity_score.toFixed(1)}
                      </span>
                    </div>
                    <div className="feed-item-footer">
                      <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h.status}</span>
                      <span>{new Date(h.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="feed-empty">No recent hazards reported.</div>
            )}
          </div>
        </div>

      </div>

      {isReportModalOpen && (
        <ReportHazardModal 
          onClose={() => setIsReportModalOpen(false)} 
          onSuccess={() => {
            setIsReportModalOpen(false);
            fetchDashboardData();
          }} 
        />
      )}
    </div>
  );
};

export default DashboardPage;
