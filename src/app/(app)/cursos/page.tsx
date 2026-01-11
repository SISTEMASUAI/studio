
'use client';

import { useUser } from '@/firebase';
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
  BookCopy,
  PlusCircle,
  BarChart,
  UserCog,
  ArrowRight,
  Edit,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const courses = [
  {
    id: 'course-1',
    name: 'Introducción al Desarrollo Web',
    professor: 'Dr. Alan Turing',
    progress: 75,
  },
  {
    id: 'course-2',
    name: 'Estrategias de Marketing Avanzado',
    professor: 'Dra. Ada Lovelace',
    progress: 40,
  },
  {
    id: 'course-3',
    name: 'Fundamentos de Diseño Gráfico',
    professor: 'Dr. Tim Berners-Lee',
    progress: 90,
  },
];

const allCourses = [
  ...courses,
  {
    id: 'course-4',
    name: 'Ciencia de Datos con Python',
    professor: 'Dr. Guido van Rossum',
    students: 45,
  },
];

function StudentCoursesView() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => {
        const image = PlaceHolderImages.find(p => p.id === course.id);
        return (
            <Card key={course.id} className="flex flex-col">
              {image && (
                <Image
                  src={image.imageUrl}
                  alt={course.name}
                  width={400}
                  height={200}
                  className="w-full h-40 object-cover rounded-t-lg"
                  data-ai-hint={image.imageHint}
                />
              )}
              <CardHeader>
                <CardTitle>{course.name}</CardTitle>
                <CardDescription>{course.professor}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                {/* Future content like progress bar can go here */}
              </CardContent>
              <CardFooter>
                <Button className="w-full">
                  Ver Curso <ArrowRight className="ml-2" />
                </Button>
              </CardFooter>
            </Card>
        )
      })}
    </div>
  );
}

function ProfessorCoursesView() {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Mis Cursos Impartidos</h2>
            <Button>
                <PlusCircle className="mr-2" /> Crear Nuevo Curso
            </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.slice(0, 2).map((course) => (
                 <Card key={course.id} className="flex flex-col">
                     <CardHeader>
                         <CardTitle>{course.name}</CardTitle>
                         <CardDescription>Semestre 2024-2</CardDescription>
                     </CardHeader>
                     <CardContent className="flex-grow">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm"><Users /> 35 Estudiantes</div>
                     </CardContent>
                     <CardFooter className="flex gap-2">
                        <Button className="w-full" variant="outline"><Edit className="mr-2"/> Editar</Button>
                        <Button className="w-full">Gestionar</Button>
                     </CardFooter>
                 </Card>
            ))}
        </div>
      </div>
    );
  }

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
      </CardHeader>
      <CardContent>
        <Alert>
            <UserCog className="h-4 w-4" />
            <AlertTitle>En Desarrollo</AlertTitle>
            <AlertDescription>
                Las funcionalidades avanzadas para la administración de cursos,
                incluyendo la gestión de asignaturas y la asignación de profesores, estarán disponibles próximamente.
            </AlertDescription>
        </Alert>
      </CardContent>
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
              <p>Cargando información del usuario...</p>
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
            Mis Cursos
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
