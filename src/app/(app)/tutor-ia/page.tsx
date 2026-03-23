'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wand2, FileText, Video, PlayCircle } from 'lucide-react';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const virtualClasses = [
  {
    id: 'clase-1',
    title: 'Clase 1: Introducción a las Estructuras de Datos',
    date: '2024-08-05',
    summary: 'Se cubrieron los conceptos básicos de estructuras de datos, incluyendo arrays y listas enlazadas. Se discutió la importancia de la eficiencia algorítmica y se presentó la notación Big O. La participación de los estudiantes fue alta, con preguntas enfocadas en la implementación práctica de listas enlazadas.',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  },
  {
    id: 'clase-2',
    title: 'Clase 2: Algoritmos de Búsqueda',
    date: '2024-08-12',
    summary: 'Análisis de algoritmos de búsqueda lineal y binaria. Se realizaron ejemplos prácticos y se comparó el rendimiento de ambos métodos. Los estudiantes mostraron dificultad con la implementación recursiva de la búsqueda binaria.',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  },
  {
    id: 'clase-3',
    title: 'Clase 3: Algoritmos de Ordenamiento',
    date: '2024-08-19',
    summary: 'Introducción a algoritmos de ordenamiento como Bubble Sort, Selection Sort e Insertion Sort. Se enfatizó la complejidad temporal y se dejó como tarea la implementación de Merge Sort.',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  },
  {
    id: 'clase-4',
    title: 'Clase 4: Listas, Pilas y Colas',
    date: '2024-08-26',
    summary: 'Diferencias y aplicaciones de las estructuras de datos lineales: listas, pilas (LIFO) y colas (FIFO). Se resolvieron problemas prácticos para ilustrar su uso en escenarios del mundo real.',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
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
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="w-full">
                            <FileText className="mr-2" /> Ver Resumen
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Resumen IA de la Clase</DialogTitle>
                            <DialogDescription>{clase.title}</DialogDescription>
                        </DialogHeader>
                        <div className="py-4 text-sm text-muted-foreground">
                            {clase.summary}
                        </div>
                    </DialogContent>
                </Dialog>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="w-full">
                            <Video className="mr-2" /> Ver Video
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                         <DialogHeader>
                            <DialogTitle>{clase.title}</DialogTitle>
                        </DialogHeader>
                        <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                            <PlayCircle className="w-16 h-16 text-white/70" />
                        </div>
                    </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
