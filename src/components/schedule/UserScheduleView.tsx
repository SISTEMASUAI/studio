'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, DocumentData, getDocs } from 'firebase/firestore';
import { addDays, format, parse, startOfDay, isBefore, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { DayProps } from 'react-day-picker';
import type { Course, Enrollment } from '@/types/course';

interface ScheduleItem {
    title: string;
    day: 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado' | 'Domingo';
    startTime: string;
    endTime: string;
    classroom: string;
}
  
interface UpcomingEvent {
    date: Date;
    title: string;
    type: 'class' | 'exam' | 'assignment' | 'event';
    courseName?: string;
    timeRange: string;
    color: string;
}

const dayOfWeekMap: { [key: string]: number } = { Domingo: 0, Lunes: 1, Martes: 2, Miércoles: 3, Jueves: 4, Viernes: 5, Sábado: 6 };

const courseColors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-indigo-500', 'bg-pink-500', 'bg-teal-500'];

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
        if (!course.schedule ) return;
        const startDate = course.semesterStartDate ? parse(course.semesterStartDate, 'yyyy-MM-dd', new Date()) : new Date();
        const endDate = course.semesterEndDate ? parse(course.semesterEndDate, 'yyyy-MM-dd', new Date()) : addDays(new Date(), 90);
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
    class: { label: 'Clase', className: 'bg-blue-100 text-blue-800 border-blue-200' },
    exam: { label: 'Exámen', className: 'bg-red-100 text-red-800 border-red-200' },
    assignment: { label: 'Entrega', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    event: { label: 'Evento', className: 'bg-green-100 text-green-800 border-green-200' },
};


export default function UserScheduleView() {
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
        const q = query(coursesRef, where('__name__', 'in', courseIds), where('status', '==', 'active'));
        const snapshot = await getDocs(q);
        const coursesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
        setStudentCourses(coursesData);
        setIsStudentCoursesLoading(false);
      };
      fetchCourses();
    }
  }, [initialData, profile, firestore]);

  const courses = profile?.role === 'student' ? studentCourses : (initialData as Course[]);
  const areCoursesLoading = profile?.role === 'student' ? isStudentCoursesLoading : isInitialDataLoading;

  const allEvents = useMemo(() => generateClassEvents(courses || []), [courses]);
  const upcomingEvents = allEvents.filter(event => isBefore(startOfDay(new Date()), event.date)).slice(0, 5);

  const DayWithDots = (props: DayProps) => {
    const { date } = props;
    if (!date) return <div />;

    const eventsOnDay = allEvents.filter(event => isSameDay(event.date, date));
    return (
      <div className="relative flex h-full w-full items-center justify-center">
        <div>{date.getDate()}</div>
        {eventsOnDay.length > 0 && (
          <div className="absolute bottom-1 flex space-x-1">
            {eventsOnDay.slice(0, 4).map((event, i) => (
              <div key={i} className={`h-1.5 w-1.5 rounded-full ${event.color}`} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
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
              components={{ Day: DayWithDots }}
              classNames={{
                day_selected: "bg-accent text-accent-foreground rounded-md",
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
                {upcomingEvents.map((event, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className="flex-shrink-0 text-center border-r pr-4">
                      <p className="font-bold font-headline text-lg">{format(event.date, 'dd')}</p>
                      <p className="text-xs text-muted-foreground">{format(event.date, 'MMM', { locale: es })}</p>
                    </div>
                    <div>
                      <p className="font-semibold">{event.title}</p>
                      <p className="text-sm text-muted-foreground">{event.timeRange}</p>
                      <Badge variant="outline" className={`${eventTypes[event.type].className} mt-1`}>
                        {eventTypes[event.type].label}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No tienes próximos eventos en tu agenda.</p>
            )}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
