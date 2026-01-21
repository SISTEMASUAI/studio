'use client';

import { useParams } from 'next/navigation';
import { doc, collection, query, where } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

import { useDoc, useCollection, useUser, useMemoFirebase, useFirestore } from '@/firebase';

import CourseHeader from '@/components/cursos/CourseHeader';
import CourseSchedule from '@/components/cursos/CourseSchedule';
import StudentView from '@/components/cursos/StudentView';
import ProfessorView from '@/components/cursos/ProfessorView';
import DropCourseDialog from '@/components/cursos/DropCourseDialog';
import { Course, InstructorProfile, AttendanceRecord } from '@/types/course';

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const firestore = useFirestore();
  const { profile } = useUser();

  const courseRef = useMemoFirebase(
    () => (firestore && courseId ? doc(firestore, 'courses', courseId) : null),
    [firestore, courseId]
  );

  const { data: course, isLoading: isCourseLoading, error: courseError } = useDoc<Course>(courseRef);

  const instructorRef = useMemoFirebase(
    () => (firestore && course?.instructorId ? doc(firestore, 'users', course.instructorId) : null),
    [firestore, course?.instructorId]
  );

  const { data: instructor, isLoading: isInstructorLoading } = useDoc<InstructorProfile>(instructorRef);

  // Solo para estudiantes
  const attendanceQuery = useMemoFirebase(() => {
    if (!firestore || !profile?.uid || profile.role !== 'student' || !courseId) return null;
    return query(
      collection(firestore, 'attendance'),
      where('studentId', '==', profile.uid),
      where('courseId', '==', courseId)
    );
  }, [firestore, profile?.uid, courseId, profile?.role]);

  const { data: attendance = [], isLoading: isAttendanceLoading } = useCollection<AttendanceRecord>(attendanceQuery);

  const isInstructor = profile?.uid === course?.instructorId;
  const isStudent = profile?.role === 'student' && !!course;

  if (isCourseLoading || isInstructorLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (courseError || !course) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 text-destructive p-6 rounded-lg">
          No se pudo cargar el curso. Puede que no exista o no tengas acceso.
        </div>
      </div>
    );
  }

  if (course.status === 'inactive') {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 text-destructive p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Curso desactivado</h2>
          <p>Este curso ha sido desactivado por un administrador.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-8 py-6">
      <CourseHeader course={course} instructor={instructor ?? null} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {isStudent ? (
            <StudentView
              course={course}
              attendance={attendance}
              isAttendanceLoading={isAttendanceLoading}
            />
          ) : isInstructor ? (
            <ProfessorView course={course} />
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              No tienes permisos para ver este contenido.
            </div>
          )}
        </div>

        <aside className="space-y-8">
          <CourseSchedule
            schedule={course.schedule}
            mode={course.mode}
            virtualRoomUrl={course.virtualRoomUrl}
          />

          {isStudent && <DropCourseDialog courseName={course.name} courseId={courseId} />}
        </aside>
      </div>
    </div>
  );
}
