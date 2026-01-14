'use client';

import { useUser } from '@/firebase';
import { FilePenLine, Loader2 } from 'lucide-react';
import StudentEnrollmentView from '@/components/matricula/StudentEnrollmentView';
import AdminEnrollmentView from '@/components/matricula/AdminEnrollmentView';
import ProfessorEnrollmentView from '@/components/matricula/ProfessorEnrollmentView';
import { Card, CardContent } from '@/components/ui/card';

export default function EnrollmentPage() {
  const { profile, isUserLoading } = useUser();

  const renderContent = () => {
    if (isUserLoading || !profile) {
      return (
        <div className="flex justify-center p-8">
          <Loader2 className="animate-spin h-8 w-8" />
        </div>
      );
    }

    switch (profile.role) {
      case 'student':
        return <StudentEnrollmentView />;
      case 'admin':
        return <AdminEnrollmentView />;
      case 'professor':
        return <ProfessorEnrollmentView />;
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
              <FilePenLine className="text-primary" />
              Matrícula y Gestión de Asignaturas
            </h1>
            <p className="text-muted-foreground">
              {profile?.role === 'student'
                ? 'Inscribe, da de baja y gestiona tus asignaturas.'
                : 'Gestiona el proceso de matrícula de la universidad.'}
            </p>
          </div>
        </div>
      </section>

      {renderContent()}
    </div>
  );
}
