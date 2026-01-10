
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, PlusCircle } from 'lucide-react';

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


export default function SchedulePage() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-8">
        <section>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold font-headline">Horarios y Calendario</h1>
              <p className="text-muted-foreground">Consulta tus clases, exámenes y eventos académicos.</p>
            </div>
            <div className="flex gap-2">
              {/* These buttons will be functional in future steps */}
              <Button variant="outline">
                <Download className="mr-2" />
                Exportar
              </Button>
              <Button>
                <PlusCircle className="mr-2" />
                Crear Evento
              </Button>
            </div>
          </div>
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
        </section>
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
  );
}
