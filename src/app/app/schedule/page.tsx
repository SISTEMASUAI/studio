'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Download,
  PlusCircle,
  CalendarCheck,
  CalendarX,
  UserCog,
  AlertTriangle,
  Loader2,
  ListTree,
  Edit,
} from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { collection, query, where, DocumentData, getDocs } from 'firebase/firestore';
import { addDays, format, parse, startOfDay, isBefore, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { DayPicker, DayProps } from 'react-day-picker';
import ModuleManagementDialog from '@/components/cursos/admin/ModuleManagementDialog';
import type { Course } from '@/types/course';

interface ScheduleItem {
  title: string;
  day: 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado' | 'Domingo';
  startTime: string;
  endTime: string;
  classroom: string;
}

interface Enrollment {
  id: string;
  courseId: string;
}

interface UpcomingEvent {
  date: Date;
  title: string;
  type: 'class' | 'exam' | 'assignment' | 'event';
  courseName?: string;
  timeRange: string;
  color: string;
}

const dayOfWeekMap: { [key: string]: number } = {
  Domingo: 0,
  Lunes: 1,
  Martes: 2,
  Miércoles: 3,
  Jueves: 4,
  Viernes: 5,
  Sábado: 6,
};

const courseColors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 
    'bg-yellow-500', 'bg-indigo-500', 'bg-pink-500', 'bg-teal-500'
];

const getCourseColor = (courseId: string) => {
    let hash = 0;
    for (let i = 0; i < courseId.length; i++) {
        hash = courseId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash % courseColors.length);
    return courseColors[index];
};

const generateClassEvents = (courses: Course[]): UpcomingEvent[] => {
    const events: UpcomingEvent[] = [];
    if (!courses) return events;

    courses.forEach(course => {
        if (!course.schedule || !course.semesterStartDate || !course.semesterEndDate) {
            return;
        }

        const startDate = parse(course.semesterStartDate, 'yyyy-MM-dd', new Date());
        const endDate = parse(course.semesterEndDate, 'yyyy-MM-dd', new Date());
        const color = getCourseColor(course.id);

        course.schedule.forEach(session => {
            const targetDay = dayOfWeekMap[session.day as keyof typeof dayOfWeekMap];
            if (targetDay === undefined) return;

            let currentDate = startOfDay(startDate);

            while (currentDate.getDay() !== targetDay) {
                currentDate = addDays(currentDate, 1);
            }
            
            while (isBefore(currentDate, endDate) || currentDate.getTime() === endDate.getTime()) {
                events.push({
                    date: new Date(currentDate),
                    title: `${course.name} - ${session.title}`,
                    type: 'class',
                    courseName: course.name,
                    timeRange: `${session.startTime} - ${session.endTime}`,
                    color: color,
                });
                currentDate = addDays(currentDate, 7);
            }
        });
    });

    return events.sort((a, b) => a.date.getTime() - b.date.getTime());
};


const eventTypes: { [key: string]: { label: string; className: string } } = {
  class: {
    label: 'Clase',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  exam: {
    label: 'Exámen',
    className: 'bg-red-100 text-red-800 border-red-200',
  },
  assignment: {
    label: 'Entrega',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  event: {
    label: 'Evento',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
};

function CreateEventDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2" />
          Crear Evento
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Nuevo Evento Académico</DialogTitle>
          <DialogDescription>
            Completa los detalles para programar un nuevo evento.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="event-title">Título del Evento</Label>
            <Input id="event-title" placeholder="Ej: Charla sobre IA" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="event-desc">Descripción</Label>
            <Textarea
              id="event-desc"
              placeholder="Describe el evento, ponentes, etc."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="event-date">Fecha</Label>
              <Input id="event-date" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-type">Tipo</Label>
              <Select>
                <SelectTrigger id="event-type">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="academic">Académico</SelectItem>
                  <SelectItem value="conference">Conferencia</SelectItem>
                  <SelectItem value="workshop">Taller</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Alert>
            <UserCog className="h-4 w-4" />
            <AlertTitle>Funcionalidad en Desarrollo</AlertTitle>
            <AlertDescription>
              La lógica para guardar el evento y notificar a los usuarios se
              implementará próximamente.
            </AlertDescription>
          </Alert>
        </div>
        <DialogFooter>
          <Button variant="outline">Cancelar</Button>
          <Button disabled>Guardar Evento</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AdminScheduleView() {
    const firestore = useFirestore();
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false);
  
    const coursesQuery = useMemoFirebase(() =>
        firestore ? query(collection(firestore, 'courses'), where('status', '==', 'active')) : null,
      [firestore]
    );
    const { data: courses, isLoading: areCoursesLoading } = useCollection<Course>(coursesQuery);
  
    const handleSelectCourse = (courseId: string) => {
      const course = courses?.find(c => c.id === courseId) || null;
      setSelectedCourse(course);
    }

  return (
    <>
    <div className="space-y-8">
        <Card>
            <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <ListTree /> Gestión de Módulos por Curso
            </CardTitle>
            <CardDescription>
                Selecciona un curso para añadir o editar sus semanas/módulos de contenido.
            </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row items-center gap-4">
            <Select onValueChange={handleSelectCourse} disabled={areCoursesLoading}>
                <SelectTrigger className="w-full sm:w-[320px]">
                    <SelectValue placeholder={areCoursesLoading ? "Cargando cursos..." : "Selecciona un curso..."} />
                </SelectTrigger>
                <SelectContent>
                    {courses?.map(course => (
                        <SelectItem key={course.id} value={course.id}>{course.name} ({course.courseId})</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Button onClick={() => setIsModuleDialogOpen(true)} disabled={!selectedCourse}>
                <Edit className="mr-2"/> Gestionar Módulos
            </Button>
            </CardContent>
        </Card>

        <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
            <UserCog /> Gestión del Calendario General
            </CardTitle>
            <CardDescription>
            Herramientas para definir y modificar las fechas institucionales.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" disabled>
                <CalendarCheck className="mr-2" /> Definir Períodos de Matrícula
            </Button>
            <Button variant="outline" disabled>
                <CalendarX className="mr-2" /> Programar Feriados
            </Button>
            </div>
            <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Panel de Administrador</AlertTitle>
            <AlertDescription>
                Las herramientas avanzadas para la gestión global del calendario
                académico estarán disponibles en esta sección.
            </AlertDescription>
            </Alert>
        </CardContent>
        </Card>
    </div>
    {selectedCourse && (
        <ModuleManagementDialog
            isOpen={isModuleDialogOpen}
            onOpenChange={setIsModuleDialogOpen}
            course={selectedCourse}
        />
    )}
    </>
  );
}

export default function SchedulePage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { profile, user } = useUser();
  const firestore = useFirestore();

    const coursesQuery = useMemoFirebase(() => {
        if (!firestore || !user || !profile) return null;
        
        if (profile.role === 'professor') {
            return query(collection(firestore, 'courses'), where('instructorId', '==', user.uid), where('status', '==', 'active'));
        }

        if (profile.role === 'student') {
            return query(collection(firestore, 'enrollments'), where('studentId', '==', user.uid));
        }
        
        return null; 
    }, [firestore, user, profile]);

    const { data: initialData, isLoading: isInitialDataLoading } = useCollection<Course | Enrollment>(coursesQuery);

    const [studentCourses, setStudentCourses] = useState<Course[]>([]);
    const [isStudentCoursesLoading, setIsStudentCoursesLoading] = useState(false);

    useEffect(() => {
        if (profile?.role === 'student' && initialData && firestore) {
            const fetchCourses = async () => {
                setIsStudentCoursesLoading(true);
                const enrollments = initialData as Enrollment[];
                if (enrollments.length === 0) {
                    setStudentCourses([]);
                    setIsStudentCoursesLoading(false);
                    return;
                }
                const courseIds = enrollments.map(e => e.courseId);
                if (courseIds.length === 0) {
                    setStudentCourses([]);
                    setIsStudentCoursesLoading(false);
                    return;
                }
                const coursesRef = collection(firestore, 'courses');
                const coursesForStudentQuery = query(coursesRef, where('__name__', 'in', courseIds), where('status', '==', 'active'));
                const coursesSnapshot = await getDocs(coursesForStudentQuery);
                const coursesData = coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
                setStudentCourses(coursesData);
                setIsStudentCoursesLoading(false);
            };

            fetchCourses();
        }
    }, [initialData, profile, firestore]);

    const courses = profile?.role === 'student' ? studentCourses : (initialData as Course[]);
    const areCoursesLoading = profile?.role === 'student' ? isStudentCoursesLoading : isInitialDataLoading;

  
  const allEvents = useMemo(() => {
      if (!courses) return [];
      return generateClassEvents(courses);
  }, [courses]);

  const upcomingEvents = allEvents.filter(event => isBefore(startOfDay(new Date()), event.date)).slice(0, 5);
  
  const DayWithDots = (props: DayProps) => {
    const { date } = props;

    if (!date) {
      return <Day {...props} />;
    }

    const eventsOnDay = allEvents.filter((event) =>
      isSameDay(event.date, date)
    );
    
    return (
      <div className="relative flex h-full w-full items-center justify-center">
        <Day {...props} />
        {eventsOnDay.length > 0 && (
          <div className="absolute bottom-1 flex space-x-1">
            {eventsOnDay.slice(0, 4).map((event, i) => (
              <div
                key={i}
                className={`h-1.5 w-1.5 rounded-full ${event.color}`}
              />
            ))}
          </div>
        )}
      </div>
    );
  };
  
  const canManageEvents =
    profile?.role === 'admin' || profile?.role === 'professor';
  const isAdmin = profile?.role === 'admin';

  if (isAdmin) {
    return (
        <div className="space-y-8">
            <section>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <div>
                        <h1 className="text-3xl font-bold font-headline">
                        Gestión de Horarios y Calendario
                        </h1>
                        <p className="text-muted-foreground">
                        Define la estructura académica de los cursos y los eventos institucionales.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <CreateEventDialog />
                    </div>
                </div>
            </section>
            <AdminScheduleView />
        </div>
    )
  }

  return (
    <div className="space-y-8">
      <section>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold font-headline">
              Horarios y Calendario
            </h1>
            <p className="text-muted-foreground">
              Consulta tus clases, exámenes y eventos académicos.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" disabled>
              <Download className="mr-2" />
              Exportar
            </Button>
            {canManageEvents && <CreateEventDialog />}
          </div>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardContent className="p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="w-full"
                locale={es}
                components={{
                    Day: DayWithDots
                }}
                classNames={{
                    day_selected:
                      "bg-accent text-accent-foreground rounded-md",
                    day_today: "bg-accent text-accent-foreground rounded-md",
                }}
              />
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Próximos Eventos</CardTitle>
            </CardHeader>
            <CardContent>
              {areCoursesLoading ? (
                 <div className="flex justify-center items-center h-24">
                    <Loader2 className="animate-spin" />
                 </div>
              ) : upcomingEvents.length > 0 ? (
                <ul className="space-y-4">
                  {upcomingEvents.map((event, i) => {
                    return (
                      <li key={i} className="flex items-start gap-4">
                        <div className="flex-shrink-0 text-center border-r pr-4">
                          <p className="font-bold font-headline text-lg">
                            {format(event.date, 'dd')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(event.date, 'MMM', { locale: es })}
                          </p>
                        </div>
                        <div>
                          <p className="font-semibold">{event.title}</p>
                          <p className="text-sm text-muted-foreground">{event.timeRange}</p>
                          <Badge variant="outline" className={`${eventTypes[event.type].className} mt-1`}>
                            {eventTypes[event.type].label}
                          </Badge>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                 <p className="text-sm text-muted-foreground">No tienes próximos eventos en tu agenda.</p>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
