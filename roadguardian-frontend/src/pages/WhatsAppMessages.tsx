import React, { useState, useEffect } from 'react';
import { MessageCircle, Clock, MapPin, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '@/services/api';
import toast from 'react-hot-toast';

interface WhatsAppMessage {
  id: number;
  hazard_type: string;
  description: string;
  latitude: number;
  longitude: number;
  created_at: string;
  status: string;
  severity_score: number;
  urgency_level: string;
  linked_department?: string;
  reporter_name?: string;
  image_url?: string;
}

const getImageUrl = (url?: string) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `http://127.0.0.1:8000${url}`;
};

export const WhatsAppMessages = () => {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'whatsapp_staging' | 'pending' | 'verified' | 'resolved'>('all');

  useEffect(() => {
    fetchWhatsAppMessages();
    // Poll for new messages every 5 seconds
    const interval = setInterval(fetchWhatsAppMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchWhatsAppMessages = async () => {
    try {
      const response = await api.get('/whatsapp/all');
      setMessages(response.data || []);
    } catch (error) {
      console.error('Failed to fetch WhatsApp messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMessages = messages.filter(msg => {
    if (filter === 'pending') return msg.status === 'pending';
    if (filter === 'whatsapp_staging') return msg.status === 'whatsapp_staging';
    if (filter === 'resolved') return msg.status === 'resolved';
    if (filter === 'verified') return msg.status === 'verified';
    return true;
  });

  const hazardTypeColors: Record<string, string> = {
    pothole: 'bg-yellow-100 text-yellow-800',
    crack: 'bg-orange-100 text-orange-800',
    waterlogging: 'bg-blue-100 text-blue-800',
    broken_dividers: 'bg-red-100 text-red-800',
    missing_signs: 'bg-purple-100 text-purple-800',
    street_light_fault: 'bg-indigo-100 text-indigo-800',
    manhole_defect: 'bg-red-200 text-red-800',
    road_debris: 'bg-gray-100 text-gray-800',
    pavement_defect: 'bg-amber-100 text-amber-800',
    other: 'bg-slate-100 text-slate-800'
  };

  const getSeverityColor = (severity: number) => {
    if (severity >= 7) return 'text-red-600';
    if (severity >= 5) return 'text-orange-600';
    if (severity >= 3) return 'text-yellow-600';
    return 'text-green-600';
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Official Govt Header */}
      <div className="bg-[#000080] text-white border-b-4 border-[#FF9933] shadow-md dark:bg-[#0a0a1a]">
        <div className="max-w-[1600px] mx-auto px-6 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <div className="hidden md:flex bg-white text-[#000080] font-serif font-black rounded-full w-14 h-14 items-center justify-center border-[3px] border-[#138808] shadow-inner text-xl">
              GOI
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-widest uppercase drop-shadow-md">
                Citizen Communications Center
              </h1>
              <p className="text-[#FF9933] text-xs md:text-sm tracking-[0.2em] uppercase mt-1 font-bold">
                WhatsApp Emergency Tip Line
              </p>
            </div>
          </div>
          
          <div className="flex items-center text-[10px] font-mono font-bold uppercase tracking-wider bg-white/10 border border-white/30 px-3 py-1.5 text-white shadow-sm rounded-sm">
            STATUS: MONITORING ENCRYPTED COMMS
          </div>
        </div>
      </div>

      <div className="bg-muted/30 border-b border-border shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 flex overflow-x-auto custom-scrollbar">
          {(['all', 'whatsapp_staging', 'pending', 'verified', 'resolved'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-6 py-4 text-sm font-bold tracking-wider uppercase border-b-4 whitespace-nowrap transition-colors ${
                filter === tab
                  ? 'border-[#000080] text-[#000080] dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              {tab === 'whatsapp_staging' ? 'INBOX' : tab}
              <span className="ml-2 bg-black/10 dark:bg-white/10 px-2 py-0.5 rounded-sm">
                {messages.filter(msg => {
                    if (tab === 'pending') return msg.status === 'pending';
                    if (tab === 'whatsapp_staging') return msg.status === 'whatsapp_staging';
                    if (tab === 'resolved') return msg.status === 'resolved';
                    if (tab === 'verified') return msg.status === 'verified';
                    return true;
                }).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 py-8">

        {/* Messages List */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-green-500" />
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center border border-slate-200">
              <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600">No WhatsApp messages yet</p>
            </div>
          ) : (
            filteredMessages.map((msg, idx) => (
              <div
                key={msg.id || idx}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-slate-200 overflow-hidden"
              >
                <div className="p-4">
                  {/* Message Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        WA
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          Report #{msg.id}
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(msg.created_at)} at {formatTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-2 py-1 rounded ${
                        msg.status === 'resolved' ? 'bg-green-100 text-green-700' : 
                        msg.status === 'verified' ? 'bg-indigo-100 text-indigo-700' :
                        msg.status === 'whatsapp_staging' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {msg.status === 'resolved' ? '✓ Resolved' : 
                         msg.status === 'verified' ? '✓ Verified' :
                         msg.status === 'whatsapp_staging' ? 'Inbox' : '⏳ Pending'}
                      </span>
                      {msg.status === 'whatsapp_staging' && (
                        <button 
                          onClick={async () => {
                            if (!msg.image_url) {
                              toast.error("Please add an image to this report before promoting.");
                              return;
                            }
                            try {
                              await api.post(`/whatsapp/promote/${msg.id}`);
                              toast.success('Promoted to official report');
                              fetchWhatsAppMessages();
                            } catch (e) {
                              toast.error('Failed to promote');
                            }
                          }}
                          className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded shadow-sm transition-colors"
                        >
                          Promote
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Hazard Type Badge */}
                  <div className="mb-3">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      hazardTypeColors[msg.hazard_type] || hazardTypeColors.other
                    }`}>
                      {msg.hazard_type?.replace(/_/g, ' ').toUpperCase()}
                    </span>
                    {msg.severity_score && (
                      <span className={`ml-2 text-sm font-semibold ${getSeverityColor(msg.severity_score)}`}>
                        Severity: {msg.severity_score.toFixed(1)}/10
                      </span>
                    )}
                  </div>

                  {/* Message Content */}
                  <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded mb-3">
                    {msg.image_url && (
                      <div className="mb-3 rounded overflow-hidden">
                        <img src={getImageUrl(msg.image_url) || ''} alt="Report Photo" className="max-h-48 object-cover" />
                      </div>
                    )}
                    <p className="text-slate-700 text-sm">
                      {msg.description?.replace('[WhatsApp Report] ', '') || 'No description'}
                    </p>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-2 rounded">
                    <MapPin className="w-3 h-3 text-red-500" />
                    <span>
                      Lat: {msg.latitude?.toFixed(4)}, Lng: {msg.longitude?.toFixed(4)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary Stats */}
        {messages.length > 0 && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <div className="bg-card p-4 border-2 border-border shadow-sm flex flex-col justify-between">
              <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">Total Reports</p>
              <p className="text-2xl font-black text-foreground mt-2">{messages.length}</p>
            </div>
            <div className="bg-card p-4 border-2 border-border shadow-sm flex flex-col justify-between border-b-4 border-b-yellow-500">
              <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">Pending Review</p>
              <p className="text-2xl font-black text-yellow-600 dark:text-yellow-500 mt-2">
                {messages.filter(m => m.status === 'pending').length}
              </p>
            </div>
            <div className="bg-card p-4 border-2 border-border shadow-sm flex flex-col justify-between border-b-4 border-b-indigo-500">
              <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">Verified</p>
              <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-2">
                {messages.filter(m => m.status === 'verified').length}
              </p>
            </div>
            <div className="bg-card p-4 border-2 border-border shadow-sm flex flex-col justify-between border-b-4 border-b-[#138808]">
              <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">Resolved</p>
              <p className="text-2xl font-black text-[#138808] dark:text-[#138808] mt-2">
                {messages.filter(m => m.status === 'resolved').length}
              </p>
            </div>
            <div className="bg-card p-4 border-2 border-border shadow-sm flex flex-col justify-between">
              <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">Primary Hazard</p>
              <p className="text-lg font-black text-[#000080] dark:text-blue-400 mt-2 capitalize truncate">
                {messages.reduce((acc: Record<string, number>, m) => {
                  acc[m.hazard_type] = (acc[m.hazard_type] || 0) + 1;
                  return acc;
                }, {}) &&
                  Object.entries(
                    messages.reduce((acc: Record<string, number>, m) => {
                      acc[m.hazard_type] = (acc[m.hazard_type] || 0) + 1;
                      return acc;
                    }, {})
                  ).sort((a, b) => b[1] - a[1])[0]?.[0]?.replace(/_/g, ' ') || 'N/A'
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
