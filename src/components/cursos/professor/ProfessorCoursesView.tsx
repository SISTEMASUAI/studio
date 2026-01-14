'use client';

import { useUser, useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, Users, BookCopy } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { collection, query, where, DocumentData } from 'firebase/firestore';

interface Enrollment {
  id: string;
  courseId: string;
}

interface Course extends DocumentData {
    id: string;
    name: string;
    semesterStartDate?: string;
}

export default function ProfessorCoursesView() {
    const { user } = useUser();
    const firestore = useFirestore();

    const coursesQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return query(
            collection(firestore, 'courses'), 
            where('instructorId', '==', user.uid),
            where('status', '==', 'active')
        );
    }, [firestore, user]);

    const { data: courses, isLoading, error } = useCollection<Course>(coursesQuery);

    const enrollmentsQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return query(collection(firestore, 'enrollments'), where('professorId', '==', user.uid));
    }, [firestore, user]);

    const { data: enrollments, isLoading: enrollmentsLoading } = useCollection<Enrollment>(enrollmentsQuery);


    if (isLoading || enrollmentsLoading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (error) {
        return <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>No se pudieron cargar los cursos.</AlertDescription></Alert>;
    }
    
    return (
      <div className="space-y-8">
        <h2 className="text-2xl font-bold">Mis Cursos Impartidos</h2>
        {courses && courses.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
                 <Card key={course.id} className="flex flex-col">
                    <Image
                        src={`https://picsum.photos/seed/${course.id}/400/200`}
                        alt={course.name}
                        width={400}
                        height={200}
                        className="w-full h-40 object-cover rounded-t-lg bg-muted"
                        data-ai-hint="university course abstract"
                    />
                     <CardHeader>
                         <CardTitle>{course.name}</CardTitle>
                         <CardDescription>Semestre {course.semesterStartDate ? new Date(course.semesterStartDate).getFullYear() : ''}</CardDescription>
                     </CardHeader>
                     <CardContent className="flex-grow">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            <Users /> 
                            {enrollments?.filter(e => e.courseId === course.id).length} Estudiantes
                        </div>
                     </CardContent>
                     <CardFooter className="flex gap-2">
                         <Button asChild className="w-full">
                           <Link href={`/cursos/${course.id}`}>
                             Gestionar
                           </Link>
                         </Button>
                     </CardFooter>
                 </Card>
            ))}
        </div>
        ) : (
             <Alert>
              <BookCopy className="h-4 w-4" />
              <AlertTitle>No tienes cursos asignados</AlertTitle>
              <AlertDescription>
                Actualmente no estás asignado como profesor a ningún curso para el semestre actual.
              </AlertDescription>
            </Alert>
        )}
      </div>
    );
}
