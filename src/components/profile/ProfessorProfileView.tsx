'use client';

import { useUser } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { User as UserIcon, Mail, Phone, Home, Book } from 'lucide-react';
import ProfileHeader from './ProfileHeader';
import SecuritySettings from './SecuritySettings';

export default function ProfessorProfileView() {
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
