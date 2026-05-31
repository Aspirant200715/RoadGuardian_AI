import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tenderApi, Bid } from '@/services/tenderApi';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BidModal } from '@/components/tender/BidModal';
import { AlertTriangle, Clock, CheckCircle2, MapPin, Calculator } from 'lucide-react';
import toast from 'react-hot-toast';

export function TendersDashboard() {
  const [selectedHazardId, setSelectedHazardId] = useState<number | null>(null);
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: tenders = [], isLoading } = useQuery({
    queryKey: ['tenders'],
    queryFn: tenderApi.getAvailableTenders,
  });

  const acceptBidMutation = useMutation({
    mutationFn: (bidId: number) => tenderApi.acceptBid(bidId),
    onSuccess: () => {
      toast.success('Bid accepted successfully');
      queryClient.invalidateQueries({ queryKey: ['tenders'] });
    },
    onError: () => {
      toast.error('Failed to accept bid');
    }
  });

  const handleOpenBidModal = (hazardId: number) => {
    setSelectedHazardId(hazardId);
    setIsBidModalOpen(true);
  };

  const handleBidSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['tenders'] });
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="animate-pulse text-primary font-bold text-xl">Loading Tenders...</div>
      </div>
    );
  }

  return (
    <div className="w-full bg-background min-h-screen pb-12">
      {/* Official Govt Header */}
      <div className="bg-[#000080] text-white border-b-4 border-[#FF9933] shadow-md dark:bg-[#0a0a1a]">
        <div className="px-6 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <div className="hidden md:flex bg-white text-[#000080] font-serif font-black rounded-full w-14 h-14 items-center justify-center border-[3px] border-[#138808] shadow-inner text-xl">
              GOI
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-widest uppercase drop-shadow-md">
                Central Public Procurement Portal
              </h1>
              <p className="text-[#FF9933] text-xs md:text-sm tracking-[0.2em] uppercase mt-1 font-bold">
                e-Tendering System - Government of India
              </p>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['tenders'] })}
            disabled={isLoading}
            className="bg-transparent text-white border-white/30 hover:bg-white/10 hover:text-white uppercase tracking-wider text-xs font-bold rounded-sm h-10 px-5"
          >
            {isLoading ? 'REFRESHING...' : 'REFRESH TENDERS'}
          </Button>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="px-6 pt-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold uppercase tracking-wider text-foreground">Active Tenders & Bidding</h2>
          <span className="bg-[#138808] text-white text-xs font-bold px-3 py-1 rounded shadow-sm">
            {tenders?.length || 0} TENDERS AVAILABLE
          </span>
        </div>

      {tenders?.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <CheckCircle2 className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-xl font-medium text-foreground">No Active Tenders</h3>
          <p className="text-muted-foreground mt-2">All critical hazards have been assigned or there are currently no critical hazards.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tenders?.map((hazard: any) => (
            <Card key={hazard.id} className="rounded-sm border-gray-300 dark:border-gray-700 shadow-sm bg-card hover:border-[#000080] transition-colors">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4 border-b pb-3">
                  <div className="flex flex-col">
                    <span className="text-[#000080] dark:text-blue-400 font-bold uppercase tracking-widest text-sm mb-1">
                      TENDER #{hazard.id}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs font-bold px-2 py-0.5 rounded-sm capitalize border border-gray-300 dark:border-gray-600">
                        {hazard.hazard_type.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center font-medium">
                        <Clock size={12} className="mr-1" />
                        {new Date(hazard.created_at + (hazard.created_at.endsWith('Z') ? '' : 'Z')).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center text-red-600 font-black bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 px-2 py-1 rounded-sm text-sm">
                      <AlertTriangle size={16} className="mr-1" />
                      Sev: {hazard.severity_score.toFixed(1)}/10
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-foreground font-serif leading-relaxed line-clamp-2">
                    "{hazard.description || "No description provided."}"
                  </p>
                  <div className="flex items-center justify-between text-xs mt-4">
                    <div className="flex items-center text-muted-foreground font-mono bg-muted px-2 py-1 rounded-sm border border-border">
                      <MapPin size={12} className="mr-1" />
                      {hazard.latitude.toFixed(4)}, {hazard.longitude.toFixed(4)}
                    </div>
                    {hazard.budget_estimate && (
                      <div className="flex items-center font-bold text-[#138808] border-b-2 border-[#138808]">
                        <Calculator size={12} className="mr-1" />
                        EST: ₹{hazard.budget_estimate.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t-2 border-dashed border-gray-200 dark:border-gray-800 pt-4 mt-2 bg-gray-50/50 dark:bg-gray-900/20 -mx-6 px-6 pb-2">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Contractor Bids ({hazard.bids?.length || 0})</span>
                    <Button size="sm" variant="outline" onClick={() => handleOpenBidModal(hazard.id)} className="bg-[#000080] text-white hover:bg-blue-900 border-none font-bold uppercase text-xs h-8 px-3 rounded-sm">
                      Submit Bid
                    </Button>
                  </div>
                  
                  {hazard.bids && hazard.bids.length > 0 ? (
                    <div className="space-y-2 mt-4 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {hazard.bids.map((bid: Bid) => (
                        <div key={bid.id} className="bg-background border border-gray-300 dark:border-gray-700 rounded-sm p-3">
                          <div className="flex justify-between items-center mb-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                            <span className="font-bold text-sm uppercase tracking-wide">{bid.contractor_name}</span>
                            <span className="text-sm font-black text-[#138808]">₹{bid.bid_amount.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-mono text-muted-foreground">{bid.estimated_days} DAYS EST.</span>
                            {bid.status === 'pending' ? (
                              <Button 
                                size="sm" 
                                className="h-6 text-[10px] px-3 font-bold uppercase tracking-wider bg-green-600 hover:bg-green-700 text-white rounded-sm"
                                onClick={() => acceptBidMutation.mutate(bid.id)}
                                disabled={acceptBidMutation.isPending}
                              >
                                {acceptBidMutation.isPending ? 'ACCEPTING...' : 'ACCEPT BID'}
                              </Button>
                            ) : (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider border ${
                                bid.status === 'accepted' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
                              }`}>
                                {bid.status}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-center py-4 text-muted-foreground border border-dashed rounded-lg">
                      No bids submitted yet
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {selectedHazardId && (
        <BidModal 
          isOpen={isBidModalOpen} 
          hazardId={selectedHazardId} 
          onClose={() => setIsBidModalOpen(false)} 
          onSuccess={handleBidSuccess}
        />
      )}
      </div>
    </div>
  );
}
