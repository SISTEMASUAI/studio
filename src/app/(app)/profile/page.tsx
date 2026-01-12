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
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';


function UserProfileView() {
  const { profile } = useUser();

  if (!profile) {
    return <Loader2 className="animate-spin" />;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Profile Header */}
      <div className="lg:col-span-3">
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
      </div>

      {/* Personal & Security Info */}
      <div className="lg:col-span-2 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon /> Datos Personales
            </CardTitle>
            <CardDescription>
              Actualiza tu información de contacto.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label htmlFor="email" className="flex items-center gap-1"><Mail /> Email</Label>
                    <Input id="email" defaultValue={profile.email} disabled />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="phone" className="flex items-center gap-1"><Phone /> Teléfono</Label>
                    <Input id="phone" defaultValue={profile.phone || ''} />
                </div>
            </div>
             <div className="space-y-1">
                <Label htmlFor="address" className="flex items-center gap-1"><Home/> Dirección</Label>
                <Input id="address" defaultValue={profile.address || ''} />
            </div>
            <Button disabled>Guardar Cambios</Button>
          </CardContent>
        </Card>

        {profile.role === 'student' && (
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><FileText /> Mi Currículum</CardTitle>
                     <CardDescription>
                        Sube tu CV para postular a ofertas laborales desde la plataforma.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Alert>
                        <UserCog className="h-4 w-4" />
                        <AlertTitle>En Desarrollo</AlertTitle>
                        <AlertDescription>
                           La funcionalidad para subir y gestionar tu CV estará disponible aquí.
                        </AlertDescription>
                    </Alert>
                </CardContent>
             </Card>
        )}
      </div>

      {/* Security Settings */}
      <aside className="space-y-8">
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
            <Button variant="outline" className="w-full justify-start" disabled><Monitor className="mr-2"/> Ver Sesiones Activas</Button>
            <Button variant="destructive" className="w-full justify-start" disabled><LogOut className="mr-2"/> Cerrar Sesiones Remotas</Button>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

function AdminProfileView() {
    return (
        <Alert>
            <UserCog className="h-4 w-4" />
            <AlertTitle>Vista de Administrador</AlertTitle>
            <AlertDescription>
                Próximamente: Panel para buscar y ver el perfil de cualquier usuario.
            </AlertDescription>
        </Alert>
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
    
    // Admins can see their own profile, but will have a different view for managing others
    // For now, we show the user's own profile for all roles.
    return <UserProfileView />;
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
