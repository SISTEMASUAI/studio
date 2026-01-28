'use client';

import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
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
import { ClipboardList, FileUp, Loader2, Download, MessageSquare, AlertTriangle, Info } from 'lucide-react';
import { useMemo } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import Link from 'next/link';

interface Assignment {
    id: string;
    title: string;
    description: string;
    dueDate: string;
}

interface Submission {
    id: string;
    assignmentId: string;
    studentId: string;
    submittedAt: string;
    grade: number | null;
    fileUrl?: string;
    feedback?: string;
}

function getStatusBadge(status: 'Calificada' | 'Entregada' | 'Pendiente' | 'Vencida') {
    switch (status) {
        case 'Calificada':
            return <Badge variant="default" className="bg-green-600">Calificada</Badge>;
        case 'Entregada':
            return <Badge variant="secondary">Entregada</Badge>;
        case 'Pendiente':
            return <Badge variant="outline">Pendiente</Badge>;
        case 'Vencida':
            return <Badge variant="destructive">Vencida</Badge>;
    }
}

export default function CourseAssignments({ courseId }: { courseId: string }) {
    const firestore = useFirestore();
    const { user } = useUser();

    const assignmentsQuery = useMemoFirebase(() =>
        (firestore && courseId) ? query(collection(firestore, 'courses', courseId, 'assignments')) : null,
    [firestore, courseId]);
    const { data: assignments, isLoading: areAssignmentsLoading } = useCollection<Assignment>(assignmentsQuery);

    const submissionsQuery = useMemoFirebase(() =>
        (firestore && user && courseId) ? query(collection(firestore, 'courses', courseId, 'submissions'), where('studentId', '==', user.uid)) : null,
    [firestore, user, courseId]);
    const { data: submissions, isLoading: areSubmissionsLoading } = useCollection<Submission>(submissionsQuery);

    const mergedData = useMemo(() => {
        if (!assignments) return [];
        const submissionsMap = new Map<string, Submission>();
        submissions?.forEach(sub => submissionsMap.set(sub.assignmentId, sub));

        return assignments.map(assignment => ({
            assignment,
            submission: submissionsMap.get(assignment.id) || null,
        }));
    }, [assignments, submissions]);

    const getStatus = (submission: Submission | null, dueDate: string): 'Calificada' | 'Entregada' | 'Pendiente' | 'Vencida' => {
      if (submission?.grade !== null && submission?.grade !== undefined) return 'Calificada';
      if (submission) return 'Entregada';
      if (new Date(dueDate) < new Date()) return 'Vencida';
      return 'Pendiente';
    }
    
    const isLoading = areAssignmentsLoading || areSubmissionsLoading;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><ClipboardList/> Tareas y Evaluaciones</CardTitle>
                <CardDescription>Revisa tus próximas entregas y el estado de tus evaluaciones.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {isLoading ? (
                    <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                ) : (
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
                        {mergedData && mergedData.length > 0 ? mergedData.map(item => {
                            const status = getStatus(item.submission, item.assignment.dueDate);
                            return (
                                <TableRow key={item.assignment.id}>
                                    <TableCell className="font-medium">{item.assignment.title}</TableCell>
                                    <TableCell>{new Date(item.assignment.dueDate).toLocaleString()}</TableCell>
                                    <TableCell>{getStatusBadge(status)}</TableCell>
                                    <TableCell>{item.submission?.grade ?? '--'}</TableCell>
                                    <TableCell className="text-right">
                                       <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm">
                                                    {item.submission ? 'Ver Entrega' : 'Entregar'}
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-xl">
                                                <DialogHeader>
                                                    <DialogTitle>{item.assignment.title}</DialogTitle>
                                                    <DialogDescription>
                                                        Fecha de entrega: {new Date(item.assignment.dueDate).toLocaleString()}
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="py-4 space-y-6">
                                                    <div>
                                                        <h4 className="font-semibold mb-2">Descripción de la Tarea</h4>
                                                        <p className="text-sm text-muted-foreground">{item.assignment.description}</p>
                                                    </div>
                                                    
                                                    {item.submission ? (
                                                        <>
                                                            <div className="space-y-2">
                                                                <h4 className="font-semibold">Mi Entrega</h4>
                                                                <p className="text-sm text-muted-foreground">Entregado el: {new Date(item.submission.submittedAt).toLocaleString()}</p>
                                                                {item.submission.fileUrl ? (
                                                                     <Button variant="outline" asChild>
                                                                         <Link href={item.submission.fileUrl} target="_blank">
                                                                            <Download className="mr-2"/> Descargar Archivo Entregado
                                                                         </Link>
                                                                     </Button>
                                                                ) : (
                                                                    <p className="text-sm text-muted-foreground">No se adjuntó archivo.</p>
                                                                )}
                                                            </div>
                                                            {item.submission.feedback && (
                                                                <div className="space-y-2">
                                                                    <h4 className="font-semibold flex items-center gap-2"><MessageSquare/> Retroalimentación del Docente</h4>
                                                                    <Card className="bg-accent/50">
                                                                        <CardContent className="p-3 text-sm text-muted-foreground">
                                                                             {item.submission.feedback}
                                                                        </CardContent>
                                                                    </Card>
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <div className="space-y-4">
                                                             <h4 className="font-semibold">Realizar Entrega</h4>
                                                             <Button variant="outline" asChild className="w-full">
                                                                <label className="cursor-pointer flex items-center gap-2">
                                                                    <FileUp className="h-4 w-4"/>
                                                                    <span>Adjuntar archivo</span>
                                                                    <input type="file" className="sr-only" />
                                                                </label>
                                                             </Button>
                                                             <Alert>
                                                                <AlertTriangle className="h-4 w-4" />
                                                                <AlertTitle>Funcionalidad en Desarrollo</AlertTitle>
                                                                <AlertDescription>
                                                                    La lógica para subir archivos y registrar la entrega está pendiente.
                                                                </AlertDescription>
                                                            </Alert>
                                                        </div>
                                                    )}
                                                </div>
                                                <DialogFooter>
                                                    {!item.submission && <Button disabled>
                                                        <FileUp className="mr-2"/> Entregar Tarea
                                                    </Button>}
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </TableCell>
                                </TableRow>
                            );
                        }) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24">No hay tareas para este curso.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                )}
            </CardContent>
        </Card>
    )
}
