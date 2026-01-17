'use client';

import { useState } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ListTree, Edit, Loader2 } from 'lucide-react';
import ModuleManagementDialog from '@/components/cursos/admin/ModuleManagementDialog';
import type { Course } from '@/types/course';

export default function AdminScheduleView() {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false);
  const firestore = useFirestore();

  const coursesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'courses'), where('status', '==', 'active'));
  }, [firestore]);

  const { data: courses, isLoading: areCoursesLoading } = useCollection<Course>(coursesQuery);

  const handleSelectCourse = (courseId: string) => {
    const course = courses?.find(c => c.id === courseId) || null;
    setSelectedCourse(course);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListTree /> Gestión de Módulos por Curso
          </CardTitle>
          <CardDescription>
            Selecciona un curso para añadir o editar sus semanas/módulos de contenido.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-center gap-4">
          <Select onValueChange={handleSelectCourse} disabled={areCoursesLoading}>
            <SelectTrigger className="w-full sm:w-[320px]">
              <SelectValue placeholder={areCoursesLoading ? "Cargando cursos..." : "Selecciona un curso..."} />
            </SelectTrigger>
            <SelectContent>
              {courses?.map(course => (
                <SelectItem key={course.id} value={course.id}>{course.name} ({course.courseId})</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setIsModuleDialogOpen(true)} disabled={!selectedCourse}>
            <Edit className="mr-2" /> Gestionar Módulos
          </Button>
        </CardContent>
      </Card>
      {selectedCourse && (
        <ModuleManagementDialog
          isOpen={isModuleDialogOpen}
          onOpenChange={setIsModuleDialogOpen}
          course={selectedCourse}
        />
      )}
    </>
  );
}
