'use client';

import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { 
  BookMarked, 
  UserCog, 
  Download, 
  ListTree, 
  ListTodo, 
  Star,
  Loader2,
  CheckCircle2,
  Clock,
  BookOpen
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { collection, query, where, doc } from 'firebase/firestore';
import { useState, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { Course, Program, Enrollment } from '@/types/course';

function StudentCurriculumView() {
  const { user, profile } = useUser();
  const firestore = useFirestore();

  // 1. Obtener información del programa del estudiante
  const programRef = useMemoFirebase(() => 
    (firestore && profile?.programId) ? doc(firestore, 'programs', profile.programId) : null,
  [firestore, profile?.programId]);
  const { data: program, isLoading: isProgramLoading } = useDoc<Program>(programRef);

  // 2. Obtener todos los cursos del programa
  const coursesQuery = useMemoFirebase(() => 
    (firestore && profile?.programId) ? query(collection(firestore, 'courses'), where('programId', '==', profile.programId)) : null,
  [firestore, profile?.programId]);
  const { data: allCourses, isLoading: areCoursesLoading } = useCollection<Course>(coursesQuery);

  // 3. Obtener matrículas actuales del estudiante para marcar estado
  const enrollmentsQuery = useMemoFirebase(() => 
    (firestore && user) ? query(collection(firestore, 'enrollments'), where('studentId', '==', user.uid)) : null,
  [firestore, user]);
  const { data: enrollments } = useCollection<Enrollment>(enrollmentsQuery);

  const enrolledCourseIds = useMemo(() => new Set(enrollments?.map(e => e.courseId) || []), [enrollments]);

  // Agrupar cursos por ciclo
  const coursesByCycle = useMemo(() => {
    if (!allCourses) return {};
    const grouped: Record<number, Course[]> = {};
    allCourses.forEach(course => {
      const cycle = course.cycle || 1;
      if (!grouped[cycle]) grouped[cycle] = [];
      grouped[cycle].push(course);
    });
    return grouped;
  }, [allCourses]);

  const sortedCycles = useMemo(() => 
    Object.keys(coursesByCycle).map(Number).sort((a, b) => a - b), 
  [coursesByCycle]);

  // Calcular progreso (MVP: créditos de cursos matriculados)
  const completedCredits = useMemo(() => {
    if (!allCourses || !enrollments) return 0;
    return allCourses
      .filter(c => enrolledCourseIds.has(c.id))
      .reduce((sum, c) => sum + (c.credits || 0), 0);
  }, [allCourses, enrolledCourseIds, enrollments]);

  const totalCredits = program?.totalCredits || 0;
  const progress = totalCredits > 0 ? (completedCredits / totalCredits) * 100 : 0;

  if (isProgramLoading || areCoursesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  if (!program) {
    return (
      <Alert>
        <BookMarked className="h-4 w-4" />
        <AlertTitle>Información no disponible</AlertTitle>
        <AlertDescription>No se pudo encontrar información de tu plan de estudios. Contacta con administración.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ListTree /> Malla Curricular: {program.name}</CardTitle>
            <CardDescription>Visualiza tu progreso académico y las asignaturas por semestre.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {sortedCycles.length > 0 ? sortedCycles.map(cycle => (
              <div key={cycle} className="space-y-3">
                <h3 className="font-headline font-semibold text-lg border-b pb-1">Ciclo {cycle}</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {coursesByCycle[cycle].map(course => {
                    const isEnrolled = enrolledCourseIds.has(course.id);
                    return (
                      <Card key={course.id} className={`${isEnrolled ? 'border-primary bg-primary/5' : 'bg-card'}`}>
                        <CardContent className="p-4 flex justify-between items-start gap-2">
                          <div className="space-y-1">
                            <p className="font-bold text-sm leading-tight">{course.name}</p>
                            <p className="text-xs text-muted-foreground uppercase">{course.courseId || 'CURSO'} • {course.credits} Créditos</p>
                          </div>
                          {isEnrolled ? (
                            <Badge className="bg-primary text-white shrink-0"><Clock className="w-3 h-3 mr-1" /> Cursando</Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground shrink-0">Pendiente</Badge>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )) : (
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="mx-auto h-12 w-12 mb-4 opacity-20" />
                <p>No hay asignaturas registradas para este plan de estudios.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <aside className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CheckCircle2 className="text-green-500" /> Avance Curricular</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                    <p className="text-sm font-medium">Créditos en curso</p>
                    <p><span className="font-bold text-2xl text-primary">{completedCredits}</span> <span className="text-muted-foreground">/ {totalCredits}</span></p>
                </div>
                <Progress value={progress} className="h-3" />
                <p className="text-xs text-right text-muted-foreground">{progress.toFixed(1)}% del total</p>
            </div>
            <Button variant="outline" className="w-full" disabled><Download className="mr-2"/> Descargar Plan (PDF)</Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><ListTodo className="w-4 h-4" /> Prerrequisitos</CardTitle></CardHeader>
          <CardContent><p className="text-xs text-muted-foreground">Consulta los cursos necesarios para desbloquear niveles superiores.</p></CardContent>
        </Card>
      </aside>
    </div>
  );
}

function AdminCurriculumView() {
  const firestore = useFirestore();
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);

  const programsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'programs') : null, [firestore]);
  const { data: programs, isLoading: isProgramsLoading } = useCollection<Program>(programsQuery);

  const coursesQuery = useMemoFirebase(() => 
    (firestore && selectedProgramId) ? query(collection(firestore, 'courses'), where('programId', '==', selectedProgramId)) : null,
  [firestore, selectedProgramId]);
  const { data: courses } = useCollection<Course>(coursesQuery);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <CardTitle className="flex items-center gap-2"><UserCog /> Gestión de Mallas Curriculares</CardTitle>
            <CardDescription>Visualiza y administra la estructura académica por programa.</CardDescription>
          </div>
          <Select onValueChange={setSelectedProgramId}>
            <SelectTrigger className="w-full sm:w-[300px]">
              <SelectValue placeholder={isProgramsLoading ? "Cargando carreras..." : "Selecciona una carrera"} />
            </SelectTrigger>
            <SelectContent>
              {programs?.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {selectedProgramId ? (
          <div className="border rounded-lg p-6 bg-accent/10">
            <h3 className="font-bold text-lg mb-4">Resumen del Programa</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="p-3 bg-background rounded border text-center">
                <p className="text-xs text-muted-foreground uppercase font-bold">Total Asignaturas</p>
                <p className="text-xl font-bold">{courses?.length || 0}</p>
              </div>
              <div className="p-3 bg-background rounded border text-center">
                <p className="text-xs text-muted-foreground uppercase font-bold">Créditos Totales</p>
                <p className="text-xl font-bold">{programs?.find(p => p.id === selectedProgramId)?.totalCredits || 0}</p>
              </div>
            </div>
            <Alert>
              <UserCog className="h-4 w-4" />
              <AlertTitle>Modo Edición</AlertTitle>
              <AlertDescription>Utiliza el módulo de "Cursos" para añadir, editar o cambiar de ciclo las asignaturas de este programa.</AlertDescription>
            </Alert>
          </div>
        ) : (
          <div className="text-center py-20 border-2 border-dashed rounded-xl opacity-50">
            <ListTree className="mx-auto h-12 w-12 mb-4" />
            <p>Selecciona un programa académico para ver su estructura.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ProfessorCurriculumView() {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Plan de Estudios e Itinerario</CardTitle>
          <CardDescription>
            Consulta la malla curricular completa de las carreras donde impartes clases.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <Button className="w-full" variant="outline" disabled><Download className="mr-2"/> Descargar Guía Docente</Button>
            <Alert>
                <BookMarked className="h-4 w-4" />
                <AlertTitle>Acceso de Consulta</AlertTitle>
                <AlertDescription>
                Los docentes tienen acceso de solo lectura. Para proponer cambios en el sílabo o prerrequisitos, contacta con tu director de escuela.
                </AlertDescription>
            </Alert>
        </CardContent>
      </Card>
    );
}

export default function CurriculumPage() {
  const { profile, isUserLoading } = useUser();

  const renderContent = () => {
    if (isUserLoading || !profile) return (
      <div className="flex justify-center p-12"><Loader2 className="animate-spin h-8 w-8" /></div>
    );

    switch (profile.role) {
      case 'student':
        return <StudentCurriculumView />;
      case 'admin':
        return <AdminCurriculumView />;
      case 'professor':
        return <ProfessorCurriculumView />;
      default:
        return <StudentCurriculumView />;
    }
  };

  return (
    <div className="space-y-8">
      <section>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
              <BookMarked className="text-primary" />
              Plan de Estudios
            </h1>
            <p className="text-muted-foreground">
              {profile?.role === 'student'
                ? 'Consulta tu progreso y la estructura de tu carrera.'
                : 'Consulta y gestiona la malla curricular de la universidad.'}
            </p>
          </div>
        </div>
      </section>

      {renderContent()}
    </div>
  );
}
