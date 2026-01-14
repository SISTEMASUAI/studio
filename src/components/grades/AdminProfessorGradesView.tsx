'use client';

import { useUser } from '@/firebase';
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
  UserCog,
  BookOpen,
  PlusCircle,
  Upload,
  BarChart,
  File,
  Settings2,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

const professorGradebookData = {
    students: [
        { id: 'S001', name: 'García, Ana' },
        { id: 'S002', name: 'Pérez, Juan' },
        { id: 'S003', name: 'Martínez, Luis' },
    ],
    evaluations: [
        { name: 'Tarea 1', maxScore: 20 },
        { name: 'Parcial 1', maxScore: 20 },
        { name: 'Tarea 2', maxScore: 20 },
    ],
    grades: {
        'S001': { 'Tarea 1': 18, 'Parcial 1': 16, 'Tarea 2': 19 },
        'S002': { 'Tarea 1': 15, 'Parcial 1': 14, 'Tarea 2': null },
        'S003': { 'Tarea 1': 12, 'Parcial 1': 11, 'Tarea 2': 14 },
    }
}

export default function AdminProfessorGradesView() {
    const { profile } = useUser();
    const isAdmin = profile?.role === 'admin';

    const calculateFinalGrade = (studentId: string) => {
        const grades = professorGradebookData.grades[studentId as keyof typeof professorGradebookData.grades];
        const evalScores = Object.values(grades).filter(g => g !== null) as number[];
        if (evalScores.length === 0) return '--';
        const avg = evalScores.reduce((acc, score) => acc + score, 0) / evalScores.length;
        return avg.toFixed(2);
    }
  
    return (
      <Card>
        <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        {isAdmin ? <UserCog /> : <BookOpen />} 
                        {isAdmin ? 'Gestión de Calificaciones' : 'Libro de Calificaciones'}
                    </CardTitle>
                    <CardDescription>
                    {isAdmin ? 'Busque, visualice y modifique los expedientes académicos.' : 'Gestiona las calificaciones de tus cursos.'}
                    </CardDescription>
                </div>
                <Select>
                    <SelectTrigger className="w-full sm:w-[280px]">
                        <SelectValue placeholder="Seleccionar curso..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="course-1">Estructuras de Datos</SelectItem>
                        <SelectItem value="course-2">Cálculo II</SelectItem>
                         {isAdmin && <SelectItem value="course-3">Todos los cursos</SelectItem>}
                    </SelectContent>
                </Select>
            </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="gradebook">
            <TabsList>
                <TabsTrigger value="gradebook">Libro de Calificaciones</TabsTrigger>
                <TabsTrigger value="stats">Estadísticas</TabsTrigger>
                <TabsTrigger value="reports">Reportes</TabsTrigger>
                {isAdmin && <TabsTrigger value="admin-tools">Herramientas Admin</TabsTrigger>}
            </TabsList>
            <TabsContent value="gradebook" className="mt-6">
                <div className="flex justify-end gap-2 mb-4">
                    <Button variant="outline" disabled><PlusCircle/> Agregar Evaluación</Button>
                    <Button disabled><Upload/> Publicar Notas</Button>
                </div>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="sticky left-0 bg-background">Estudiante</TableHead>
                                {professorGradebookData.evaluations.map(ev => (
                                    <TableHead key={ev.name} className="text-center">{ev.name} ({ev.maxScore})</TableHead>
                                ))}
                                <TableHead className="text-center font-bold">Nota Final</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {professorGradebookData.students.map(student => (
                                <TableRow key={student.id}>
                                    <TableCell className="sticky left-0 bg-background font-medium">{student.name}</TableCell>
                                    {professorGradebookData.evaluations.map(ev => {
                                        const grade = professorGradebookData.grades[student.id as keyof typeof professorGradebookData.grades]?.[ev.name as keyof typeof professorGradebookData.grades['S001']];
                                        return (
                                            <TableCell key={`${student.id}-${ev.name}`} className="text-center">
                                                <Input 
                                                    type="number" 
                                                    defaultValue={grade ?? ''} 
                                                    className={`w-20 text-center mx-auto ${grade === null ? 'bg-destructive/10 border-destructive/50' : ''}`}
                                                    placeholder="--"
                                                    disabled={!isAdmin}
                                                />
                                            </TableCell>
                                        )
                                    })}
                                    <TableCell className="text-center font-bold">{calculateFinalGrade(student.id)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <Alert className="mt-6">
                  <UserCog className="h-4 w-4" />
                  <AlertTitle>En Desarrollo</AlertTitle>
                  <AlertDescription>
                    La lógica para guardar las notas, agregar evaluaciones y calcular la nota final ponderada se implementará próximamente. {isAdmin && 'Las modificaciones de notas por administradores requerirán justificación y serán auditadas.'}
                  </AlertDescription>
                </Alert>
            </TabsContent>
            <TabsContent value="stats" className="mt-6">
                <Card>
                    <CardHeader><CardTitle>Estadísticas</CardTitle></CardHeader>
                    <CardContent>
                        <Alert>
                            <BarChart className="h-4 w-4" />
                            <AlertTitle>En Desarrollo</AlertTitle>
                            <AlertDescription>
                                {isAdmin 
                                    ? 'Aquí se mostrará el dashboard con KPIs institucionales: tasa de retención, tasa de graduación, promedios por programa, etc.'
                                    : 'Aquí se mostrarán gráficos interactivos con el promedio, desviación estándar y distribución de notas por evaluación.'
                                }
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="reports" className="mt-6">
                <Card>
                     <CardHeader><CardTitle>Generación de Reportes</CardTitle></CardHeader>
                     <CardContent>
                         <Alert>
                            <File className="h-4 w-4" />
                            <AlertTitle>En Desarrollo</AlertTitle>
                            <AlertDescription>
                                {isAdmin
                                    ? 'Aquí encontrarás opciones para generar reportes masivos por cohorte, programa o para procesos de acreditación.'
                                    : 'Aquí encontrarás el formulario para generar reportes en PDF y Excel con filtros y opciones de contenido para tu curso.'
                                }
                            </AlertDescription>
                        </Alert>
                     </CardContent>
                </Card>
            </TabsContent>
            {isAdmin && (
                <TabsContent value="admin-tools" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Herramientas de Administración</CardTitle>
                            <CardDescription>Acciones de alto nivel sobre expedientes académicos.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Alert>
                                <Settings2 className="h-4 w-4" />
                                <AlertTitle>En Desarrollo</AlertTitle>
                                <AlertDescription>
                                    Aquí se ubicarán las herramientas para modificar expedientes (convalidaciones, cambios de estado, etc.) y para generar estadísticas institucionales avanzadas.
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>
                </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    );
}
