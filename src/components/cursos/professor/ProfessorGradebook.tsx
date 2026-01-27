'use client';

import { useState, useMemo } from 'react';
import { useFirestore, useCollection, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, query, where, doc, DocumentData } from 'firebase/firestore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle, Upload, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Course } from '@/types/course';

interface Student extends DocumentData {
    id: string;
    uid: string;
    firstName: string;
    lastName: string;
}

interface Assignment extends DocumentData {
    id: string;
    title: string;
    maxGrade: number;
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

    // 1. Fetch enrolled students
    const enrollmentsQuery = useMemoFirebase(() => 
        firestore ? query(collection(firestore, 'enrollments'), where('courseId', '==', course.id)) : null, 
    [firestore, course.id]);
    const { data: enrollments } = useCollection(enrollmentsQuery);

    const studentIds = useMemo(() => enrollments?.map(e => e.studentId) || [], [enrollments]);
    const studentsQuery = useMemoFirebase(() =>
        (firestore && studentIds.length > 0) ? query(collection(firestore, 'users'), where('uid', 'in', studentIds)) : null,
    [firestore, studentIds]);
    const { data: students, isLoading: areStudentsLoading } = useCollection<Student>(studentsQuery);

    // 2. Fetch assignments
    const assignmentsQuery = useMemoFirebase(() => 
        firestore ? collection(firestore, 'courses', course.id, 'assignments') : null, 
    [firestore, course.id]);
    const { data: assignments, isLoading: areAssignmentsLoading } = useCollection<Assignment>(assignmentsQuery);

    // 3. Fetch submissions
    const submissionsQuery = useMemoFirebase(() => 
        firestore ? collection(firestore, 'courses', course.id, 'submissions') : null, 
    [firestore, course.id]);
    const { data: submissions, isLoading: areSubmissionsLoading } = useCollection<Submission>(submissionsQuery);

    // 4. Local state for editing grades
    const [localGrades, setLocalGrades] = useState<Record<string, Record<string, string>>>({});
    const [isSaving, setIsSaving] = useState(false);

    // Create a map for quick access to submissions
    const submissionsMap = useMemo(() => {
        const map = new Map<string, Submission>();
        submissions?.forEach(sub => {
            map.set(`${sub.studentId}-${sub.assignmentId}`, sub);
        });
        return map;
    }, [submissions]);

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

    const isLoading = areStudentsLoading || areAssignmentsLoading || areSubmissionsLoading;

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end gap-2">
                <Button variant="outline" disabled><PlusCircle/> Agregar Evaluación</Button>
                <Button onClick={handleSaveChanges} disabled={isSaving || Object.keys(localGrades).length === 0}>
                    {isSaving ? <Loader2 className="mr-2 animate-spin"/> : <Save className="mr-2"/>}
                    Guardar Cambios
                </Button>
                <Button disabled><Upload/> Publicar Notas</Button>
            </div>
            <div className="overflow-x-auto border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="sticky left-0 bg-background z-10 min-w-[200px]">Estudiante</TableHead>
                            {assignments?.map(ev => (
                                <TableHead key={ev.id} className="text-center min-w-[150px]">{ev.title}</TableHead>
                            ))}
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
                                                placeholder="--"
                                                className="w-24 text-center mx-auto"
                                                value={displayGrade}
                                                onChange={(e) => handleGradeChange(student.uid, assignment.id, e.target.value)}
                                            />
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={(assignments?.length || 0) + 1} className="text-center h-24">
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
