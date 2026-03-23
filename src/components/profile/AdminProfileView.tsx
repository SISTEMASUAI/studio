'use client';

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
import { UserCog, Search, MoreHorizontal, Mail, Shield, User as UserIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const mockUsers = [
  { id: '1', name: 'Carlos Rodríguez', email: 'c.rodriguez@uni.edu.pe', role: 'admin', avatar: 'https://i.pravatar.cc/150?u=1' },
  { id: '2', name: 'Dra. Elena Vizcarra', email: 'e.vizcarra@prof.uni.edu.pe', role: 'professor', avatar: 'https://i.pravatar.cc/150?u=2' },
  { id: '3', name: 'Miguel Ángel Torres', email: 'm.angel@student.uni.edu.pe', role: 'student', avatar: 'https://i.pravatar.cc/150?u=3' },
  { id: '4', name: 'Ing. Roberto Gómez', email: 'r.gomez@prof.uni.edu.pe', role: 'professor', avatar: 'https://i.pravatar.cc/150?u=4' },
  { id: '5', name: 'Lucía Méndez', email: 'l.mendez@student.uni.edu.pe', role: 'student', avatar: 'https://i.pravatar.cc/150?u=5' },
];

const getRoleBadge = (role: string) => {
  switch (role) {
    case 'admin': return <Badge variant="default" className="bg-primary">Admin</Badge>;
    case 'professor': return <Badge variant="secondary">Docente</Badge>;
    case 'student': return <Badge variant="outline">Estudiante</Badge>;
    default: return <Badge variant="outline">{role}</Badge>;
  }
};

export default function AdminProfileView() {
    return (
        <Card className="border-none shadow-lg">
            <CardHeader className="bg-primary/5 rounded-t-lg border-b">
                <CardTitle className="flex items-center gap-2 text-primary"><UserCog /> Administración de Usuarios</CardTitle>
                <CardDescription>Visualiza y gestiona los accesos y perfiles de toda la institución.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
                 <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Buscar por nombre, email o cargo..." className="pl-9 h-11" />
                    </div>
                    <Button size="lg" className="px-8 shadow-md">
                        <Search className="mr-2 h-4 w-4"/> 
                        Buscar
                    </Button>
                </div>

                <div className="rounded-xl border shadow-sm overflow-hidden bg-card">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="w-[300px]">Usuario</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Rol</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockUsers.map(user => (
                                <TableRow key={user.id} className="hover:bg-muted/30 transition-colors">
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9 border-2 border-background shadow-sm">
                                                <AvatarImage src={user.avatar} alt={user.name} />
                                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold">{user.name}</span>
                                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">ID: {user.id.padStart(6, '0')}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1.5">
                                            <Mail className="h-3.5 w-3.5" />
                                            {user.email}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {getRoleBadge(user.role)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-accent">
                                                    <MoreHorizontal className="h-4 w-4"/>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                <DropdownMenuItem className="cursor-pointer">
                                                    <UserIcon className="mr-2 h-4 w-4"/> Ver Perfil Completo
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="cursor-pointer">
                                                    <Shield className="mr-2 h-4 w-4"/> Editar Permisos
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
                                                    <Shield className="mr-2 h-4 w-4"/> Suspender Cuenta
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}
