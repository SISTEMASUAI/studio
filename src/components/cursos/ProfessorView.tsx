'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Users, ClipboardList, GraduationCap, BookOpen, BarChart2 } from 'lucide-react';

import { CourseDetails } from '@/types/course'; // ajusta la ruta según donde tengas tus tipos

// Componentes que ya existen o que crearás después
// import CourseStudentsManagement from './CourseStudentsManagement'; // por ahora placeholder
import CourseAssignments from './CourseAssignments'; // versión profesor (puedes crear una específica después)
import CourseGrades from './CourseGrades'; // o una versión profesor
// import CourseMaterials from './CourseMaterials';
// import CourseStatsDashboard from './CourseStatsDashboard'; // futuro

interface ProfessorViewProps {
  course: CourseDetails;
}

export default function ProfessorView({ course }: ProfessorViewProps) {
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
        <div className="p-8 bg-muted/40 rounded-lg text-center">
          <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Gestión de Estudiantes</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Aquí podrás ver la lista de inscritos, tomar asistencia y comunicarte con la clase.
          </p>
          <p className="text-sm text-muted-foreground italic">
            (Funcionalidad en desarrollo – pronto se integrará la lista real y herramientas de gestión)
          </p>
        </div>
      </TabsContent>

      <TabsContent value="assignments" className="mt-6">
        {/* Puedes crear CourseAssignmentsProfessor.tsx más adelante */}
        <div className="space-y-6">
          <CourseAssignments /> {/* temporal – idealmente versión profesor */}
          
          <div className="p-6 bg-muted/40 rounded-lg">
            <h3 className="text-lg font-medium mb-2">Funcionalidades pendientes</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>Crear / editar / eliminar tareas</li>
              <li>Revisar y calificar entregas</li>
              <li>Subir plantillas o rúbricas</li>
              <li>Notificaciones automáticas</li>
            </ul>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="grades" className="mt-6">
        <div className="p-8 bg-muted/40 rounded-lg text-center">
          <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Libro de Calificaciones</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Vista consolidada de notas, promedio por estudiante y exportación.
          </p>
          <p className="text-sm italic text-muted-foreground">
            En desarrollo – pronto podrás ingresar notas y publicarlas.
          </p>
        </div>
      </TabsContent>

      <TabsContent value="materials" className="mt-6">
        {/* <CourseMaterials isProfessor={true} /> */}
        <div className="p-8 bg-muted/40 rounded-lg text-center">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Gestión de Materiales</h3>
          <p className="text-sm text-muted-foreground">
            Subir, organizar y compartir recursos del curso.
          </p>
          <p className="text-sm italic text-muted-foreground mt-4">
            Próximamente: carga de archivos, carpetas y control de versiones.
          </p>
        </div>
      </TabsContent>

      <TabsContent value="stats" className="mt-6">
        <div className="p-8 bg-muted/40 rounded-lg text-center">
          <BarChart2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Estadísticas del Curso</h3>
          <p className="text-sm text-muted-foreground">
            Dashboard con asistencia promedio, rendimiento general, distribución de notas, etc.
          </p>
          <p className="text-sm italic text-muted-foreground mt-4">
            En desarrollo – gráficos y reportes exportables llegarán pronto.
          </p>
        </div>
      </TabsContent>
    </Tabs>
  );
}