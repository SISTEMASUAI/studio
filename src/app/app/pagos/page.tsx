'use client';

import { useUser } from '@/firebase';
import { Landmark, Loader2 } from 'lucide-react';
import StudentFinanceView from '@/components/pagos/StudentFinanceView';
import AdminFinanceView from '@/components/pagos/AdminFinanceView';
import ProfessorFinanceView from '@/components/pagos/ProfessorFinanceView';
import { Card, CardContent } from '@/components/ui/card';

export default function PaymentsPage() {
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
        return <StudentFinanceView />;
      case 'admin':
        return <AdminFinanceView />;
      case 'professor':
        return <ProfessorFinanceView />;
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
              <Landmark className="text-primary" />
              Pagos y Finanzas
            </h1>
            <p className="text-muted-foreground">
              {profile?.role === 'student'
                ? 'Consulta tu estado de cuenta, realiza pagos y gestiona tus finanzas.'
                : 'Gestiona la información financiera de los estudiantes.'}
            </p>
          </div>
        </div>
      </section>

      {renderContent()}
    </div>
  );
}
