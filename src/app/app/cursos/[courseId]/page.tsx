'use client';

import { useDoc, useMemoFirebase, useFirestore, useUser, useCollection } from '@/firebase';
import { doc, DocumentData, collection, query, where } from 'firebase/firestore';
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
import { Loader2, Info, BookMarked, Users, Library, UserCheck, Search, CheckCircle, XCircle, BookOpen, Settings, Trash2, Megaphone, UserCog, PlusCircle, Check, Eye, BarChart2, FileText, ClipboardList, GraduationCap, Folder, File, Tv, AlertTriangle, ShieldX } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

import CourseHeader from '@/components/cursos/CourseHeader';
import CourseSchedule from '@/components/cursos/CourseSchedule';
import CourseGrades from '@/components/cursos/CourseGrades';
import CourseAssignments from '@/components/cursos/CourseAssignments';
import CourseAttendance from '@/components/cursos/CourseAttendance';


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
  schedule?: { day: string; startTime: string; endTime: string; classroom: string }[];
  mode?: 'Presencial' | 'Online' | 'Híbrido';
  virtualRoomUrl?: string;
  status?: 'active' | 'inactive';
}

// Define the type for the instructor's profile data
interface InstructorProfile {
    firstName: string;
    lastName: string;
    profilePicture: string;
    email: string;
}

interface AttendanceRecord {
    id: string;
    studentId: string;
    courseId: string;
    sessionTitle: string;
    date: string;
    status: 'presente' | 'ausente' | 'tarde' | 'justificado';
    notes?: string;
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

const professorAssignments = [
    { id: 'A01', title: 'Tarea 1: Investigación de Mercado', dueDate: '2024-08-20', submissions: 28, total: 30, graded: 15 },
    { id: 'A02', title: 'Examen Parcial', dueDate: '2024-09-05', submissions: 30, total: 30, graded: 0 },
]

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

  const attendanceQuery = useMemoFirebase(() => {
    if (!firestore || !profile || !courseId || profile.role !== 'student') return null;
    return query(collection(firestore, 'attendance'), where('studentId', '==', profile.uid), where('courseId', '==', courseId));
  }, [firestore, profile, courseId]);

  const { data: attendance, isLoading: isAttendanceLoading } = useCollection<AttendanceRecord>(attendanceQuery);


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

  if (course.status === 'inactive') {
    return (
      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShieldX className="text-destructive"/> Curso Desactivado</CardTitle>
        </CardHeader>
        <CardContent>
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4"/>
                <AlertTitle>Acceso Denegado</AlertTitle>
                <AlertDescription>
                    Este curso ha sido desactivado por un administrador y ya no está disponible. Contacta con tu institución si crees que esto es un error.
                </AlertDescription>
            </Alert>
        </CardContent>
      </Card>
    )
  }

  const isInstructor = profile?.uid === course.instructorId;
  const isStudent = profile?.role === 'student';


  // Placeholder for approved prerequisites
  const approvedPrerequisites = ['CS101'];

  const studentTabs = (
    <>
      <TabsTrigger value="assignments"><ClipboardList /> Tareas</TabsTrigger>
      <TabsTrigger value="grades"><GraduationCap/> Calificaciones</TabsTrigger>
      <TabsTrigger value="info"><Info /> Información</TabsTrigger>
      <TabsTrigger value="materials"><BookOpen /> Materiales</TabsTrigger>
    </>
  );

  const professorTabs = (
     <>
        <TabsTrigger value="students"><Users/> Estudiantes</TabsTrigger>
        <TabsTrigger value="assignments"><ClipboardList /> Tareas</TabsTrigger>
        <TabsTrigger value="grades"><GraduationCap/> Calificaciones</TabsTrigger>
        <TabsTrigger value="materials"><BookOpen /> Materiales</TabsTrigger>
        <TabsTrigger value="stats"><BarChart2 /> Estadísticas</TabsTrigger>
    </>
  )

  return (
    <div className="space-y-8">
      <CourseHeader course={course} instructor={instructor} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <Tabs defaultValue={isStudent ? "assignments" : "students"} className="w-full">
                <TabsList className={`grid w-full ${isStudent ? 'grid-cols-4' : 'grid-cols-5'}`}>
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
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div className="space-y-1">
                                    <CardTitle>Gestión de Tareas</CardTitle>
                                    <CardDescription>Crea, edita y revisa las tareas del curso.</CardDescription>
                                </div>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button><PlusCircle className="mr-2"/> Crear Tarea</Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-2xl">
                                        <DialogHeader>
                                            <DialogTitle>Crear Nueva Tarea</DialogTitle>
                                            <DialogDescription>Completa el formulario para publicar una nueva tarea o evaluación.</DialogDescription>
                                        </DialogHeader>
                                        <div className="py-4 space-y-4">
                                            <div className="space-y-2">
                                                <Label>Título</Label>
                                                <Input placeholder="Ej: Tarea 1: Investigación de Mercado" />
                                            </div>
                                             <div className="space-y-2">
                                                <Label>Descripción</Label>
                                                <Textarea placeholder="Describe los objetivos y requisitos de la tarea." />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Fecha de Entrega</Label>
                                                    <Input type="date" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Puntaje Máximo</Label>
                                                    <Input type="number" placeholder="20" />
                                                </div>
                                            </div>
                                             <div className="flex items-center space-x-2">
                                                <Checkbox id="allow-late"/>
                                                <Label htmlFor="allow-late">Permitir entregas tardías</Label>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Adjuntar Archivos</Label>
                                                 <Button variant="outline" asChild className="w-full">
                                                    <label htmlFor="file-upload-assignment" className="cursor-pointer flex items-center gap-2">
                                                        <UserCog className="h-4 w-4"/>
                                                        <span>Adjuntar plantilla o guía (PDF, DOCX)</span>
                                                        <input id="file-upload-assignment" name="file-upload" type="file" className="sr-only" />
                                                    </label>
                                                </Button>
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline">Cancelar</Button>
                                            <Button disabled><Check className="mr-2"/> Publicar Tarea</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Título</TableHead>
                                            <TableHead>Fecha Límite</TableHead>
                                            <TableHead>Entregas</TableHead>
                                            <TableHead>Calificadas</TableHead>
                                            <TableHead className="text-right">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {professorAssignments.map(a => (
                                            <TableRow key={a.id}>
                                                <TableCell className="font-medium">{a.title}</TableCell>
                                                <TableCell>{a.dueDate}</TableCell>
                                                <TableCell>{a.submissions}/{a.total}</TableCell>
                                                <TableCell>{a.graded}/{a.submissions}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button size="sm" variant="outline"><Eye className="mr-2"/>Ver Entregas</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                 <Alert className="mt-4">
                                    <UserCog className="w-4 h-4"/>
                                    <AlertTitle>En Desarrollo</AlertTitle>
                                    <AlertDescription>La lógica para guardar, editar y calificar las tareas se implementará próximamente.</AlertDescription>
                                </Alert>
                            </CardContent>
                        </Card>
                     </TabsContent>
                     <TabsContent value="grades" className="mt-6">
                        <Card>
                            <CardHeader><CardTitle>Libro de Calificaciones</CardTitle></CardHeader>
                            <CardContent><Alert><UserCog className="w-4 h-4"/><AlertTitle>En Desarrollo</AlertTitle><AlertDescription>Aquí podrás ingresar y publicar las calificaciones finales de los estudiantes, así como ver el progreso general del curso.</AlertDescription></Alert></CardContent>
                        </Card>
                     </TabsContent>
                    </>
                )}


                <TabsContent value="info" className="mt-6">
                    <Tabs defaultValue="description" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="description"><Info className="mr-2"/>Descripción</TabsTrigger>
                            <TabsTrigger value="content"><BookMarked className="mr-2"/>Contenido</TabsTrigger>
                            <TabsTrigger value="classmates"><Users className="mr-2"/>Compañeros</TabsTrigger>
                            <TabsTrigger value="attendance"><UserCheck className="mr-2"/>Asistencia</TabsTrigger>
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
                        <TabsContent value="attendance" className="mt-6">
                             {isStudent && (
                                isAttendanceLoading ? <Loader2 className="animate-spin" /> : <CourseAttendance attendance={attendance || []} />
                            )}
                        </TabsContent>
                    </Tabs>
                </TabsContent>
                <TabsContent value="materials" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><BookOpen /> Materiales del Curso</CardTitle>
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
                                                        <UserCog className="h-4 w-4"/>
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
                {isInstructor && (
                    <TabsContent value="stats" className="mt-6">
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Estadísticas del Curso</CardTitle>
                                    <CardDescription>Dashboard analítico con el rendimiento general de la clase.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Alert>
                                        <BarChart2 className="w-4 h-4"/>
                                        <AlertTitle>En Desarrollo</AlertTitle>
                                        <AlertDescription>
                                            Aquí se mostrará el dashboard analítico con gráficos sobre rendimiento, asistencia y más.
                                        </AlertDescription>
                                    </Alert>
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader>
                                    <CardTitle>Generación de Reportes</CardTitle>
                                    <CardDescription>Exporta informes académicos del curso.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Alert>
                                        <FileText className="w-4 h-4"/>
                                        <AlertTitle>En Desarrollo</AlertTitle>
                                        <AlertDescription>
                                            Desde aquí podrás generar y exportar reportes de asistencia, calificaciones y desempeño en formato PDF y Excel.
                                        </AlertDescription>
                                    </Alert>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                )}
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
                                        <Button variant="outline">Cancelar</Button>
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
