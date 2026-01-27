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
import { Loader2, GraduationCap } from 'lucide-react';
import type { Course } from '@/types/course';
import { useMemo } from 'react';

interface Assignment {
    id: string;
    title: string;
    weight: number;
}

interface Submission {
    id: string;
    assignmentId: string;
    grade: number | null;
    status: string;
}

export default function CourseGrades({ course }: { course: Course | null }) {
    
    if (!course) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><GraduationCap /> Mis Calificaciones</CardTitle>
                    <CardDescription>Resumen de tu rendimiento en el curso.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-center p-8"><Loader2 className="animate-spin"/></div>
                </CardContent>
            </Card>
        );
    }

    const firestore = useFirestore();
    const { user } = useUser();

    const assignmentsQuery = useMemoFirebase(() =>
        (firestore) ? collection(firestore, 'courses', course.id, 'assignments') : null,
    [firestore, course.id]);
    const { data: assignments, isLoading: areAssignmentsLoading } = useCollection<Assignment>(assignmentsQuery);

    const submissionsQuery = useMemoFirebase(() =>
        (firestore && user) ? query(
            collection(firestore, 'courses', course.id, 'submissions'),
            where('studentId', '==', user.uid)
        ) : null,
    [firestore, course.id, user]);
    const { data: submissions, isLoading: areSubmissionsLoading } = useCollection<Submission>(submissionsQuery);
    
    const submissionsMap = useMemo(() => {
        const map = new Map<string, Submission>();
        submissions?.forEach(sub => map.set(sub.assignmentId, sub));
        return map;
    }, [submissions]);

    const { finalGrade, letterGrade } = useMemo(() => {
        if (!submissions) return { finalGrade: 0, letterGrade: 'N/A' };
        
        const gradedSubmissions = submissions.filter(s => s.grade !== null && s.grade !== undefined);

        if (gradedSubmissions.length === 0) {
            return { finalGrade: 0, letterGrade: 'N/A' };
        }

        const sumOfGrades = gradedSubmissions.reduce((acc, sub) => acc + sub.grade!, 0);
        const finalGradeValue = sumOfGrades / gradedSubmissions.length;
        
        let letterGradeValue = 'N/A';
        if (finalGradeValue >= 10.5) {
            letterGradeValue = 'Aprobado';
        } else {
            letterGradeValue = 'Desaprobado';
        }
        
        return { finalGrade: parseFloat(finalGradeValue.toFixed(1)), letterGrade: letterGradeValue };

    }, [submissions]);
    
    const isLoading = areAssignmentsLoading || areSubmissionsLoading;

    const getStatusText = (submission: Submission | null) => {
        if (submission?.grade !== null && submission?.grade !== undefined) return 'Calificada';
        if (submission) return 'Entregada';
        return 'Pendiente';
    };
    
    const getStatusVariant = (submission: Submission | null): 'default' | 'secondary' | 'outline' => {
        if (submission?.grade !== null && submission?.grade !== undefined) return 'secondary';
        if (submission) return 'outline';
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
                        <CardDescription>Resumen de tu rendimiento en el curso.</CardDescription>
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
                                <TableHead>Evaluación</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Nota</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {assignments?.map(assignment => {
                                const submission = submissionsMap.get(assignment.id);
                                return (
                                    <TableRow key={assignment.id}>
                                        <TableCell className="font-medium">{assignment.title}</TableCell>
                                        <TableCell><Badge variant={getStatusVariant(submission)}>{getStatusText(submission)}</Badge></TableCell>
                                        <TableCell className="text-right font-mono">{submission?.grade !== null && submission?.grade !== undefined ? submission.grade : '--'}</TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
