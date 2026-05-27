import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { hazardService } from '../../services/api';
import 'leaflet.heat';

// Fix Leaflet default icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Component to handle map bounds and heatmap logic
const HeatmapLayer = ({ setBounds }) => {
  const map = useMapEvents({
    moveend: () => {
      const b = map.getBounds();
      setBounds({
        north: b.getNorth(),
        south: b.getSouth(),
        east: b.getEast(),
        west: b.getWest()
      });
    },
    load: () => {
      const b = map.getBounds();
      setBounds({
        north: b.getNorth(),
        south: b.getSouth(),
        east: b.getEast(),
        west: b.getWest()
      });
    }
  });
  return null;
};

const LiveMap = ({ center = [13.0827, 80.2707], zoom = 12 }) => {
  const [bounds, setBounds] = useState(null);
  const [heatmapData, setHeatmapData] = useState([]);
  const mapRef = useRef(null);
  const heatLayerRef = useRef(null);

  useEffect(() => {
    if (bounds) {
      hazardService.getHeatmap(bounds).then(data => {
        setHeatmapData(data || []);
      }).catch(err => console.error('Failed to fetch heatmap:', err));
    }
  }, [bounds]);

  useEffect(() => {
    if (mapRef.current && heatmapData.length > 0) {
      const map = mapRef.current;
      
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
      }

      const intensityData = heatmapData.map(p => [p.center_lat, p.center_lng, p.severity_avg / 10]);
      
      heatLayerRef.current = L.heatLayer(intensityData, {
        radius: 25,
        blur: 15,
        maxZoom: 18,
        gradient: {0.4: 'blue', 0.6: 'lime', 0.8: 'yellow', 1.0: 'red'}
      }).addTo(map);
    }
  }, [heatmapData]);

  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    if (navigator.geolocation && mapRef.current) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        mapRef.current.setView(coords, 14);
        setUserLocation(coords);
      }, () => {
        console.warn('Geolocation denied or unavailable');
      });
    }
  }, []);

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative', zIndex: 0 }}>
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%', background: '#0f172a' }}
        ref={mapRef}
        whenReady={() => {
            if(mapRef.current) {
                const b = mapRef.current.getBounds();
                setBounds({
                  north: b.getNorth(),
                  south: b.getSouth(),
                  east: b.getEast(),
                  west: b.getWest()
                });
            }
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <HeatmapLayer setBounds={setBounds} />
        {userLocation && (
          <Marker position={userLocation}>
            <Popup>You are here</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default LiveMap;
