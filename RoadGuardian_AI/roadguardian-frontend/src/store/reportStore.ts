import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Report {
  id: string;
  type: string;
  severity: number;
  location: string;
  date: string;
  status: 'Pending' | 'Under Review' | 'Resolved';
  code: string;
  image?: string;
  transcript?: string;
  coords?: { lat: number, lng: number } | null;
}

interface ReportState {
  reports: Report[];
  addReport: (report: Omit<Report, 'id' | 'date' | 'status' | 'code'>) => void;
}

export const useReportStore = create<ReportState>()(
  persist(
    (set) => ({
      reports: [
        { id: '1', type: 'Pothole', severity: 8, location: 'Main St & 4th Ave, Mumbai, Maharashtra', date: '2h ago', status: 'Pending', code: 'RPT-104A' },
        { id: '2', type: 'Missing Sign', severity: 5, location: 'Oak Road, Ward K, Mumbai', date: '1d ago', status: 'Under Review', code: 'RPT-105B' },
        { id: '3', type: 'Waterlogging', severity: 3, location: 'Highland Park, Navi Mumbai', date: '3d ago', status: 'Resolved', code: 'RPT-106C' }
      ],
      addReport: (reportData) => set((state) => {
        const newReport: Report = {
          ...reportData,
          id: Math.random().toString(36).substr(2, 9),
          date: 'Just now',
          status: 'Pending',
          code: `RPT-${Math.floor(100 + Math.random() * 900)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`
        };
        return { reports: [newReport, ...state.reports] };
      })
    }),
    {
      name: 'report-storage',
    }
  )
);
