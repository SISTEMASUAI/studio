
'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Users, ClipboardList, GraduationCap, BookOpen, BarChart2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import type { Course } from '@/types/course';
import CourseStudentsManagement from './CourseStudentsManagement';
import ProfessorGradebook from './professor/ProfessorGradebook';
import ProfessorAssignments from './professor/ProfessorAssignments';
import CourseMaterials from './CourseMaterials';

interface ProfessorViewProps {
  course: Course;
}

export default function ProfessorView({ course }: ProfessorViewProps) {
  if (!course) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
  }
  
  return (
    <Tabs defaultValue="students" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="students">
          <Users className="mr-2 h-4 w-4" /> Estudiantes
        </TabsTrigger>
        <TabsTrigger value="assignments">
          <ClipboardList className="mr-2 h-4 w-4" /> Tareas
        </TabsTrigger>
        <TabsTrigger value="grades">
          <GraduationCap className="mr-2 h-4 w-4" /> Calificaciones
        </TabsTrigger>
        <TabsTrigger value="materials">
          <BookOpen className="mr-2 h-4 w-4" /> Materiales
        </TabsTrigger>
        <TabsTrigger value="stats">
          <BarChart2 className="mr-2 h-4 w-4" /> Estadísticas
        </TabsTrigger>
      </TabsList>

      <TabsContent value="students" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Estudiantes Inscritos</CardTitle>
            <CardDescription>Lista de todos los estudiantes matriculados en este curso.</CardDescription>
          </CardHeader>
          <CardContent>
            <CourseStudentsManagement course={course} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="assignments" className="mt-6">
        <ProfessorAssignments course={course} />
      </TabsContent>

      <TabsContent value="grades" className="mt-6">
        <ProfessorGradebook course={course} />
      </TabsContent>

      <TabsContent value="materials" className="mt-6">
        <CourseMaterials />
      </TabsContent>

      <TabsContent value="stats" className="mt-6">
        <div className="p-8 bg-muted/40 rounded-lg text-center">
          <BarChart2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Estadísticas del Curso</h3>
          <p className="text-sm text-muted-foreground">
            Dashboard con asistencia promedio, rendimiento general, distribución de notas, etc.
          </p>
        </div>
      </TabsContent>
    </Tabs>
  );
}
