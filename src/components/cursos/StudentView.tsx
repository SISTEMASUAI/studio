
'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ClipboardList, GraduationCap, Info, BookOpen, UserCheck } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import CourseAssignments from './CourseAssignments';
import CourseGrades from './CourseGrades';
import CourseInfoTabs from './CourseInfoTabs';
import CourseMaterials from './CourseMaterials';
import CourseAttendance from './CourseAttendance';
import { Course, AttendanceRecord } from '@/types/course';

interface StudentViewProps {
  course: Course;
  courseId: string;
  attendance: AttendanceRecord[];
  isAttendanceLoading: boolean;
}

export default function StudentView({ course, courseId, attendance, isAttendanceLoading }: StudentViewProps) {
  return (
    <Tabs defaultValue="assignments" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="info">
          <Info className="mr-2 h-4 w-4" /> Información
        </TabsTrigger>
        <TabsTrigger value="materials">
          <BookOpen className="mr-2 h-4 w-4" /> Materiales
        </TabsTrigger>
        <TabsTrigger value="assignments">
          <ClipboardList className="mr-2 h-4 w-4" /> Tareas
        </TabsTrigger>
        <TabsTrigger value="grades">
          <GraduationCap className="mr-2 h-4 w-4" /> Calificaciones
        </TabsTrigger>
        <TabsTrigger value="attendance">
            <UserCheck className="mr-2 h-4 w-4" /> Asistencia
        </TabsTrigger>
      </TabsList>

      <TabsContent value="info" className="mt-6">
        <CourseInfoTabs
          course={course}
          attendance={attendance}
          isAttendanceLoading={isAttendanceLoading}
        />
      </TabsContent>

      <TabsContent value="materials" className="mt-6">
        <CourseMaterials courseId={courseId} />
      </TabsContent>

      <TabsContent value="assignments" className="mt-6">
        <CourseAssignments courseId={courseId} />
      </TabsContent>

      <TabsContent value="grades" className="mt-6">
          <CourseGrades courseId={courseId} />
      </TabsContent>
      
      <TabsContent value="attendance" className="mt-6">
        {isAttendanceLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
          </div>
        ) : (
          <CourseAttendance attendance={attendance} />
        )}
      </TabsContent>
    </Tabs>
  );
}
