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
import { GraduationCap, UserCog } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const gradesData = {
  semester: '2024-1',
  gpa: 3.8,
  courses: [
    {
      code: 'CS101',
      name: 'Introducción a la Programación',
      credits: 4,
      grade: 92,
      letter: 'A',
    },
    {
      code: 'MA203',
      name: 'Cálculo Avanzado',
      credits: 4,
      grade: 85,
      letter: 'B+',
    },
    {
      code: 'HI105',
      name: 'Historia del Siglo XX',
      credits: 3,
      grade: 88,
      letter: 'A-',
    },
    {
      code: 'PH210',
      name: 'Física Moderna',
      credits: 4,
      grade: 79,
      letter: 'C+',
    },
  ],
};

function StudentGradesView() {
  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Calificaciones del Semestre</CardTitle>
            <CardDescription>
              Resumen de tus calificaciones para el semestre actual:{' '}
              {gradesData.semester}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Curso</TableHead>
                  <TableHead className="text-center">Créditos</TableHead>
                  <TableHead className="text-right">Calificación</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gradesData.courses.map((course) => (
                  <TableRow key={course.code}>
                    <TableCell>
                      <div className="font-medium">{course.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {course.code}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {course.credits}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="font-bold">{course.grade}</span>
                        <Badge variant="secondary">{course.letter}</Badge>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <aside className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Resumen Académico</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Semestre Actual</span>
              <span className="font-bold">{gradesData.semester}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Promedio (GPA)</span>
              <span className="font-bold text-2xl text-primary">
                {gradesData.gpa.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">
                Créditos del Semestre
              </span>
              <span className="font-bold">
                {gradesData.courses.reduce((acc, c) => acc + c.credits, 0)}
              </span>
            </div>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

function AdminProfessorGradesView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Calificaciones</CardTitle>
        <CardDescription>
          Próximamente: Panel para ver, modificar y gestionar las
          calificaciones de los estudiantes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert>
          <UserCog className="h-4 w-4" />
          <AlertTitle>En Desarrollo</AlertTitle>
          <AlertDescription>
            Esta sección está siendo construida y pronto estará disponible para
            profesores y administradores. Aquí podrás gestionar las
            calificaciones de tus cursos.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

export default function GradesPage() {
  const { profile } = useUser();

  const renderContent = () => {
    switch (profile?.role) {
      case 'student':
        return <StudentGradesView />;
      case 'professor':
      case 'admin':
        return <AdminProfessorGradesView />;
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
              <GraduationCap className="text-primary" />
              Calificaciones y Expediente
            </h1>
            <p className="text-muted-foreground">
              {profile?.role === 'student'
                ? 'Consulta tus calificaciones, promedio y progreso académico.'
                : 'Gestiona las calificaciones y expedientes de los estudiantes.'}
            </p>
          </div>
        </div>
      </section>

      {renderContent()}
    </div>
  );
}
