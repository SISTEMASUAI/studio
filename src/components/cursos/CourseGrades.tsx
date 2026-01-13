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
import { GraduationCap, UserCheckIcon as UserCheck, Download, AlertTriangle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableRow, TableHeader, TableHead } from '@/components/ui/table';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

interface AttendanceRecord {
    id: string;
    studentId: string;
    courseId: string;
    sessionId: string;
    date: string;
    status: 'presente' | 'ausente' | 'tarde' | 'justificado';
    notes?: string;
}


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


export default function CourseGrades({ attendance }: { attendance: AttendanceRecord[]}) {
    const attendancePolicy = 85;
    const totalClasses = attendance.length > 0 ? attendance.length : 20; // Placeholder if no records yet
    const validAttendance = attendance.filter(a => a.status === 'presente' || a.status === 'tarde' || a.status === 'justificado').length;
    const attendancePercentage = totalClasses > 0 ? Math.round((validAttendance / totalClasses) * 100) : 100;
    const justifiableAbsences = attendance.filter(a => a.status === 'ausente' || a.status === 'tarde');

    const getProgressColor = (percentage: number) => {
        if (percentage >= 85) return 'bg-green-500';
        if (percentage >= 70) return 'bg-yellow-500';
        return 'bg-red-500';
      };

    return (
        <div className="space-y-8">
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
                    <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Funcionalidad en Desarrollo</AlertTitle>
                        <AlertDescription>
                            Esta sección se conectará a tus calificaciones reales próximamente. El cálculo de la nota proyectada y la descarga de reportes aún no están implementados.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><UserCheck/> Mi Asistencia</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <p className="text-sm font-medium mb-2">Resumen de Asistencia</p>
                        <div className="space-y-2">
                            <Progress value={attendancePercentage} className="h-2 [&>div]:bg-green-500" indicatorClassName={getProgressColor(attendancePercentage)} />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>{validAttendance} de {totalClasses} clases asistidas</span>
                                <span>{attendancePercentage}%</span>
                            </div>
                            {attendancePercentage < attendancePolicy && (
                                <p className="text-xs text-destructive flex items-center gap-1"><AlertTriangle className="h-3 w-3"/> Mínimo requerido: {attendancePolicy}%</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-2 text-sm">Detalle de Inasistencias</h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Clase</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">Acción</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {justifiableAbsences.length > 0 ? justifiableAbsences.map(record => (
                                    <TableRow key={record.id}>
                                        <TableCell className="p-2">
                                            <p className="text-sm">{record.date}</p>
                                        </TableCell>
                                        <TableCell className="p-2 text-sm text-muted-foreground">{record.sessionId.split('-').slice(2, -1).join(' ')}</TableCell>
                                         <TableCell className="p-2 text-sm capitalize">
                                            <Badge variant={record.status === 'ausente' ? 'destructive' : 'secondary'}>{record.status}</Badge>
                                         </TableCell>
                                        <TableCell className="p-2 text-right">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" size="sm" disabled={record.status === 'justificado'}>
                                                        {record.status === 'justificado' ? 'Justificado' : 'Justificar'}
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-[425px]">
                                                    <DialogHeader>
                                                        <DialogTitle>Justificar Inasistencia</DialogTitle>
                                                        <DialogDescription>
                                                            Fecha: {record.date}. Completa el formulario para enviar tu justificación.
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="grid gap-4 py-4">
                                                        <div className="grid grid-cols-4 items-center gap-4">
                                                            <Label htmlFor="reason" className="text-right">Motivo</Label>
                                                            <Select>
                                                                <SelectTrigger className="col-span-3">
                                                                    <SelectValue placeholder="Selecciona un motivo" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="medical">Médico</SelectItem>
                                                                    <SelectItem value="family">Familiar</SelectItem>
                                                                    <SelectItem value="work">Laboral</SelectItem>
                                                                    <SelectItem value="other">Otro</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="grid grid-cols-4 items-center gap-4">
                                                            <Label htmlFor="description" className="text-right">Descripción</Label>
                                                            <Textarea id="description" className="col-span-3" placeholder="Explica brevemente tu ausencia."/>
                                                        </div>
                                                        <div className="grid grid-cols-4 items-center gap-4">
                                                            <Label htmlFor="attachment" className="text-right">Sustento</Label>
                                                            <Button variant="outline" asChild className="col-span-3">
                                                                <label htmlFor="file-upload" className="cursor-pointer flex items-center gap-2">
                                                                    <GraduationCap className="h-4 w-4"/>
                                                                    <span>Adjuntar archivo (PDF, JPG)</span>
                                                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                                                                </label>
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <DialogFooter>
                                                        <Button type="submit" disabled>Enviar Justificación</Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground text-sm p-2">No tienes inasistencias por justificar.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
