import localforage from 'localforage';
import { api } from '@/services/api';
import toast from 'react-hot-toast';

export interface OfflineReport {
  id: string;
  type: 'image' | 'voice';
  latitude: string;
  longitude: string;
  hazard_type?: string;
  description?: string;
  severity_score?: number;
  confidence_score?: number;
  mediaFilename: string;
  mediaMimeType: string;
  mediaBase64: string;
  timestamp: number;
}

export type OfflineReportPayload = Omit<OfflineReport, 'mediaBase64'> & {
  mediaBlob: Blob;
};

const OFFLINE_STORE_KEY = 'roadguardian_offline_reports';
let isSyncing = false;

const blobToBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

const base64ToBlob = (base64: string, type: string) => {
  const parts = base64.split(',');
  const raw = atob(parts[1]);
  const uInt8Array = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) {
    uInt8Array[i] = raw.charCodeAt(i);
  }
  return new Blob([uInt8Array], { type });
};

export const getOfflineReports = async (): Promise<OfflineReport[]> => {
  try {
    return (await localforage.getItem<OfflineReport[]>(OFFLINE_STORE_KEY)) || [];
  } catch {
    return [];
  }
};

export const getOfflineCount = async (): Promise<number> => {
  const list = await getOfflineReports();
  return list.length;
};

const notifyOfflineChange = (count: number) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('roadguardian:offline-queue-changed', { detail: { count } }));
  }
};

export const saveOfflineReport = async (report: OfflineReportPayload): Promise<boolean> => {
  try {
    const existing = await getOfflineReports();
    const mediaBase64 = await blobToBase64(report.mediaBlob);
    existing.push({
      ...report,
      mediaBase64,
    });
    await localforage.setItem(OFFLINE_STORE_KEY, existing);
    notifyOfflineChange(existing.length);
    toast.success('Report registered in offline queue! Tap "Sync Now" anytime.', { icon: '💾', duration: 5000 });
    return true;
  } catch (error) {
    console.error('Failed to save offline report:', error);
    toast.error('Failed to save report locally.');
    return false;
  }
};

export const clearOfflineReports = async () => {
  await localforage.removeItem(OFFLINE_STORE_KEY);
  notifyOfflineChange(0);
};

export const syncOfflineReports = async (): Promise<{ success: boolean; synced: number; remaining: number }> => {
  if (isSyncing) {
    console.log('Sync already in progress...');
    return { success: false, synced: 0, remaining: 0 };
  }

  isSyncing = true;
  let syncedCount = 0;

  try {
    const existing = await getOfflineReports();
    if (existing.length === 0) {
      isSyncing = false;
      return { success: true, synced: 0, remaining: 0 };
    }

    toast.loading(`Syncing ${existing.length} offline report(s)...`, { id: 'offline-sync' });

    const remainingReports = [...existing];

    for (let i = 0; i < existing.length; i++) {
      const report = existing[i];
      const formData = new FormData();
      formData.append('latitude', report.latitude);
      formData.append('longitude', report.longitude);
      formData.append('hazard_type', report.hazard_type || 'pothole');
      formData.append('description', report.description || 'Offline report submission');
      formData.append('severity_score', String(report.severity_score || 5.0));
      formData.append('confidence_score', String(report.confidence_score || 0.85));

      const blob = base64ToBlob(report.mediaBase64, report.mediaMimeType);

      try {
        if (report.type === 'image') {
          formData.append('image', blob, report.mediaFilename);
          await api.post('/hazards/upload', formData, { timeout: 60000 });
        } else {
          formData.append('audio', blob, report.mediaFilename);
          await api.post('/hazards/voice-report', formData, { timeout: 60000 });
        }

        // Successfully uploaded: remove this item immediately from storage
        syncedCount += 1;
        const removeIndex = remainingReports.findIndex(r => r.id === report.id);
        if (removeIndex !== -1) {
          remainingReports.splice(removeIndex, 1);
          await localforage.setItem(OFFLINE_STORE_KEY, remainingReports);
          notifyOfflineChange(remainingReports.length);
        }
      } catch (itemErr: any) {
        console.warn(`Failed to sync item ${report.id}:`, itemErr?.message);
        // Stop syncing remaining items if server is unreachable
        const isConnError = itemErr?.code === 'ECONNABORTED' || itemErr?.code === 'ERR_NETWORK' || itemErr?.message?.includes('timeout');
        if (isConnError) {
          toast.error(`Server node waking up. Synced ${syncedCount}/${existing.length}. Remaining queued.`, { id: 'offline-sync' });
          isSyncing = false;
          return { success: false, synced: syncedCount, remaining: remainingReports.length };
        }
      }
    }

    if (remainingReports.length === 0) {
      await localforage.removeItem(OFFLINE_STORE_KEY);
      notifyOfflineChange(0);
      toast.success('All reports synced to national database!', { id: 'offline-sync' });
      return { success: true, synced: syncedCount, remaining: 0 };
    } else {
      toast.success(`Synced ${syncedCount} report(s). ${remainingReports.length} queued.`, { id: 'offline-sync' });
      return { success: true, synced: syncedCount, remaining: remainingReports.length };
    }
  } catch (error) {
    console.error('Sync failed:', error);
    toast.error('Sync paused. Will retry when connection stabilizes.', { id: 'offline-sync' });
    return { success: false, synced: syncedCount, remaining: 0 };
  } finally {
    isSyncing = false;
  }
};
