'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  UserCog,
  BookOpen,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useMemo } from 'react';
import { collection, query, where, DocumentData } from 'firebase/firestore';
import ProfessorGradebook from '../cursos/professor/ProfessorGradebook';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import type { Course, Faculty, Program } from '@/types/course';


export default function AdminProfessorGradesView() {
    const { profile } = useUser();
    const isAdmin = profile?.role === 'admin';
    const firestore = useFirestore();

    const [selectedFacultyId, setSelectedFacultyId] = useState<string | null>(null);
    const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

    // 1. Fetch data
    const facultiesQuery = useMemoFirebase(() => isAdmin ? collection(firestore, 'faculties') : null, [isAdmin, firestore]);
    const { data: faculties } = useCollection<Faculty>(facultiesQuery);

    const programsQuery = useMemoFirebase(() => collection(firestore, 'programs'), [firestore]);
    const { data: allPrograms } = useCollection<Program>(programsQuery);

    const coursesQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        // Admin gets all courses
        if (isAdmin) return query(collection(firestore, 'courses'), where('status', '==', 'active'));
        // Professor gets only their courses
        return query(collection(firestore, 'courses'), where('instructorId', '==', profile?.uid || '---'), where('status', '==', 'active'));
    }, [firestore, isAdmin, profile?.uid]);
    const { data: coursesForUser } = useCollection<Course>(coursesQuery);

    // 2. Memos for dropdown lists
    const programList = useMemo(() => {
        if (isAdmin) {
            if (!selectedFacultyId) return allPrograms;
            return allPrograms?.filter(p => p.facultyId === selectedFacultyId);
        } else { // Professor
            if (!coursesForUser || !allPrograms) return [];
            const programIds = new Set(coursesForUser.map(c => c.programId));
            return allPrograms.filter(p => programIds.has(p.id));
        }
    }, [isAdmin, selectedFacultyId, allPrograms, coursesForUser]);

    const courseList = useMemo(() => {
        if (!selectedProgramId || !coursesForUser) return [];
        return coursesForUser.filter(c => c.programId === selectedProgramId);
    }, [selectedProgramId, coursesForUser]);
    
    const selectedCourse = useMemo(() => {
        return coursesForUser?.find(c => c.id === selectedCourseId) || null;
    }, [selectedCourseId, coursesForUser]);
    
    // Handlers
    const handleFacultyChange = (facultyId: string) => {
        setSelectedFacultyId(facultyId);
        setSelectedProgramId(null);
        setSelectedCourseId(null);
    }
    
    const handleProgramChange = (programId: string) => {
        setSelectedProgramId(programId);
        setSelectedCourseId(null);
    }

    return (
      <Card>
        <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        {isAdmin ? <UserCog /> : <BookOpen />} 
                        {isAdmin ? 'Gestión de Calificaciones' : 'Libro de Calificaciones'}
                    </CardTitle>
                    <CardDescription>
                    {isAdmin ? 'Busque, visualice y modifique los expedientes académicos.' : 'Gestiona las calificaciones de tus cursos.'}
                    </CardDescription>
                </div>
            </div>
             <div className="flex flex-col sm:flex-row gap-2 pt-4">
                {isAdmin && (
                    <Select onValueChange={handleFacultyChange}>
                        <SelectTrigger className="w-full sm:w-[220px]">
                            <SelectValue placeholder="Filtrar por facultad" />
                        </SelectTrigger>
                        <SelectContent>
                            {faculties?.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                )}
                <Select onValueChange={handleProgramChange} disabled={isAdmin && !selectedFacultyId}>
                    <SelectTrigger className="w-full sm:w-[220px]">
                        <SelectValue placeholder="Filtrar por programa" />
                    </SelectTrigger>
                    <SelectContent>
                        {programList?.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select onValueChange={setSelectedCourseId} disabled={!selectedProgramId}>
                    <SelectTrigger className="w-full sm:w-[280px]">
                        <SelectValue placeholder="Seleccionar curso..." />
                    </SelectTrigger>
                    <SelectContent>
                        {courseList?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
        </CardHeader>
        <CardContent>
            {selectedCourse ? (
                <ProfessorGradebook course={selectedCourse} />
            ) : (
                <Alert>
                    <BookOpen className="h-4 w-4" />
                    <AlertTitle>Seleccione un curso</AlertTitle>
                    <AlertDescription>
                        Utilice los filtros para seleccionar un curso y ver su libro de calificaciones.
                    </AlertDescription>
                </Alert>
            )}
        </CardContent>
      </Card>
    );
}
