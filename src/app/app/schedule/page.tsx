'use client';

import { useUser } from '@/firebase';
import { Loader2, Download, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdminScheduleView from '@/components/schedule/AdminScheduleView';
import UserScheduleView from '@/components/schedule/UserScheduleView';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { UserCog } from 'lucide-react';
import { DialogFooter } from '@/components/ui/dialog';

// Keep CreateEventDialog here as it's shared and simple
function CreateEventDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2" />
          Crear Evento
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Nuevo Evento Académico</DialogTitle>
          <DialogDescription>
            Completa los detalles para programar un nuevo evento.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="event-title">Título del Evento</Label>
            <Input id="event-title" placeholder="Ej: Charla sobre IA" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="event-desc">Descripción</Label>
            <Textarea id="event-desc" placeholder="Describe el evento, ponentes, etc." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="event-date">Fecha</Label>
              <Input id="event-date" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-type">Tipo</Label>
              <Select>
                <SelectTrigger id="event-type"><SelectValue placeholder="Seleccionar tipo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="academic">Académico</SelectItem>
                  <SelectItem value="conference">Conferencia</SelectItem>
                  <SelectItem value="workshop">Taller</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Alert>
            <UserCog className="h-4 w-4" />
            <AlertTitle>Funcionalidad en Desarrollo</AlertTitle>
            <AlertDescription>
              La lógica para guardar el evento y notificar a los usuarios se implementará próximamente.
            </AlertDescription>
          </Alert>
        </div>
        <DialogFooter>
          <Button variant="outline">Cancelar</Button>
          <Button disabled>Guardar Evento</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function SchedulePage() {
  const { profile, isUserLoading } = useUser();
  const canManageEvents = profile?.role === 'admin' || profile?.role === 'professor';

  if (isUserLoading || !profile) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold font-headline">
              {profile.role === 'admin' ? 'Gestión de Horarios y Calendario' : 'Horarios y Calendario'}
            </h1>
            <p className="text-muted-foreground">
              {profile.role === 'admin'
                ? 'Define la estructura académica de los cursos y los eventos institucionales.'
                : 'Consulta tus clases, exámenes y eventos académicos.'}
            </p>
          </div>
          <div className="flex gap-2">
            {profile.role !== 'admin' && <Button variant="outline" disabled><Download className="mr-2" />Exportar</Button>}
            {canManageEvents && <CreateEventDialog />}
          </div>
        </div>
      </section>

      {profile.role === 'admin' ? <AdminScheduleView /> : <UserScheduleView />}
    </div>
  );
}
