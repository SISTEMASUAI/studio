'use client';

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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ClipboardList, FileUp } from 'lucide-react';

const assignments = [
    { id: 1, title: 'Tarea 1: Investigación de Mercado', dueDate: '2024-08-20', status: 'Calificada', grade: '18/20' },
    { id: 2, title: 'Proyecto Avance 1', dueDate: '2024-08-28', status: 'Entregada', grade: null },
    { id: 3, title: 'Examen Parcial', dueDate: '2024-09-05', status: 'Pendiente', grade: null },
    { id: 4, title: 'Tarea 2: Análisis FODA', dueDate: '2024-09-12', status: 'Pendiente', grade: null },
]

function getStatusBadge(status: string) {
    switch (status) {
        case 'Calificada':
            return <Badge variant="default" className="bg-green-600">Calificada</Badge>;
        case 'Entregada':
            return <Badge variant="secondary">Entregada</Badge>;
        case 'Pendiente':
            return <Badge variant="outline">Pendiente</Badge>;
        default:
            return <Badge variant="destructive">Vencida</Badge>;
    }
}

export default function CourseAssignments() {

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><ClipboardList/> Tareas y Evaluaciones</CardTitle>
                <CardDescription>Revisa tus próximas entregas y el estado de tus evaluaciones.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Evaluación</TableHead>
                            <TableHead>Fecha de Entrega</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Nota</TableHead>
                            <TableHead className="text-right">Acción</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {assignments.map(item => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.title}</TableCell>
                                <TableCell>{item.dueDate}</TableCell>
                                <TableCell>{getStatusBadge(item.status)}</TableCell>
                                <TableCell>{item.grade || '--'}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="outline" size="sm" disabled={item.status !== 'Pendiente'}>
                                        <FileUp className="mr-2"/> Entregar
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
