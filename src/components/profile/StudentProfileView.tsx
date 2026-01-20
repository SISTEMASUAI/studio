'use client';

import { useUser } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User as UserIcon, Mail, Phone, Home, FileText, CheckCircle } from 'lucide-react';
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
            <Button>Guardar Cambios</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText /> Mi Currículum</CardTitle>
            <CardDescription>Sube tu CV para postular a ofertas laborales desde la plataforma.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg bg-accent/50">
                <FileText className="h-6 w-6 text-primary"/>
                <div>
                    <p className="font-medium text-sm">cv_juan_perez_2024.pdf</p>
                    <p className="text-xs text-muted-foreground">Subido el: 2024-08-01</p>
                </div>
                <Button variant="outline" size="sm" className="ml-auto">Reemplazar</Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <aside className="space-y-8">
        <SecuritySettings />
      </aside>
    </div>
  );
}
