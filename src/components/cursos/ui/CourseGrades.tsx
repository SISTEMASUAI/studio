'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GraduationCap, Download } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';

const gradesData = {
    finalGrade: 88,
    projectedGrade: 89,
    letterGrade: 'A-',
    evaluations: [
        { name: 'Tarea 1', grade: 90, maxGrade: 100, weight: 15 },
        { name: 'Parcial 1', grade: 85, maxGrade: 100, weight: 25 },
        { name: 'Tarea 2', grade: 95, maxGrade: 100, weight: 15 },
        { name: 'Proyecto', grade: 88, maxGrade: 100, weight: 20 },
        { name: 'Ex. Final', grade: null, maxGrade: 100, weight: 25 },
    ]
}


export default function CourseGrades() {
    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start">
                        <div>
                            <CardTitle className="flex items-center gap-2"><GraduationCap /> Mis Calificaciones</CardTitle>
                            <CardDescription>Resumen de tu rendimiento en el curso.</CardDescription>
                        </div>
                        <div className="flex items-center gap-4 mt-4 sm:mt-0">
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground">Nota Proyectada</p>
                                <p className="text-2xl font-bold">{gradesData.projectedGrade}<span className="text-base font-normal text-muted-foreground">/100</span></p>
                            </div>
                            <Button variant="outline" size="icon">
                                <Download className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Evaluación</TableHead>
                                <TableHead className="text-center">Ponderación</TableHead>
                                <TableHead className="text-right">Nota</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {gradesData.evaluations.map(ev => (
                                <TableRow key={ev.name}>
                                    <TableCell className="font-medium">{ev.name}</TableCell>
                                    <TableCell className="text-center">{ev.weight}%</TableCell>
                                    <TableCell className="text-right">
                                        {ev.grade !== null ? `${ev.grade} / ${ev.maxGrade}` : <Badge variant="outline">Pendiente</Badge>}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
