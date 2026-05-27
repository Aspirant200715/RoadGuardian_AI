import React, { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User as UserIcon, Award, Activity, ShieldCheck, FileSignature, Save, X, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

export const Profile = () => {
  const { user, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    phone: user?.phone || '',
    aadhaar: user?.aadhaar || '',
    state: user?.state || '',
    address: user?.address || '',
    avatar: user?.avatar || ''
  });

  const mockBadges = [
    { id: '1', name: 'Verified Reporter', description: 'Submitted first confirmed hazard report.', date: new Date().toLocaleDateString(), code: 'BDG-01A' },
    { id: '2', name: 'Infrastructure Sentinel', description: 'Documented 10 severe structural defects.', date: new Date().toLocaleDateString(), code: 'BDG-02B' },
    { id: '3', name: 'Night Operations', description: 'Logged hazards between 0000 and 0400 hrs.', date: new Date().toLocaleDateString(), code: 'BDG-03C' }
  ];

  const handleSave = () => {
    updateUser(formData);
    setIsEditing(false);
    toast.success('Official records updated successfully.');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setFormData({ ...formData, avatar: base64 });
        updateUser({ avatar: base64 });
        toast.success('Official photo updated successfully.');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b-2 border-[#138808] pb-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-[#000080] dark:text-foreground">Citizen Profile & Records</h1>
          <p className="text-muted-foreground font-bold text-sm uppercase tracking-wider mt-1">Official activity log and verification status.</p>
        </div>
        <div className="flex items-center text-xs font-mono font-bold bg-slate-50 dark:bg-muted border border-border px-4 py-2 text-muted-foreground shadow-sm">
          <ShieldCheck className="w-4 h-4 mr-2 text-[#138808] dark:text-success" /> IDENTITY VERIFIED
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        <div className="md:col-span-4 space-y-6">
          <Card className="shadow-sm rounded-sm bg-white dark:bg-card border-border overflow-hidden">
            <div className="bg-slate-50 dark:bg-muted/50 border-b border-border py-3 px-5 flex justify-between items-center">
               <h3 className="font-bold text-xs uppercase tracking-widest text-muted-foreground">ID Card</h3>
               <span className="text-xs font-mono font-bold text-[#000080] dark:text-primary">UID-4492-AX</span>
            </div>
            <CardContent className="p-0">
               <div className="p-8 flex flex-col items-center border-b border-border">
                  <div className="relative w-32 h-32 bg-white dark:bg-background border-4 border-[#000080] dark:border-primary shadow-sm p-1 group cursor-pointer">
                    <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" onChange={handleImageUpload} title="Upload Official Photo" />
                    <div className="w-full h-full bg-slate-100 dark:bg-muted flex items-center justify-center overflow-hidden">
                      {user?.avatar ? (
                        <img src={user.avatar} className="w-full h-full object-cover" alt="Profile" />
                      ) : (
                        <UserIcon className="w-16 h-16 text-muted-foreground opacity-50" />
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 text-white">
                       <Camera className="w-6 h-6 mb-1" />
                       <span className="text-[10px] font-bold uppercase tracking-wider text-center px-2">Update Photo</span>
                    </div>
                  </div>
                  <h2 className="text-xl font-black uppercase mt-6 text-foreground tracking-wider">{user?.fullName || 'Authorized Citizen'}</h2>
                  <p className="text-sm text-muted-foreground font-mono mt-2 font-medium">{user?.email}</p>
               </div>
               
               <table className="w-full text-left text-sm font-mono">
                 <tbody className="divide-y divide-border">
                   <tr>
                     <td className="py-3 px-5 font-bold uppercase text-muted-foreground w-1/2 bg-slate-50/50 dark:bg-muted/30 border-r border-border">Clearance</td>
                     <td className="py-3 px-5 font-black text-[#000080] dark:text-primary">{user?.role.toUpperCase()}</td>
                   </tr>
                   <tr>
                     <td className="py-3 px-5 font-bold uppercase text-muted-foreground bg-slate-50/50 dark:bg-muted/30 border-r border-border">Account</td>
                     <td className="py-3 px-5 font-black text-[#138808] dark:text-success">ACTIVE</td>
                   </tr>
                 </tbody>
               </table>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-8 space-y-6">
          <Card className="shadow-sm rounded-sm bg-white dark:bg-card border-border overflow-hidden">
            <div className="bg-[#FF9933] text-white py-3 px-5 flex justify-between items-center border-b border-border/50">
              <h2 className="font-black uppercase text-sm tracking-widest flex items-center"><FileSignature className="w-4 h-4 mr-2" /> Official Registration Details</h2>
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="bg-white/10 border-white/30 text-white hover:bg-white hover:text-[#FF9933] h-8 rounded-sm text-xs uppercase font-bold tracking-wider">
                  Update Records
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(false)} className="bg-white/10 border-white/30 text-white hover:bg-white hover:text-destructive h-8 rounded-sm text-xs uppercase font-bold tracking-wider">
                  <X className="w-4 h-4 mr-1" /> Cancel
                </Button>
              )}
            </div>
            <CardContent className="p-0">
              {isEditing ? (
                <div className="p-6 space-y-4 bg-slate-50 dark:bg-background">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                       <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Mobile Number</label>
                       <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+91" className="rounded-sm border-border bg-white dark:bg-card" />
                     </div>
                     <div className="space-y-2">
                       <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Aadhaar / Virtual ID</label>
                       <Input value={formData.aadhaar} onChange={e => setFormData({...formData, aadhaar: e.target.value})} placeholder="XXXX XXXX XXXX" className="rounded-sm border-border bg-white dark:bg-card" />
                     </div>
                     <div className="space-y-2">
                       <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">State / Union Territory</label>
                       <Input value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} placeholder="E.g. Maharashtra" className="rounded-sm border-border bg-white dark:bg-card" />
                     </div>
                     <div className="space-y-2">
                       <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Residential Address</label>
                       <Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Full local address" className="rounded-sm border-border bg-white dark:bg-card" />
                     </div>
                   </div>
                   <div className="flex justify-end pt-4 border-t border-border mt-6">
                      <Button onClick={handleSave} className="bg-[#138808] hover:bg-green-700 text-white font-bold uppercase tracking-wider rounded-sm shadow-sm">
                         <Save className="w-4 h-4 mr-2" /> Save Official Details
                      </Button>
                   </div>
                </div>
              ) : (
                <table className="w-full text-left text-sm font-mono">
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="py-4 px-5 font-bold uppercase text-muted-foreground w-1/3 bg-slate-50/50 dark:bg-muted/30 border-r border-border">Mobile Number</td>
                      <td className="py-4 px-5 font-medium">{user?.phone || 'Not Registered'}</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-5 font-bold uppercase text-muted-foreground bg-slate-50/50 dark:bg-muted/30 border-r border-border">Aadhaar / VID</td>
                      <td className="py-4 px-5 font-medium">{user?.aadhaar ? 'XXXX XXXX ' + user.aadhaar.slice(-4) : 'Not Registered'}</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-5 font-bold uppercase text-muted-foreground bg-slate-50/50 dark:bg-muted/30 border-r border-border">State / UT</td>
                      <td className="py-4 px-5 font-medium uppercase">{user?.state || 'Not Registered'}</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-5 font-bold uppercase text-muted-foreground bg-slate-50/50 dark:bg-muted/30 border-r border-border">Residential Address</td>
                      <td className="py-4 px-5 font-medium text-xs whitespace-pre-wrap">{user?.address || 'Not Registered'}</td>
                    </tr>
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm rounded-sm bg-white dark:bg-card border-border overflow-hidden">
            <div className="bg-[#000080] dark:bg-slate-900 text-white py-3 px-5 flex justify-between items-center border-b border-border/50">
              <h2 className="font-black uppercase text-sm tracking-widest flex items-center"><Activity className="w-4 h-4 mr-2 text-[#FF9933]"/> Official Recognitions Directory</h2>
            </div>
            <CardContent className="p-0">
               <table className="w-full text-left text-sm">
                 <thead className="bg-slate-50 dark:bg-muted/50 border-b border-border">
                   <tr>
                     <th className="py-4 px-5 font-bold uppercase tracking-widest text-muted-foreground border-r border-border w-20 text-center">Icon</th>
                     <th className="py-4 px-5 font-bold uppercase tracking-widest text-muted-foreground border-r border-border">Recognition Title & Details</th>
                     <th className="py-4 px-5 font-bold uppercase tracking-widest text-muted-foreground">Issuance Date</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-border">
                    {mockBadges.map(badge => (
                      <tr key={badge.id} className="hover:bg-slate-50 dark:hover:bg-muted/30 transition-colors group">
                        <td className="p-5 border-r border-border">
                          <div className="w-12 h-12 bg-[#138808]/10 dark:bg-success/10 border border-[#138808]/30 dark:border-success/30 flex items-center justify-center mx-auto">
                            <Award className="w-6 h-6 text-[#138808] dark:text-success" />
                          </div>
                        </td>
                        <td className="p-5 border-r border-border">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-black text-base uppercase tracking-wider text-[#000080] dark:text-primary">{badge.name}</h4>
                            <span className="text-xs font-mono border border-border px-2 py-0.5 rounded-sm text-muted-foreground bg-white dark:bg-background">{badge.code}</span>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">{badge.description}</p>
                        </td>
                        <td className="p-5">
                          <div className="flex flex-col">
                            <span className="font-mono font-bold text-foreground">{badge.date}</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#138808] dark:text-success mt-2 flex items-center"><ShieldCheck className="w-3.5 h-3.5 mr-1" /> Verified</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                 </tbody>
               </table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
