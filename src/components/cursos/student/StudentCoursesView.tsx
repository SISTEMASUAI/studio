'use client';

import { useUser, useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight, BookCopy } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { collection, query, where } from 'firebase/firestore';

interface Enrollment {
  id: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  professorName: string;
  courseImage: string;
}

export default function StudentCoursesView() {
  const { user } = useUser();
  const firestore = useFirestore();

  const enrollmentsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'enrollments'), where('studentId', '==', user.uid));
  }, [firestore, user]);

  const { data: enrollments, isLoading, error } = useCollection<Enrollment>(enrollmentsQuery);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
        <Alert variant="destructive">
            <AlertTitle>Error al cargar los cursos</AlertTitle>
            <AlertDescription>
                No se pudo obtener la lista de cursos. Por favor, inténtalo de nuevo más tarde.
            </AlertDescription>
        </Alert>
    );
  }
  
  if (!enrollments || enrollments.length === 0) {
    return (
        <Alert>
            <BookCopy className="h-4 w-4" />
            <AlertTitle>No tienes cursos inscritos</AlertTitle>
            <AlertDescription>
                Actualmente no estás inscrito en ningún curso. Visita la sección de Matrícula para inscribirte.
            </AlertDescription>
        </Alert>
    );
  }


  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {enrollments.map((enrollment) => {
        return (
            <Card key={enrollment.id} className="flex flex-col">
              <Image
                src={enrollment.courseImage || `https://picsum.photos/seed/${enrollment.courseId}/400/200`}
                alt={enrollment.courseName}
                width={400}
                height={200}
                className="w-full h-40 object-cover rounded-t-lg"
                data-ai-hint="university course"
              />
              <CardHeader>
                <CardTitle>{enrollment.courseName}</CardTitle>
                <CardDescription>{enrollment.professorName}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <Badge variant="secondary">{enrollment.courseCode}</Badge>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={`/cursos/${enrollment.courseId}`}>
                    Ver Curso <ArrowRight className="ml-2" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
        )
      })}
    </div>
  );
}
