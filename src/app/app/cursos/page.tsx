'use client';

import { useUser } from '@/firebase';
import { BookCopy, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import StudentCoursesView from '@/components/cursos/student/StudentCoursesView';
import ProfessorCoursesView from '@/components/cursos/professor/ProfessorCoursesView';
import AdminCoursesView from '@/components/cursos/admin/AdminCoursesView';

export default function CoursesPage() {
  const { profile, isUserLoading } = useUser();

  const renderContent = () => {
    if (isUserLoading || !profile) {
      return (
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          </CardContent>
        </Card>
      );
    }
    
    switch (profile.role) {
      case 'student':
        return <StudentCoursesView />;
      case 'professor':
        return <ProfessorCoursesView />;
      case 'admin':
        return <AdminCoursesView />;
      default:
        return (
          <Card>
            <CardContent className="pt-6">
              <p>Rol de usuario no reconocido.</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-8">
      <section>
        <div>
          <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
            <BookCopy className="text-primary" />
            {profile?.role === 'student' ? 'Mis Cursos' : 'Gestión Académica'}
          </h1>
          <p className="text-muted-foreground">
            {profile?.role === 'student'
              ? 'Accede a tus cursos y materiales de clase.'
              : 'Gestiona los cursos, secciones y estudiantes.'}
          </p>
        </div>
      </section>

      {renderContent()}
    </div>
  );
}
