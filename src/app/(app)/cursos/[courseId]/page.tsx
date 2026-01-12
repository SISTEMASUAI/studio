'use client';

import { useDoc, useMemoFirebase, useFirestore, useUser } from '@/firebase';
import { doc, DocumentData } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
  } from "@/components/ui/tabs"
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, BookOpen, CheckCircle, XCircle, FileText, Info, BookMarked, ListChecks, Mail, Users, Library, UserCheck as UserCheckIcon, Search } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import CourseSchedule from '@/components/cursos/CourseSchedule';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';

interface ScheduleItem {
    day: string;
    startTime: string;
    endTime: string;
    classroom: string;
}

// Define the type for the course data we expect from Firestore
interface CourseDetails {
  id: string;
  name: string;
  description: string;
  instructorId: string;
  objectives?: string[];
  methodology?: string;
  syllabusUrl?: string;
  level?: string;
  department?: string;
  prerequisites?: string[];
  schedule?: ScheduleItem[];
  mode?: 'Presencial' | 'Online' | 'Híbrido';
  virtualRoomUrl?: string;
}

// Define the type for the instructor's profile data
interface InstructorProfile {
    firstName: string;
    lastName: string;
    profilePicture: string;
    email: string;
}

// Mock data for classmates
const classmates = [
    { id: 'user-2', name: 'Alicia Keys', avatar: 'https://i.pravatar.cc/150?u=user-2' },
    { id: 'user-3', name: 'Ben Carter', avatar: 'https://i.pravatar.cc/150?u=user-3' },
    { id: 'user-4', name: 'Carla Diaz', avatar: 'https://i.pravatar.cc/150?u=user-4' },
    { id: 'user-5', name: 'David Evans', avatar: 'https://i.pravatar.cc/150?u=user-5' },
];

// Mock data for bibliography
const bibliography = [
    { id: 'bib-1', text: 'Clean Code: A Handbook of Agile Software Craftsmanship by Robert C. Martin', available: true, digital: true },
    { id: 'bib-2', text: 'Structure and Interpretation of Computer Programs by Harold Abelson', available: true, digital: false },
    { id: 'bib-3', text: 'Introduction to Algorithms by Thomas H. Cormen', available: false, digital: false },
];

// Mock data for attendance
const attendance = [
    { date: '2024-08-05', status: 'presente' },
    { date: '2024-08-07', status: 'presente' },
    { date: '2024-08-12', status: 'ausente' },
    { date: '2024-08-14', status: 'tarde' },
    { date: '2024-08-19', status: 'presente' },
];

function CourseHeader({ course, instructor }: { course: CourseDetails, instructor: InstructorProfile | null }) {
    const image = PlaceHolderImages.find(p => p.id === course.id);
    
    return (
        <Card className="overflow-hidden">
            <div className="relative w-full h-48">
                {image ? (
                    <Image
                    src={image.imageUrl}
                    alt={course.name}
                    fill
                    className="object-cover"
                    data-ai-hint={image.imageHint}
                    />
                ) : (
                    <div className="w-full h-full bg-secondary"></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6">
                    <h1 className="text-3xl font-bold font-headline text-white">{course.name}</h1>
                </div>
            </div>
             <CardContent className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                {instructor ? (
                    <div className="flex items-center gap-3">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={instructor.profilePicture} />
                            <AvatarFallback>{instructor.firstName?.[0]}{instructor.lastName?.[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold text-lg">{instructor.firstName} {instructor.lastName}</p>
                            <p className="text-sm text-muted-foreground">Instructor</p>
                             <div className="flex items-center gap-2 mt-1">
                                <Button size="sm" variant="outline" asChild>
                                    <a href={`mailto:${instructor.email}`}>
                                        <Mail className="mr-2 h-4 w-4" /> Contactar
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : <Loader2 className="w-5 h-5 animate-spin" />}
                <div className="flex items-center gap-2">
                    {course.department && <Badge variant="secondary">{course.department}</Badge>}
                    {course.level && <Badge variant="outline">{course.level}</Badge>}
                </div>
             </CardContent>
        </Card>
    )
}

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const firestore = useFirestore();

  // Memoize the document reference for the course
  const courseDocRef = useMemoFirebase(() => {
    if (!firestore || !courseId) return null;
    return doc(firestore, 'courses', courseId);
  }, [firestore, courseId]);

  const { data: course, isLoading: isCourseLoading, error: courseError } = useDoc<CourseDetails>(courseDocRef);

  // Memoize the document reference for the instructor
  const instructorDocRef = useMemoFirebase(() => {
    if (!firestore || !course?.instructorId) return null;
    return doc(firestore, 'users', course.instructorId);
  }, [firestore, course]);
  
  const { data: instructor, isLoading: isInstructorLoading } = useDoc<InstructorProfile>(instructorDocRef);

  if (isCourseLoading) {
    return (
      <div className="flex justify-center items-center h-full pt-20">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (courseError || !course) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error al Cargar el Curso</AlertTitle>
        <AlertDescription>
          No se pudo encontrar el curso solicitado o no tienes permiso para verlo.
        </AlertDescription>
      </Alert>
    );
  }

  // Placeholder for approved prerequisites
  const approvedPrerequisites = ['CS101'];

  return (
    <div className="space-y-8">
      <CourseHeader course={course} instructor={instructor} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="description"><Info className="mr-2"/>Descripción</TabsTrigger>
              <TabsTrigger value="content"><BookMarked className="mr-2"/>Contenido</TabsTrigger>
              <TabsTrigger value="prerequisites"><ListChecks className="mr-2"/>Prerrequisitos</TabsTrigger>
              <TabsTrigger value="classmates"><Users className="mr-2"/>Compañeros</TabsTrigger>
              <TabsTrigger value="bibliography"><Library className="mr-2"/>Bibliografía</TabsTrigger>
              <TabsTrigger value="attendance"><UserCheckIcon className="mr-2"/>Asistencia</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-6">
                <Card>
                    <CardHeader><CardTitle>Descripción del Curso</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground">{course.description}</p>
                        <h3 className="font-semibold">Metodología</h3>
                        <p className="text-muted-foreground">{course.methodology || 'No especificada.'}</p>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="content" className="mt-6">
                 <Card>
                    <CardHeader><CardTitle>Contenido y Objetivos</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h3 className="font-semibold mb-2">Objetivos de Aprendizaje</h3>
                            {course.objectives && course.objectives.length > 0 ? (
                                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                    {course.objectives.map((obj, i) => <li key={i}>{obj}</li>)}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground">No se han especificado objetivos.</p>
                            )}
                        </div>
                         <div>
                            <h3 className="font-semibold mb-2">Syllabus del Curso</h3>
                            {course.syllabusUrl ? (
                                <Button asChild>
                                    <Link href={course.syllabusUrl} target="_blank"><FileText className="mr-2"/> Descargar Syllabus (PDF)</Link>
                                </Button>
                            ): (
                                <p className="text-sm text-muted-foreground">El syllabus no está disponible actualmente.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="prerequisites" className="mt-6">
                <Card>
                    <CardHeader><CardTitle>Prerrequisitos</CardTitle></CardHeader>
                    <CardContent>
                        {course.prerequisites && course.prerequisites.length > 0 ? (
                             <ul className="space-y-2">
                                {course.prerequisites.map(prereq => (
                                    <li key={prereq} className="flex items-center gap-2 text-muted-foreground">
                                        {approvedPrerequisites.includes(prereq) ? <CheckCircle className="text-green-500"/> : <XCircle className="text-destructive"/>}
                                        <span>{prereq}</span>
                                        {approvedPrerequisites.includes(prereq) ? <Badge variant="secondary" className="bg-green-100 text-green-800">Aprobado</Badge> : null}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground">Este curso no tiene prerrequisitos.</p>
                        )}
                         <Alert className="mt-6">
                            <BookOpen className="h-4 w-4" />
                            <AlertTitle>Visualización en Desarrollo</AlertTitle>
                            <AlertDescription>
                                Próximamente, se mostrará el nombre completo de los cursos y tu estado académico real.
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            </TabsContent>
             <TabsContent value="classmates" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Compañeros de Clase</CardTitle>
                        <CardDescription>Lista de estudiantes inscritos en este curso.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <div className="mb-4 flex gap-2">
                            <Input placeholder="Buscar por nombre..." />
                            <Button variant="outline"><Search className="h-4 w-4"/></Button>
                         </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {classmates.map(student => (
                                <div key={student.id} className="flex flex-col items-center text-center gap-2">
                                    <Avatar>
                                        <AvatarImage src={student.avatar} alt={student.name} />
                                        <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <p className="text-sm font-medium">{student.name}</p>
                                </div>
                            ))}
                        </div>
                        <Alert className="mt-6">
                            <Users className="h-4 w-4" />
                            <AlertTitle>Funcionalidad en Desarrollo</AlertTitle>
                            <AlertDescription>
                                La lista completa de compañeros y la funcionalidad de búsqueda se conectarán a datos reales próximamente. La información sensible del estudiante no será expuesta.
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="bibliography" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Bibliografía del Curso</CardTitle>
                        <CardDescription>Recursos y lecturas recomendadas.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-4">
                            {bibliography.map(item => (
                                <li key={item.id} className="flex flex-col sm:flex-row justify-between gap-2">
                                    <p className="text-muted-foreground flex-grow">{item.text}</p>
                                    <div className="flex gap-2 shrink-0">
                                        <Button variant="outline" size="sm" disabled={!item.available}>
                                            <Library className="mr-2" />
                                            {item.available ? 'En Biblioteca' : 'No Disponible'}
                                        </Button>
                                         <Button size="sm" disabled={!item.digital}>
                                            <BookOpen className="mr-2" />
                                            Acceso Digital
                                        </Button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                         <Alert className="mt-6">
                            <Library className="h-4 w-4" />
                            <AlertTitle>Funcionalidad en Desarrollo</AlertTitle>
                            <AlertDescription>
                                La integración con el sistema de biblioteca para verificar disponibilidad y acceso digital se implementará próximamente.
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="attendance" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Mi Asistencia</CardTitle>
                        <CardDescription>Tu registro de asistencia para este curso.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                            <div>
                               <p className="text-sm font-medium mb-2">Resumen de Asistencia</p>
                               <Progress value={60} className="h-2" />
                               <p className="text-xs text-muted-foreground mt-1">60% de Asistencia (3 de 5 clases)</p>
                            </div>
                             <div className="hidden md:block">
                                {/* Placeholder for a chart */}
                                <p className="text-sm font-medium mb-2">Tendencia</p>
                                <div className="h-10 w-full bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">Gráfico en desarrollo</div>
                             </div>
                        </div>

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Estado</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {attendance.map(record => (
                                    <TableRow key={record.date}>
                                        <TableCell>{record.date}</TableCell>
                                        <TableCell>
                                            <Badge variant={record.status === 'ausente' ? 'destructive' : 'secondary'} className="capitalize">{record.status}</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                         <Alert className="mt-6">
                            <UserCheckIcon className="h-4 w-4" />
                            <AlertTitle>Funcionalidad en Desarrollo</AlertTitle>
                            <AlertDescription>
                                Próximamente, esta sección se conectará con tus datos reales de asistencia para este curso.
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            </TabsContent>
          </Tabs>
        </div>
        <aside className="space-y-8">
            <CourseSchedule 
                schedule={course.schedule}
                mode={course.mode}
                virtualRoomUrl={course.virtualRoomUrl}
            />
        </aside>
      </div>
    </div>
  );
}

    