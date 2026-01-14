'use client';

import { useUser } from '@/firebase';
import { FileClock, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import UserProceduresView from '@/components/tramites/UserProceduresView';
import AdminProceduresView from '@/components/tramites/AdminProceduresView';

export default function ProceduresPage() {
  const { profile, isUserLoading } = useUser();

  const renderContent = () => {
    if (isUserLoading || !profile) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      );
    }
    
    switch (profile.role) {
      case 'student':
      case 'professor':
        return <UserProceduresView />;
      case 'admin':
        return <AdminProceduresView />;
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
              <FileClock className="text-primary" />
              Estado de Trámites
            </h1>
            <p className="text-muted-foreground">
              {profile?.role === 'admin'
                ? 'Gestiona todas las solicitudes de la institución.'
                : 'Consulta el estado y el historial de tus solicitudes.'}
            </p>
          </div>
        </div>
      </section>

      {renderContent()}
    </div>
  );
}
