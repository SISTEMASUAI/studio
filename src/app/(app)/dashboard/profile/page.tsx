
'use client';

import { useUser } from '@/firebase';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
  GraduationCap,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

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
            <Button variant="outline">
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
            <Button>Guardar Cambios</Button>
          </CardContent>
        </Card>

        {profile.role === 'admin' && (
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><GraduationCap/> Datos Académicos</CardTitle>
                </CardHeader>
                <CardContent>
                     <Alert>
                        <UserCog className="h-4 w-4" />
                        <AlertTitle>En Desarrollo</AlertTitle>
                        <AlertDescription>
                           La funcionalidad para modificar los datos académicos de los estudiantes estará disponible aquí para los administradores.
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
            <Button variant="outline" className="w-full justify-start"><KeyRound className="mr-2"/> Cambiar Contraseña</Button>
            <Button variant="outline" className="w-full justify-start"><Fingerprint className="mr-2"/> Configurar 2FA</Button>
            <Button variant="outline" className="w-full justify-start"><Monitor className="mr-2"/> Ver Sesiones Activas</Button>
            <Button variant="destructive" className="w-full justify-start"><LogOut className="mr-2"/> Cerrar Sesiones Remotas</Button>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

function AdminProfileView() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/profile');
    }, [router]);
    return null;
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
