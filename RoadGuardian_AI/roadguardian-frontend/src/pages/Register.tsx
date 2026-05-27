import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { Navigate, useSearchParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export const Register = () => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') || 'citizen';

  useEffect(() => {
    localStorage.setItem('intended_role', role);
  }, [role]);

  if (isAuthenticated) {
    return <Navigate to={role === 'authority' ? "/authority" : "/dashboard"} replace />;
  }

  const handleGoogleRegister = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + (role === 'authority' ? '/authority' : '/dashboard'),
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
    <div className="flex flex-col items-center justify-center min-h-[85vh] relative z-10 px-4 bg-background">
      <div className="mb-8 text-center">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest border-b-2 border-[#138808] pb-1 inline-block mb-2">Government of India</h2>
        <h1 className="text-3xl font-extrabold text-foreground">Secure Registration</h1>
      </div>
      
      <Card className="w-full max-w-md bg-card border border-border shadow-md rounded-sm">
        <CardHeader className="text-center pb-2 bg-muted/50 border-b border-border rounded-t-sm">
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
            {role === 'authority' ? 'Department Official Registration' : 'Citizen Registration'}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Register your identity to participate in national infrastructure monitoring.
          </p>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <Button 
            onClick={handleGoogleRegister} 
            disabled={loading}
            className="w-full h-14 text-lg font-semibold bg-white text-black hover:bg-gray-100 shadow-sm border border-slate-300 transition-all rounded-sm"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 mr-3" />
            {loading ? 'Connecting securely...' : 'Register via Google ID'}
          </Button>
          
          <div className="p-4 bg-muted border border-border rounded-sm">
            <p className="text-xs text-center text-muted-foreground font-mono">
              By registering, you agree to the official terms of service regarding geospatial data submission.
            </p>
          </div>
          
          <div className="text-center text-sm pt-2">
            Already registered? <Link to={`/login?role=${role}`} className="text-primary hover:text-primary/80 font-bold hover:underline transition-colors">Login here</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
