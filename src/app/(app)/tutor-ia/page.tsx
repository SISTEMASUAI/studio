'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wand2, FileText, Video } from 'lucide-react';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const virtualClasses = [
  {
    id: 'clase-1',
    title: 'Clase 1: Introducción a las Estructuras de Datos',
    date: '2024-08-05',
  },
  {
    id: 'clase-2',
    title: 'Clase 2: Algoritmos de Búsqueda',
    date: '2024-08-12',
  },
  {
    id: 'clase-3',
    title: 'Clase 3: Algoritmos de Ordenamiento',
    date: '2024-08-19',
  },
  {
    id: 'clase-4',
    title: 'Clase 4: Listas, Pilas y Colas',
    date: '2024-08-26',
  },
];

export default function TutorIAPage() {
  const { profile, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && (!profile || !['professor', 'admin'].includes(profile.role))) {
      router.replace('/intranet');
    }
  }, [isUserLoading, profile, router]);

  if (isUserLoading || !profile || !['professor', 'admin'].includes(profile.role)) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
          <Wand2 className="text-primary" />
          Tutor IA
        </h1>
        <p className="text-muted-foreground">
          Herramientas de IA para analizar y enriquecer tus clases grabadas.
        </p>
      </section>
      
      <Card>
        <CardHeader>
          <CardTitle>Clases Virtuales Grabadas</CardTitle>
          <CardDescription>
            Genera resúmenes y busca momentos clave en tus clases grabadas.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          {virtualClasses.map((clase) => (
            <Card key={clase.id}>
              <CardHeader>
                <CardTitle className="text-lg">{clase.title}</CardTitle>
                <CardDescription>Fecha: {clase.date}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" className="w-full" disabled>
                  <FileText className="mr-2" /> Ver Resumen
                </Button>
                <Button className="w-full" disabled>
                  <Video className="mr-2" /> Ver Video
                </Button>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
       <Alert>
          <Wand2 className="h-4 w-4" />
          <AlertTitle>Funcionalidad en Desarrollo</AlertTitle>
          <AlertDescription>
            Próximamente, esta sección se conectará a las grabaciones de tus clases virtuales. La IA podrá transcribir el video, generar resúmenes automáticos y permitirte buscar temas específicos dentro de la grabación.
          </AlertDescription>
        </Alert>
    </div>
  );
}
