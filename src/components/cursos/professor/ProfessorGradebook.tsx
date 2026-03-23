'use client';

import { useMemo } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, DocumentData } from 'firebase/firestore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, ClipboardList, PenTool } from 'lucide-react';
import type { Course, QuizResult } from '@/types/course';

interface Student extends DocumentData {
    id: string;
    uid: string;
    firstName: string;
    lastName: string;
}

interface Assignment extends DocumentData {
    id: string;
    title: string;
}

interface Submission extends DocumentData {
    id: string;
    studentId: string;
    assignmentId: string;
    grade: number | null;
}

export default function ProfessorGradebook({ course }: { course: Course }) {
    const firestore = useFirestore();

    // 1. Obtener estudiantes inscritos
    const enrollmentsQuery = useMemoFirebase(() => 
        firestore ? query(collection(firestore, 'enrollments'), where('courseId', '==', course.id)) : null, 
    [firestore, course.id]);
    const { data: enrollments } = useCollection(enrollmentsQuery);

    const studentIds = useMemo(() => enrollments?.map(e => e.studentId) || [], [enrollments]);
    const studentsQuery = useMemoFirebase(() =>
        (firestore && studentIds.length > 0) ? query(collection(firestore, 'users'), where('uid', 'in', studentIds)) : null,
    [firestore, studentIds]);
    const { data: students, isLoading: areStudentsLoading } = useCollection<Student>(studentsQuery);

    // 2. Obtener tareas
    const assignmentsQuery = useMemoFirebase(() => 
        firestore ? collection(firestore, 'courses', course.id, 'assignments') : null, 
    [firestore, course.id]);
    const { data: assignments, isLoading: areAssignmentsLoading } = useCollection<Assignment>(assignmentsQuery);

    // 3. Obtener entregas
    const submissionsQuery = useMemoFirebase(() => 
        firestore ? collection(firestore, 'courses', course.id, 'submissions') : null, 
    [firestore, course.id]);
    const { data: submissions, isLoading: areSubmissionsLoading } = useCollection<Submission>(submissionsQuery);

    // 4. Obtener resultados de exámenes (quizResults)
    const quizResultsQuery = useMemoFirebase(() =>
        firestore ? collection(firestore, 'courses', course.id, 'quizResults') : null,
    [firestore, course.id]);
    const { data: quizResults, isLoading: areQuizzesLoading } = useCollection<QuizResult>(quizResultsQuery);

    // Mapas para acceso rápido y columnas dinámicas
    const uniqueQuizzes = useMemo(() => {
        if (!quizResults) return [];
        const quizIds = new Set<string>();
        quizResults.forEach(r => quizIds.add(r.quizId));
        return Array.from(quizIds).sort();
    }, [quizResults]);

    const submissionsMap = useMemo(() => {
        const map = new Map<string, Submission>();
        submissions?.forEach(sub => {
            map.set(`${sub.studentId}-${sub.assignmentId}`, sub);
        });
        return map;
    }, [submissions]);

    const quizResultsMap = useMemo(() => {
        const map = new Map<string, Map<string, QuizResult>>();
        quizResults?.forEach(result => {
            if (!map.has(result.userId)) {
                map.set(result.userId, new Map<string, QuizResult>());
            }
            map.get(result.userId)!.set(result.quizId, result);
        });
        return map;
    }, [quizResults]);

    const isLoading = areStudentsLoading || areAssignmentsLoading || areSubmissionsLoading || areQuizzesLoading;

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><ClipboardList className="h-4 w-4"/> Tareas</span>
                <span className="flex items-center gap-1"><PenTool className="h-4 w-4 text-primary"/> Exámenes</span>
            </div>
            
            <div className="overflow-x-auto border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="sticky left-0 bg-background z-10 min-w-[200px]">Estudiante</TableHead>
                            {assignments?.map(ev => (
                                <TableHead key={ev.id} className="text-center min-w-[150px]">
                                    <div className="flex flex-col items-center">
                                        <ClipboardList className="h-3 w-3 mb-1 opacity-50" />
                                        <span className="text-xs truncate max-w-[120px]">{ev.title}</span>
                                    </div>
                                </TableHead>
                            ))}
                            {uniqueQuizzes.map((quizId, idx) => (
                                <TableHead key={quizId} className="text-center min-w-[120px] bg-primary/5">
                                    <div className="flex flex-col items-center">
                                        <PenTool className="h-3 w-3 mb-1 text-primary" />
                                        <span className="text-xs">Examen {idx + 1}</span>
                                    </div>
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {students && students.length > 0 ? students.map(student => (
                            <TableRow key={student.id}>
                                <TableCell className="sticky left-0 bg-background z-10 font-medium">
                                    {student.lastName}, {student.firstName}
                                </TableCell>
                                {assignments?.map(assignment => {
                                    const submission = submissionsMap.get(`${student.uid}-${assignment.id}`);
                                    const gradeValue = submission?.grade !== null && submission?.grade !== undefined 
                                        ? String(submission.grade) 
                                        : '--';

                                    return (
                                        <TableCell key={assignment.id} className="text-center">
                                            <div className="font-mono text-sm">
                                                {gradeValue}
                                            </div>
                                        </TableCell>
                                    );
                                })}
                                {/* Columnas de Exámenes */}
                                {uniqueQuizzes.map(quizId => (
                                    <TableCell key={quizId} className="text-center bg-primary/5">
                                        <div className="font-bold text-primary font-mono">
                                            {quizResultsMap.get(student.uid)?.get(quizId)?.score ?? '--'}
                                        </div>
                                    </TableCell>
                                ))}
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={(assignments?.length || 0) + uniqueQuizzes.length + 1} className="text-center h-24">
                                    No hay estudiantes inscritos en este curso.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}