'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, PlusCircle, Settings, Edit } from 'lucide-react';
import { useUser } from '@/firebase';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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
];

const eventTypes: { [key: string]: { label: string; className: string } } = {
  academic: { label: 'Académico', className: 'bg-blue-100 text-blue-800' },
  exam: { label: 'Exámen', className: 'bg-red-100 text-red-800' },
  assignment: { label: 'Entrega', className: 'bg-yellow-100 text-yellow-800' },
  event: { label: 'Evento', className: 'bg-green-100 text-green-800' },
};

function AdminCalendarManagement() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Settings /> Gestión del Calendario Académico</CardTitle>
                <CardDescription>Define las fechas clave y los eventos para toda la institución.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="flex flex-wrap gap-2">
                    <Button variant="outline"><Edit className="mr-2"/> Definir Períodos de Matrícula</Button>
                    <Button variant="outline"><Edit className="mr-2"/> Programar Feriados</Button>
                    <Button variant="outline"><Edit className="mr-2"/> Gestionar Fechas de Exámenes Finales</Button>
                </div>
                <Alert>
                    <Settings className="h-4 w-4" />
                    <AlertTitle>En Desarrollo</AlertTitle>
                    <AlertDescription>
                        Esta sección albergará las herramientas avanzadas para la gestión del calendario institucional, incluyendo la notificación masiva a los usuarios.
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
    )
}


export default function SchedulePage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { profile } = useUser();

  const canManageEvents = profile?.role === 'admin' || profile?.role === 'professor';
  const isAdmin = profile?.role === 'admin';

  return (
    <div className="space-y-8">
       <section>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
              <Calendar className="text-primary" />
              Horarios y Calendario
            </h1>
            <p className="text-muted-foreground">Consulta tus clases, exámenes y eventos académicos.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" disabled>
              <Download className="mr-2" />
              Exportar
            </Button>
            {canManageEvents && (
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
                      Completa el formulario para añadir un nuevo examen, entrega o evento al calendario.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="event-title">Título del Evento</Label>
                      <Input id="event-title" placeholder="Ej: Examen Parcial de Cálculo" />
                    </div>
                     <div className="space-y-2">
                      <Label htmlFor="event-desc">Descripción</Label>
                      <Textarea id="event-desc" placeholder="Temas a evaluar: Derivadas e Integrales."/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="event-date">Fecha</Label>
                        <Input id="event-date" type="date"/>
                      </div>
                      <div className="space-y-2">
                        <Label>Tipo de Evento</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar tipo..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="exam">Examen</SelectItem>
                            <SelectItem value="assignment">Entrega</SelectItem>
                            <SelectItem value="academic">Evento Académico</SelectItem>
                            <SelectItem value="other">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                     <Alert>
                        <PlusCircle className="h-4 w-4" />
                        <AlertTitle>En Desarrollo</AlertTitle>
                        <AlertDescription>
                            La lógica para guardar el evento y notificar a los estudiantes se implementará próximamente.
                        </AlertDescription>
                    </Alert>
                  </div>
                  <DialogFooter>
                    <Button variant="outline">Cancelar</Button>
                    <Button disabled>Guardar Evento</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </section>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
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
                  return (
                    <li key={i} className="flex items-center gap-4">
                      <div className="flex-shrink-0 text-center">
                          <p className="font-bold font-headline text-lg">{new Date(event.date).toLocaleDateString('es-ES', { day: '2-digit' })}</p>
                          <p className="text-xs text-muted-foreground">{new Date(event.date).toLocaleDateString('es-ES', { month: 'short' })}</p>
                      </div>
                      <div>
                        <p className="font-semibold">{event.title}</p>
                        <Badge className={eventConfig.className}>{eventConfig.label}</Badge>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </CardContent>
          </Card>
        </aside>
      </div>
      
      {isAdmin && (
        <section className="mt-8">
            <AdminCalendarManagement />
        </section>
      )}

    </div>
  );
}
