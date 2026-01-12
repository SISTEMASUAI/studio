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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
  } from "@/components/ui/tabs"
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, BookOpen, CheckCircle, XCircle, FileText, Info, BookMarked, ListChecks, Mail, Users, Library, UserCheck as UserCheckIcon, Search, AlertTriangle, FileUp, GraduationCap, ClipboardList, Folder, File, Download, Tv, Book, Settings, Trash2, Edit, Megaphone, UserCog } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import CourseSchedule from '@/components/cursos/CourseSchedule';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CourseGrades from '@/components/cursos/CourseGrades';
import CourseAssignments from '@/components/cursos/CourseAssignments';

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
    { date: '2024-08-21', status: 'ausente' },
];

const courseMaterials = [
    { type: 'folder', name: 'Presentaciones', items: [
        { type: 'file', name: 'Semana 1 - Intro.pptx', size: '5.2 MB' },
        { type: 'file', name: 'Semana 2 - Conceptos Clave.pptx', size: '8.1 MB' },
    ]},
    { type: 'folder', name: 'Lecturas', items: [
        { type: 'file', name: 'Paper Académico Principal.pdf', size: '1.8 MB' },
        { type: 'file', name: 'Lectura Complementaria 1.pdf', size: '0.9 MB' },
    ]},
    { type: 'folder', name: 'Videos', items: [
        { type: 'video', name: 'Clase Grabada - 05/08.mp4', size: '150 MB' },
    ]},
];

function CourseHeader({ course, instructor }: { course: CourseDetails, instructor: InstructorProfile | null }) {
    const { profile } = useUser();
    const isInstructor = profile?.uid === course.instructorId;

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
                 {isInstructor && (
                    <div className="absolute top-4 right-4 flex gap-2">
                        <Dialog>
                            <DialogTrigger asChild>
                                 <Button variant="secondary" size="sm"><Edit className="mr-2"/> Editar</Button>
                            </DialogTrigger>
                             <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Editar Información del Curso</DialogTitle>
                                    <DialogDescription>
                                        Realiza cambios en la descripción, objetivos y otros detalles del curso.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                     <div className="space-y-2">
                                        <Label>Descripción</Label>
                                        <Textarea defaultValue={course.description} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Metodología</Label>
                                        <Textarea defaultValue={course.methodology} />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline">Cancelar</Button>
                                    <Button disabled>Guardar Cambios</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        <Button variant="secondary" size="sm" disabled><Megaphone className="mr-2"/> Publicar Anuncio</Button>
                    </div>
                )}
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

function FileIcon({ type }: { type: string }) {
    if (type.includes('pdf')) return <FileText className="text-red-500" />;
    if (type.includes('ppt')) return <FileText className="text-orange-500" />;
    if (type.includes('mp4')) return <Tv className="text-blue-500" />;
    return <File className="text-muted-foreground" />;
}

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const firestore = useFirestore();
  const { profile } = useUser();


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

  const isInstructor = profile?.uid === course.instructorId;
  const isStudent = profile?.role === 'student';


  // Placeholder for approved prerequisites
  const approvedPrerequisites = ['CS101'];

  const attendancePolicy = 85;
  const totalClasses = attendance.length;
  const validAttendance = attendance.filter(a => a.status === 'presente' || a.status === 'tarde').length;
  const attendancePercentage = Math.round((validAttendance / totalClasses) * 100);
  const absences = attendance.filter(a => a.status === 'ausente');

  const getProgressColor = (percentage: number) => {
    if (percentage >= 85) return 'bg-green-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const studentTabs = (
    <>
      <TabsTrigger value="assignments"><ClipboardList /> Tareas</TabsTrigger>
      <TabsTrigger value="grades"><GraduationCap/> Calificaciones</TabsTrigger>
      <TabsTrigger value="info"><Info /> Información</TabsTrigger>
      <TabsTrigger value="materials"><Book /> Materiales</TabsTrigger>
    </>
  );

  const professorTabs = (
     <>
        <TabsTrigger value="students"><Users/> Estudiantes</TabsTrigger>
        <TabsTrigger value="assignments"><ClipboardList /> Tareas</TabsTrigger>
        <TabsTrigger value="grades"><GraduationCap/> Calificaciones</TabsTrigger>
        <TabsTrigger value="materials"><Book /> Materiales</TabsTrigger>
    </>
  )

  return (
    <div className="space-y-8">
      <CourseHeader course={course} instructor={instructor} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <Tabs defaultValue={isStudent ? "assignments" : "students"} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    {isStudent ? studentTabs : professorTabs}
                </TabsList>

                {isStudent && (
                    <>
                        <TabsContent value="assignments" className="mt-6">
                            <CourseAssignments />
                        </TabsContent>
                        <TabsContent value="grades" className="mt-6">
                            <CourseGrades />
                        </TabsContent>
                    </>
                )}

                {isInstructor && (
                    <>
                     <TabsContent value="students" className="mt-6">
                        <Card>
                            <CardHeader><CardTitle>Gestión de Estudiantes</CardTitle></CardHeader>
                            <CardContent><Alert><UserCog className="w-4 h-4"/><AlertTitle>En Desarrollo</AlertTitle><AlertDescription>Aquí podrás ver la lista de estudiantes, gestionar la asistencia y comunicarte con la clase.</AlertDescription></Alert></CardContent>
                        </Card>
                     </TabsContent>
                     <TabsContent value="assignments" className="mt-6">
                         <Card>
                            <CardHeader><CardTitle>Gestión de Tareas</CardTitle></CardHeader>
                            <CardContent><Alert><UserCog className="w-4 h-4"/><AlertTitle>En Desarrollo</AlertTitle><AlertDescription>Aquí podrás crear, editar y calificar las tareas y evaluaciones del curso.</AlertDescription></Alert></CardContent>
                        </Card>
                     </TabsContent>
                     <TabsContent value="grades" className="mt-6">
                        <Card>
                            <CardHeader><CardTitle>Gestión de Calificaciones</CardTitle></CardHeader>
                            <CardContent><Alert><UserCog className="w-4 h-4"/><AlertTitle>En Desarrollo</AlertTitle><AlertDescription>Aquí podrás ingresar y publicar las calificaciones de los estudiantes.</AlertDescription></Alert></CardContent>
                        </Card>
                     </TabsContent>
                    </>
                )}


                <TabsContent value="info" className="mt-6">
                    <Tabs defaultValue="description" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="description"><Info className="mr-2"/>Descripción</TabsTrigger>
                        <TabsTrigger value="content"><BookMarked className="mr-2"/>Contenido</TabsTrigger>
                        <TabsTrigger value="classmates"><Users className="mr-2"/>Compañeros</TabsTrigger>
                        </TabsList>
                        <TabsContent value="description" className="mt-6">
                            <Card>
                                <CardHeader><CardTitle>Descripción del Curso</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-muted-foreground">{course.description}</p>
                                    <div>
                                        <h3 className="font-semibold mb-2">Metodología</h3>
                                        <p className="text-muted-foreground">{course.methodology || 'No especificada.'}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-2">Prerrequisitos</h3>
                                        {course.prerequisites && course.prerequisites.length > 0 ? (
                                            <ul className="space-y-2">
                                                {course.prerequisites.map(prereq => (
                                                    <li key={prereq} className="flex items-center gap-2 text-muted-foreground">
                                                        {approvedPrerequisites.includes(prereq) ? <CheckCircle className="text-green-500"/> : <XCircle className="text-destructive"/>}
                                                        <span>{prereq}</span>
                                                        {isStudent && approvedPrerequisites.includes(prereq) ? <Badge variant="secondary" className="bg-green-100 text-green-800">Aprobado</Badge> : null}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">Este curso no tiene prerrequisitos.</p>
                                        )}
                                    </div>
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
                                        <h3 className="font-semibold mb-2">Syllabus y Bibliografía</h3>
                                        {course.syllabusUrl ? (
                                            <Button asChild>
                                                <Link href={course.syllabusUrl} target="_blank"><FileText className="mr-2"/> Descargar Syllabus (PDF)</Link>
                                            </Button>
                                        ): (
                                            <p className="text-sm text-muted-foreground">El syllabus no está disponible actualmente.</p>
                                        )}
                                        <div className="mt-4 space-y-4">
                                            <h4 className="font-medium">Bibliografía</h4>
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
                                        </div>
                                    </div>
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
                    </Tabs>
                </TabsContent>
                <TabsContent value="materials" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Book /> Materiales del Curso</CardTitle>
                            <CardDescription>Descarga presentaciones, lecturas y otros recursos.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {courseMaterials.map((folder, idx) => (
                                    <div key={idx}>
                                        <h3 className="font-semibold flex items-center gap-2 mb-2"><Folder className="text-primary"/> {folder.name}</h3>
                                        <ul className="space-y-2 pl-6">
                                            {folder.items.map((item, itemIdx) => (
                                                <li key={itemIdx} className="flex justify-between items-center p-2 rounded-md hover:bg-accent">
                                                    <div className="flex items-center gap-2">
                                                        <FileIcon type={item.name} />
                                                        <span className="text-sm">{item.name}</span>
                                                        <span className="text-xs text-muted-foreground">({item.size})</span>
                                                    </div>
                                                    <Button variant="ghost" size="icon" disabled>
                                                        <Download className="h-4 w-4"/>
                                                    </Button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                             <Alert className="mt-6">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Funcionalidad en Desarrollo</AlertTitle>
                                <AlertDescription>
                                    La descarga y previsualización de archivos se implementará próximamente. Esto requerirá integración con un servicio de almacenamiento.
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
            {isStudent && (
                <>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><UserCheckIcon/> Mi Asistencia</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <p className="text-sm font-medium mb-2">Resumen de Asistencia</p>
                                <div className="space-y-2">
                                    <Progress value={attendancePercentage} className="h-2 [&>div]:bg-green-500" indicatorClassName={getProgressColor(attendancePercentage)} />
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>{validAttendance} de {totalClasses} clases asistidas</span>
                                        <span>{attendancePercentage}%</span>
                                    </div>
                                    {attendancePercentage < attendancePolicy && (
                                        <p className="text-xs text-destructive flex items-center gap-1"><AlertTriangle className="h-3 w-3"/> Mínimo requerido: {attendancePolicy}%</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-2 text-sm">Justificar Inasistencias</h3>
                                <Table>
                                    <TableBody>
                                        {absences.length > 0 ? absences.map(record => (
                                            <TableRow key={record.date}>
                                                <TableCell className="p-2">
                                                    <p className="text-sm">{record.date}</p>
                                                    <Badge variant='destructive' className="capitalize text-xs h-5">{record.status}</Badge>
                                                </TableCell>
                                                <TableCell className="p-2 text-right">
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button variant="outline" size="sm">Justificar</Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="sm:max-w-[425px]">
                                                            <DialogHeader>
                                                                <DialogTitle>Justificar Inasistencia</DialogTitle>
                                                                <DialogDescription>
                                                                    Fecha: {record.date}. Completa el formulario para enviar tu justificación.
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <div className="grid gap-4 py-4">
                                                                <div className="grid grid-cols-4 items-center gap-4">
                                                                    <Label htmlFor="reason" className="text-right">Motivo</Label>
                                                                    <Select>
                                                                        <SelectTrigger className="col-span-3">
                                                                            <SelectValue placeholder="Selecciona un motivo" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value="medical">Médico</SelectItem>
                                                                            <SelectItem value="family">Familiar</SelectItem>
                                                                            <SelectItem value="work">Laboral</SelectItem>
                                                                            <SelectItem value="other">Otro</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                                <div className="grid grid-cols-4 items-center gap-4">
                                                                    <Label htmlFor="description" className="text-right">Descripción</Label>
                                                                    <Textarea id="description" className="col-span-3" placeholder="Explica brevemente tu ausencia."/>
                                                                </div>
                                                                <div className="grid grid-cols-4 items-center gap-4">
                                                                    <Label htmlFor="attachment" className="text-right">Sustento</Label>
                                                                    <Button variant="outline" asChild className="col-span-3">
                                                                        <label htmlFor="file-upload" className="cursor-pointer flex items-center gap-2">
                                                                            <FileUp className="h-4 w-4"/>
                                                                            <span>Adjuntar archivo (PDF, JPG)</span>
                                                                            <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                                                                        </label>
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                            <DialogFooter>
                                                                <Button type="submit" disabled>Enviar Justificación</Button>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>
                                                </TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={2} className="text-center text-muted-foreground text-sm p-2">No tienes inasistencias por justificar.</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Settings/> Administración</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="destructive" className="w-full">
                                        <Trash2 className="mr-2"/> Dar de Baja el Curso
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive"/>Confirmar Baja del Curso</DialogTitle>
                                        <DialogDescription>
                                            Estás a punto de dar de baja "{course.name}". Esta acción no se puede deshacer.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="py-4 space-y-4">
                                        <Alert variant="destructive">
                                            <AlertTriangle className="h-4 w-4" />
                                            <AlertTitle>¡Atención!</AlertTitle>
                                            <AlertDescription>
                                                <ul className="list-disc list-inside">
                                                    <li>Perderás todo el avance y calificaciones.</li>
                                                    <li>No habrá reembolso de pagos realizados.</li>
                                                    <li>Esta acción puede afectar tu carga académica y progreso.</li>
                                                </ul>
                                            </AlertDescription>
                                        </Alert>
                                        <div className="space-y-2">
                                            <Label htmlFor="reason">Motivo de la baja (requerido)</Label>
                                            <Select>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona un motivo..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="academic">Académico</SelectItem>
                                                    <SelectItem value="personal">Personal</SelectItem>
                                                    <SelectItem value="health">Salud</SelectItem>
                                                    <SelectItem value="work">Laboral</SelectItem>
                                                    <SelectItem value="other">Otro</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="comments">Comentarios (opcional)</Label>
                                            <Textarea id="comments" placeholder="Si lo deseas, puedes añadir un comentario."/>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Alert>
                                            <AlertTriangle className="h-4 w-4" />
                                            <AlertTitle>Función en Desarrollo</AlertTitle>
                                            <AlertDescription>
                                                La lógica para procesar la baja del curso se implementará próximamente.
                                            </AlertDescription>
                                        </Alert>
                                        <DialogTrigger asChild><Button variant="outline">Cancelar</Button></DialogTrigger>
                                        <Button variant="destructive" disabled>Confirmar Baja</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </CardContent>
                    </Card>
                </>
            )}
        </aside>
      </div>
    </div>
  );
}
