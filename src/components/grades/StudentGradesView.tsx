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
import {
  BarChart2,
  TrendingUp,
  Download,
  FileText,
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


export default function StudentGradesView() {
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
                                                                ) : (
                                                                    <Badge variant="outline">No publicada</Badge>
                                                                )}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                    <div>
                                                        <ChartContainer config={chartConfig} className="min-h-[150px] w-full">
                                                            <RechartsBarChart data={course.evaluations.filter(e => e.published).map(e => ({ name: e.name, grade: e.grade || 0 }))}>
                                                                <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={10} interval={0} />
                                                                <YAxis domain={[0, 20]} />
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
                        <CardTitle className="flex items-center gap-2"><BarChart2 /> Resumen Académico</CardTitle>
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
                        <Button variant="outline" className="w-full">
                            <Download className="mr-2" /> Descargar Historial (No Oficial)
                        </Button>
                        <Button className="w-full">
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
