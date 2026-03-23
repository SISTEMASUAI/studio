
'use client';

import { useUser } from '@/firebase';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  FileClock,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import UserProceduresView from '@/components/tramites/UserProceduresView';
import AdminProceduresView from '@/components/tramites/AdminProceduresView';

export default function ProceduresPage() {
  const { profile, isUserLoading } = useUser();

  const renderContent = () => {
    if (isUserLoading || !profile) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8"/></div>
    }

    switch (profile.role) {
      case 'student':
      case 'professor':
        return <UserProceduresView />;
      case 'admin':
      case 'staff':
        return <AdminProceduresView />;
      default:
        return (
          <Card>
            <CardContent className="pt-6">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Acceso restringido</AlertTitle>
                <AlertDescription>No tienes los permisos necesarios para esta sección.</AlertDescription>
              </Alert>
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
              {['admin', 'staff'].includes(profile?.role || '')
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
