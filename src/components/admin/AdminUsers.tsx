import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserPlus, UserMinus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  created_at: string;
  user_roles: { role: string }[];
}

export function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Get user IDs
      const userIds = profilesData?.map(p => p.id) || [];
      
      // Fetch roles for these users
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds);

      if (rolesError) throw rolesError;

      // Combine profiles with roles
      const usersWithRoles = profilesData?.map(profile => ({
        ...profile,
        user_roles: rolesData?.filter(r => r.user_id === profile.id).map(r => ({ role: r.role })) || []
      }));

      setUsers(usersWithRoles as any || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os utilizadores",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addResellerRole = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert([{ user_id: userId, role: 'reseller' }]);

      if (error) throw error;

      await loadUsers();
      toast({
        title: "Role adicionada",
        description: "O utilizador agora é um revendedor",
      });
    } catch (error: any) {
      console.error('Error adding reseller role:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível adicionar a role de revendedor",
        variant: "destructive",
      });
    }
  };

  const removeResellerRole = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', 'reseller');

      if (error) throw error;

      await loadUsers();
      toast({
        title: "Role removida",
        description: "O utilizador não é mais um revendedor",
      });
    } catch (error) {
      console.error('Error removing reseller role:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a role de revendedor",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>A carregar...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Utilizadores</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Funções</TableHead>
              <TableHead>Data de Registo</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const isReseller = user.user_roles?.some(ur => ur.role === 'reseller');
              const isAdmin = user.user_roles?.some(ur => ur.role === 'admin');
              
              return (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.full_name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone || '-'}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {user.user_roles?.map((ur, idx) => (
                        <Badge 
                          key={idx} 
                          variant={
                            ur.role === 'admin' ? 'default' : 
                            ur.role === 'reseller' ? 'outline' : 
                            'secondary'
                          }
                        >
                          {ur.role === 'admin' ? 'Admin' : 
                           ur.role === 'reseller' ? 'Revendedor' : 
                           ur.role}
                        </Badge>
                      ))}
                      {user.user_roles?.length === 0 && (
                        <Badge variant="secondary">user</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString('pt-PT')}
                  </TableCell>
                  <TableCell className="text-right">
                    {!isAdmin && (
                      isReseller ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeResellerRole(user.id)}
                          className="gap-2"
                        >
                          <UserMinus className="w-4 h-4" />
                          Remover Revendedor
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => addResellerRole(user.id)}
                          className="gap-2"
                        >
                          <UserPlus className="w-4 h-4" />
                          Tornar Revendedor
                        </Button>
                      )
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
