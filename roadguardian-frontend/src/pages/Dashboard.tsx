import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/services/api';
import { AnimatedCounter } from '@/components/gamification/AnimatedCounter';
import { ShieldPlus, Activity, Trophy, MapPin, CalendarClock, Server, AlertTriangle, RefreshCw, CloudUpload, HardDriveDownload } from 'lucide-react';
import localforage from 'localforage';
import { syncOfflineReports, getOfflineCount, getSyncedReports } from '@/utils/offlineSync';

const formatCoord = (val: any) => {
  if (val === null || val === undefined || val === '') return 'N/A';
  const num = Number(val);
  return isNaN(num) ? 'N/A' : num.toFixed(4);
};

export const Dashboard = () => {
  const { user } = useAuthStore();
  const [reports, setReports] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [pendingOfflineCount, setPendingOfflineCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const navigate = useNavigate();
  const itemsPerPage = 5;

  const totalPages = Math.ceil((Array.isArray(reports) ? reports : []).length / itemsPerPage);
  const paginatedReports = (Array.isArray(reports) ? reports : []).slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const fetchReports = async () => {
    let combinedReports: any[] = [];
    try {
      const response = await api.get('/hazards/my-reports');
      const serverReports = Array.isArray(response.data) ? response.data : [];
      combinedReports = [...serverReports];
      await useAuthStore.getState().refreshUser();
    } catch (error) {
      console.warn("Server request pending or timed out, loading local cache:", error);
    } finally {
      try {
        // Merge recently synced reports stored in local cache
        const localSynced = await getSyncedReports();
        const existingIds = new Set(combinedReports.map(r => String(r.id)));
        for (const sr of localSynced) {
          if (!existingIds.has(String(sr.id))) {
            combinedReports.push(sr);
            existingIds.add(String(sr.id));
          }
        }

        // Merge remaining offline pending reports
        const offlineQueue: any[] = (await localforage.getItem('roadguardian_offline_reports')) || [];
        setPendingOfflineCount(offlineQueue.length);
        if (offlineQueue.length > 0) {
          const mappedOffline = offlineQueue.map((item, idx) => ({
            id: `OFFLINE-${idx + 1}`,
            hazard_type: item.hazard_type || 'other',
            status: 'pending_sync',
            severity_score: item.severity_score || 5.0,
            latitude: Number(item.latitude) || 0,
            longitude: Number(item.longitude) || 0,
            description: `[Sync Pending] ${item.description || ''}`,
            image_url: item.mediaBase64 || '',
            created_at: new Date(item.timestamp).toISOString()
          }));
          for (const mo of mappedOffline) {
            if (!existingIds.has(String(mo.id))) {
              combinedReports.unshift(mo);
            }
          }
        }

        setReports(combinedReports);
      } catch (_) {
        setReports(combinedReports);
      }
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchReports();
    }
  }, [user?.id]);

  useEffect(() => {
    getOfflineCount().then(setPendingOfflineCount);
    const handleQueueChanged = (e: any) => {
      setPendingOfflineCount(e?.detail?.count ?? 0);
    };
    window.addEventListener('roadguardian:offline-queue-changed', handleQueueChanged);
    return () => window.removeEventListener('roadguardian:offline-queue-changed', handleQueueChanged);
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await syncOfflineReports();
    await fetchReports();
    const count = await getOfflineCount();
    setPendingOfflineCount(count);
    setIsSyncing(false);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-2 relative">
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-border bg-slate-50 dark:bg-muted/50">
              <h3 className="font-bold text-lg uppercase tracking-wider text-[#000080] dark:text-primary">
                Report Details - HZ-{selectedReport.id}
              </h3>
              <button onClick={() => setSelectedReport(null)} className="text-muted-foreground hover:text-foreground font-bold text-xl leading-none">&times;</button>
            </div>
            <div className="p-4 space-y-4 overflow-y-auto max-h-[80vh]">
              <div className="space-y-1">
                 <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Classification</h4>
                 <p className="font-medium text-foreground">{selectedReport?.hazard_type?.replace('_', ' ').toUpperCase()}</p>
              </div>
              <div className="space-y-1">
                 <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Status & Severity</h4>
                 <p className="font-medium capitalize text-foreground">{selectedReport?.status} - SEV: {selectedReport?.severity_score}/10</p>
              </div>
              <div className="space-y-1">
                 <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Location</h4>
                 <p className="font-medium text-sm text-foreground">Lat: {formatCoord(selectedReport?.latitude)}, Lng: {formatCoord(selectedReport?.longitude)}</p>
              </div>
              {selectedReport?.description && (
                <div className="space-y-1">
                   <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Description</h4>
                   <p className="text-sm bg-slate-50 dark:bg-muted p-3 rounded-md text-foreground">{selectedReport?.description}</p>
                </div>
              )}
              {selectedReport?.image_url && (
                <div className="space-y-1 mt-2">
                   <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-2">Attached Image</h4>
                   <img 
                      src={selectedReport.image_url.startsWith('http') || selectedReport.image_url.startsWith('data:') ? selectedReport.image_url : `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}${selectedReport.image_url}`} 
                      alt="Hazard" 
                      className="w-full h-auto max-h-60 rounded-md border border-border object-cover" 
                   />
                </div>
              )}
            </div>
            <div className="p-4 border-t border-border bg-slate-50 dark:bg-muted/50 flex justify-end">
              <Button onClick={() => setSelectedReport(null)} variant="outline">Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b-2 border-[#138808] pb-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-[#000080] dark:text-foreground">Citizen Dashboard</h1>
          <p className="text-muted-foreground font-bold text-sm uppercase tracking-wider mt-2">Authorized Profile: {user?.fullName} | Node: IND-204-VX</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleManualSync} 
            disabled={isSyncing}
            variant="outline"
            className="border-[#000080] text-[#000080] dark:border-primary dark:text-primary rounded-sm font-bold text-xs uppercase h-12 px-4 shadow-sm flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : pendingOfflineCount > 0 ? `Sync Offline (${pendingOfflineCount})` : 'Sync / Refresh'}
          </Button>
          <Button size="lg" onClick={() => navigate('/report')} className="bg-[#FF9933] hover:bg-[#e68a2e] text-white rounded-sm font-black text-sm uppercase shadow-sm border-b-2 border-[#b45309] active:border-b-0 active:translate-y-px px-6 h-12">
            <ShieldPlus className="mr-2 h-5 w-5" /> File Hazard Report
          </Button>
        </div>
      </div>

      {/* Offline Pending Notice Banner */}
      {pendingOfflineCount > 0 && (
        <div className="bg-amber-500/10 border-2 border-amber-500/30 p-4 rounded-sm flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500 text-white p-2 rounded-sm shadow-sm">
              <CloudUpload className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black uppercase tracking-wider text-amber-900 dark:text-amber-300">
                {pendingOfflineCount} Local Offline Report{pendingOfflineCount > 1 ? 's' : ''} Ready for Sync
              </h4>
              <p className="text-xs text-amber-800/80 dark:text-amber-400 font-mono">
                Reports are saved securely on your device. Click "Sync Now" to push them to the national database.
              </p>
            </div>
          </div>
          <Button 
            onClick={handleManualSync} 
            disabled={isSyncing}
            className="w-full sm:w-auto bg-[#138808] hover:bg-green-700 text-white font-black text-xs uppercase h-10 px-6 rounded-sm shadow-md flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing Queue...' : 'Sync Now'}
          </Button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-t-4 border-t-[#000080] dark:border-t-primary rounded-sm shadow-sm bg-white dark:bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 bg-slate-50 dark:bg-muted/50 border-b border-border p-4">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-[#000080] dark:text-primary">Civic Score</CardTitle>
            <Trophy className="h-5 w-5 text-[#FF9933]" />
          </CardHeader>
          <CardContent className="p-6 flex justify-between items-end">
            <div>
              <div className="text-5xl font-black text-[#000080] dark:text-foreground font-mono leading-none">
                <AnimatedCounter from={0} to={user?.points || 0} />
              </div>
              <p className="text-xs font-bold text-muted-foreground uppercase mt-2">Top 5% bracket</p>
            </div>
            <div className="text-xs font-mono font-bold bg-muted px-3 py-1.5 border border-border">RANK: HERO</div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-[#138808] dark:border-t-success rounded-sm shadow-sm bg-white dark:bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 bg-slate-50 dark:bg-muted/50 border-b border-border p-4">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-[#000080] dark:text-primary">Logs Submitted</CardTitle>
            <Activity className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-6 flex justify-between items-end">
            <div>
               <div className="text-5xl font-black text-foreground font-mono leading-none">{Array.isArray(reports) ? reports.length : 0}</div>
               <p className="text-xs font-bold text-success uppercase mt-2">Active Tracker</p>
            </div>
            <div className="text-xs font-mono font-bold bg-muted px-3 py-1.5 border border-border text-success">ACTIVE</div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-[#FF9933] rounded-sm shadow-sm bg-white dark:bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 bg-slate-50 dark:bg-muted/50 border-b border-border p-4">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-[#000080] dark:text-primary">Verified Accuracy</CardTitle>
            <ShieldPlus className="h-5 w-5 text-success" />
          </CardHeader>
          <CardContent className="p-6 flex justify-between items-end">
             <div>
                <div className="text-5xl font-black text-foreground font-mono leading-none">8</div>
                <p className="text-xs font-bold text-muted-foreground uppercase mt-2">66% accuracy rate</p>
             </div>
             <div className="text-xs font-mono font-bold bg-muted px-3 py-1.5 border border-border">VERIFIED</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-12 items-start">
        <Card className="col-span-8 rounded-sm shadow-sm overflow-hidden border-border bg-white dark:bg-card">
          <div className="bg-[#000080] dark:bg-slate-900 text-white py-3 px-5 flex justify-between items-center border-b border-border/50">
            <h2 className="font-black uppercase text-sm tracking-widest flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2 text-[#FF9933]" /> Official Incident Registry
            </h2>
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                onClick={handleManualSync} 
                disabled={isSyncing}
                variant="outline"
                className="bg-white/10 hover:bg-white hover:text-[#000080] text-white border-white/20 text-xs font-bold uppercase h-8 px-3 flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing...' : pendingOfflineCount > 0 ? `Sync Queue (${pendingOfflineCount})` : 'Refresh Feed'}
              </Button>
            </div>
          </div>
          <CardContent className="p-0">
             <table className="w-full text-left text-sm border-collapse">
               <thead className="bg-slate-50 dark:bg-muted/50 border-b border-border">
                 <tr>
                   <th className="py-3 px-5 font-bold uppercase tracking-wider text-muted-foreground">Log ID</th>
                   <th className="py-3 px-5 font-bold uppercase tracking-wider text-muted-foreground">Classification</th>
                   <th className="py-3 px-5 font-bold uppercase tracking-wider text-muted-foreground">Location Vector</th>
                   <th className="py-3 px-5 font-bold uppercase tracking-wider text-muted-foreground">Status / Severity</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-border">
                 {paginatedReports.length === 0 ? (
                   <tr>
                     <td colSpan={4} className="py-8 text-center text-muted-foreground font-medium">
                       No reported incidents found. Click "File Hazard Report" to report an issue.
                     </td>
                   </tr>
                 ) : (
                   paginatedReports.map(report => (
                     <tr key={report?.id} className="hover:bg-slate-50 dark:hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setSelectedReport(report)}>
                       <td className="py-4 px-5 font-mono font-bold text-[#000080] dark:text-primary text-[13px]">HZ-{report?.id}</td>
                       <td className="py-4 px-5 font-bold text-foreground uppercase">{report?.hazard_type?.replace('_', ' ') || 'UNKNOWN'}</td>
                       <td className="py-4 px-5">
                         <div className="flex items-center text-muted-foreground font-medium"><MapPin className="w-4 h-4 mr-1.5" /> {formatCoord(report?.latitude)}, {formatCoord(report?.longitude)}</div>
                       </td>
                       <td className="py-4 px-5">
                         <div className="flex items-center space-x-2">
                           <span className={`inline-block px-2.5 py-1 text-xs font-mono font-black uppercase tracking-wider border rounded-sm ${
                             report?.status === 'resolved' ? 'bg-[#138808]/10 text-[#138808] border-[#138808]' :
                             report?.status === 'pending_sync' ? 'bg-amber-500/10 text-amber-600 border-amber-500 animate-pulse' :
                             report?.status === 'in_progress' ? 'bg-[#FF9933]/10 text-[#FF9933] border-[#FF9933]' :
                             'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                           }`}>
                             {report?.status === 'pending_sync' ? 'Sync Pending' : (report?.status || 'Active')}
                           </span>
                           <span className="font-mono text-xs font-bold text-muted-foreground">SEV: {report?.severity_score || 5}/10</span>
                         </div>
                       </td>
                     </tr>
                   ))
                 )}
               </tbody>
             </table>

             {/* Pagination */}
             {totalPages > 1 && (
               <div className="flex items-center justify-between p-4 border-t border-border bg-slate-50 dark:bg-muted/50">
                 <Button
                   variant="outline"
                   size="sm"
                   onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                   disabled={currentPage === 1}
                   className="text-xs uppercase font-bold"
                 >
                   Previous
                 </Button>
                 <span className="text-xs font-mono font-bold text-muted-foreground">
                   Page {currentPage} of {totalPages}
                 </span>
                 <Button
                   variant="outline"
                   size="sm"
                   onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                   disabled={currentPage === totalPages}
                   className="text-xs uppercase font-bold"
                 >
                   Next
                 </Button>
               </div>
             )}
          </CardContent>
        </Card>

        {/* System Telemetry Side Panel */}
        <div className="col-span-4 space-y-6">
          <Card className="rounded-sm shadow-sm border-border bg-white dark:bg-card">
            <CardHeader className="bg-slate-50 dark:bg-muted/50 border-b border-border p-4">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-[#000080] dark:text-primary flex items-center">
                <Server className="w-4 h-4 mr-2" /> Node Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-muted-foreground">PORTAL VERSION:</span>
                <span className="font-bold">v1.2.4-PROD</span>
              </div>
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-muted-foreground">ENCRYPTION:</span>
                <span className="text-success font-bold">AES-256-GCM</span>
              </div>
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-muted-foreground">NODE INTEGRITY:</span>
                <span className="text-success font-bold">100% OPERATIONAL</span>
              </div>
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-muted-foreground">OFFLINE QUEUE:</span>
                <span className={`font-bold ${pendingOfflineCount > 0 ? 'text-amber-500' : 'text-muted-foreground'}`}>
                  {pendingOfflineCount} PENDING
                </span>
              </div>
              <div className="pt-2 border-t border-border">
                <Button 
                  onClick={handleManualSync} 
                  disabled={isSyncing}
                  variant="outline"
                  className="w-full text-xs font-bold uppercase h-9 flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Synchronizing...' : 'Force Queue Sync'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
