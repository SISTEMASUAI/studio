'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Info, BookMarked, Users, UserCheck, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, CheckCircle, XCircle, Library, BookOpen } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';

import { AttendanceRecord } from '@/types/course';

// Datos mock temporales (solo para bibliography y prerequisites de ejemplo)
const approvedPrerequisites = ['CS101'];
const bibliography = [
  { id: '1', text: 'Clean Code - Robert C. Martin', available: true, digital: true },
  { id: '2', text: 'Design Patterns - Gamma et al.', available: true, digital: false },
];

interface CourseInfoTabsProps {
  course?: any;                    // opcional – solo se usa en descripción y contenido
  attendance: AttendanceRecord[];
  isAttendanceLoading?: boolean;
}

export default function CourseInfoTabs({
  course,
  attendance = [],
  isAttendanceLoading = false,
}: CourseInfoTabsProps) {
  // Cálculos para el resumen de asistencia
  const totalSessions = attendance.length;
  const presentCount = attendance.filter(a => a.status === 'presente' || a.status === 'justificado').length;
  const lateCount = attendance.filter(a => a.status === 'tarde').length;
  const absentCount = attendance.filter(a => a.status === 'ausente').length;

  const attendancePercentage = totalSessions > 0
    ? Math.round(((presentCount + lateCount) / totalSessions) * 100)
    : 100;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'presente':
        return <Badge className="bg-green-600 hover:bg-green-700">Presente</Badge>;
      case 'tarde':
        return <Badge variant="secondary" className="bg-yellow-500 hover:bg-yellow-600 text-white">Tarde</Badge>;
      case 'ausente':
        return <Badge variant="destructive">Ausente</Badge>;
      case 'justificado':
        return <Badge variant="outline">Justificado</Badge>;
      default:
        return <Badge variant="secondary">{status || 'Sin estado'}</Badge>;
    }
  };

  return (
    <Tabs defaultValue="description" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="description">
          <Info className="mr-2 h-4 w-4" /> Descripción
        </TabsTrigger>
        <TabsTrigger value="content">
          <BookMarked className="mr-2 h-4 w-4" /> Contenido
        </TabsTrigger>
        <TabsTrigger value="classmates">
          <Users className="mr-2 h-4 w-4" /> Compañeros
        </TabsTrigger>
        <TabsTrigger value="attendance">
          <UserCheck className="mr-2 h-4 w-4" /> Asistencia
        </TabsTrigger>
      </TabsList>

      {/* Descripción */}
      <TabsContent value="description" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Descripción del Curso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-muted-foreground">
                {course?.description || 'Sin descripción disponible.'}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Metodología</h3>
              <p className="text-muted-foreground">
                {course?.methodology || 'No especificada.'}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Prerrequisitos</h3>
              {course?.prerequisites?.length ? (
                <ul className="space-y-2">
                  {course.prerequisites.map((prereq: string) => (
                    <li key={prereq} className="flex items-center gap-2">
                      {approvedPrerequisites.includes(prereq) ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                      <span>{prereq}</span>
                      {approvedPrerequisites.includes(prereq) && (
                        <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
                          Aprobado
                        </Badge>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No hay prerrequisitos definidos.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Contenido y Objetivos */}
      <TabsContent value="content" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Contenido y Objetivos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Objetivos de Aprendizaje</h3>
              {course?.objectives?.length ? (
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  {course.objectives.map((obj: string, i: number) => (
                    <li key={i}>{obj}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No se han especificado objetivos.</p>
              )}
            </div>

            <div>
              <h3 className="font-semibold mb-3">Syllabus y Bibliografía</h3>
              {course?.syllabusUrl ? (
                <Button asChild variant="outline">
                  <a href={course.syllabusUrl} target="_blank" rel="noopener noreferrer">
                    <FileText className="mr-2 h-4 w-4" />
                    Descargar Syllabus (PDF)
                  </a>
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground">Syllabus no disponible actualmente.</p>
              )}

              <div className="mt-6">
                <h4 className="font-medium mb-3">Bibliografía recomendada</h4>
                <ul className="space-y-4">
                  {bibliography.map((item) => (
                    <li key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <p className="text-muted-foreground">{item.text}</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" disabled={!item.available}>
                          <Library className="mr-2 h-4 w-4" />
                          {item.available ? 'Disponible' : 'No disponible'}
                        </Button>
                        <Button size="sm" disabled={!item.digital}>
                          <BookOpen className="mr-2 h-4 w-4" />
                          Digital
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

      {/* Compañeros */}
      <TabsContent value="classmates" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Compañeros de Clase</CardTitle>
            <CardDescription>Estudiantes inscritos en este curso</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-8 text-center text-muted-foreground">
              <Users className="mx-auto h-10 w-10 mb-4 opacity-70" />
              <p className="mb-2">Lista de compañeros</p>
              <p className="text-sm">
                Funcionalidad en desarrollo – pronto mostrará la lista real de estudiantes inscritos
                (con privacidad respetada).
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Asistencia – NO depende de course */}
      <TabsContent value="attendance" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" /> Mi Asistencia
            </CardTitle>
            <CardDescription>Registro de presentes, tardanzas e inasistencias</CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            {isAttendanceLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : totalSessions === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <UserCheck className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>Aún no hay registros de asistencia para este curso.</p>
              </div>
            ) : (
              <>
                {/* Resumen */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center">
                    <div>
                      <p className="text-sm font-medium mb-1">Porcentaje de asistencia</p>
                      <div className="flex items-center gap-3">
                        <Progress
                          value={attendancePercentage}
                          className="h-3 w-40"
                          indicatorClassName={
                            attendancePercentage >= 80
                              ? 'bg-green-500'
                              : attendancePercentage >= 60
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }
                        />
                        <span className="font-bold text-lg">{attendancePercentage}%</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-6 text-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Presente</p>
                        <p className="text-xl font-bold text-green-600">{presentCount}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Tarde</p>
                        <p className="text-xl font-bold text-yellow-600">{lateCount}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Ausente</p>
                        <p className="text-xl font-bold text-red-600">{absentCount}</p>
                      </div>
                    </div>
                  </div>

                  {attendancePercentage < 80 && (
                    <p className="text-sm text-destructive flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4" />
                      Atención: porcentaje por debajo del mínimo recomendado
                    </p>
                  )}
                </div>

                {/* Tabla */}
                <div>
                  <h3 className="font-semibold mb-3">Historial detallado</h3>
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Estado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {attendance.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell className="font-medium whitespace-nowrap">
                              {record.date}
                            </TableCell>
                            <TableCell>{getStatusBadge(record.status)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}