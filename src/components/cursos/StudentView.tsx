'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ClipboardList, GraduationCap, Info, BookOpen } from 'lucide-react';

import CourseAssignments from './CourseAssignments';
import CourseGrades from './CourseGrades';           // o CourseAttendance si lo usas aquí
import CourseInfoTabs from './CourseInfoTabs';
import CourseMaterials from './CourseMaterials';

import { AttendanceRecord } from '@/types/course';

interface StudentViewProps {
  attendance: AttendanceRecord[];
  isAttendanceLoading: boolean;
}

export default function StudentView({ attendance, isAttendanceLoading }: StudentViewProps) {
  return (
    <Tabs defaultValue="assignments" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="assignments">
          <ClipboardList className="mr-2 h-4 w-4" /> Tareas
        </TabsTrigger>
        <TabsTrigger value="grades">
          <GraduationCap className="mr-2 h-4 w-4" /> Calificaciones
        </TabsTrigger>
        <TabsTrigger value="info">
          <Info className="mr-2 h-4 w-4" /> Información
        </TabsTrigger>
        <TabsTrigger value="materials">
          <BookOpen className="mr-2 h-4 w-4" /> Materiales
        </TabsTrigger>
      </TabsList>

      <TabsContent value="assignments" className="mt-6">
        <CourseAssignments />
      </TabsContent>

      <TabsContent value="grades" className="mt-6">
        {isAttendanceLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <CourseGrades />  // o reemplaza por CourseAttendance si prefieres mostrar solo asistencia aquí
        )}
      </TabsContent>

      {/* SOLO UNA VEZ aquí */}
      <TabsContent value="info" className="mt-6">
        <CourseInfoTabs
          attendance={attendance}
          isAttendanceLoading={isAttendanceLoading}
        />
      </TabsContent>

      <TabsContent value="materials" className="mt-6">
        <CourseMaterials />
      </TabsContent>
    </Tabs>
  );
}