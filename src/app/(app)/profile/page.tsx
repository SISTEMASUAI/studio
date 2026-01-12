'use client';

import { useUser } from '@/firebase';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  User as UserIcon,
  Shield,
  Edit,
  UserCog,
  Loader2,
  KeyRound,
  Fingerprint,
  Monitor,
  LogOut,
  Mail,
  Phone,
  Home,
  FileText,
  QrCode,
  ShieldCheck,
  Smartphone,
  Book,
  Search,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';


const activeSessions = [
    { id: 'sess-1', device: 'Chrome on Windows', location: 'Lima, PE (190.42.XX.XX)', lastActive: 'Ahora', isCurrent: true, icon: Monitor },
    { id: 'sess-2', device: 'Safari on iPhone', location: 'Arequipa, PE (179.7.XX.XX)', lastActive: 'Hace 2 horas', isCurrent: false, icon: Smartphone },
    { id: 'sess-3', device: 'Firefox on macOS', location: 'Bogotá, CO (200.118.XX.XX)', lastActive: 'Ayer', isCurrent: false, icon: Monitor },
];

function ProfileHeader() {
  const { profile } = useUser();
  if (!profile) return null;

  return (
    <Card>
      <CardContent className="pt-6 flex flex-col items-center text-center gap-4 sm:flex-row sm:text-left">
        <Avatar className="h-24 w-24">
          <AvatarImage src={profile.profilePicture} alt={profile.firstName} />
          <AvatarFallback>
            {profile.firstName?.[0]}
            {profile.lastName?.[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex-grow">
          <h2 className="text-2xl font-bold font-headline">
            {profile.firstName} {profile.lastName}
          </h2>
          <p className="text-muted-foreground">{profile.email}</p>
          <Badge variant="outline" className="mt-2 capitalize">
            {profile.role}
          </Badge>
        </div>
        <Button variant="outline" disabled>
          <Edit className="mr-2" /> Cambiar Foto
        </Button>
      </CardContent>
    </Card>
  );
}

function SecuritySettings() {
    return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield /> Seguridad
            </CardTitle>
            <CardDescription>Gestiona tu contraseña y seguridad.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-start"><KeyRound className="mr-2"/> Cambiar Contraseña</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cambiar Contraseña</DialogTitle>
                        <DialogDescription>
                            Para mayor seguridad, tu nueva contraseña debe cumplir con los requisitos mínimos.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="current-password">Contraseña Actual</Label>
                            <Input id="current-password" type="password" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-password">Nueva Contraseña</Label>
                            <Input id="new-password" type="password" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirmar Nueva Contraseña</Label>
                            <Input id="confirm-password" type="password" />
                        </div>
                        <Alert variant="destructive">
                            <ShieldCheck className="h-4 w-4"/>
                            <AlertTitle>Requisitos de Contraseña</AlertTitle>
                            <AlertDescription>
                                <ul className="list-disc list-inside text-xs">
                                    <li>Mínimo 8 caracteres</li>
                                    <li>Al menos una mayúscula</li>
                                    <li>Al menos un número</li>
                                    <li>Al menos un carácter especial</li>
                                </ul>
                            </AlertDescription>
                        </Alert>
                    </div>
                    <DialogFooter>
                        <Button variant="outline">Cancelar</Button>
                        <Button disabled>Actualizar Contraseña</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-start"><Fingerprint className="mr-2"/> Configurar 2FA</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Autenticación de Dos Factores (2FA)</DialogTitle>
                        <DialogDescription>
                            Añade una capa extra de seguridad a tu cuenta.
                        </DialogDescription>
                    </DialogHeader>
                     <div className="py-4 space-y-6">
                        <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                                <Label>Habilitar 2FA</Label>
                                <p className="text-xs text-muted-foreground">
                                    Se te pedirá un código de tu app de autenticación al iniciar sesión.
                                </p>
                            </div>
                            <Switch />
                        </div>
                        <div className="text-center space-y-2">
                             <Label>1. Escanea el código QR</Label>
                             <div className="flex justify-center items-center h-40 w-40 bg-muted rounded-lg mx-auto">
                                <QrCode className="h-16 w-16 text-muted-foreground"/>
                             </div>
                             <p className="text-xs text-muted-foreground">Usa una app como Google Authenticator o Authy.</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="2fa-code">2. Ingresa el código de verificación</Label>
                            <Input id="2fa-code" placeholder="123456"/>
                        </div>
                    </div>
                    <DialogFooter>
                         <Alert>
                            <UserCog className="h-4 w-4"/>
                            <AlertTitle>En Desarrollo</AlertTitle>
                            <AlertDescription>
                                La lógica para generar el QR y verificar el código se implementará próximamente.
                            </AlertDescription>
                        </Alert>
                        <Button variant="outline">Cancelar</Button>
                        <Button disabled>Verificar y Habilitar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
             <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-start"><Monitor className="mr-2"/> Ver Sesiones Activas</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                     <DialogHeader>
                        <DialogTitle>Sesiones Activas</DialogTitle>
                        <DialogDescription>
                            Estas son las sesiones donde tu cuenta está actualmente iniciada.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <ul className="space-y-4">
                            {activeSessions.map(session => (
                                <li key={session.id} className="flex items-center gap-4 p-3 rounded-lg border">
                                    <session.icon className="h-8 w-8 text-muted-foreground" />
                                    <div className="flex-grow">
                                        <p className="font-semibold">{session.device}</p>
                                        <p className="text-sm text-muted-foreground">{session.location} - Última actividad: {session.lastActive}</p>
                                    </div>
                                    {session.isCurrent ? (
                                        <Badge variant="secondary">Esta sesión</Badge>
                                    ) : (
                                        <Button variant="ghost" size="sm" disabled>Cerrar sesión</Button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <DialogFooter>
                        <Button variant="destructive" disabled><LogOut className="mr-2"/> Cerrar todas las sesiones remotas</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
    );
}

function StudentProfileView() {
  const { profile } = useUser();
  if (!profile) return null;

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-3">
        <ProfileHeader />
      </div>
      <div className="lg:col-span-2 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon /> Datos Personales
            </CardTitle>
            <CardDescription>Actualiza tu información de contacto.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="email"><Mail className="inline mr-1" /> Email</Label>
                <Input id="email" defaultValue={profile.email} disabled />
              </div>
              <div className="space-y-1">
                <Label htmlFor="phone"><Phone className="inline mr-1" /> Teléfono</Label>
                <Input id="phone" defaultValue={profile.phone || ''} />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="address"><Home className="inline mr-1" /> Dirección</Label>
              <Input id="address" defaultValue={profile.address || ''} />
            </div>
            <Button disabled>Guardar Cambios</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText /> Mi Currículum</CardTitle>
            <CardDescription>Sube tu CV para postular a ofertas laborales desde la plataforma.</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <UserCog className="h-4 w-4" />
              <AlertTitle>En Desarrollo</AlertTitle>
              <AlertDescription>La funcionalidad para subir y gestionar tu CV estará disponible aquí.</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
      <aside className="space-y-8">
        <SecuritySettings />
      </aside>
    </div>
  );
}

function ProfessorProfileView() {
  const { profile } = useUser();
  if (!profile) return null;

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-3">
        <ProfileHeader />
      </div>
      <div className="lg:col-span-2 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><UserIcon /> Datos Personales</CardTitle>
            <CardDescription>Actualiza tu información de contacto.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label htmlFor="email"><Mail className="inline mr-1" /> Email Institucional</Label>
                    <Input id="email" defaultValue={profile.email} disabled />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="phone"><Phone className="inline mr-1" /> Teléfono</Label>
                    <Input id="phone" defaultValue={profile.phone || ''} />
                </div>
            </div>
             <div className="space-y-1">
                <Label htmlFor="address"><Home className="inline mr-1" /> Dirección</Label>
                <Input id="address" defaultValue={profile.address || ''} />
            </div>
            <Button disabled>Guardar Cambios</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Book /> Información Académica y Profesional</CardTitle>
            <CardDescription>Actualiza tu información pública como docente.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
                <Label htmlFor="bio">Biografía Corta</Label>
                <Textarea id="bio" placeholder="Una breve descripción de tu trayectoria y áreas de interés..." defaultValue={profile.bio || ''} />
            </div>
            <div className="space-y-1">
                <Label htmlFor="specialization">Especializaciones (separadas por comas)</Label>
                <Input id="specialization" placeholder="Inteligencia Artificial, Interacción Humano-Computador, ..." defaultValue={profile.specialization?.join(', ') || ''} />
            </div>
             <div className="space-y-1">
                <Label htmlFor="officeHours">Horas de Oficina</Label>
                <Textarea id="officeHours" placeholder="Ej: Lun/Mié 10:00-12:00, previa cita por email." defaultValue={profile.officeHours || ''}/>
            </div>
            <Button disabled>Actualizar Información Académica</Button>
          </CardContent>
        </Card>
      </div>
      <aside className="space-y-8">
        <SecuritySettings />
      </aside>
    </div>
  );
}

function AdminProfileView() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><UserCog /> Administración de Perfiles</CardTitle>
                <CardDescription>Busca y gestiona la información de cualquier usuario en el sistema.</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="flex gap-2 mb-6">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Buscar por nombre, email o matrícula..." className="pl-9" />
                    </div>
                    <Button><Search/> Buscar</Button>
                </div>
                 <Alert>
                    <UserCog className="h-4 w-4" />
                    <AlertTitle>En Desarrollo</AlertTitle>
                    <AlertDescription>
                        Las funcionalidades para ver y editar los perfiles de los usuarios, aplicar cambios con justificación y auditar modificaciones estarán disponibles próximamente en esta sección.
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
    )
}

export default function ProfilePage() {
  const { profile } = useUser();

  const renderContent = () => {
    if (!profile) {
      return (
        <div className="flex justify-center items-center h-full">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      );
    }
    
    switch(profile.role) {
        case 'student':
            return <StudentProfileView />;
        case 'professor':
            return <ProfessorProfileView />;
        case 'admin':
            return <AdminProfileView />;
        default:
             return <StudentProfileView />;
    }
  };

  return (
    <div className="space-y-8">
      <section>
        <div>
          <h1 className="text-3xl font-bold font-headline">Perfil Personal</h1>
          <p className="text-muted-foreground">
            Consulta y actualiza tu información personal y de seguridad.
          </p>
        </div>
      </section>
      {renderContent()}
    </div>
  );
}