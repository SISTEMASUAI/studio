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
  UserCheck,
  UserCog,
  BookOpen,
  Loader2,
  ListOrdered,
  Users,
  Check,
  X,
  Clock,
  AlertTriangle,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { addDays, format, isBefore, parse, startOfDay, differenceInCalendarDays, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

interface ScheduleItem {
  title: string;
  day: 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado' | 'Domingo';
  startTime: string;
  endTime: string;
  classroom: string;
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

interface StudentProfile extends DocumentData {
    id: string;
    uid: string;
    firstName: string;
    lastName: string;
    profilePicture: string;
}

interface ClassSession {
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


function ProfessorAttendanceView() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [classSessions, setClassSessions] = useState<ClassSession[]>([]);
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

  const { data: enrollments, isLoading: areEnrollmentsLoading } = useCollection<Enrollment>(enrollmentsQuery);

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
    }
  }, [enrollments, firestore]);

  const isAttendanceActionable = (sessionDate: Date) => {
    const today = startOfDay(new Date());
    const daysDifference = differenceInCalendarDays(today, startOfDay(sessionDate));

    // Actionable if it's today or up to 6 days in the past. Not actionable for future dates.
    return daysDifference >= 0 && daysDifference <= 6;
  };

  return (
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
                                        <Dialog onOpenChange={(open) => !open && setSelectedSession(null)}>
                                            <DialogTrigger asChild>
                                                <Button 
                                                    variant={isToday ? 'default' : 'outline'}
                                                    onClick={() => setSelectedSession(session)} 
                                                    disabled={!isActionable}
                                                >
                                                    Pasar Asistencia
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-2xl">
                                                <DialogHeader>
                                                    <DialogTitle>Pasar Asistencia</DialogTitle>
                                                    <DialogDescription>
                                                        Clase: {selectedSession?.title} <br />
                                                        Fecha: {selectedSession ? format(selectedSession.date, 'PPPP', { locale: es }) : ''}
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="max-h-[60vh] overflow-y-auto">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>Estudiante</TableHead>
                                                                <TableHead className="text-right">Acciones</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {areStudentsLoading ? (
                                                                <TableRow>
                                                                    <TableCell colSpan={2} className="text-center">
                                                                        <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                                                                    </TableCell>
                                                                </TableRow>
                                                            ) : enrolledStudents.length > 0 ? enrolledStudents.map(student => (
                                                                <TableRow key={student.id}>
                                                                    <TableCell className="flex items-center gap-3">
                                                                        <Avatar>
                                                                            <AvatarImage src={student.profilePicture} alt={student.firstName} />
                                                                            <AvatarFallback>{student.firstName?.[0]}{student.lastName?.[0]}</AvatarFallback>
                                                                        </Avatar>
                                                                        <span>{student.lastName}, {student.firstName}</span>
                                                                    </TableCell>
                                                                    <TableCell className="text-right space-x-2">
                                                                        <Button size="icon" variant="outline" className="text-green-600 hover:text-green-700 hover:bg-green-50"><Check /></Button>
                                                                        <Button size="icon" variant="outline" className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"><Clock /></Button>
                                                                        <Button size="icon" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50"><X /></Button>
                                                                    </TableCell>
                                                                </TableRow>
                                                            )) : (
                                                                <TableRow>
                                                                    <TableCell colSpan={2} className="text-center">
                                                                        No hay estudiantes inscritos en este curso.
                                                                    </TableCell>
                                                                </TableRow>
                                                            )}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                                <DialogFooter>
                                                    <Alert>
                                                        <AlertTriangle className="h-4 w-4" />
                                                        <AlertTitle>En Desarrollo</AlertTitle>
                                                        <AlertDescription>
                                                            La lógica para guardar el estado de la asistencia de cada alumno se implementará próximamente.
                                                        </AlertDescription>
                                                    </Alert>
                                                    <Button variant="outline">Cerrar</Button>
                                                    <Button disabled>Guardar Asistencia</Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
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
  );
}

function AdminAttendanceView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCog /> Gestión de Asistencia
        </CardTitle>
        <CardDescription>
          Panel de administrador para supervisar la asistencia y gestionar justificaciones.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert>
          <UserCog className="h-4 w-4" />
          <AlertTitle>Panel de Administrador en Desarrollo</AlertTitle>
          <AlertDescription>
            Las herramientas para supervisar la asistencia de todos los cursos, ver estadísticas y gestionar las justificaciones de los alumnos estarán disponibles aquí.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

export default function AttendancePage() {
  const { profile } = useUser();

  const renderContent = () => {
    switch (profile?.role) {
      case 'professor':
        return <ProfessorAttendanceView />;
      case 'admin':
        return <AdminAttendanceView />;
      default:
        return (
          <Card>
            <CardContent className="pt-6">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Acceso Denegado</AlertTitle>
                <AlertDescription>No tienes permiso para acceder a esta sección.</AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-8">
      <section>
        <div>
          <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
            <UserCheck className="text-primary" />
            Gestión de Asistencia
          </h1>
          <p className="text-muted-foreground">
            {profile?.role === 'admin'
              ? 'Panel de control para la asistencia de toda la institución.'
              : 'Gestiona la asistencia de tus cursos.'}
          </p>
        </div>
      </section>

      {renderContent()}
    </div>
  );
}
