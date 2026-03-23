'use client';

import { useMemo, useState } from 'react';
import { collection, query, where, DocumentData } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, MoreHorizontal, PlusCircle, Search, User, Users, Edit } from 'lucide-react';
import CreateStudentDialog from './CreateStudentDialog';
import EditStudentDialog from './EditStudentDialog';

interface Program extends DocumentData {
  id: string;
  name: string;
}

interface StudentProfile extends DocumentData {
  id: string;
  uid: string;
  dni: string;
  firstName: string;
  lastName: string;
  email: string;
  programId: string;
  semester?: number;
  gpa?: number;
  status?: string;
}

export default function AlumnosView() {
  const [isCreateStudentOpen, setIsCreateStudentOpen] = useState(false);
  const [isEditStudentOpen, setIsEditStudentOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);

  const firestore = useFirestore();

  const programsQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'programs') : null),
    [firestore]
  );
  const { data: programs } = useCollection<Program>(programsQuery);

  const studentsQuery = useMemoFirebase(
    () =>
      firestore
        ? query(collection(firestore, 'users'), where('role', '==', 'student'))
        : null,
    [firestore]
  );
  const { data: students, isLoading: areStudentsLoading } =
    useCollection<StudentProfile>(studentsQuery);

  const handleOpenEditDialog = (student: StudentProfile) => {
    setSelectedStudent(student);
    setIsEditStudentOpen(true);
  };
  
  return (
    <div className="space-y-8">
      <section>
        <div>
          <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
            <Users className="text-primary" />
            Gestión de Alumnos
          </h1>
          <p className="text-muted-foreground">
            Busca, visualiza y gestiona la información académica de los estudiantes.
          </p>
        </div>
      </section>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User /> Lista de Alumnos
              </CardTitle>
              <CardDescription>Directorio de todos los estudiantes registrados.</CardDescription>
            </div>
            <Button onClick={() => setIsCreateStudentOpen(true)}>
              <PlusCircle className="mr-2" /> Crear Alumno
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por matrícula o nombre..." className="pl-9" />
            </div>
            <Select>
              <SelectTrigger className="w-full sm:w-[220px]">
                <SelectValue placeholder="Filtrar por programa" />
              </SelectTrigger>
              <SelectContent>
                {programs?.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="regular">Regular</SelectItem>
                <SelectItem value="probation">Probatorio</SelectItem>
                <SelectItem value="honor">Honor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Matrícula (DNI)</TableHead>
                <TableHead>Nombre Completo</TableHead>
                <TableHead>Programa</TableHead>
                <TableHead className="text-center">Semestre</TableHead>
                <TableHead className="text-center">GPA</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {areStudentsLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                  </TableCell>
                </TableRow>
              ) : students && students.length > 0 ? (
                students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-mono">{student.dni}</TableCell>
                    <TableCell className="font-medium">
                      {student.lastName}, {student.firstName}
                    </TableCell>
                    <TableCell>
                      {programs?.find((p) => p.id === student.programId)?.name || 'N/A'}
                    </TableCell>
                    <TableCell className="text-center">{student.semester || 'N/A'}</TableCell>
                    <TableCell className="text-center">{student.gpa || 'N/A'}</TableCell>
                    <TableCell>{student.status || 'Regular'}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem disabled>Ver Expediente</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleOpenEditDialog(student)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar Alumno
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No se encontraron estudiantes.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <CreateStudentDialog
        isOpen={isCreateStudentOpen}
        onOpenChange={setIsCreateStudentOpen}
      />
      
      {selectedStudent && (
        <EditStudentDialog
          isOpen={isEditStudentOpen}
          onOpenChange={setIsEditStudentOpen}
          student={selectedStudent}
        />
      )}
    </div>
  );
}
