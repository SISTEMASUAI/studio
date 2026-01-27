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
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useMemo } from 'react';
import { collection, query, where, DocumentData } from 'firebase/firestore';
import ProfessorGradebook from '../cursos/professor/ProfessorGradebook';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';

interface Faculty extends DocumentData {
    id: string;
    name: string;
}

interface Program extends DocumentData {
    id: string;
    name: string;
    facultyId: string;
}

interface Course extends DocumentData {
    id: string;
    name: string;
    programId: string;
}

export default function AdminProfessorGradesView() {
    const { profile } = useUser();
    const isAdmin = profile?.role === 'admin';
    const firestore = useFirestore();

    const [selectedFacultyId, setSelectedFacultyId] = useState<string | null>(null);
    const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

    // Fetch all necessary data
    const facultiesQuery = useMemoFirebase(() => isAdmin ? collection(firestore, 'faculties') : null, [isAdmin, firestore]);
    const { data: faculties } = useCollection<Faculty>(facultiesQuery);

    const programsQuery = useMemoFirebase(() => collection(firestore, 'programs'), [firestore]);
    const { data: allPrograms } = useCollection<Program>(programsQuery);

    const coursesQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        if (isAdmin) return collection(firestore, 'courses');
        return query(collection(firestore, 'courses'), where('instructorId', '==', profile?.uid || ''));
    }, [firestore, isAdmin, profile?.uid]);
    const { data: allCourses } = useCollection<Course>(coursesQuery);

    // Filter data based on selection
    const filteredPrograms = useMemo(() => {
        if (!selectedFacultyId) return isAdmin ? allPrograms : [];
        return allPrograms?.filter(p => p.facultyId === selectedFacultyId);
    }, [selectedFacultyId, allPrograms, isAdmin]);

    const filteredCourses = useMemo(() => {
        if (!selectedProgramId) return [];
        return allCourses?.filter(c => c.programId === selectedProgramId);
    }, [selectedProgramId, allCourses]);
    
    const selectedCourse = useMemo(() => {
        if (!selectedCourseId) return null;
        return allCourses?.find(c => c.id === selectedCourseId) || null;
    }, [selectedCourseId, allCourses]);

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
                    <Select onValueChange={setSelectedFacultyId}>
                        <SelectTrigger className="w-full sm:w-[220px]">
                            <SelectValue placeholder="Filtrar por facultad" />
                        </SelectTrigger>
                        <SelectContent>
                            {faculties?.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                )}
                <Select onValueChange={setSelectedProgramId} disabled={isAdmin && !selectedFacultyId}>
                    <SelectTrigger className="w-full sm:w-[220px]">
                        <SelectValue placeholder="Filtrar por programa" />
                    </SelectTrigger>
                    <SelectContent>
                        {filteredPrograms?.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select onValueChange={setSelectedCourseId} disabled={!selectedProgramId}>
                    <SelectTrigger className="w-full sm:w-[280px]">
                        <SelectValue placeholder="Seleccionar curso..." />
                    </SelectTrigger>
                    <SelectContent>
                        {filteredCourses?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
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
