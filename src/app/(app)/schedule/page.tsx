'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Download,
  PlusCircle,
  CalendarCheck,
  CalendarX,
  UserCog,
  AlertTriangle,
} from 'lucide-react';
import { useUser } from '@/firebase';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const upcomingEvents = [
  {
    date: '2024-09-01',
    title: 'Inicio del Semestre',
    type: 'academic',
  },
  {
    date: '2024-09-15',
    title: 'Examen Parcial de Cálculo',
    type: 'exam',
  },
  {
    date: '2024-10-20',
    title: 'Entrega Proyecto Final',
    type: 'assignment',
  },
  {
    date: '2024-10-31',
    title: 'Festival de Bienvenida',
    type: 'event',
  },
];

const eventTypes: { [key: string]: { label: string; className: string } } = {
  academic: {
    label: 'Académico',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  exam: {
    label: 'Exámen',
    className: 'bg-red-100 text-red-800 border-red-200',
  },
  assignment: {
    label: 'Entrega',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  event: {
    label: 'Evento',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
};

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
            <Textarea
              id="event-desc"
              placeholder="Describe el evento, ponentes, etc."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="event-date">Fecha</Label>
              <Input id="event-date" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-type">Tipo</Label>
              <Select>
                <SelectTrigger id="event-type">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
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
              La lógica para guardar el evento y notificar a los usuarios se
              implementará próximamente.
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

function AdminCalendarManagement() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCog /> Gestión del Calendario Académico
        </CardTitle>
        <CardDescription>
          Herramientas para definir y modificar las fechas institucionales.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" disabled>
            <CalendarCheck className="mr-2" /> Definir Períodos de Matrícula
          </Button>
          <Button variant="outline" disabled>
            <CalendarX className="mr-2" /> Programar Feriados
          </Button>
        </div>
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Panel de Administrador</AlertTitle>
          <AlertDescription>
            Las herramientas avanzadas para la gestión global del calendario
            académico estarán disponibles en esta sección.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

export default function SchedulePage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { profile } = useUser();

  const canManageEvents =
    profile?.role === 'admin' || profile?.role === 'professor';
  const isAdmin = profile?.role === 'admin';

  return (
    <div className="space-y-8">
      <section>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold font-headline">
              Horarios y Calendario
            </h1>
            <p className="text-muted-foreground">
              Consulta tus clases, exámenes y eventos académicos.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" disabled>
              <Download className="mr-2" />
              Exportar
            </Button>
            {canManageEvents && <CreateEventDialog />}
          </div>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardContent className="p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="w-full"
              />
            </CardContent>
          </Card>
          {isAdmin && <AdminCalendarManagement />}
        </div>

        <aside className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Próximos Eventos</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {upcomingEvents.map((event, i) => {
                  const eventConfig = eventTypes[event.type] || eventTypes.event;
                  const eventDate = new Date(event.date);
                  // Adjust for timezone offset to prevent day-off errors
                  const utcDate = new Date(eventDate.getUTCFullYear(), eventDate.getUTCMonth(), eventDate.getUTCDate());

                  return (
                    <li key={i} className="flex items-center gap-4">
                      <div className="flex-shrink-0 text-center border-r pr-4">
                        <p className="font-bold font-headline text-lg">
                          {utcDate.toLocaleDateString('es-ES', {
                            day: '2-digit',
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {utcDate.toLocaleDateString('es-ES', {
                            month: 'short',
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold">{event.title}</p>
                        <Badge variant="outline" className={eventConfig.className}>
                          {eventConfig.label}
                        </Badge>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
