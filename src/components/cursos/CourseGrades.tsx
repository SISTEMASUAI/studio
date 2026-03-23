'use client';

import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, GraduationCap, ClipboardList, PenTool } from 'lucide-react';
import { useMemo } from 'react';
import type { QuizResult } from '@/types/course';

interface Assignment {
    id: string;
    title: string;
    weight?: number;
}

interface Submission {
    id: string;
    assignmentId: string;
    grade: number | null;
}

export default function CourseGrades({ courseId }: { courseId: string }) {
    const firestore = useFirestore();
    const { user } = useUser();

    // Consultar tareas (Assignments)
    const assignmentsQuery = useMemoFirebase(() =>
        (firestore && courseId) ? collection(firestore, 'courses', courseId, 'assignments') : null,
    [firestore, courseId]);
    const { data: assignments, isLoading: areAssignmentsLoading } = useCollection<Assignment>(assignmentsQuery);

    // Consultar entregas del alumno (Submissions)
    const submissionsQuery = useMemoFirebase(() =>
        (firestore && user && courseId) ? query(
            collection(firestore, 'courses', courseId, 'submissions'),
            where('studentId', '==', user.uid)
        ) : null,
    [firestore, courseId, user?.uid]);
    const { data: submissions, isLoading: areSubmissionsLoading } = useCollection<Submission>(submissionsQuery);

    // Consultar resultados de exámenes (QuizResults)
    const quizResultsQuery = useMemoFirebase(() =>
        (firestore && user && courseId) ? query(
            collection(firestore, 'courses', courseId, 'quizResults'),
            where('userId', '==', user.uid)
        ) : null,
    [firestore, courseId, user?.uid]);
    const { data: quizResults, isLoading: areQuizzesLoading } = useCollection<QuizResult>(quizResultsQuery);
    
    const submissionsMap = useMemo(() => {
        const map = new Map<string, Submission>();
        submissions?.forEach(sub => map.set(sub.assignmentId, sub));
        return map;
    }, [submissions]);

    const { finalGrade, letterGrade } = useMemo(() => {
        const gradedSubmissions = submissions?.filter(s => s.grade !== null && s.grade !== undefined) || [];
        const gradedQuizzes = quizResults?.filter(q => q.score !== null && q.score !== undefined) || [];

        if (gradedSubmissions.length === 0 && gradedQuizzes.length === 0) {
            return { finalGrade: 0, letterGrade: 'N/A' };
        }

        const sumOfGrades = gradedSubmissions.reduce((acc, sub) => acc + sub.grade!, 0) + 
                           gradedQuizzes.reduce((acc, quiz) => acc + quiz.score, 0);
        
        const totalEvaluations = gradedSubmissions.length + gradedQuizzes.length;
        const finalGradeValue = sumOfGrades / totalEvaluations;
        
        let letterGradeValue = 'Desaprobado';
        if (finalGradeValue >= 10.5) {
            letterGradeValue = 'Aprobado';
        }
        
        return { finalGrade: parseFloat(finalGradeValue.toFixed(1)), letterGrade: letterGradeValue };

    }, [submissions, quizResults]);
    
    const isLoading = areAssignmentsLoading || areSubmissionsLoading || areQuizzesLoading;

    const getStatusText = (submission?: Submission) => {
        if (submission?.grade !== null && submission?.grade !== undefined) return 'Calificada';
        if (submission) return 'Entregada';
        return 'Pendiente';
    };
    
    const getStatusVariant = (submission?: Submission): 'default' | 'secondary' | 'outline' => {
        if (submission?.grade !== null && submission?.grade !== undefined) return 'default';
        if (submission) return 'secondary';
        return 'outline';
    };

    const getLetterGradeVariant = () => {
        if (letterGrade === 'Aprobado') return 'secondary';
        if (letterGrade === 'Desaprobado') return 'destructive';
        return 'secondary';
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start">
                    <div>
                        <CardTitle className="flex items-center gap-2"><GraduationCap /> Mis Calificaciones</CardTitle>
                        <CardDescription>Resumen de tu rendimiento en el curso (Tareas y Exámenes).</CardDescription>
                    </div>
                    { !isLoading &&
                    <div className="flex items-center gap-2 mt-4 sm:mt-0">
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">Nota Final</p>
                            <p className="text-2xl font-bold">{finalGrade}<span className="text-base font-normal text-muted-foreground">/20</span></p>
                        </div>
                        <Badge variant={getLetterGradeVariant()} className="text-lg h-10">{letterGrade}</Badge>
                    </div>
                    }
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center p-8"><Loader2 className="animate-spin"/></div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Evaluación</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Nota</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {/* Tareas */}
                            {assignments?.map(assignment => {
                                const submission = submissionsMap.get(assignment.id);
                                return (
                                    <TableRow key={assignment.id}>
                                        <TableCell><ClipboardList className="h-4 w-4 text-muted-foreground" /></TableCell>
                                        <TableCell className="font-medium">{assignment.title}</TableCell>
                                        <TableCell><Badge variant={getStatusVariant(submission)}>{getStatusText(submission)}</Badge></TableCell>
                                        <TableCell className="text-right font-mono">{submission?.grade !== null && submission?.grade !== undefined ? submission.grade : '--'}</TableCell>
                                    </TableRow>
                                )
                            })}
                            {/* Exámenes */}
                            {quizResults?.map((quiz, index) => (
                                <TableRow key={quiz.id}>
                                    <TableCell><PenTool className="h-4 w-4 text-primary" /></TableCell>
                                    <TableCell className="font-medium">Examen {index + 1}</TableCell>
                                    <TableCell><Badge variant="default">Completado</Badge></TableCell>
                                    <TableCell className="text-right font-mono font-bold text-primary">{quiz.score}</TableCell>
                                </TableRow>
                            ))}
                            {(!assignments || assignments.length === 0) && (!quizResults || quizResults.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">No hay evaluaciones registradas.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
