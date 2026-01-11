

'use client';

import { useUser } from '@/firebase';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
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
    ClipboardList,
  FilePenLine,
  UserCog,
  BookOpenCheck,
  PlusCircle,
  MinusCircle,
  Clock,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

const availableCourses = [
  {
    code: 'CS404',
    name: 'Algoritmos Avanzados',
    credits: 4,
    enrolled: 25,
    capacity: 30,
    professor: 'Dr. Alan Turing',
  },
  {
    code: 'HI202',
    name: 'Historia de la Tecnología',
    credits: 3,
    enrolled: 48,
    capacity: 50,
    professor: 'Dra. Ada Lovelace',
  },
  {
    code: 'MA501',
    name: 'Matemáticas Discretas II',
    credits: 4,
    enrolled: 30,
    capacity: 30,
    professor: 'Dr. John von Neumann',
  },
];

const enrolledCourses = [
  {
    code: 'CS101',
    name: 'Introducción a la Programación',
    credits: 4,
    professor: 'Dr. Guido van Rossum',
  },
  {
    code: 'MA203',
    name: 'Cálculo Avanzado',
    credits: 4,
    professor: 'Dr. Isaac Newton',
  },
];

function StudentEnrollmentView() {
  const isEnrollmentPeriod = true; // Placeholder

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpenCheck /> Cursos Disponibles
          </CardTitle>
          <CardDescription>
            Explora y inscríbete en las asignaturas para el próximo semestre.
            {isEnrollmentPeriod ? (
              <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">Período de Matrícula Abierto</Badge>
            ) : (
                <Badge variant="destructive" className="ml-2">Período de Matrícula Cerrado</Badge>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Curso</TableHead>
                <TableHead className="text-center">Cupos</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {availableCourses.map((course) => (
                <TableRow key={course.code}>
                  <TableCell>
                    <div className="font-medium">{course.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {course.code} - {course.credits} créditos
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{`${course.enrolled}/${course.capacity}`}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" disabled={!isEnrollmentPeriod || course.enrolled >= course.capacity}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Inscribir
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList /> Mis Asignaturas
          </CardTitle>
          <CardDescription>
            Asignaturas en las que estás inscrito actualmente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Curso</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrolledCourses.map((course) => (
                <TableRow key={course.code}>
                  <TableCell>
                    <div className="font-medium">{course.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {course.code} - {course.credits} créditos
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" disabled={!isEnrollmentPeriod}>
                      <MinusCircle className="mr-2 h-4 w-4" />
                      Dar de Baja
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function AdminEnrollmentView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Matrícula</CardTitle>
        <CardDescription>
          Panel para gestionar cupos, aprobar inscripciones y habilitar períodos de matrícula.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert>
          <UserCog className="h-4 w-4" />
          <AlertTitle>En Desarrollo</AlertTitle>
          <AlertDescription>
            Esta sección está en construcción y pronto permitirá la gestión completa del proceso de matrícula.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

function ProfessorEnrollmentView() {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Matrícula de Cursos</CardTitle>
          <CardDescription>
            Este panel es para la gestión de matrícula por parte de alumnos y administradores.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="default">
            <Clock className="h-4 w-4" />
            <AlertTitle>No hay acciones disponibles</AlertTitle>
            <AlertDescription>
              Los docentes no tienen acciones directas en el proceso de matrícula desde este panel. Podrás ver tus listas de clase en la sección de cursos.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

export default function EnrollmentPage() {
  const { profile } = useUser();

  const renderContent = () => {
    switch (profile?.role) {
      case 'student':
        return <StudentEnrollmentView />;
      case 'admin':
        return <AdminEnrollmentView />;
      case 'professor':
        return <ProfessorEnrollmentView />;
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
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
              <FilePenLine className="text-primary" />
              Matrícula y Gestión de Asignaturas
            </h1>
            <p className="text-muted-foreground">
              {profile?.role === 'student'
                ? 'Inscribe, da de baja y gestiona tus asignaturas.'
                : 'Gestiona el proceso de matrícula de la universidad.'}
            </p>
          </div>
        </div>
      </section>

      {renderContent()}
    </div>
  );
}
