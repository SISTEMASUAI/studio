
'use client';

import { useState, useMemo } from 'react';
import { useFirestore, useCollection, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, query, DocumentData, doc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { UserCog, Search, MoreHorizontal, Mail, Loader2, Edit, UserPlus, UserX, UserCheck } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import EditUserDialog from './EditUserDialog';
import CreateUserDialog from './CreateUserDialog';

interface UserProfile extends DocumentData {
  id: string;
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status?: 'active' | 'inactive';
  profilePicture: string;
  phone?: string;
  address?: string;
  birthDate?: string;
}

const getRoleBadge = (role: string) => {
  switch (role) {
    case 'admin': return <Badge variant="default" className="bg-primary hover:bg-primary/90 text-white rounded-full px-4">Admin</Badge>;
    case 'professor': return <Badge variant="secondary" className="bg-neutral-200 text-neutral-800 rounded-full px-4">Docente</Badge>;
    case 'student': return <Badge variant="outline" className="bg-white border-neutral-300 text-neutral-800 rounded-full px-4">Estudiante</Badge>;
    case 'staff': return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 rounded-full px-4">Staff</Badge>;
    default: return <Badge variant="outline" className="rounded-full px-4">{role}</Badge>;
  }
};

const getStatusBadge = (status?: string) => {
  if (status === 'inactive') {
    return <Badge variant="destructive" className="rounded-full px-3">Inactivo</Badge>;
  }
  return <Badge variant="default" className="bg-green-500 hover:bg-green-600 rounded-full px-3">Activo</Badge>;
};

export default function UserManagementView() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const usersQuery = useMemoFirebase(() => 
    firestore ? query(collection(firestore, 'users')) : null,
  [firestore]);

  const { data: users, isLoading } = useCollection<UserProfile>(usersQuery);

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter(user => 
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  const handleEditUser = (user: UserProfile) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const toggleUserStatus = async (user: UserProfile) => {
    if (!firestore) return;
    const newStatus = user.status === 'inactive' ? 'active' : 'inactive';
    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      updateDocumentNonBlocking(userDocRef, { status: newStatus });
      toast({ 
        title: newStatus === 'active' ? "Usuario activado" : "Usuario desactivado",
        description: `El estado de ${user.firstName} ha sido actualizado.` 
      });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo cambiar el estado." });
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <UserCog className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold font-headline text-primary">Administración de Usuarios</CardTitle>
            <CardDescription className="text-lg">Visualiza y gestiona los accesos y perfiles de toda la institución.</CardDescription>
          </div>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="shadow-lg font-bold gap-2">
          <UserPlus className="h-5 w-5" />
          Crear Usuario
        </Button>
      </header>

      <Card className="border shadow-sm">
        <CardContent className="pt-6 space-y-6">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por nombre, email o cargo..." 
                className="pl-9 h-12 border-neutral-200 bg-neutral-50/50" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button size="lg" className="px-8 shadow-md h-12 font-bold flex gap-2">
              <Search className="h-5 w-5" />
              Buscar
            </Button>
          </div>

          <div className="rounded-xl border shadow-sm overflow-hidden bg-white">
            <Table>
              <TableHeader className="bg-neutral-50/80">
                <TableRow className="hover:bg-transparent border-b">
                  <TableHead className="w-[300px] py-4">Usuario</TableHead>
                  <TableHead className="py-4">Email</TableHead>
                  <TableHead className="py-4">Rol</TableHead>
                  <TableHead className="py-4">Estado</TableHead>
                  <TableHead className="text-right py-4">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-64 text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary opacity-20" />
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user, index) => (
                    <TableRow key={user.id} className={`hover:bg-neutral-50/50 transition-colors border-b last:border-0 h-20 ${user.status === 'inactive' ? 'opacity-60 bg-neutral-50' : ''}`}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                            <AvatarImage src={user.profilePicture} alt={user.firstName} className="object-cover" />
                            <AvatarFallback className="bg-primary/5 text-primary font-bold">
                              {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-base font-bold text-neutral-800">{user.firstName} {user.lastName}</span>
                            <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-tight">ID: {(index + 1).toString().padStart(6, '0')}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-neutral-600">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 opacity-40" />
                          {user.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getRoleBadge(user.role)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(user.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-neutral-100">
                              <MoreHorizontal className="h-5 w-5 text-neutral-400" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl shadow-xl border-neutral-100">
                            <DropdownMenuItem onClick={() => handleEditUser(user)} className="rounded-lg h-10 cursor-pointer">
                              <Edit className="mr-3 h-4 w-4 text-neutral-500" />
                              <span className="font-medium">Editar Perfil</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => toggleUserStatus(user)} 
                              className={`rounded-lg h-10 cursor-pointer font-medium ${user.status === 'inactive' ? 'text-green-600 focus:text-green-600' : 'text-destructive focus:text-destructive'}`}
                            >
                              {user.status === 'inactive' ? (
                                <><UserCheck className="mr-3 h-4 w-4" /> Activar Usuario</>
                              ) : (
                                <><UserX className="mr-3 h-4 w-4" /> Desactivar Usuario</>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-64 text-center text-muted-foreground italic">
                      No se encontraron usuarios que coincidan con la búsqueda.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {selectedUser && (
        <EditUserDialog 
          isOpen={isEditDialogOpen} 
          onOpenChange={setIsEditDialogOpen} 
          user={selectedUser} 
        />
      )}

      <CreateUserDialog 
        isOpen={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen} 
      />
    </div>
  );
}
