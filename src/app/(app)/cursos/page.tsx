'use client';

import { useUser, useCollection, useMemoFirebase, useFirestore } from '@/firebase';
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { collection, query, where, DocumentData } from 'firebase/firestore';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// Define the type for the enrollment data we expect from Firestore
interface Enrollment {
  id: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  professorId: string;
  professorName: string;
  semester: string;
  year: number;
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
    return <p>No estás inscrito en ningún curso este semestre.</p>;
  }


  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {enrollments.map((enrollment) => {
        const image = PlaceHolderImages.find(p => p.id === enrollment.courseId);
        return (
            <Card key={enrollment.id} className="flex flex-col">
              {image && (
                <Image
                  src={image.imageUrl}
                  alt={enrollment.courseName}
                  width={400}
                  height={200}
                  className="w-full h-40 object-cover rounded-t-lg"
                  data-ai-hint={image.imageHint}
                />
              )}
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
        // This is not optimal, we should query courses directly
        return query(collection(firestore, 'enrollments'), where('professorId', '==', user.uid));
    }, [firestore, user]);

    const { data: courses, isLoading, error } = useCollection<Enrollment>(coursesQuery);

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (error) {
        return <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>No se pudieron cargar los cursos.</AlertDescription></Alert>;
    }
    
    // Aggregate courses to show a unique list
    const uniqueCourses = courses ? Array.from(new Map(courses.map(c => [c.courseId, c])).values()) : [];


    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Mis Cursos Impartidos</h2>
            <Button disabled>
                <PlusCircle className="mr-2" /> Crear Nuevo Curso
            </Button>
        </div>
        {uniqueCourses.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {uniqueCourses.map((course) => (
                 <Card key={course.courseId} className="flex flex-col">
                     <CardHeader>
                         <CardTitle>{course.courseName}</CardTitle>
                         <CardDescription>Semestre {course.semester} - {course.year}</CardDescription>
                     </CardHeader>
                     <CardContent className="flex-grow">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            <Users /> 
                            {/* This is a placeholder count */}
                            {courses?.filter(c => c.courseId === course.courseId).length} Estudiantes
                        </div>
                     </CardContent>
                     <CardFooter className="flex gap-2">
                        <Button asChild className="w-full">
                           <Link href={`/cursos/${course.courseId}`}>
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

  const allCoursesData = [
    { id: 'CRS-001', code: 'CS101', name: 'Introducción a la Programación', department: 'Ciencias de la Computación', credits: 4, level: 'Pregrado', sections: 5 },
    { id: 'CRS-002', code: 'MA203', name: 'Cálculo Avanzado', department: 'Matemáticas', credits: 4, level: 'Pregrado', sections: 3 },
    { id: 'CRS-003', code: 'HI105', name: 'Historia del Siglo XX', department: 'Humanidades', credits: 3, level: 'Pregrado', sections: 8 },
    { id: 'CRS-004', code: 'DS501', name: 'Machine Learning Aplicado', department: 'Ciencias de la Computación', credits: 4, level: 'Postgrado', sections: 2 },
    { id: 'CRS-005', code: 'FIN310', name: 'Mercados Financieros', department: 'Economía y Finanzas', credits: 3, level: 'Pregrado', sections: 4 },
];

function AdminCoursesView() {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog /> Gestión de Cursos
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
            <Dialog>
                <DialogTrigger asChild>
                    <Button className="w-full sm:w-auto">
                        <PlusCircle className="mr-2" /> Crear Curso
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Crear Nuevo Curso</DialogTitle>
                        <DialogDescription>Completa el formulario para registrar un nuevo curso en el sistema.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Código del Curso</Label>
                                <Input placeholder="Ej: CS-101" />
                            </div>
                             <div className="space-y-2">
                                <Label>Nombre del Curso</Label>
                                <Input placeholder="Introducción a la Programación" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Descripción Breve</Label>
                            <Textarea placeholder="Describe el curso en una o dos frases." />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Créditos</Label>
                                <Input type="number" placeholder="4" />
                            </div>
                             <div className="space-y-2">
                                <Label>Departamento</Label>
                                <Select>
                                    <SelectTrigger><SelectValue placeholder="Selecciona..."/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cs">Ciencias de la Computación</SelectItem>
                                        <SelectItem value="math">Matemáticas</SelectItem>
                                        <SelectItem value="humanities">Humanidades</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="space-y-2">
                                <Label>Nivel</Label>
                                <Select>
                                    <SelectTrigger><SelectValue placeholder="Selecciona..."/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Pregrado">Pregrado</SelectItem>
                                        <SelectItem value="Postgrado">Postgrado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label>Prerrequisitos</Label>
                            <Button variant="outline" disabled>Seleccionar cursos</Button>
                            <p className="text-xs text-muted-foreground">Funcionalidad para seleccionar prerrequisitos en desarrollo.</p>
                        </div>
                        <Alert>
                            <UserCog className="h-4 w-4" />
                            <AlertTitle>En Desarrollo</AlertTitle>
                            <AlertDescription>
                                La lógica para guardar el nuevo curso en la base de datos se implementará próximamente.
                            </AlertDescription>
                        </Alert>
                    </div>
                    <DialogFooter>
                        <Button variant="outline">Cancelar</Button>
                        <Button disabled><PlusCircle className="mr-2"/> Guardar Curso</Button>
                    </DialogFooter>
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
                        <TableHead className="text-center">Secciones</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {allCoursesData.map(course => (
                        <TableRow key={course.code}>
                            <TableCell className="font-mono">{course.code}</TableCell>
                            <TableCell className="font-medium">{course.name}</TableCell>
                            <TableCell>{course.department}</TableCell>
                            <TableCell>{course.credits}</TableCell>
                            <TableCell>{course.level}</TableCell>
                            <TableCell className="text-center">{course.sections}</TableCell>
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
                                            <DropdownMenuItem><Edit className="mr-2"/>Editar Curso</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DialogTrigger asChild>
                                                <DropdownMenuItem><PlusCircle className="mr-2"/>Crear Sección</DropdownMenuItem>
                                            </DialogTrigger>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2"/>Desactivar</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Crear Sección para "{course.name}"</DialogTitle>
                                            <DialogDescription>Configura los detalles para la nueva sección de este curso.</DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                    <Label>N° de Sección</Label>
                                                    <Input placeholder="Ej: A1" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Semestre</Label>
                                                    <Input placeholder="2024-2" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Año</Label>
                                                    <Input type="number" placeholder="2024" />
                                                </div>
                                            </div>
                                             <div className="grid grid-cols-2 gap-4">
                                                 <div className="space-y-2">
                                                    <Label>Profesor</Label>
                                                    <Select>
                                                        <SelectTrigger><SelectValue placeholder="Asignar profesor..."/></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="prof1">Dr. Alan Turing</SelectItem>
                                                            <SelectItem value="prof2">Dra. Ada Lovelace</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                 <div className="space-y-2">
                                                    <Label>Capacidad</Label>
                                                    <Input type="number" placeholder="30" />
                                                </div>
                                             </div>
                                            <div className="space-y-2">
                                                <Label>Horario</Label>
                                                <Button variant="outline" disabled>Configurar Horario</Button>
                                                <p className="text-xs text-muted-foreground">La interfaz de gestión de horarios se implementará próximamente.</p>
                                            </div>
                                            <Alert>
                                                <UserCog className="h-4 w-4" />
                                                <AlertTitle>En Desarrollo</AlertTitle>
                                                <AlertDescription>La lógica para guardar la sección se implementará próximamente.</AlertDescription>
                                            </Alert>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline">Cancelar</Button>
                                            <Button disabled><PlusCircle className="mr-2"/>Guardar Sección</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
         <CardFooter className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
                Mostrando {allCoursesData.length} de {allCoursesData.length} cursos.
            </span>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>Anterior</Button>
                <Button variant="outline" size="sm" disabled>Siguiente</Button>
            </div>
        </CardFooter>
      </Card>
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
            {profile?.role === 'student' ? 'Mis Cursos' : 'Gestión de Cursos'}
          </h1>
          <p className="text-muted-foreground">
            {profile?.role === 'student'
              ? 'Accede a tus cursos y materiales de clase.'
              : 'Gestiona los cursos y asignaturas.'}
          </p>
        </div>
      </section>

      {renderContent()}
    </div>
  );
}
