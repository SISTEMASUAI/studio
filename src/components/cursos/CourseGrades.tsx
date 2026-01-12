'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GraduationCap, Download, AlertTriangle } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const gradesData = {
    finalGrade: 88,
    letterGrade: 'A-',
    evaluations: [
        { name: 'Tarea 1', grade: 90, maxGrade: 100, weight: 15 },
        { name: 'Parcial 1', grade: 85, maxGrade: 100, weight: 25 },
        { name: 'Tarea 2', grade: 95, maxGrade: 100, weight: 15 },
        { name: 'Proyecto', grade: 88, maxGrade: 100, weight: 20 },
        { name: 'Ex. Final', grade: null, maxGrade: 100, weight: 25 },
    ]
}

const chartData = gradesData.evaluations.filter(e => e.grade !== null).map(e => ({ name: e.name, nota: e.grade }));

const chartConfig = {
    nota: {
        label: "Nota",
        color: "hsl(var(--primary))",
    },
}

export default function CourseGrades() {

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start">
                    <div>
                        <CardTitle className="flex items-center gap-2"><GraduationCap /> Mis Calificaciones</CardTitle>
                        <CardDescription>Resumen de tu rendimiento en el curso.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2 mt-4 sm:mt-0">
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">Nota Final</p>
                            <p className="text-2xl font-bold">{gradesData.finalGrade}<span className="text-base font-normal text-muted-foreground">/100</span></p>
                        </div>
                        <Badge variant="default" className="text-lg h-10">{gradesData.letterGrade}</Badge>
                         <Button variant="outline" size="icon" disabled>
                            <Download className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div>
                    <h3 className="font-semibold mb-2">Rendimiento por Evaluación</h3>
                    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                        <BarChart accessibilityLayer data={chartData}>
                             <XAxis
                                dataKey="name"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                                tickFormatter={(value) => value.slice(0, 8)}
                            />
                            <YAxis domain={[0, 100]}/>
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="nota" fill="var(--color-nota)" radius={4} />
                        </BarChart>
                    </ChartContainer>
                </div>
                <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Funcionalidad en Desarrollo</AlertTitle>
                    <AlertDescription>
                        Esta sección se conectará a tus calificaciones reales próximamente. El cálculo de la nota proyectada y la descarga de reportes aún no están implementados.
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
    )
}
