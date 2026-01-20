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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

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
        'S002': { 'Tarea 1': 15, 'Parcial 1': 14, 'Tarea 2': 17 },
        'S003': { 'Tarea 1': 12, 'Parcial 1': 11, 'Tarea 2': 14 },
    }
}

const statsData = [
    { name: '0-5', value: 0 },
    { name: '6-10', value: 2 },
    { name: '11-13', value: 5 },
    { name: '14-16', value: 12 },
    { name: '17-20', value: 8 },
]

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
                    <Button variant="outline"><PlusCircle/> Agregar Evaluación</Button>
                    <Button><Upload/> Publicar Notas</Button>
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
            </TabsContent>
            <TabsContent value="stats" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Estadísticas del Curso</CardTitle>
                        <CardDescription>Distribución de calificaciones finales.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <ChartContainer config={{}} className="min-h-[200px] w-full">
                            <RechartsBarChart data={statsData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                            </RechartsBarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="reports" className="mt-6">
                <Card>
                     <CardHeader>
                        <CardTitle>Generación de Reportes</CardTitle>
                        <CardDescription>Exporta los datos de calificaciones en diferentes formatos.</CardDescription>
                     </CardHeader>
                     <CardContent className="flex gap-4">
                        <Button><File className="mr-2"/> Exportar a PDF</Button>
                        <Button variant="outline"><File className="mr-2"/> Exportar a Excel</Button>
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
                        <CardContent className="flex flex-wrap gap-4">
                             <Button variant="secondary"><Settings2 className="mr-2"/> Convalidar Cursos</Button>
                             <Button variant="secondary"><Settings2 className="mr-2"/> Modificar Expediente</Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    );
}
