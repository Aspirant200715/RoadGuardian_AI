import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { tenderApi } from '@/services/tenderApi';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

interface BidModalProps {
  hazardId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BidModal({ hazardId, isOpen, onClose, onSuccess }: BidModalProps) {
  const [contractorName, setContractorName] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [estimatedDays, setEstimatedDays] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractorName || !bidAmount || !estimatedDays) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setIsSubmitting(true);
      await tenderApi.submitBid(hazardId, {
        contractor_name: contractorName,
        bid_amount: parseFloat(bidAmount),
        estimated_days: parseInt(estimatedDays, 10),
      });
      toast.success('Bid submitted successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Failed to submit bid');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card w-full max-w-md rounded-xl p-6 shadow-xl animate-in fade-in zoom-in-95">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-card-foreground">Submit Repair Bid</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Contractor Name</label>
            <Input 
              value={contractorName}
              onChange={(e) => setContractorName(e.target.value)}
              placeholder="e.g. Acme Infra"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bid Amount (INR)</label>
            <Input 
              type="number"
              min="0"
              step="0.01"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              placeholder="e.g. 50000"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Estimated Days</label>
            <Input 
              type="number"
              min="1"
              value={estimatedDays}
              onChange={(e) => setEstimatedDays(e.target.value)}
              placeholder="e.g. 5"
              required
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Bid'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
