import { useState, useRef, useEffect } from 'react';
import { Camera, X } from 'lucide-react';
import { hazardService } from '../../services/api';

const ReportHazardModal = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);
  
  const [formData, setFormData] = useState({
    hazardType: 'pothole',
    latitude: '',
    longitude: '',
    description: '',
    photo: null
  });

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setFormData(prev => ({ ...prev, latitude: pos.coords.latitude, longitude: pos.coords.longitude })),
        (err) => console.warn('Could not fetch location', err)
      );
    }
  }, []);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, photo: file });
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const data = new FormData();
    data.append('hazard_type', formData.hazardType);
    data.append('latitude', formData.latitude);
    data.append('longitude', formData.longitude);
    data.append('description', formData.description);
    if (formData.photo) {
      data.append('image', formData.photo);
    }

    try {
      await hazardService.uploadHazard(data);
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>New Report</p>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Submit a Hazard</h2>
          </div>
          <button className="modal-close" onClick={onClose}><X size={24} /></button>
        </div>

        <div className="modal-body">
          {error && <div className="form-error">{error}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Photo Evidence</label>
              <div className="photo-upload-area" onClick={() => fileInputRef.current?.click()}>
                {preview ? (
                  <>
                    <img src={preview} alt="Preview" className="photo-upload-preview" />
                    <div className="photo-upload-overlay">
                      <p style={{ color: 'white', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Camera size={18} /> Change Photo</p>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <Camera size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.7 }} />
                    <p>Click to upload a photo</p>
                    <p style={{ fontSize: '0.75rem', marginTop: '0.25rem', opacity: 0.7 }}>Helps AI assess severity</p>
                  </div>
                )}
                <input type="file" hidden accept="image/*" ref={fileInputRef} onChange={handlePhotoChange} />
              </div>
            </div>

            <div className="form-grid">
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label>Hazard Type</label>
                <select value={formData.hazardType} onChange={e => setFormData({...formData, hazardType: e.target.value})}>
                  <option value="pothole">Pothole</option>
                  <option value="crack">Crack</option>
                  <option value="waterlogging">Waterlogging</option>
                  <option value="broken_divider">Broken Divider</option>
                  <option value="missing_sign">Missing Sign</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="input-group" style={{ marginBottom: 0 }}>
                <label>Location (Lat, Lng)</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="number" step="any" required placeholder="Lat" value={formData.latitude} onChange={e => setFormData({...formData, latitude: e.target.value})} />
                  <input type="number" step="any" required placeholder="Lng" value={formData.longitude} onChange={e => setFormData({...formData, longitude: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Additional Details</label>
              <textarea 
                rows="3" 
                placeholder="e.g., size, lane, traffic impact..."
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                style={{ resize: 'none' }}
              ></textarea>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading || !formData.latitude || !formData.longitude || !formData.photo}>
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportHazardModal;
