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

export default function CourseGrades({ course }: { course: Course }) {
    const firestore = useFirestore();
    const { user } = useUser();

    const assignmentsQuery = useMemoFirebase(() =>
        firestore && course ? collection(firestore, 'courses', course.id, 'assignments') : null,
    [firestore, course]);
    const { data: assignments, isLoading: areAssignmentsLoading } = useCollection<Assignment>(assignmentsQuery);

    const submissionsQuery = useMemoFirebase(() =>
        (firestore && user && course) ? query(
            collection(firestore, 'courses', course.id, 'submissions'),
            where('studentId', '==', user.uid)
        ) : null,
    [firestore, course, user]);
    const { data: submissions, isLoading: areSubmissionsLoading } = useCollection<Submission>(submissionsQuery);
    
    const submissionsMap = useMemo(() => {
        const map = new Map<string, Submission>();
        submissions?.forEach(sub => map.set(sub.assignmentId, sub));
        return map;
    }, [submissions]);

    const { finalGrade, letterGrade } = useMemo(() => {
        if (!assignments || !submissions) return { finalGrade: 0, letterGrade: 'N/A' };
        
        let totalWeight = 0;
        let weightedSum = 0;
        
        assignments.forEach(assignment => {
            const submission = submissionsMap.get(assignment.id);
            if (submission?.grade !== null && submission?.grade !== undefined && assignment.weight) {
                weightedSum += submission.grade * (assignment.weight / 100);
                totalWeight += assignment.weight;
            }
        });
        
        const finalGrade = totalWeight > 0 ? (weightedSum / totalWeight) * 100 : 0;

        let letterGrade = 'N/A';
        if (finalGrade >= 90) letterGrade = 'A';
        else if (finalGrade >= 80) letterGrade = 'B';
        else if (finalGrade >= 70) letterGrade = 'C';
        else if (finalGrade >= 60) letterGrade = 'D';
        else if (totalWeight > 0) letterGrade = 'F';
        
        return { finalGrade: Math.round(finalGrade), letterGrade };

    }, [assignments, submissionsMap]);
    
    const isLoading = areAssignmentsLoading || areSubmissionsLoading;

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
                            <p className="text-2xl font-bold">{finalGrade}<span className="text-base font-normal text-muted-foreground">/100</span></p>
                        </div>
                        <Badge variant="default" className="text-lg h-10">{letterGrade}</Badge>
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
                                        <TableCell><Badge variant={submission?.status === 'graded' ? 'default' : 'secondary'}>{submission?.status || 'Pendiente'}</Badge></TableCell>
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
