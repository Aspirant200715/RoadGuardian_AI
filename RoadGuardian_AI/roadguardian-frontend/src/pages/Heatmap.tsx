import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Map, Filter, AlertTriangle, ShieldCheck } from 'lucide-react';

// Fix for default marker icon in leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const mockHazards = [
  { id: 1, lat: 13.0827, lng: 80.2707, type: 'Pothole', severity: 8, status: 'Pending', date: '2026-05-26', code: 'HZ-40A' },
  { id: 2, lat: 13.0850, lng: 80.2750, type: 'Crack', severity: 5, status: 'In Progress', date: '2026-05-25', code: 'HZ-41B' },
  { id: 3, lat: 13.0780, lng: 80.2650, type: 'Waterlogging', severity: 9, status: 'Pending', date: '2026-05-27', code: 'HZ-42C' },
  { id: 4, lat: 13.0900, lng: 80.2800, type: 'Broken Divider', severity: 10, status: 'Pending', date: '2026-05-27', code: 'HZ-43D' },
];

export const Heatmap = () => {
  return (
    <div className="space-y-6 max-w-6xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b-2 border-[#138808] pb-4 shrink-0">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-[#000080] dark:text-foreground">Live Infrastructure Telemetry</h1>
          <p className="text-muted-foreground font-bold text-xs uppercase tracking-wider mt-1">Real-time geospatial plotting of active hazard reports.</p>
        </div>
        <div className="flex items-center text-[10px] font-mono bg-slate-50 dark:bg-muted border border-border px-3 py-1 text-muted-foreground shadow-sm">
          <Map className="w-3 h-3 mr-2" /> SECTOR: CHENNAI NORTH (Z-8)
        </div>
      </div>

      <div className="flex-1 w-full relative border-t-4 border-t-[#000080] dark:border-t-primary rounded-sm overflow-hidden border-x border-b border-border shadow-sm bg-white dark:bg-card">
        {/* Map Header Band */}
        <div className="absolute top-0 left-0 w-full z-[400] pointer-events-none">
           <div className="bg-[#000080] dark:bg-slate-900 text-white py-1.5 px-4 flex justify-between items-center border-b border-border/50 shadow-sm pointer-events-auto w-full">
              <h2 className="font-black uppercase text-[10px] tracking-widest flex items-center"><Filter className="w-3.5 h-3.5 mr-2 text-[#FF9933]"/> Geographic Filter Controls</h2>
              <span className="text-[10px] font-mono font-bold text-success flex items-center"><ShieldCheck className="w-3 h-3 mr-1" /> SYSTEM ONLINE</span>
           </div>
        </div>

        {/* Floating Filter Panel */}
        <div className="absolute top-12 right-4 z-[1000] bg-white/95 dark:bg-card/95 backdrop-blur-md p-4 rounded-sm shadow-md border border-border w-72 space-y-4 hidden md:block">
          <div className="border-b border-border pb-2 flex justify-between items-center">
             <h3 className="font-black text-xs uppercase tracking-wider text-[#000080] dark:text-primary">Data Overlays</h3>
             <span className="text-[9px] font-mono text-muted-foreground bg-slate-100 dark:bg-muted px-1.5 py-0.5 border border-border">FLT-01</span>
          </div>
          
          <div className="space-y-2">
             <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex justify-between">Severity Threshold <span>0-10</span></label>
             <input type="range" min="0" max="10" className="w-full accent-[#000080] dark:accent-primary" />
          </div>
          <div className="space-y-2 pt-2">
             <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Incident Status</label>
             <select className="w-full bg-slate-50 dark:bg-background border border-border rounded-sm px-3 py-2 text-xs font-bold uppercase text-foreground focus:outline-none focus:ring-1 focus:ring-[#000080]">
               <option>All Active Reports</option>
               <option>Pending Dispatch</option>
               <option>Repairs In Progress</option>
               <option>Resolved Incidents</option>
             </select>
          </div>
          
          <div className="bg-[#fdf2e9] dark:bg-yellow-950/20 p-2 border border-[#FF9933]/30 mt-4">
             <p className="text-[9px] text-[#b45309] dark:text-yellow-500 font-bold uppercase tracking-wider flex items-start gap-1">
               <AlertTriangle className="w-3 h-3 shrink-0" />
               High-severity zones automatically escalate to municipal priority.
             </p>
          </div>
        </div>

        {/* Map Container */}
        <div className="w-full h-full pt-8">
          <MapContainer center={[13.0827, 80.2707]} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            {mockHazards.map((hazard) => (
              <Marker key={hazard.id} position={[hazard.lat, hazard.lng]}>
                <Popup className="bg-background text-foreground custom-popup rounded-none p-0 overflow-hidden border-border shadow-md">
                  <div className="w-64">
                     <div className="bg-[#000080] dark:bg-slate-900 text-white py-1.5 px-3 flex justify-between items-center">
                        <span className="font-black text-[10px] uppercase tracking-wider">{hazard.type}</span>
                        <span className="font-mono text-[9px] opacity-70">{hazard.code}</span>
                     </div>
                     <div className="p-3 bg-white dark:bg-card">
                        <table className="w-full text-left text-[10px] font-mono border-collapse mb-3">
                           <tbody className="divide-y divide-border border border-border">
                             <tr>
                               <td className="py-1 px-2 font-bold text-muted-foreground uppercase bg-slate-50 dark:bg-muted/50 w-1/2 border-r border-border">Severity</td>
                               <td className="py-1 px-2 font-black text-destructive">{hazard.severity}/10</td>
                             </tr>
                             <tr>
                               <td className="py-1 px-2 font-bold text-muted-foreground uppercase bg-slate-50 dark:bg-muted/50 border-r border-border">Status</td>
                               <td className="py-1 px-2 font-bold text-foreground uppercase">{hazard.status}</td>
                             </tr>
                             <tr>
                               <td className="py-1 px-2 font-bold text-muted-foreground uppercase bg-slate-50 dark:bg-muted/50 border-r border-border">Log Date</td>
                               <td className="py-1 px-2 font-medium">{hazard.date}</td>
                             </tr>
                           </tbody>
                        </table>
                     </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};
