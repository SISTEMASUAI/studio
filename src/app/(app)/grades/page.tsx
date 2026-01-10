'use client';

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
import { GraduationCap } from 'lucide-react';

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

function getGradeColor(grade: number) {
  if (grade >= 90) return 'bg-green-100 text-green-800';
  if (grade >= 80) return 'bg-blue-100 text-blue-800';
  if (grade >= 70) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
}

export default function GradesPage() {
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
              Consulta tus calificaciones, promedio y progreso académico.
            </p>
          </div>
        </div>
      </section>

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
                          <Badge className={getGradeColor(course.grade)}>
                            {course.letter}
                          </Badge>
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
                        <span className="font-bold text-2xl text-primary">{gradesData.gpa.toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Créditos del Semestre</span>
                        <span className="font-bold">{gradesData.courses.reduce((acc, c) => acc + c.credits, 0)}</span>
                    </div>
                </CardContent>
            </Card>
        </aside>
      </div>
    </div>
  );
}
