'use client';

import { useUser, useCollection, useMemoFirebase, useFirestore, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
  } from "@/components/ui/tabs"
import {
  BookCopy,
  PlusCircle,
  BarChart,
  UserCog,
  ArrowRight,
  Edit,
  Users,
  Loader2,
  MoreHorizontal,
  Search,
  Book,
  Trash2,
  Eye,
  User,
  GraduationCap,
  Clock,
  Building,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import Image from 'next/image';
import { collection, query, where, DocumentData, doc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from '@/firebase';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useState, useMemo } from 'react';

// Define the type for the enrollment data we expect from Firestore
interface Enrollment {
  id: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  professorId: string;
  professorName: string;
  professorProfilePicture: string;
  courseImage: string;
  semester: string;
  year: number;
}

// Define the type for course data
interface Course extends DocumentData {
    id: string;
    courseId: string;
    name: string;
    description: string;
    credits: number;
    level: string;
    instructorId: string;
    programId: string;
    facultyId: string;
    cycle?: number;
    semesterStartDate?: string;
    semesterEndDate?: string;
    schedule?: { day: string; startTime: string; endTime: string; classroom: string }[];
    mode?: string;
    capacity?: number;
}

interface Program extends DocumentData {
    id: string;
    programId: string;
    name: string;
    facultyId: string;
    totalCycles: number;
}

interface Faculty extends DocumentData {
    id: string;
    facultyId: string;
    name: string;
}

function StudentCoursesView() {
  const { user } = useUser();
  const firestore = useFirestore();

  // Memoize the query to prevent re-creating it on every render
  const enrollmentsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'enrollments'), where('studentId', '==', user.uid));
  }, [firestore, user]);

  const { data: enrollments, isLoading, error } = useCollection<Enrollment>(enrollmentsQuery);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
        <Alert variant="destructive">
            <AlertTitle>Error al cargar los cursos</AlertTitle>
            <AlertDescription>
                No se pudo obtener la lista de cursos. Por favor, inténtalo de nuevo más tarde.
            </AlertDescription>
        </Alert>
    );
  }
  
  if (!enrollments || enrollments.length === 0) {
    return (
        <Alert>
            <BookCopy className="h-4 w-4" />
            <AlertTitle>No tienes cursos inscritos</AlertTitle>
            <AlertDescription>
                Actualmente no estás inscrito en ningún curso. Visita la sección de Matrícula para inscribirte.
            </AlertDescription>
        </Alert>
    );
  }


  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {enrollments.map((enrollment) => {
        return (
            <Card key={enrollment.id} className="flex flex-col">
              <Image
                src={enrollment.courseImage || `https://picsum.photos/seed/${enrollment.courseId}/400/200`}
                alt={enrollment.courseName}
                width={400}
                height={200}
                className="w-full h-40 object-cover rounded-t-lg"
                data-ai-hint="university course"
              />
              <CardHeader>
                <CardTitle>{enrollment.courseName}</CardTitle>
                <CardDescription>{enrollment.professorName}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <Badge variant="secondary">{enrollment.courseCode}</Badge>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={`/cursos/${enrollment.courseId}`}>
                    Ver Curso <ArrowRight className="ml-2" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
        )
      })}
    </div>
  );
}

function ProfessorCoursesView() {
    const { user } = useUser();
    const firestore = useFirestore();

    const coursesQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return query(collection(firestore, 'courses'), where('instructorId', '==', user.uid));
    }, [firestore, user]);

    const { data: courses, isLoading, error } = useCollection<Course>(coursesQuery);

    const enrollmentsQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return query(collection(firestore, 'enrollments'), where('professorId', '==', user.uid));
    }, [firestore, user]);

    const { data: enrollments, isLoading: enrollmentsLoading } = useCollection<Enrollment>(enrollmentsQuery);


    if (isLoading || enrollmentsLoading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (error) {
        return <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>No se pudieron cargar los cursos.</AlertDescription></Alert>;
    }
    
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Mis Cursos Impartidos</h2>
        </div>
        {courses && courses.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
                 <Card key={course.id} className="flex flex-col">
                    <Image
                        src={`https://picsum.photos/seed/${course.id}/400/200`}
                        alt={course.name}
                        width={400}
                        height={200}
                        className="w-full h-40 object-cover rounded-t-lg bg-muted"
                        data-ai-hint="university course abstract"
                    />
                     <CardHeader>
                         <CardTitle>{course.name}</CardTitle>
                         <CardDescription>Semestre {course.semesterStartDate ? new Date(course.semesterStartDate).getFullYear() : ''}</CardDescription>
                     </CardHeader>
                     <CardContent className="flex-grow">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            <Users /> 
                            {enrollments?.filter(e => e.courseId === course.id).length} Estudiantes
                        </div>
                     </CardContent>
                     <CardFooter className="flex gap-2">
                         <Button asChild className="w-full">
                           <Link href={`/cursos/${course.id}`}>
                             Gestionar
                           </Link>
                         </Button>
                     </CardFooter>
                 </Card>
            ))}
        </div>
        ) : (
             <Alert>
              <BookCopy className="h-4 w-4" />
              <AlertTitle>No tienes cursos asignados</AlertTitle>
              <AlertDescription>
                Actualmente no estás asignado como profesor a ningún curso para el semestre actual.
              </AlertDescription>
            </Alert>
        )}
      </div>
    );
  }

const CourseSchema = z.object({
    courseId: z.string().min(3, "El código debe tener al menos 3 caracteres."),
    name: z.string().min(5, "El nombre debe tener al menos 5 caracteres."),
    description: z.string().min(10, "La descripción debe tener al menos 10 caracteres."),
    credits: z.coerce.number().min(1, "Debe tener al menos 1 crédito."),
    capacity: z.coerce.number().min(0, "La capacidad no puede ser negativa."),
    facultyId: z.string().min(1, "Debe seleccionar una facultad."),
    programId: z.string().min(1, "Debe seleccionar un programa."),
    cycle: z.coerce.number().min(1, "Debe seleccionar un ciclo."),
    level: z.string().min(1, "Debe seleccionar un nivel."),
    instructorId: z.string().min(1, "Debe seleccionar un instructor."),
    mode: z.string().min(1, "Debe seleccionar una modalidad."),
    semesterStartDate: z.string().min(1, "Debe seleccionar una fecha de inicio."),
    semesterEndDate: z.string().min(1, "Debe seleccionar una fecha de fin."),
  });

function AdminCoursesView() {
    const { toast } = useToast();
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [schedule, setSchedule] = useState([{ day: '', startTime: '', endTime: '', classroom: '' }]);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

    const firestore = useFirestore();

    const professorsQuery = useMemoFirebase(() => 
        firestore ? query(collection(firestore, 'users'), where('role', '==', 'professor')) : null,
    [firestore]);
    const { data: professors } = useCollection(professorsQuery);

    const programsQuery = useMemoFirebase(() =>
        firestore ? collection(firestore, 'programs') : null,
    [firestore]);
    const { data: programs } = useCollection<Program>(programsQuery);

    const facultiesQuery = useMemoFirebase(() => 
        firestore ? collection(firestore, 'faculties') : null,
    [firestore]);
    const { data: faculties } = useCollection<Faculty>(facultiesQuery);

    const coursesQuery = useMemoFirebase(() => 
        firestore ? collection(firestore, 'courses') : null,
    [firestore]);
    const { data: courses, isLoading: areCoursesLoading } = useCollection<Course>(coursesQuery);

    const courseForm = useForm<z.infer<typeof CourseSchema>>({
        resolver: zodResolver(CourseSchema),
        defaultValues: {
            courseId: '',
            name: '',
            description: '',
            credits: 1,
            capacity: 30,
            facultyId: '',
            programId: '',
            cycle: 1,
            level: 'Pregrado',
            instructorId: '',
            mode: 'Presencial',
            semesterStartDate: '',
            semesterEndDate: '',
        },
    });
    
    const selectedFacultyIdCourse = courseForm.watch('facultyId');
    const selectedProgramIdCourse = courseForm.watch('programId');

    const updateCourseForm = useForm<z.infer<typeof CourseSchema>>({
        resolver: zodResolver(CourseSchema),
    });

    const selectedFacultyIdUpdateCourse = updateCourseForm.watch('facultyId');
    const selectedProgramIdUpdateCourse = updateCourseForm.watch('programId');
    
    const selectedCourseFacultyId = useMemo(() => {
        if (!selectedCourse || !programs) return '';
        return programs.find(p => p.id === selectedCourse.programId)?.facultyId || '';
    }, [selectedCourse, programs]);

    const handleOpenEditDialog = (course: Course) => {
        setSelectedCourse(course);
        updateCourseForm.reset({
            ...course,
            facultyId: selectedCourseFacultyId,
            schedule: undefined, // schedule is handled separately
        });
        setSchedule(course.schedule || [{ day: '', startTime: '', endTime: '', classroom: '' }]);
        setIsEditDialogOpen(true);
    };

    const handleScheduleChange = (index: number, field: string, value: string) => {
        const newSchedule = [...schedule];
        newSchedule[index] = { ...newSchedule[index], [field]: value };
        setSchedule(newSchedule);
    };

    const addScheduleRow = () => {
        setSchedule([...schedule, { day: '', startTime: '', endTime: '', classroom: '' }]);
    };

    const removeScheduleRow = (index: number) => {
        const newSchedule = schedule.filter((_, i) => i !== index);
        setSchedule(newSchedule);
    };

    async function onCreateCourseSubmit(values: z.infer<typeof CourseSchema>) {
        if (!firestore) return;
        
        try {
            const courseCollection = collection(firestore, 'courses');
            
            await addDocumentNonBlocking(courseCollection, {
                ...values,
                enrolled: 0,
                schedule: schedule.filter(s => s.day && s.startTime && s.endTime),
                prerequisites: [],
                objectives: [],
                methodology: "",
                syllabusUrl: "",
                virtualRoomUrl: "",
            });
            
            toast({
                title: "Curso Creado",
                description: `El curso "${values.name}" ha sido creado exitosamente.`,
            });
            courseForm.reset();
            setSchedule([{ day: '', startTime: '', endTime: '', classroom: '' }]);
            setIsCreateDialogOpen(false);
        } catch (error) {
            console.error("Error creating course: ", error);
            toast({
                variant: "destructive",
                title: "Error al crear el curso",
                description: "Hubo un problema al guardar el curso. Por favor, inténtalo de nuevo.",
            });
        }
    }

    async function onUpdateCourseSubmit(values: z.infer<typeof CourseSchema>) {
        if (!firestore || !selectedCourse) return;

        try {
            const courseDocRef = doc(firestore, 'courses', selectedCourse.id);
            await updateDocumentNonBlocking(courseDocRef, {
                ...values,
                schedule: schedule.filter(s => s.day && s.startTime && s.endTime),
            });

            toast({
                title: "Curso Actualizado",
                description: `El curso "${values.name}" ha sido actualizado.`,
            });
            setIsEditDialogOpen(false);
            setSelectedCourse(null);
        } catch (error) {
             console.error("Error updating course: ", error);
            toast({
                variant: "destructive",
                title: "Error al actualizar",
                description: "Hubo un problema al guardar los cambios.",
            });
        }
    }

    const hasCourseStarted = (course: Course | null) => {
        if (!course || !course.semesterStartDate) return false;
        return new Date(course.semesterStartDate) < new Date();
    }

    const cyclesForSelectedProgramCreate = useMemo(() => {
        if (!selectedProgramIdCourse || !programs) return [];
        const program = programs.find(p => p.id === selectedProgramIdCourse);
        return program ? Array.from({ length: program.totalCycles }, (_, i) => i + 1) : [];
    }, [selectedProgramIdCourse, programs]);

    const cyclesForSelectedProgramUpdate = useMemo(() => {
        const programId = selectedProgramIdUpdateCourse || selectedCourse?.programId;
        if (!programId || !programs) return [];
        const program = programs.find(p => p.id === programId);
        return program ? Array.from({ length: program.totalCycles }, (_, i) => i + 1) : [];
    }, [selectedProgramIdUpdateCourse, selectedCourse, programs]);

    return (
        <Tabs defaultValue="courses">
            <TabsList>
                <TabsTrigger value="courses"><Book /> Gestión de Cursos</TabsTrigger>
            </TabsList>
            <TabsContent value="courses" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                        <UserCog /> Administración de Cursos
                        </CardTitle>
                        <CardDescription>
                        Panel para administrar todos los cursos de la plataforma, asignaturas y profesores.
                        </CardDescription>
                        <div className="flex flex-col sm:flex-row gap-2 pt-4">
                            <div className="relative flex-grow">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Buscar por código o nombre..." className="pl-9" />
                            </div>
                            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="w-full sm:w-auto">
                                        <PlusCircle className="mr-2" /> Crear Curso
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-3xl">
                                    <Form {...courseForm}>
                                        <form onSubmit={courseForm.handleSubmit(onCreateCourseSubmit)}>
                                            <DialogHeader>
                                                <DialogTitle>Crear Nuevo Curso</DialogTitle>
                                                <DialogDescription>Completa el formulario para registrar un nuevo curso en el sistema.</DialogDescription>
                                            </DialogHeader>
                                            <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <FormField control={courseForm.control} name="courseId" render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Código del Curso</FormLabel>
                                                            <FormControl><Input placeholder="Ej: CS-101" {...field} /></FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )} />
                                                    <FormField control={courseForm.control} name="name" render={({ field }) => (
                                                         <FormItem>
                                                            <FormLabel>Nombre del Curso</FormLabel>
                                                            <FormControl><Input placeholder="Introducción a la Programación" {...field} /></FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )} />
                                                </div>
                                                <FormField control={courseForm.control} name="description" render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Descripción Breve</FormLabel>
                                                        <FormControl><Textarea placeholder="Describe el curso en una o dos frases." {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <FormField control={courseForm.control} name="credits" render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Créditos</FormLabel>
                                                            <FormControl><Input type="number" placeholder="4" {...field} /></FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )} />
                                                    <FormField control={courseForm.control} name="capacity" render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Capacidad</FormLabel>
                                                            <FormControl><Input type="number" placeholder="30" {...field} /></FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )} />
                                                    <FormField control={courseForm.control} name="level" render={({ field }) => (
                                                         <FormItem>
                                                            <FormLabel>Nivel</FormLabel>
                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger><SelectValue placeholder="Selecciona..."/></SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="Pregrado">Pregrado</SelectItem>
                                                                    <SelectItem value="Postgrado">Postgrado</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )} />
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <FormField control={courseForm.control} name="facultyId" render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Facultad</FormLabel>
                                                            <Select onValueChange={(value) => { field.onChange(value); courseForm.setValue('programId', ''); courseForm.setValue('cycle', 1); }} defaultValue={field.value}>
                                                                <FormControl><SelectTrigger><SelectValue placeholder="Selecciona una facultad..."/></SelectTrigger></FormControl>
                                                                <SelectContent>
                                                                    {faculties ? faculties.map(fac => (
                                                                        <SelectItem key={fac.id} value={fac.id}>{fac.name}</SelectItem>
                                                                    )) : <SelectItem value="loading" disabled>Cargando...</SelectItem>}
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )} />
                                                    <FormField control={courseForm.control} name="programId" render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Programa Académico</FormLabel>
                                                            <Select onValueChange={(value) => { field.onChange(value); courseForm.setValue('cycle', 1); }} value={field.value} disabled={!selectedFacultyIdCourse}>
                                                                <FormControl><SelectTrigger><SelectValue placeholder={!selectedFacultyIdCourse ? "Selecciona una facultad primero" : "Asigna un programa..."}/></SelectTrigger></FormControl>
                                                                <SelectContent>
                                                                    {programs?.filter(p => p.facultyId === selectedFacultyIdCourse).map(prog => (
                                                                        <SelectItem key={prog.id} value={prog.id}>{prog.name}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )} />
                                                </div>
                                                <FormField control={courseForm.control} name="cycle" render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Ciclo</FormLabel>
                                                        <Select onValueChange={field.onChange} value={String(field.value)} disabled={!selectedProgramIdCourse}>
                                                            <FormControl><SelectTrigger><SelectValue placeholder={!selectedProgramIdCourse ? "Selecciona un programa primero" : "Asigna un ciclo..."}/></SelectTrigger></FormControl>
                                                            <SelectContent>
                                                                {cyclesForSelectedProgramCreate.map(cycleNum => (
                                                                    <SelectItem key={cycleNum} value={String(cycleNum)}>Ciclo {cycleNum}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <FormField control={courseForm.control} name="semesterStartDate" render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Fecha de Inicio del Semestre</FormLabel>
                                                            <FormControl><Input type="date" {...field} /></FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )} />
                                                    <FormField control={courseForm.control} name="semesterEndDate" render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Fecha de Fin del Semestre</FormLabel>
                                                            <FormControl><Input type="date" {...field} /></FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )} />
                                                </div>
                                                <FormField control={courseForm.control} name="instructorId" render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Instructor</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Asigna un instructor al curso..."/>
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {professors ? professors.map(prof => (
                                                                    <SelectItem key={prof.id} value={prof.id}>{prof.firstName} {prof.lastName}</SelectItem>
                                                                )) : <SelectItem value="loading" disabled>Cargando...</SelectItem>}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                                
                                                <div className="space-y-4 rounded-md border p-4">
                                                    <h4 className="font-medium flex items-center justify-between"><span className='flex items-center gap-2'><Clock /> Horario</span>
                                                        <Button type="button" variant="outline" size="sm" onClick={addScheduleRow}><PlusCircle className='mr-2'/> Añadir</Button>
                                                    </h4>
                                                    {schedule.map((session, index) => (
                                                        <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
                                                            <div className="space-y-1">
                                                                <Label>Día</Label>
                                                                <Select onValueChange={(value) => handleScheduleChange(index, 'day', value)} value={session.day}>
                                                                    <SelectTrigger><SelectValue placeholder="Día"/></SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="Lunes">Lunes</SelectItem>
                                                                        <SelectItem value="Martes">Martes</SelectItem>
                                                                        <SelectItem value="Miércoles">Miércoles</SelectItem>
                                                                        <SelectItem value="Jueves">Jueves</SelectItem>
                                                                        <SelectItem value="Viernes">Viernes</SelectItem>
                                                                        <SelectItem value="Sábado">Sábado</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <Label>Hora Inicio</Label>
                                                                <Input type="time" value={session.startTime} onChange={(e) => handleScheduleChange(index, 'startTime', e.target.value)} />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <Label>Hora Fin</Label>
                                                                <Input type="time" value={session.endTime} onChange={(e) => handleScheduleChange(index, 'endTime', e.target.value)} />
                                                            </div>
                                                            <div className="flex gap-1 items-center">
                                                                <div className='space-y-1 w-full'>
                                                                    <Label>Aula</Label>
                                                                    <Input placeholder="Ej: A-101" value={session.classroom} onChange={(e) => handleScheduleChange(index, 'classroom', e.target.value)} />
                                                                </div>
                                                                <Button type="button" variant="ghost" size="icon" onClick={() => removeScheduleRow(index)} disabled={schedule.length <= 1}><Trash2 className="text-destructive"/></Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                      <FormField control={courseForm.control} name="mode" render={({ field }) => (
                                                         <FormItem>
                                                            <FormLabel>Modalidad</FormLabel>
                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger><SelectValue placeholder="Selecciona..."/></SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="Presencial">Presencial</SelectItem>
                                                                    <SelectItem value="Online">Online</SelectItem>
                                                                    <SelectItem value="Híbrido">Híbrido</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )} />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Prerrequisitos</Label>
                                                    <Button variant="outline" disabled>Seleccionar cursos</Button>
                                                    <p className="text-xs text-muted-foreground">Funcionalidad para seleccionar prerrequisitos en desarrollo.</p>
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button variant="outline" type="button" onClick={() => setIsCreateDialogOpen(false)}>Cancelar</Button>
                                                <Button type="submit" disabled={courseForm.formState.isSubmitting}>
                                                    {courseForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                    Guardar Curso
                                                </Button>
                                            </DialogFooter>
                                        </form>
                                    </Form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Código</TableHead>
                                    <TableHead>Nombre del Curso</TableHead>
                                    <TableHead>Programa</TableHead>
                                    <TableHead>Ciclo</TableHead>
                                    <TableHead>Créditos</TableHead>
                                    <TableHead>Nivel</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                               {areCoursesLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center">
                                            <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                                        </TableCell>
                                    </TableRow>
                                ) : courses && courses.length > 0 ? (
                                    courses.map(course => (
                                        <TableRow key={course.id}>
                                            <TableCell className="font-mono">{course.courseId}</TableCell>
                                            <TableCell className="font-medium">{course.name}</TableCell>
                                            <TableCell>{programs?.find(p => p.id === course.programId)?.name || 'N/A'}</TableCell>
                                            <TableCell className="text-center">{course.cycle}</TableCell>
                                            <TableCell className="text-center">{course.credits}</TableCell>
                                            <TableCell>{course.level}</TableCell>
                                            <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <MoreHorizontal />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent>
                                                            <DropdownMenuItem><Eye className="mr-2"/>Ver Secciones</DropdownMenuItem>
                                                            <DropdownMenuItem onSelect={() => handleOpenEditDialog(course)}>
                                                                <Edit className="mr-2"/>Editar Curso
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem><PlusCircle className="mr-2"/>Crear Sección</DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="text-destructive" disabled><Trash2 className="mr-2"/>Desactivar</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center">No se encontraron cursos.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                            Mostrando {courses?.length || 0} de {courses?.length || 0} cursos.
                        </span>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" disabled>Anterior</Button>
                            <Button variant="outline" size="sm" disabled>Siguiente</Button>
                        </div>
                    </CardFooter>
                </Card>
            </TabsContent>
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-3xl">
                    <Form {...updateCourseForm}>
                        <form onSubmit={updateCourseForm.handleSubmit(onUpdateCourseSubmit)}>
                            <DialogHeader>
                                <DialogTitle>Editar Curso: {selectedCourse?.name}</DialogTitle>
                                <DialogDescription>Modifica la información principal del curso. { hasCourseStarted(selectedCourse) && <span className="text-destructive font-semibold">Este curso ya ha iniciado y no se puede editar.</span>}</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField control={updateCourseForm.control} name="courseId" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Código del Curso</FormLabel>
                                            <FormControl><Input {...field} disabled={hasCourseStarted(selectedCourse)} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                     <FormField control={updateCourseForm.control} name="name" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nombre del Curso</FormLabel>
                                            <FormControl><Input {...field} disabled={hasCourseStarted(selectedCourse)}/></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>
                                <FormField control={updateCourseForm.control} name="description" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Descripción Breve</FormLabel>
                                        <FormControl><Textarea {...field} disabled={hasCourseStarted(selectedCourse)} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <FormField control={updateCourseForm.control} name="credits" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Créditos</FormLabel>
                                            <FormControl><Input type="number" {...field} disabled={hasCourseStarted(selectedCourse)} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={updateCourseForm.control} name="capacity" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Capacidad</FormLabel>
                                            <FormControl><Input type="number" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={updateCourseForm.control} name="level" render={({ field }) => (
                                         <FormItem>
                                            <FormLabel>Nivel</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={hasCourseStarted(selectedCourse)}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Selecciona..."/></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Pregrado">Pregrado</SelectItem>
                                                    <SelectItem value="Postgrado">Postgrado</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <FormField control={updateCourseForm.control} name="facultyId" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Facultad</FormLabel>
                                            <Select onValueChange={(value) => { field.onChange(value); updateCourseForm.setValue('programId', ''); updateCourseForm.setValue('cycle', 1); }} value={field.value} disabled={hasCourseStarted(selectedCourse)}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Selecciona una facultad..."/></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    {faculties ? faculties.map(fac => (
                                                        <SelectItem key={fac.id} value={fac.id}>{fac.name}</SelectItem>
                                                    )) : <SelectItem value="loading" disabled>Cargando...</SelectItem>}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={updateCourseForm.control} name="programId" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Programa Académico</FormLabel>
                                            <Select onValueChange={(value) => { field.onChange(value); updateCourseForm.setValue('cycle', 1); }} value={field.value} disabled={!selectedFacultyIdUpdateCourse || hasCourseStarted(selectedCourse)}>
                                                <FormControl><SelectTrigger><SelectValue placeholder={!selectedFacultyIdUpdateCourse ? "Selecciona una facultad primero" : "Asigna un programa..."}/></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    {programs?.filter(p => p.facultyId === selectedFacultyIdUpdateCourse).map(prog => (
                                                        <SelectItem key={prog.id} value={prog.id}>{prog.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>
                                 <FormField control={updateCourseForm.control} name="cycle" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Ciclo</FormLabel>
                                        <Select onValueChange={field.onChange} value={String(field.value)} disabled={!selectedProgramIdUpdateCourse || hasCourseStarted(selectedCourse)}>
                                            <FormControl><SelectTrigger><SelectValue placeholder={!selectedProgramIdUpdateCourse ? "Selecciona un programa primero" : "Asigna un ciclo..."}/></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {cyclesForSelectedProgramUpdate.map(cycleNum => (
                                                    <SelectItem key={cycleNum} value={String(cycleNum)}>Ciclo {cycleNum}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField control={updateCourseForm.control} name="semesterStartDate" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Fecha de Inicio del Semestre</FormLabel>
                                            <FormControl><Input type="date" {...field} disabled={hasCourseStarted(selectedCourse)} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={updateCourseForm.control} name="semesterEndDate" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Fecha de Fin del Semestre</FormLabel>
                                            <FormControl><Input type="date" {...field} disabled={hasCourseStarted(selectedCourse)} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>
                                <FormField control={updateCourseForm.control} name="instructorId" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Instructor</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Asigna un instructor..."/></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {professors ? professors.map(prof => (
                                                    <SelectItem key={prof.id} value={prof.id}>{prof.firstName} {prof.lastName}</SelectItem>
                                                )) : <SelectItem value="loading" disabled>Cargando...</SelectItem>}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <div className="space-y-4 rounded-md border p-4">
                                    <h4 className="font-medium flex items-center justify-between"><span className='flex items-center gap-2'><Clock /> Horario</span>
                                        <Button type="button" variant="outline" size="sm" onClick={addScheduleRow} disabled={hasCourseStarted(selectedCourse)}><PlusCircle className='mr-2'/> Añadir</Button>
                                    </h4>
                                     {schedule.map((session, index) => (
                                        <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
                                            <div className="space-y-1">
                                                <Label>Día</Label>
                                                <Select onValueChange={(value) => handleScheduleChange(index, 'day', value)} value={session.day} disabled={hasCourseStarted(selectedCourse)}>
                                                    <SelectTrigger><SelectValue placeholder="Día"/></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Lunes">Lunes</SelectItem>
                                                        <SelectItem value="Martes">Martes</SelectItem>
                                                        <SelectItem value="Miércoles">Miércoles</SelectItem>
                                                        <SelectItem value="Jueves">Jueves</SelectItem>
                                                        <SelectItem value="Viernes">Viernes</SelectItem>
                                                        <SelectItem value="Sábado">Sábado</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-1">
                                                <Label>Hora Inicio</Label>
                                                <Input type="time" value={session.startTime} onChange={(e) => handleScheduleChange(index, 'startTime', e.target.value)} disabled={hasCourseStarted(selectedCourse)} />
                                            </div>
                                            <div className="space-y-1">
                                                <Label>Hora Fin</Label>
                                                <Input type="time" value={session.endTime} onChange={(e) => handleScheduleChange(index, 'endTime', e.target.value)} disabled={hasCourseStarted(selectedCourse)} />
                                            </div>
                                            <div className="flex gap-1 items-center">
                                                <div className='space-y-1 w-full'>
                                                    <Label>Aula</Label>
                                                    <Input placeholder="Ej: A-101" value={session.classroom} onChange={(e) => handleScheduleChange(index, 'classroom', e.target.value)} disabled={hasCourseStarted(selectedCourse)} />
                                                </div>
                                                <Button type="button" variant="ghost" size="icon" onClick={() => removeScheduleRow(index)} disabled={schedule.length <= 1 || hasCourseStarted(selectedCourse)}><Trash2 className="text-destructive"/></Button>
                                            </div>
                                        </div>
                                    ))}
                                    <FormField control={updateCourseForm.control} name="mode" render={({ field }) => (
                                         <FormItem>
                                            <FormLabel>Modalidad</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={hasCourseStarted(selectedCourse)}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Selecciona..."/></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Presencial">Presencial</SelectItem>
                                                    <SelectItem value="Online">Online</SelectItem>
                                                    <SelectItem value="Híbrido">Híbrido</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" type="button" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
                                <Button type="submit" disabled={updateCourseForm.formState.isSubmitting || hasCourseStarted(selectedCourse)}>
                                    {updateCourseForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Guardar Cambios
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
             </Dialog>
        </Tabs>
    );
  }

export default function CoursesPage() {
  const { profile } = useUser();

  const renderContent = () => {
    switch (profile?.role) {
      case 'student':
        return <StudentCoursesView />;
      case 'professor':
        return <ProfessorCoursesView />;
      case 'admin':
        return <AdminCoursesView />;
      default:
        return (
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-center items-center h-32">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
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
            <BookCopy className="text-primary" />
            {profile?.role === 'student' ? 'Mis Cursos' : 'Gestión Académica'}
          </h1>
          <p className="text-muted-foreground">
            {profile?.role === 'student'
              ? 'Accede a tus cursos y materiales de clase.'
              : 'Gestiona los cursos, secciones y estudiantes.'}
          </p>
        </div>
      </section>

      {renderContent()}
    </div>
  );
}
