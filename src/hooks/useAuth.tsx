import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any; session: Session | null }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isReseller: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isReseller, setIsReseller] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Check roles
        if (session?.user) {
          setTimeout(() => {
            checkUserRoles(session.user.id);
          }, 0);
        } else {
          setIsAdmin(false);
          setIsReseller(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        checkUserRoles(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserRoles = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      
      if (!error && data) {
        const roles = data.map(r => r.role);
        setIsAdmin(roles.includes('admin'));
        setIsReseller(roles.includes('reseller'));
      } else {
        setIsAdmin(false);
        setIsReseller(false);
      }
    } catch (error) {
      console.error('Error checking user roles:', error);
      setIsAdmin(false);
      setIsReseller(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Erro ao fazer login",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Login bem-sucedido!",
        description: "Bem-vindo de volta.",
      });
    }

    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      toast({
        title: "Erro ao criar conta",
        description: error.message,
        variant: "destructive",
      });
    } else if (data.session) {
      toast({
        title: "Conta criada!",
        description: "Bem-vindo à Sinkera!",
      });
    } else {
      toast({
        title: "Conta criada!",
        description: "Verifique o seu email para activar a conta.",
      });
    }

    return { error, session: data?.session ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logout realizado",
      description: "Até breve!",
    });
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut, isAdmin, isReseller }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
