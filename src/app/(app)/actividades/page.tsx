'use client';

import { useUser } from '@/firebase';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import {
  Activity,
  PlusCircle,
  Calendar as CalendarIcon,
  Users,
  BarChart,
  CheckCircle,
  UserCog,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const activities = [
  {
    id: '1',
    title: 'Club de Debate',
    category: 'Académico',
    date: 'Todos los miércoles',
    imageUrl: 'https://picsum.photos/seed/debate/400/200',
    description: 'Practica tus habilidades de oratoria y pensamiento crítico.',
    aiHint: 'debate students',
  },
  {
    id: '2',
    title: 'Equipo de Fútbol',
    category: 'Deportivo',
    date: 'Martes y Jueves',
    imageUrl: 'https://picsum.photos/seed/futbol/400/200',
    description: 'Únete al equipo representativo de la universidad.',
    aiHint: 'soccer team',
  },
  {
    id: '3',
    title: 'Taller de Fotografía',
    category: 'Cultural',
    date: 'Viernes por la tarde',
    imageUrl: 'https://picsum.photos/seed/photo/400/200',
    description: 'Aprende los fundamentos de la fotografía digital.',
    aiHint: 'photography class',
  },
];

const enrolledActivities = ['1'];

export default function ActivitiesPage() {
  const { profile } = useUser();

  const canCreate = profile?.role === 'admin' || profile?.role === 'professor';
  const isAdmin = profile?.role === 'admin';

  return (
    <div className="space-y-8">
      <section>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
              <Activity className="text-primary" />
              Actividades Extracurriculares
            </h1>
            <p className="text-muted-foreground">
              Participa en talleres, clubes y equipos deportivos.
            </p>
          </div>
          {canCreate && (
            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                    <Button>
                        <PlusCircle className="mr-2" /> Crear Actividad
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Crear Nueva Actividad/Evento</DialogTitle>
                        <DialogDescription>
                            Completa el formulario para publicar una nueva actividad extracurricular o evento.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto pr-4">
                        <div className="space-y-2">
                            <Label htmlFor="event-title">Título</Label>
                            <Input id="event-title" placeholder="Ej: Taller de Oratoria"/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="event-description">Descripción</Label>
                            <Textarea id="event-description" placeholder="Describe los objetivos, temas y requisitos de la actividad."/>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="event-category">Categoría</Label>
                                <Select>
                                    <SelectTrigger id="event-category">
                                        <SelectValue placeholder="Selecciona una categoría"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="academic">Académico</SelectItem>
                                        <SelectItem value="cultural">Cultural</SelectItem>
                                        <SelectItem value="sports">Deportivo</SelectItem>
                                        <SelectItem value="social">Social</SelectItem>
                                        <SelectItem value="workshop">Taller</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="event-date">Fecha y Hora de Inicio</Label>
                                <Input id="event-date" type="datetime-local"/>
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label>Ubicación</Label>
                            <Input placeholder="Ej: Auditorio Principal o Link de Zoom"/>
                        </div>
                        <Alert>
                            <UserCog className="h-4 w-4" />
                            <AlertTitle>En Desarrollo</AlertTitle>
                            <AlertDescription>
                               La lógica para guardar el evento, subir imágenes y gestionar inscripciones se implementará próximamente.
                            </AlertDescription>
                        </Alert>
                    </div>
                    <DialogFooter>
                        <Button variant="outline">Cancelar</Button>
                        <Button disabled><PlusCircle className="mr-2"/> Publicar Actividad</Button>
                    </DialogFooter>
                </DialogContent>
              </Dialog>
              {isAdmin && (
                <Button variant="outline">
                  <BarChart className="mr-2" /> Ver Estadísticas
                </Button>
              )}
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {activities.map((activity) => {
            const isEnrolled = enrolledActivities.includes(activity.id);
            return (
              <Card key={activity.id} className="flex flex-col">
                <Image
                  src={activity.imageUrl}
                  alt={activity.title}
                  width={400}
                  height={200}
                  className="w-full h-40 object-cover rounded-t-lg"
                  data-ai-hint={activity.aiHint}
                />
                <CardHeader>
                  <CardTitle>{activity.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2 pt-1">
                    <Badge variant="secondary">{activity.category}</Badge>
                    <span className="text-xs text-muted-foreground">{activity.date}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground">
                    {activity.description}
                  </p>
                </CardContent>
                <CardFooter>
                  {isEnrolled ? (
                    <Button variant="outline" className="w-full text-destructive hover:text-destructive">
                      <CheckCircle className="mr-2 text-green-500" /> Cancelar Inscripción
                    </Button>
                  ) : (
                    <Button className="w-full">
                      Inscribirse
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </section>

      {isAdmin && (
         <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users /> Gestión de Actividades</CardTitle>
                <CardDescription>Panel para administrar inscripciones, asistencia y comunicaciones de todos los eventos.</CardDescription>
            </CardHeader>
            <CardContent>
                <Alert>
                    <UserCog className="h-4 w-4" />
                    <AlertTitle>En Desarrollo</AlertTitle>
                    <AlertDescription>
                        Las funcionalidades avanzadas para la gestión de actividades, incluyendo la lista de inscritos, el control de asistencia por QR y las estadísticas de participación, estarán disponibles próximamente en este panel.
                    </AlertDescription>
                </Alert>
            </CardContent>
         </Card> 
      )}
    </div>
  );
}
