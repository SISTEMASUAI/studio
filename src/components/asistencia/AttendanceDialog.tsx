'use client';

import { useState, useEffect } from 'react';
import { useFirestore, setDocumentNonBlocking } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { doc, getDoc } from 'firebase/firestore';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, Check, X, Clock } from 'lucide-react';
import type { StudentProfile, ClassSession } from './ProfessorAttendanceView';

type AttendanceStatus = 'presente' | 'ausente' | 'tarde';

interface AttendanceRecord {
    id: string;
    studentId: string;
    courseId: string;
    date: string;
    sessionTitle: string;
    status: AttendanceStatus;
}

interface AttendanceDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  session: ClassSession;
  courseId: string;
  students: StudentProfile[];
  isLoadingStudents: boolean;
}

export default function AttendanceDialog({
  isOpen,
  onOpenChange,
  session,
  courseId,
  students,
  isLoadingStudents,
}: AttendanceDialogProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [attendanceState, setAttendanceState] = useState<Map<string, AttendanceStatus>>(new Map());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && students.length > 0) {
      const fetchInitialAttendance = async () => {
        if (!firestore) return;
        const sessionTitle = session.title.split(' - ')[1];
        const newAttendanceState = new Map<string, AttendanceStatus>();
        
        for (const student of students) {
            const attendanceDocId = `${courseId}-${student.uid}-${format(session.date, 'yyyy-MM-dd')}-${sessionTitle}`;
            const docRef = doc(firestore, 'attendance', attendanceDocId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                newAttendanceState.set(student.uid, (docSnap.data() as AttendanceRecord).status);
            }
        }
        setAttendanceState(newAttendanceState);
      };
      fetchInitialAttendance();
    }
  }, [isOpen, students, courseId, session, firestore]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceState(prev => new Map(prev).set(studentId, status));
  };

  const handleSaveAttendance = async () => {
    if (!firestore || !courseId || !session) return;
    setIsSaving(true);
    try {
        const sessionTitle = session.title.split(' - ')[1];
        for (const [studentId, status] of attendanceState.entries()) {
            const attendanceDocId = `${courseId}-${studentId}-${format(session.date, 'yyyy-MM-dd')}-${sessionTitle}`;
            const record: Omit<AttendanceRecord, 'id'> = {
                studentId,
                courseId: courseId,
                date: format(session.date, 'yyyy-MM-dd'),
                sessionTitle,
                status,
            };
            setDocumentNonBlocking(doc(firestore, 'attendance', attendanceDocId), record, { merge: true });
        }
        toast({ title: 'Éxito', description: 'Asistencia guardada correctamente.' });
        onOpenChange(false);
    } catch (error) {
        console.error('Error saving attendance:', error);
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo guardar la asistencia.' });
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Pasar Asistencia</DialogTitle>
          <DialogDescription>
            Clase: {session.title} <br />
            Fecha: {format(session.date, 'PPPP', { locale: es })}
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estudiante</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingStudents ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                  </TableCell>
                </TableRow>
              ) : students.length > 0 ? (
                students.map(student => (
                  <TableRow key={student.id}>
                    <TableCell className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={student.profilePicture} alt={student.firstName} />
                        <AvatarFallback>{student.firstName?.[0]}{student.lastName?.[0]}</AvatarFallback>
                      </Avatar>
                      <span>{student.lastName}, {student.firstName}</span>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="icon" variant={attendanceState.get(student.uid) === 'presente' ? 'default' : 'outline'} onClick={() => handleStatusChange(student.uid, 'presente')} className="text-green-600 hover:text-green-700 hover:bg-green-50"><Check /></Button>
                      <Button size="icon" variant={attendanceState.get(student.uid) === 'tarde' ? 'default' : 'outline'} onClick={() => handleStatusChange(student.uid, 'tarde')} className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"><Clock /></Button>
                      <Button size="icon" variant={attendanceState.get(student.uid) === 'ausente' ? 'destructive' : 'outline'} onClick={() => handleStatusChange(student.uid, 'ausente')} className="hover:bg-red-50"><X /></Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="text-center">
                    No hay estudiantes inscritos en este curso.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cerrar</Button>
          <Button onClick={handleSaveAttendance} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
            Guardar Asistencia
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
