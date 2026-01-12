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
  Activity,
  PlusCircle,
  Calendar as CalendarIcon,
  Users,
  BarChart,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import Image from 'next/image';

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
              <Button>
                <PlusCircle className="mr-2" /> Crear Actividad
              </Button>
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
                <CardDescription>Panel para administrar inscripciones y asistencia.</CardDescription>
            </CardHeader>
            <CardContent>
                <Alert>
                    <Activity className="h-4 w-4" />
                    <AlertTitle>En Desarrollo</AlertTitle>
                    <AlertDescription>
                        Las funcionalidades avanzadas para la gestión de actividades, inscripciones y asistencia estarán disponibles próximamente.
                    </AlertDescription>
                </Alert>
            </CardContent>
         </Card> 
      )}
    </div>
  );
}
