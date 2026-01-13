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
import { UserCheck, AlertTriangle } from 'lucide-react';
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
    date: string;
    sessionTitle: string;
    status: 'presente' | 'ausente' | 'tarde' | 'justificado';
    notes?: string;
}


export default function CourseAttendance({ attendance }: { attendance: AttendanceRecord[]}) {
    const attendancePolicy = 85;
    const totalClasses = attendance.length > 0 ? attendance.length : 20; // Placeholder if no records yet
    const presentCount = attendance.filter(a => a.status === 'presente' || a.status === 'justificado').length;
    const lateCount = attendance.filter(a => a.status === 'tarde').length;
    const absentCount = attendance.filter(a => a.status === 'ausente').length;
    
    // As per policy, tardies might count as half-absences or similar, but for now, we count them as attended for the percentage.
    const validAttendance = presentCount + lateCount;
    const attendancePercentage = totalClasses > 0 ? Math.round((validAttendance / totalClasses) * 100) : 100;
    
    const justifiableAbsences = attendance.filter(a => a.status === 'ausente' || a.status === 'tarde');

    const getProgressColor = (percentage: number) => {
        if (percentage >= 85) return 'bg-green-500';
        if (percentage >= 70) return 'bg-yellow-500';
        return 'bg-red-500';
      };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><UserCheck/> Mi Asistencia</CardTitle>
                <CardDescription>Resumen y detalle de tu asistencia en el curso.</CardDescription>
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
                    <h3 className="font-semibold mb-2 text-sm">Historial de Asistencia</h3>
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
                            {attendance && attendance.length > 0 ? attendance.map(record => (
                                <TableRow key={record.id}>
                                    <TableCell className="p-2">
                                        <p className="text-sm">{record.date}</p>
                                    </TableCell>
                                    <TableCell className="p-2 text-sm text-muted-foreground">{record.sessionTitle}</TableCell>
                                    <TableCell className="p-2 text-sm capitalize">
                                        <Badge variant={
                                            record.status === 'presente' ? 'default' :
                                            record.status === 'justificado' ? 'secondary' :
                                            record.status === 'ausente' ? 'destructive' :
                                            'secondary'
                                        }>{record.status}</Badge>
                                    </TableCell>
                                    <TableCell className="p-2 text-right">
                                        {(record.status === 'ausente' || record.status === 'tarde') && (
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" size="sm">
                                                        Justificar
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
                                                                    <UserCheck className="h-4 w-4"/>
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
                                        )}
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-muted-foreground text-sm p-2">No hay registros de asistencia para este curso.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
