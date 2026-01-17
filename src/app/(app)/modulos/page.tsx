'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ListTree, Edit, Loader2 } from 'lucide-react';
import ModuleManagementDialog from '@/components/cursos/admin/ModuleManagementDialog';
import type { Course } from '@/types/course';

export default function ModulesPage() {
  const { profile, isUserLoading } = useUser();
  const router = useRouter();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false);
  const firestore = useFirestore();

  useEffect(() => {
    if (!isUserLoading && profile?.role !== 'admin') {
      router.replace('/intranet');
    }
  }, [isUserLoading, profile, router]);

  const coursesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'courses'), where('status', '==', 'active'));
  }, [firestore]);

  const { data: courses, isLoading: areCoursesLoading } = useCollection<Course>(coursesQuery);

  const handleSelectCourse = (courseId: string) => {
    const course = courses?.find(c => c.id === courseId) || null;
    setSelectedCourse(course);
  };

  if (isUserLoading || !profile || profile.role !== 'admin') {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section>
        <div>
          <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
            <ListTree className="text-primary" />
            Gestión de Módulos y Semanas
          </h1>
          <p className="text-muted-foreground">
            Añade y organiza el contenido semanal de cada curso.
          </p>
        </div>
      </section>

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
    </div>
  );
}
