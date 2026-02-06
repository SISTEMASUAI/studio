
'use client';

import { useState, useMemo } from 'react';
import { useFirestore, useCollection, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, query, where, doc, DocumentData } from 'firebase/firestore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle, Upload, Save, ClipboardList, PenTool } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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
    const { toast } = useToast();

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

    // 4. Obtener resultados de exámenes
    const quizResultsQuery = useMemoFirebase(() =>
        firestore ? collection(firestore, 'courses', course.id, 'quizResults') : null,
    [firestore, course.id]);
    const { data: quizResults, isLoading: areQuizzesLoading } = useCollection<QuizResult>(quizResultsQuery);

    // 5. Estado local para edición de notas
    const [localGrades, setLocalGrades] = useState<Record<string, Record<string, string>>>({});
    const [isSaving, setIsSaving] = useState(false);

    // Mapas para acceso rápido
    const submissionsMap = useMemo(() => {
        const map = new Map<string, Submission>();
        submissions?.forEach(sub => {
            map.set(`${sub.studentId}-${sub.assignmentId}`, sub);
        });
        return map;
    }, [submissions]);

    const quizResultsMap = useMemo(() => {
        const map = new Map<string, QuizResult>();
        quizResults?.forEach(result => {
            map.set(result.userId, result); // Nota: por ahora asumo un quiz por curso para el demo
        });
        return map;
    }, [quizResults]);

    const handleGradeChange = (studentId: string, assignmentId: string, value: string) => {
        setLocalGrades(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [assignmentId]: value,
            },
        }));
    };

    const handleSaveChanges = async () => {
        if (!firestore) return;
        setIsSaving(true);
        const promises = [];
        for (const studentId in localGrades) {
            for (const assignmentId in localGrades[studentId]) {
                const submissionKey = `${studentId}-${assignmentId}`;
                const submission = submissionsMap.get(submissionKey);
                const newGrade = parseFloat(localGrades[studentId][assignmentId]);

                if (submission && !isNaN(newGrade) && submission.grade !== newGrade) {
                    const submissionRef = doc(firestore, 'courses', course.id, 'submissions', submission.id);
                    promises.push(updateDocumentNonBlocking(submissionRef, { grade: newGrade, status: 'graded' }));
                }
            }
        }
        await Promise.all(promises);
        setIsSaving(false);
        setLocalGrades({});
        toast({ title: "Calificaciones guardadas", description: "Las notas han sido actualizadas." });
    };

    const isLoading = areStudentsLoading || areAssignmentsLoading || areSubmissionsLoading || areQuizzesLoading;

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><ClipboardList className="h-4 w-4"/> Tareas</span>
                    <span className="flex items-center gap-1"><PenTool className="h-4 w-4 text-primary"/> Exámenes</span>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" disabled><PlusCircle className="mr-2"/> Agregar Evaluación</Button>
                    <Button onClick={handleSaveChanges} disabled={isSaving || Object.keys(localGrades).length === 0}>
                        {isSaving ? <Loader2 className="mr-2 animate-spin"/> : <Save className="mr-2"/>}
                        Guardar Cambios
                    </Button>
                    <Button disabled><Upload className="mr-2"/> Publicar Notas</Button>
                </div>
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
                            <TableHead className="text-center min-w-[150px] bg-primary/5">
                                <div className="flex flex-col items-center">
                                    <PenTool className="h-3 w-3 mb-1 text-primary" />
                                    <span className="text-xs">Examen / Quiz</span>
                                </div>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {students && students.length > 0 ? students.map(student => (
                            <TableRow key={student.id}>
                                <TableCell className="sticky left-0 bg-background z-10 font-medium">{student.lastName}, {student.firstName}</TableCell>
                                {assignments?.map(assignment => {
                                    const submission = submissionsMap.get(`${student.uid}-${assignment.id}`);
                                    const localGrade = localGrades[student.uid]?.[assignment.id];
                                    const displayGrade = localGrade !== undefined ? localGrade : (submission?.grade !== null && submission?.grade !== undefined ? String(submission.grade) : '');

                                    return (
                                        <TableCell key={assignment.id} className="text-center">
                                            <Input
                                                type="number"
                                                min="0"
                                                max="20"
                                                step="0.1"
                                                placeholder="--"
                                                className="w-24 text-center mx-auto"
                                                value={displayGrade}
                                                onChange={(e) => handleGradeChange(student.uid, assignment.id, e.target.value)}
                                            />
                                        </TableCell>
                                    );
                                })}
                                {/* Columna de Examen (Solo lectura desde quizResults) */}
                                <TableCell className="text-center bg-primary/5">
                                    <div className="font-bold text-primary">
                                        {quizResultsMap.get(student.uid)?.score ?? '--'}
                                    </div>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={(assignments?.length || 0) + 2} className="text-center h-24">
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
