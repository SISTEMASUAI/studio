'use client';

import { useUser, useCollection, useMemoFirebase, useFirestore, addDocumentNonBlocking } from '@/firebase';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import Image from 'next/image';
import { collection, query, where, DocumentData } from 'firebase/firestore';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

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
    department: string;
    level: string;
    instructorId: string;
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

    const { data: courses, isLoading, error } = useCollection<DocumentData>(coursesQuery);

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
            <Dialog>
                <DialogTrigger asChild>
                    <Button><PlusCircle className="mr-2" /> Crear Nuevo Curso</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Crear Curso</DialogTitle>
                        <DialogDescription>Esta función está en desarrollo.</DialogDescription>
                    </DialogHeader>
                    <Alert>
                        <UserCog className="h-4 w-4" />
                        <AlertTitle>En Desarrollo</AlertTitle>
                        <AlertDescription>
                            La lógica para guardar el nuevo curso en la base de datos se implementará próximamente.
                        </AlertDescription>
                    </Alert>
                    <DialogFooter>
                        <Button variant="outline">Cancelar</Button>
                        <Button disabled>Guardar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
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
                         <CardDescription>Semestre {enrollments?.find(e => e.courseId === course.id)?.semester} - {enrollments?.find(e => e.courseId === course.id)?.year}</CardDescription>
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

const allStudentsData = [
    { id: 'STU-001', name: 'García, Ana', program: 'Ingeniería de Software', semester: 5, gpa: 3.8, status: 'Regular' },
    { id: 'STU-002', name: 'Pérez, Juan', program: 'Administración de Empresas', semester: 3, gpa: 3.2, status: 'Regular' },
    { id: 'STU-003', name: 'Martínez, Luis', program: 'Derecho', semester: 8, gpa: 2.9, status: 'Probatorio' },
    { id: 'STU-004', name: 'Rodríguez, María', program: 'Ingeniería de Software', semester: 5, gpa: 4.0, status: 'Honor' },
]

const CreateCourseSchema = z.object({
  courseId: z.string().min(3, "El código debe tener al menos 3 caracteres."),
  name: z.string().min(5, "El nombre debe tener al menos 5 caracteres."),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres."),
  credits: z.coerce.number().min(1, "Debe tener al menos 1 crédito."),
  department: z.string().min(1, "Debe seleccionar un departamento."),
  level: z.string().min(1, "Debe seleccionar un nivel."),
  instructorId: z.string().min(1, "Debe seleccionar un instructor."),
});


function AdminCoursesView() {
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const firestore = useFirestore();

    const professorsQuery = useMemoFirebase(() => 
        firestore ? query(collection(firestore, 'users'), where('role', '==', 'professor')) : null,
    [firestore]);

    const { data: professors } = useCollection(professorsQuery);

    const coursesQuery = useMemoFirebase(() => 
        firestore ? collection(firestore, 'courses') : null,
    [firestore]);
    const { data: courses, isLoading: areCoursesLoading } = useCollection<Course>(coursesQuery);


    const form = useForm<z.infer<typeof CreateCourseSchema>>({
        resolver: zodResolver(CreateCourseSchema),
        defaultValues: {
            courseId: '',
            name: '',
            description: '',
            credits: 1,
            department: '',
            level: 'Pregrado',
            instructorId: ''
        },
    });

    async function onSubmit(values: z.infer<typeof CreateCourseSchema>) {
        if (!firestore) return;
        
        try {
            const courseCollection = collection(firestore, 'courses');
            
            await addDocumentNonBlocking(courseCollection, {
                ...values,
                schedule: [],
                mode: "Presencial",
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
            form.reset();
            setIsDialogOpen(false);
        } catch (error) {
            console.error("Error creating course: ", error);
            toast({
                variant: "destructive",
                title: "Error al crear el curso",
                description: "Hubo un problema al guardar el curso. Por favor, inténtalo de nuevo.",
            });
        }
    }


    return (
        <Tabs defaultValue="courses">
            <TabsList>
                <TabsTrigger value="courses"><Book /> Gestión de Cursos</TabsTrigger>
                <TabsTrigger value="students"><Users /> Gestión de Alumnos</TabsTrigger>
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
                            <Select>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Departamento" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cs">Ciencias de la Computación</SelectItem>
                                    <SelectItem value="math">Matemáticas</SelectItem>
                                    <SelectItem value="humanities">Humanidades</SelectItem>
                                    <SelectItem value="finance">Economía y Finanzas</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select>
                                <SelectTrigger className="w-full sm:w-[150px]">
                                    <SelectValue placeholder="Nivel" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="undergrad">Pregrado</SelectItem>
                                    <SelectItem value="postgrad">Postgrado</SelectItem>
                                </SelectContent>
                            </Select>
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="w-full sm:w-auto">
                                        <PlusCircle className="mr-2" /> Crear Curso
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-3xl">
                                    <Form {...form}>
                                        <form onSubmit={form.handleSubmit(onSubmit)}>
                                            <DialogHeader>
                                                <DialogTitle>Crear Nuevo Curso</DialogTitle>
                                                <DialogDescription>Completa el formulario para registrar un nuevo curso en el sistema.</DialogDescription>
                                            </DialogHeader>
                                            <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <FormField control={form.control} name="courseId" render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Código del Curso</FormLabel>
                                                            <FormControl><Input placeholder="Ej: CS-101" {...field} /></FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )} />
                                                    <FormField control={form.control} name="name" render={({ field }) => (
                                                         <FormItem>
                                                            <FormLabel>Nombre del Curso</FormLabel>
                                                            <FormControl><Input placeholder="Introducción a la Programación" {...field} /></FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )} />
                                                </div>
                                                <FormField control={form.control} name="description" render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Descripción Breve</FormLabel>
                                                        <FormControl><Textarea placeholder="Describe el curso en una o dos frases." {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <FormField control={form.control} name="credits" render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Créditos</FormLabel>
                                                            <FormControl><Input type="number" placeholder="4" {...field} /></FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )} />
                                                    <FormField control={form.control} name="department" render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Departamento</FormLabel>
                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger><SelectValue placeholder="Selecciona..."/></SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="Ciencias de la Computación">Ciencias de la Computación</SelectItem>
                                                                    <SelectItem value="Matemáticas">Matemáticas</SelectItem>
                                                                    <SelectItem value="Humanidades">Humanidades</SelectItem>
                                                                    <SelectItem value="Economía y Finanzas">Economía y Finanzas</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )} />
                                                    <FormField control={form.control} name="level" render={({ field }) => (
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
                                                <FormField control={form.control} name="instructorId" render={({ field }) => (
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
                                                <div className="space-y-2">
                                                    <Label>Prerrequisitos</Label>
                                                    <Button variant="outline" disabled>Seleccionar cursos</Button>
                                                    <p className="text-xs text-muted-foreground">Funcionalidad para seleccionar prerrequisitos en desarrollo.</p>
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                                                <Button type="submit" disabled={form.formState.isSubmitting}>
                                                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
                                    <TableHead>Departamento</TableHead>
                                    <TableHead>Créditos</TableHead>
                                    <TableHead>Nivel</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                               {areCoursesLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center">
                                            <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                                        </TableCell>
                                    </TableRow>
                                ) : courses && courses.length > 0 ? (
                                    courses.map(course => (
                                        <TableRow key={course.id}>
                                            <TableCell className="font-mono">{course.courseId}</TableCell>
                                            <TableCell className="font-medium">{course.name}</TableCell>
                                            <TableCell>{course.department}</TableCell>
                                            <TableCell>{course.credits}</TableCell>
                                            <TableCell>{course.level}</TableCell>
                                            <TableCell className="text-right">
                                                <Dialog>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <MoreHorizontal />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent>
                                                            <DropdownMenuItem><Eye className="mr-2"/>Ver Secciones</DropdownMenuItem>
                                                            <DialogTrigger asChild>
                                                                <DropdownMenuItem><Edit className="mr-2"/>Editar Curso</DropdownMenuItem>
                                                            </DialogTrigger>
                                                            <DropdownMenuSeparator />
                                                            <DialogTrigger asChild>
                                                                <DropdownMenuItem><PlusCircle className="mr-2"/>Crear Sección</DropdownMenuItem>
                                                            </DialogTrigger>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2"/>Desactivar</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                    <DialogContent className="sm:max-w-3xl">
                                                        <DialogHeader>
                                                            <DialogTitle>Editar Curso: {course.name}</DialogTitle>
                                                            <DialogDescription>Modifica la información principal del curso.</DialogDescription>
                                                        </DialogHeader>
                                                        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
                                                            {/* Form content for editing a course */}
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div className="space-y-2">
                                                                    <Label>Código del Curso</Label>
                                                                    <Input defaultValue={course.courseId} />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label>Nombre del Curso</Label>
                                                                    <Input defaultValue={course.name} />
                                                                </div>
                                                            </div>
                                                            <Alert>
                                                                <UserCog className="h-4 w-4" />
                                                                <AlertTitle>En Desarrollo</AlertTitle>
                                                                <AlertDescription>
                                                                    La lógica para guardar los cambios en la base de datos se implementará próximamente.
                                                                </AlertDescription>
                                                            </Alert>
                                                        </div>
                                                        <DialogFooter>
                                                            <Button variant="outline">Cancelar</Button>
                                                            <Button disabled><Edit className="mr-2"/> Guardar Cambios</Button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center">No se encontraron cursos.</TableCell>
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
            <TabsContent value="students" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><User /> Gestión de Alumnos</CardTitle>
                        <CardDescription>Busca, visualiza y gestiona la información académica de los estudiantes.</CardDescription>
                         <div className="flex flex-col sm:flex-row gap-2 pt-4">
                            <div className="relative flex-grow">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Buscar por matrícula o nombre..." className="pl-9" />
                            </div>
                            <Select>
                                <SelectTrigger className="w-full sm:w-[220px]">
                                    <SelectValue placeholder="Filtrar por programa" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="swe">Ingeniería de Software</SelectItem>
                                    <SelectItem value="ba">Administración de Empresas</SelectItem>
                                    <SelectItem value="law">Derecho</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Filtrar por estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="regular">Regular</SelectItem>
                                    <SelectItem value="probation">Probatorio</SelectItem>
                                    <SelectItem value="honor">Honor</SelectItem>
                                </SelectContent>
                            </Select>
                         </div>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Matrícula</TableHead>
                                    <TableHead>Nombre Completo</TableHead>
                                    <TableHead>Programa</TableHead>
                                    <TableHead className="text-center">Semestre</TableHead>
                                    <TableHead className="text-center">GPA</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {allStudentsData.map(student => (
                                    <TableRow key={student.id}>
                                        <TableCell className="font-mono">{student.id}</TableCell>
                                        <TableCell className="font-medium">{student.name}</TableCell>
                                        <TableCell>{student.program}</TableCell>
                                        <TableCell className="text-center">{student.semester}</TableCell>
                                        <TableCell className="text-center">{student.gpa.toFixed(2)}</TableCell>
                                        <TableCell><Badge variant={student.status === 'Regular' ? 'secondary' : student.status === 'Honor' ? 'default' : 'destructive'}>{student.status}</Badge></TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm">Ver Detalles</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                         <Alert className="mt-6">
                            <UserCog className="h-4 w-4" />
                            <AlertTitle>En Desarrollo</AlertTitle>
                            <AlertDescription>
                                La vista detallada de cada estudiante, junto con las acciones de gestión (inscripción forzosa, retiro, modificación de GPA), se implementará próximamente.
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            </TabsContent>
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
