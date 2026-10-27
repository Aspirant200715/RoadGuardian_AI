import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/authStore';
import { Navigate, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, UserCheck, Sparkles, Building2, User, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export const Register = () => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const registerUser = useAuthStore(state => state.registerUser);
  const guestLogin = useAuthStore(state => state.guestLogin);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const role = (searchParams.get('role') || 'citizen') as 'citizen' | 'authority';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    localStorage.setItem('intended_role', role);
  }, [role]);

  if (isAuthenticated) {
    return <Navigate to={role === 'authority' ? "/authority" : "/dashboard"} replace />;
  }

  const handleInstantRegister = () => {
    if (role === 'authority') {
      guestLogin('authority');
      toast.success('Instant Authority Clearance granted!', { icon: '🏛️' });
      navigate('/authority');
    } else {
      guestLogin('citizen');
      toast.success('Instant Citizen ID registered!', { icon: '🚀' });
      navigate('/dashboard');
    }
  };

  const handleCustomRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error('Please enter your full name');
      return;
    }
    registerUser({
      fullName: fullName.trim(),
      email: email.trim(),
      role: role
    });
    navigate(role === 'authority' ? '/authority' : '/dashboard');
  };

  const handleGoogleRegister = async () => {
    setLoading(true);
    try {
      const rawBase = import.meta.env.VITE_CLIENT_URL || window.location.origin;
      const clientBase = rawBase.replace(/\/+$/, '');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${clientBase}${role === 'authority' ? '/authority' : '/dashboard'}`,
        }
      });
      if (error) toast.error(error.message);
    } catch (err) {
      toast.error('Failed to initialize Google registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[88vh] relative z-10 px-4 py-8 bg-slate-50 dark:bg-slate-950">
      <div className="mb-6 text-center">
        <div className="bg-white p-2 rounded-sm inline-block shadow-sm mb-3">
          <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Emblem of India" className="h-10 w-8 object-contain" />
        </div>
        <div>
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest border-b-2 border-[#138808] pb-1 inline-block mb-1">Government of India</h2>
          <h1 className="text-2xl sm:text-3xl font-black text-[#000080] dark:text-foreground">Official Portal Registration</h1>
        </div>
      </div>

      <div className="w-full max-w-md">
        {/* Role Toggle */}
        <div className="flex w-full mb-4 bg-slate-200 dark:bg-slate-800 p-1 shadow-inner rounded-sm border border-border">
          <button 
            type="button"
            onClick={() => setSearchParams({ role: 'citizen' })}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-sm transition-all flex items-center justify-center gap-1.5 ${role === 'citizen' ? 'bg-white dark:bg-slate-950 text-[#000080] dark:text-primary shadow-sm border border-border/50' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <User className="w-3.5 h-3.5" />
            Citizen Registration
          </button>
          <button 
            type="button"
            onClick={() => setSearchParams({ role: 'authority' })}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-sm transition-all flex items-center justify-center gap-1.5 ${role === 'authority' ? 'bg-white dark:bg-slate-950 text-[#000080] dark:text-primary shadow-sm border border-border/50' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Official Clearance
          </button>
        </div>
        
        <Card className="w-full bg-card border-t-4 border-t-[#138808] border-x-border border-b-border shadow-xl rounded-sm">
          <CardHeader className="text-center pb-2 pt-6 bg-muted/30 border-b border-border">
            <CardTitle className="text-xl font-black tracking-tight text-[#000080] dark:text-foreground">
              {role === 'authority' ? 'Department Official Clearance' : 'Citizen Civic Registration'}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {role === 'authority' 
                ? 'Register municipal access to triage, dispatch crews, and resolve road hazards.'
                : 'Join millions of active citizens reporting infrastructure hazards nationwide.'}
            </p>
          </CardHeader>
          <CardContent className="space-y-5 pt-6 px-6 pb-6">
            
            {/* Primary Action: 1-Click Instant Register */}
            <div>
              <Button 
                onClick={handleInstantRegister} 
                className="w-full h-13 py-3 text-sm font-extrabold bg-[#138808] hover:bg-green-700 text-white shadow-md transition-all rounded-sm uppercase tracking-wider flex items-center justify-center gap-2 border border-green-600"
              >
                <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
                {role === 'authority' ? 'Instant Official Registration (1-Click)' : 'Instant Citizen Registration (1-Click)'}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
              <p className="text-[10px] text-center text-muted-foreground mt-1 font-mono">
                ⚡ Zero waiting • Instant verified credentials generated
              </p>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-border w-full"></div>
              <span className="bg-card px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider absolute">Or Register with Details</span>
            </div>

            {/* Custom Details Form */}
            <form onSubmit={handleCustomRegister} className="space-y-3">
              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">Full Name</label>
                <Input 
                  placeholder={role === 'authority' ? 'e.g. Officer Rajesh Verma' : 'e.g. Priya Sharma'} 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-10 text-sm rounded-sm"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">Email or Mobile (Optional)</label>
                <Input 
                  placeholder={role === 'authority' ? 'official@pwd.gov.in' : 'citizen@example.com'} 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 text-sm rounded-sm"
                />
              </div>
              <Button 
                type="submit"
                variant="outline"
                className="w-full h-11 text-xs font-black uppercase tracking-wider border-[#000080] text-[#000080] dark:border-primary dark:text-primary hover:bg-[#000080] hover:text-white transition-all rounded-sm flex items-center justify-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                Create Account & Access Portal
              </Button>
            </form>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-border w-full"></div>
              <span className="bg-card px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider absolute">Or Use Google</span>
            </div>

            {/* Google OAuth Option */}
            <Button 
              onClick={handleGoogleRegister} 
              disabled={loading}
              variant="outline"
              className="w-full h-11 text-xs font-bold bg-white text-slate-800 hover:bg-slate-50 border-slate-300 transition-all rounded-sm uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
              {loading ? 'Connecting...' : 'Register with Google ID'}
            </Button>
            
            <div className="p-3 bg-muted/60 border border-border rounded-sm">
              <p className="text-[10px] text-center text-muted-foreground font-mono flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#138808]" />
                Identity secured under Government of India Digital Security Guidelines.
              </p>
            </div>
            
            <div className="text-center text-xs pt-1">
              Already registered? <Link to={`/login?role=${role}`} className="text-[#000080] dark:text-primary hover:underline font-black uppercase tracking-wider">Login to Portal</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
