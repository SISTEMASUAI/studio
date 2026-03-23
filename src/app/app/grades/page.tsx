'use client';

import { useUser } from '@/firebase';
import { GraduationCap, Loader2 } from 'lucide-react';
import StudentGradesView from '@/components/grades/StudentGradesView';
import AdminProfessorGradesView from '@/components/grades/AdminProfessorGradesView';
import { Card, CardContent } from '@/components/ui/card';

export default function GradesPage() {
  const { profile, isUserLoading } = useUser();

  const renderContent = () => {
    if (isUserLoading || !profile) {
        return (
          <Card>
            <CardContent className="pt-6 flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin" />
            </CardContent>
          </Card>
        );
      }

    switch (profile.role) {
      case 'student':
        return <StudentGradesView />;
      case 'professor':
      case 'admin':
        return <AdminProfessorGradesView />;
      default:
        return (
          <Card>
            <CardContent className="pt-6">
              <p>Error: Rol de usuario no reconocido.</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-8">
      <section>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
              <GraduationCap className="text-primary" />
              Calificaciones y Expediente
            </h1>
            <p className="text-muted-foreground">
              {profile?.role === 'student'
                ? 'Consulta tus calificaciones, promedio y progreso académico.'
                : 'Gestiona las calificaciones y expedientes de los estudiantes.'}
            </p>
          </div>
        </div>
      </section>

      {renderContent()}
    </div>
  );
}
