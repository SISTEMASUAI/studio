'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { UserCog, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const coursesAttendance = [
    { name: 'Estructuras de Datos', avg: 95, trend: 'up' },
    { name: 'Cálculo II', avg: 88, trend: 'stable' },
    { name: 'Humanidades I', avg: 75, trend: 'down' },
];

export default function AdminAttendanceView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCog /> Supervisión de Asistencia
        </CardTitle>
        <CardDescription>
          Panel de administrador para supervisar la asistencia y gestionar justificaciones.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3 mb-6">
            <Card>
                <CardHeader className="pb-2">
                    <CardDescription>Asistencia General</CardDescription>
                    <CardTitle className="text-4xl">89%</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-xs text-muted-foreground flex items-center"><TrendingUp className="text-green-500 mr-1"/>+2% vs la semana pasada</div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="pb-2">
                    <CardDescription>Cursos en Riesgo</CardDescription>
                    <CardTitle className="text-4xl">1</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-xs text-muted-foreground">Cursos con &lt;80% de asistencia</div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="pb-2">
                    <CardDescription>Justificaciones Pendientes</CardDescription>
                    <CardTitle className="text-4xl">3</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-xs text-muted-foreground">Solicitudes por revisar</div>
                </CardContent>
            </Card>
        </div>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Curso</TableHead>
                    <TableHead className="text-center">Asistencia Promedio</TableHead>
                    <TableHead className="text-center">Tendencia</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {coursesAttendance.map(course => (
                    <TableRow key={course.name}>
                        <TableCell className="font-medium">{course.name}</TableCell>
                        <TableCell className="text-center">{course.avg}%</TableCell>
                        <TableCell className="text-center">
                            <Badge variant={course.trend === 'down' ? 'destructive' : 'secondary'}>
                                {course.trend === 'up' && <TrendingUp className="mr-1"/>}
                                {course.trend === 'down' && <TrendingDown className="mr-1"/>}
                                {course.trend === 'stable' ? 'Estable' : course.trend === 'up' ? 'Subiendo' : 'Bajando'}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                            <Button variant="outline" size="sm">Ver Detalles</Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
