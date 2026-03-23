'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, BookCopy } from 'lucide-react';
import { collection, query, where, DocumentData } from 'firebase/firestore';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import CourseGrades from '../cursos/CourseGrades';
import { useMemo } from 'react';

interface Enrollment extends DocumentData {
  id: string;
  courseId: string;
  courseName: string;
  courseCode: string;
}

interface Course extends DocumentData {
    id: string;
    name: string;
}

export default function StudentGradesView() {
    const { user } = useUser();
    const firestore = useFirestore();

    const enrollmentsQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return query(collection(firestore, 'enrollments'), where('studentId', '==', user.uid));
    }, [firestore, user]);

    const { data: enrollments, isLoading: areEnrollmentsLoading } = useCollection<Enrollment>(enrollmentsQuery);

    const courseIds = useMemo(() => enrollments?.map(e => e.courseId) || [], [enrollments]);

    const coursesQuery = useMemoFirebase(() =>
        (firestore && courseIds.length > 0) ? query(collection(firestore, 'courses'), where('__name__', 'in', courseIds)) : null,
    [firestore, courseIds]);
    const { data: courses, isLoading: areCoursesLoading } = useCollection<Course>(coursesQuery);

    if (areEnrollmentsLoading || areCoursesLoading) {
        return (
            <Card>
                <CardContent className="pt-6 flex justify-center items-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin" />
                </CardContent>
            </Card>
        );
    }
    
    if (!courses || courses.length === 0) {
        return (
             <Alert>
                <BookCopy className="h-4 w-4" />
                <AlertTitle>Sin Calificaciones</AlertTitle>
                <AlertDescription>
                    Aún no tienes calificaciones para mostrar. Inscríbete en un curso para empezar.
                </AlertDescription>
            </Alert>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Mis Calificaciones por Curso</CardTitle>
                <CardDescription>
                    Expande cada curso para ver el detalle de tus calificaciones.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    {courses.map(course => (
                        <AccordionItem value={course.id} key={course.id}>
                            <AccordionTrigger>
                                <div className="text-left">
                                    <p className="font-semibold">{course.name}</p>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="p-2">
                                <CourseGrades courseId={course.id} />
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </CardContent>
        </Card>
    );
}
