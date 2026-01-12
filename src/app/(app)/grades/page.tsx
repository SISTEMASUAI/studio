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
  GraduationCap,
  UserCog,
  ChevronDown,
  BarChart2,
  TrendingUp,
  Download,
  FileText,
  BookOpen,
  PlusCircle,
  Upload,
  BarChart,
  File,
  Settings2,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

const academicData = {
  currentSemester: {
    semester: '2024-2',
    courses: [
      {
        code: 'CS201',
        name: 'Estructuras de Datos',
        credits: 4,
        finalGrade: null, // Still in progress
        status: 'en curso',
        evaluations: [
          { name: 'Tarea 1', grade: 16, maxGrade: 20, published: true },
          { name: 'Parcial 1', grade: 14, maxGrade: 20, published: true },
          { name: 'Tarea 2', grade: null, maxGrade: 20, published: false },
          { name: 'Final', grade: null, maxGrade: 20, published: false },
        ],
      },
      {
        code: 'MA201',
        name: 'Cálculo II',
        credits: 4,
        finalGrade: null,
        status: 'en curso',
        evaluations: [
          { name: 'Práctica 1', grade: 18, maxGrade: 20, published: true },
          { name: 'Práctica 2', grade: 15, maxGrade: 20, published: true },
          { name: 'Examen Final', grade: null, maxGrade: 20, published: false },
        ],
      },
    ],
  },
  history: [
    {
      semester: '2024-1',
      gpa: 17.5,
      credits: 11,
      courses: [
        { code: 'CS101', name: 'Introducción a la Programación', credits: 4, grade: 18, status: 'aprobado' },
        { code: 'MA101', name: 'Cálculo I', credits: 4, grade: 17, status: 'aprobado' },
        { code: 'HU101', name: 'Humanidades I', credits: 3, grade: 18, status: 'aprobado' },
      ],
    },
    {
      semester: '2023-2',
      gpa: 15.8,
      credits: 10,
      courses: [
        { code: 'PH101', name: 'Física I', credits: 4, grade: 16, status: 'aprobado' },
        { code: 'CH101', name: 'Química General', credits: 3, grade: 15, status: 'aprobado' },
        { code: 'ID101', name: 'Inglés I', credits: 3, grade: 17, status: 'aprobado' },
      ],
    }
  ],
  summary: {
    gpa: 16.72,
    totalCredits: 140,
    approvedCredits: 21,
    failedCredits: 0,
    semesters: 2,
    academicStatus: 'excelencia',
    scholarshipGpaRequired: 16.0,
  },
};

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

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'aprobado': return <Badge className="bg-green-100 text-green-800">Aprobado</Badge>;
    case 'reprobado': return <Badge variant="destructive">Reprobado</Badge>;
    case 'en curso': return <Badge variant="secondary">En Curso</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
};

const getGpaStatusBadge = (status: string) => {
    switch (status) {
      case 'excelencia': return <Badge className="bg-sky-100 text-sky-800 text-base">Excelencia</Badge>;
      case 'regular': return <Badge className="bg-green-100 text-green-800">Regular</Badge>;
      case 'probatorio': return <Badge className="bg-yellow-100 text-yellow-800">Probatorio</Badge>;
      case 'riesgo': return <Badge variant="destructive">Riesgo Académico</Badge>;
      default: return null;
    }
}

const chartConfig = {
    grade: {
      label: 'Nota',
      color: 'hsl(var(--primary))',
    },
  } satisfies ChartConfig;


function StudentGradesView() {
  const { summary, currentSemester, history } = academicData;

  const progress = (summary.approvedCredits / summary.totalCredits) * 100;
  
  return (
    <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
            <Tabs defaultValue="current">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="current">Semestre Actual</TabsTrigger>
                    <TabsTrigger value="history">Historial Académico</TabsTrigger>
                </TabsList>
                <TabsContent value="current" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Rendimiento del Semestre {currentSemester.semester}</CardTitle>
                            <CardDescription>Detalle de tus calificaciones para el período actual.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Accordion type="single" collapsible className="w-full" defaultValue="CS201">
                                {currentSemester.courses.map(course => (
                                    <AccordionItem value={course.code} key={course.code}>
                                        <AccordionTrigger>
                                            <div className="flex justify-between items-center w-full pr-4">
                                                <div className="text-left">
                                                    <p className="font-semibold">{course.name}</p>
                                                    <p className="text-sm text-muted-foreground">{course.code}</p>
                                                </div>
                                                {getStatusBadge(course.status)}
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="p-2">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <ul className="space-y-3">
                                                    {course.evaluations.map(ev => (
                                                        <li key={ev.name} className="flex justify-between items-center text-sm">
                                                            <span>{ev.name}</span>
                                                            {ev.published ? (
                                                                <span className="font-medium">{ev.grade}/{ev.maxGrade}</span>
                                                            ): (
                                                                <Badge variant="outline">No publicada</Badge>
                                                            )}
                                                        </li>
                                                    ))}
                                                </ul>
                                                <div>
                                                     <ChartContainer config={chartConfig} className="min-h-[150px] w-full">
                                                        <RechartsBarChart data={course.evaluations.filter(e => e.published).map(e => ({ name: e.name, grade: e.grade || 0 }))}>
                                                            <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={10} interval={0} />
                                                            <YAxis domain={[0, 20]}/>
                                                            <ChartTooltip content={<ChartTooltipContent />} />
                                                            <Bar dataKey="grade" fill="var(--color-grade)" radius={4} />
                                                        </RechartsBarChart>
                                                    </ChartContainer>
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="history" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Historial Académico Completo</CardTitle>
                            <CardDescription>Consulta tus calificaciones de semestres anteriores.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {history.map(semester => (
                                    <div key={semester.semester}>
                                        <div className="flex justify-between items-baseline mb-2 pb-2 border-b">
                                            <h3 className="font-semibold font-headline text-lg">Semestre {semester.semester}</h3>
                                            <div className="text-sm text-muted-foreground">Promedio: <span className="font-bold text-foreground">{semester.gpa.toFixed(2)}</span></div>
                                        </div>
                                         <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Curso</TableHead>
                                                    <TableHead className="text-center">Créditos</TableHead>
                                                    <TableHead className="text-right">Nota Final</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {semester.courses.map(course => (
                                                    <TableRow key={course.code}>
                                                        <TableCell>{course.name} ({course.code})</TableCell>
                                                        <TableCell className="text-center">{course.credits}</TableCell>
                                                        <TableCell className="text-right font-bold">{course.grade}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
      <aside className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChart2/> Resumen Académico</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Promedio (GPA)</span>
              <span className="font-bold text-2xl text-primary">{summary.gpa.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Estado Académico</span>
              {getGpaStatusBadge(summary.academicStatus)}
            </div>
             <div className="space-y-1">
                <div className="flex justify-between items-baseline text-sm">
                    <p className="font-medium">Progreso de Carrera</p>
                    <p><span className="font-bold">{summary.approvedCredits}</span> / {summary.totalCredits} créditos</p>
                </div>
                <Progress value={progress} />
            </div>
             <Alert>
                <TrendingUp className="h-4 w-4" />
                <AlertTitle>Requisito de Beca</AlertTitle>
                <AlertDescription>
                  Promedio mínimo requerido: <span className="font-bold">{summary.scholarshipGpaRequired.toFixed(2)}</span>.
                  Tu promedio actual {summary.gpa > summary.scholarshipGpaRequired ? 'cumple' : 'no cumple'} con el requisito.
                </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Acciones y Certificados</CardTitle>
                <CardDescription>Descarga documentos o solicita certificados oficiales.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <Button variant="outline" className="w-full" disabled>
                    <Download className="mr-2" /> Descargar Historial (No Oficial)
                </Button>
                 <Button className="w-full" disabled>
                    <FileText className="mr-2" /> Solicitar Certificado Oficial
                </Button>
                 <p className="text-xs text-muted-foreground text-center">
                    La solicitud de certificados oficiales puede tener un costo y se procesará a través del módulo de trámites.
                 </p>
            </CardContent>
        </Card>
      </aside>
    </div>
  );
}

function AdminProfessorGradesView() {
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
