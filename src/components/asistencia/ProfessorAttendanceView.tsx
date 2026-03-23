'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  BookOpen,
  Loader2,
  ListOrdered,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useState, useMemo, useEffect } from 'react';
import { collection, query, where, DocumentData, getDocs } from 'firebase/firestore';
import { addDays, format, isBefore, parse, startOfDay, differenceInCalendarDays, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import AttendanceDialog from './AttendanceDialog';

interface ScheduleItem {
  title: string;
  day: 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado' | 'Domingo';
  startTime: string;
  endTime: string;
}

interface Course extends DocumentData {
  id: string;
  name: string;
  schedule?: ScheduleItem[];
  semesterStartDate?: string;
  semesterEndDate?: string;
}

interface Enrollment extends DocumentData {
    id: string;
    studentId: string;
}

export interface StudentProfile extends DocumentData {
    id: string;
    uid: string;
    firstName: string;
    lastName: string;
    profilePicture: string;
}

export interface ClassSession {
  id: string;
  date: Date;
  title: string;
  timeRange: string;
}

const dayOfWeekMap: { [key: string]: number } = {
  Domingo: 0, Lunes: 1, Martes: 2, Miércoles: 3, Jueves: 4, Viernes: 5, Sábado: 6,
};

const generateClassSessionsForCourse = (course: Course): ClassSession[] => {
    const sessions: ClassSession[] = [];
    if (!course.schedule || !course.semesterStartDate || !course.semesterEndDate) {
        return sessions;
    }

    const startDate = parse(course.semesterStartDate, 'yyyy-MM-dd', new Date());
    const endDate = parse(course.semesterEndDate, 'yyyy-MM-dd', new Date());

    course.schedule.forEach(session => {
        const targetDay = dayOfWeekMap[session.day];
        if (targetDay === undefined) return;

        let currentDate = startOfDay(startDate);
        while (currentDate.getDay() !== targetDay) {
            currentDate = addDays(currentDate, 1);
        }
        
        while (isBefore(currentDate, endDate) || currentDate.getTime() === endDate.getTime()) {
            sessions.push({
                id: `${course.id}-${session.title}-${format(currentDate, 'yyyy-MM-dd')}`,
                date: new Date(currentDate),
                title: `${course.name} - ${session.title}`,
                timeRange: `${session.startTime} - ${session.endTime}`,
            });
            currentDate = addDays(currentDate, 7);
        }
    });

    return sessions.sort((a, b) => a.date.getTime() - b.date.getTime());
};


export default function ProfessorAttendanceView() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [classSessions, setClassSessions] = useState<ClassSession[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<ClassSession | null>(null);
  
  const coursesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'courses'), where('instructorId', '==', user.uid), where('status', '==', 'active'));
  }, [firestore, user]);

  const { data: courses, isLoading: areCoursesLoading } = useCollection<Course>(coursesQuery);

  const enrollmentsQuery = useMemoFirebase(() => {
    if (!firestore || !selectedCourseId) return null;
    return query(collection(firestore, 'enrollments'), where('courseId', '==', selectedCourseId));
  }, [firestore, selectedCourseId]);

  const { data: enrollments } = useCollection<Enrollment>(enrollmentsQuery);

  const [enrolledStudents, setEnrolledStudents] = useState<StudentProfile[]>([]);
  const [areStudentsLoading, setAreStudentsLoading] = useState(false);

  useEffect(() => {
    if (selectedCourseId && courses) {
      const course = courses.find(c => c.id === selectedCourseId);
      if (course) {
        setClassSessions(generateClassSessionsForCourse(course));
      }
    } else {
      setClassSessions([]);
    }
    setSelectedSession(null);
  }, [selectedCourseId, courses]);

  useEffect(() => {
    if (enrollments && firestore) {
      const fetchStudents = async () => {
        setAreStudentsLoading(true);
        if(enrollments.length === 0) {
            setEnrolledStudents([]);
            setAreStudentsLoading(false);
            return;
        }
        const studentIds = enrollments.map(e => e.studentId);
        const studentsRef = collection(firestore, 'users');
        const studentsForCourseQuery = query(studentsRef, where('uid', 'in', studentIds));
        const studentsSnapshot = await getDocs(studentsForCourseQuery);
        const studentsData = studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudentProfile));
        setEnrolledStudents(studentsData);
        setAreStudentsLoading(false);
      };
      fetchStudents();
    } else if (!enrollments) {
        setEnrolledStudents([]);
    }
  }, [enrollments, firestore]);

  const handleOpenDialog = (session: ClassSession) => {
    setSelectedSession(session);
    setIsDialogOpen(true);
  }

  const isAttendanceActionable = (sessionDate: Date) => {
    const today = startOfDay(new Date());
    const daysDifference = differenceInCalendarDays(today, startOfDay(sessionDate));
    return daysDifference >= 0 && daysDifference <= 6;
  };

  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen /> Mis Cursos
            </CardTitle>
            <CardDescription>
              Selecciona un curso para gestionar la asistencia de sus clases.
            </CardDescription>
          </div>
          {areCoursesLoading ? (
            <Loader2 className='animate-spin' />
          ) : (
            <Select onValueChange={setSelectedCourseId} value={selectedCourseId || ''}>
              <SelectTrigger className="w-full sm:w-[280px]">
                <SelectValue placeholder="Seleccionar curso..." />
              </SelectTrigger>
              <SelectContent>
                {courses?.map(course => (
                  <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {selectedCourseId ? (
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2"><ListOrdered /> Sesiones de Clase Programadas</h3>
            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Clase</TableHead>
                            <TableHead className="text-right">Acción</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {classSessions.length > 0 ? classSessions.map(session => {
                            const isActionable = isAttendanceActionable(session.date);
                            const isToday = isSameDay(session.date, new Date());
                            return (
                                <TableRow key={session.id} className={isToday ? 'bg-accent/50' : ''}>
                                    <TableCell>
                                        <div className="font-medium">{format(session.date, 'PPP', { locale: es })}</div>
                                        <div className="text-sm text-muted-foreground">{format(session.date, 'EEEE', { locale: es })}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div>{session.title.split(' - ')[1]}</div>
                                        <div className="text-sm text-muted-foreground">{session.timeRange}</div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button 
                                            variant={isToday ? 'default' : 'outline'}
                                            onClick={() => handleOpenDialog(session)} 
                                            disabled={!isActionable}
                                        >
                                            Pasar Asistencia
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )
                        }) : (
                             <TableRow>
                                <TableCell colSpan={3} className="text-center h-24">
                                    No hay clases programadas para este curso. Verifique el horario en la configuración del curso.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
          </div>
        ) : (
          <Alert>
            <BookOpen className="h-4 w-4" />
            <AlertTitle>Selecciona un curso</AlertTitle>
            <AlertDescription>
              Para empezar, elige un curso de la lista para ver sus clases y gestionar la asistencia.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
    {selectedSession && selectedCourseId && (
        <AttendanceDialog 
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            session={selectedSession}
            courseId={selectedCourseId}
            students={enrolledStudents}
            isLoadingStudents={areStudentsLoading}
        />
    )}
    </>
  );
}
