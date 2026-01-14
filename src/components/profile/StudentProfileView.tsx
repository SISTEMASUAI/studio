'use client';

import { useUser } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { User as UserIcon, Mail, Phone, Home, FileText, UserCog } from 'lucide-react';
import ProfileHeader from './ProfileHeader';
import SecuritySettings from './SecuritySettings';

export default function StudentProfileView() {
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
