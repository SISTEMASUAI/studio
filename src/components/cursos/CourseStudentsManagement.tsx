'use client';

import { useState, useEffect } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, DocumentData, getDocs } from 'firebase/firestore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, Mail } from 'lucide-react';
import type { Course } from '@/types/course';

interface Enrollment extends DocumentData {
    id: string;
    studentId: string;
}

interface StudentProfile extends DocumentData {
    id: string;
    uid: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture: string;
}

export default function CourseStudentsManagement({ course }: { course: Course }) {
    const firestore = useFirestore();

    const enrollmentsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'enrollments'), where('courseId', '==', course.id));
    }, [firestore, course.id]);

    const { data: enrollments } = useCollection<Enrollment>(enrollmentsQuery);

    const [enrolledStudents, setEnrolledStudents] = useState<StudentProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (enrollments === undefined) return; // Wait for enrollments to be loaded

        const fetchStudents = async () => {
            setIsLoading(true);
            if (!firestore || !enrollments || enrollments.length === 0) {
                setEnrolledStudents([]);
                setIsLoading(false);
                return;
            }
            const studentIds = enrollments.map(e => e.studentId);
            if (studentIds.length === 0) {
                setEnrolledStudents([]);
                setIsLoading(false);
                return;
            }
            const studentsRef = collection(firestore, 'users');
            // Firestore 'in' queries are limited to 30 elements. For now, this is fine.
            const studentsForCourseQuery = query(studentsRef, where('uid', 'in', studentIds));
            try {
                const studentsSnapshot = await getDocs(studentsForCourseQuery);
                const studentsData = studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudentProfile));
                setEnrolledStudents(studentsData);
            } catch (e) {
                console.error("Error fetching students:", e);
                setEnrolledStudents([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStudents();
    }, [enrollments, firestore]);

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Estudiante</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {enrolledStudents.length > 0 ? (
                        enrolledStudents.map(student => (
                            <TableRow key={student.uid}>
                                <TableCell className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={student.profilePicture} alt={student.firstName} />
                                        <AvatarFallback>{student.firstName?.[0]}{student.lastName?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <span>{student.lastName}, {student.firstName}</span>
                                </TableCell>
                                <TableCell>{student.email}</TableCell>
                                <TableCell className="text-right">
                                    <Button asChild variant="outline" size="sm">
                                        <a href={`mailto:${student.email}`}><Mail className="mr-2 h-4 w-4" /> Contactar</a>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={3} className="text-center h-24">No hay estudiantes inscritos en este curso.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
