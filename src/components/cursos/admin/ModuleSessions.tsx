'use client';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CourseModuleSession } from '@/types/course';

interface ModuleSessionsProps {
    courseId: string;
    moduleId: string;
}

export default function ModuleSessions({ courseId, moduleId }: ModuleSessionsProps) {
    const firestore = useFirestore();

    const sessionsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'courses', courseId, 'modules', moduleId, 'sessions'), orderBy('date'));
    }, [firestore, courseId, moduleId]);

    const { data: sessions, isLoading } = useCollection<CourseModuleSession>(sessionsQuery);

    if (isLoading) {
        return <div className="flex justify-center items-center p-4"><Loader2 className="h-5 w-5 animate-spin" /></div>;
    }

    if (!sessions || sessions.length === 0) {
        return <p className="text-sm text-muted-foreground px-4 py-3">No hay clases programadas. Defina el horario del curso.</p>;
    }

    return (
        <div className="px-2 pb-2">
            <Table className="bg-accent/50">
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-xs">Clase</TableHead>
                        <TableHead className="text-xs">Fecha</TableHead>
                        <TableHead className="text-xs">Horario</TableHead>
                        <TableHead className="text-right text-xs">Acción</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sessions.map((session, index) => (
                        <TableRow key={session.id || index}>
                            <TableCell className="text-sm py-2">{session.title}</TableCell>
                            <TableCell className="text-sm py-2">{session.date}</TableCell>
                            <TableCell className="text-sm py-2">{session.startTime} - {session.endTime}</TableCell>
                            <TableCell className="text-right py-2">
                                <Button variant="outline" size="sm" disabled>
                                    <Edit className="mr-1.5 h-3 w-3"/> Editar
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
