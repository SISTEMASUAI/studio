'use client';

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
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import {
    Loader2,
    MoreHorizontal,
    Edit,
    Trash2,
    PlusCircle,
    AlertTriangle,
    RotateCw,
} from 'lucide-react';
import type { Course, Program } from '@/types/course';

interface CoursesTableProps {
  courses: Course[] | null;
  isLoading: boolean;
  programs: Program[] | null;
  onEdit: (course: Course) => void;
  onDeactivate?: (course: Course) => void;
  onActivate?: (course: Course) => void;
  isActive: boolean;
}

export default function CoursesTable({
  courses,
  isLoading,
  programs,
  onEdit,
  onDeactivate,
  onActivate,
  isActive
}: CoursesTableProps) {
  return (
    <Table>
        <TableHeader>
            <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nombre del Curso</TableHead>
                <TableHead>Programa</TableHead>
                <TableHead>Ciclo</TableHead>
                <TableHead>Créditos</TableHead>
                <TableHead>Nivel</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {isLoading ? (
                <TableRow>
                    <TableCell colSpan={7} className="text-center">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                    </TableCell>
                </TableRow>
            ) : courses && courses.length > 0 ? (
                courses.map(course => (
                    <TableRow key={course.id}>
                        <TableCell className="font-mono">{course.courseId}</TableCell>
                        <TableCell className="font-medium">{course.name}</TableCell>
                        <TableCell>{programs?.find(p => p.id === course.programId)?.name || 'N/A'}</TableCell>
                        <TableCell className="text-center">{course.cycle}</TableCell>
                        <TableCell className="text-center">{course.credits}</TableCell>
                        <TableCell>{course.level}</TableCell>
                        <TableCell className="text-right">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreHorizontal />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onSelect={() => onEdit(course)}>
                                        <Edit className="mr-2"/>Editar Curso
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem><PlusCircle className="mr-2"/>Crear Sección</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    {isActive ? (
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                                                    <Trash2 className="mr-2"/>Desactivar
                                                </DropdownMenuItem>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle className='flex items-center gap-2'><AlertTriangle/> Confirmar Desactivación</DialogTitle>
                                                    <DialogDescription>
                                                        ¿Estás seguro de que quieres desactivar el curso "{course.name}"? Esta acción no se puede deshacer.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <DialogFooter>
                                                    <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
                                                    <DialogClose asChild>
                                                      <Button variant="destructive" onClick={() => onDeactivate?.(course)}>Sí, desactivar</Button>
                                                    </DialogClose>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    ) : (
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                 <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                    <RotateCw className="mr-2"/>Activar
                                                </DropdownMenuItem>
                                            </DialogTrigger>
                                             <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle className='flex items-center gap-2'><AlertTriangle/> Confirmar Activación</DialogTitle>
                                                    <DialogDescription>
                                                        ¿Estás seguro de que quieres activar el curso "{course.name}"?
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <DialogFooter>
                                                    <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
                                                    <DialogClose asChild>
                                                      <Button onClick={() => onActivate?.(course)}>Sí, activar</Button>
                                                    </DialogClose>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))
            ) : (
                <TableRow>
                    <TableCell colSpan={7} className="text-center">No se encontraron cursos.</TableCell>
                </TableRow>
            )}
        </TableBody>
    </Table>
  );
}
