'use client';

import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';
import StudentProfileView from '@/components/profile/StudentProfileView';
import ProfessorProfileView from '@/components/profile/ProfessorProfileView';
import AdminProfileView from '@/components/profile/AdminProfileView';

export default function ProfilePage() {
  const { profile } = useUser();

  const renderContent = () => {
    if (!profile) {
      return (
        <div className="flex justify-center items-center h-full">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      );
    }
    
    switch(profile.role) {
        case 'student':
            return <StudentProfileView />;
        case 'professor':
            return <ProfessorProfileView />;
        case 'admin':
            return <AdminProfileView />;
        default:
             return <StudentProfileView />;
    }
  };

  return (
    <div className="space-y-8">
      <section>
        <div>
          <h1 className="text-3xl font-bold font-headline">Perfil Personal</h1>
          <p className="text-muted-foreground">
            Consulta y actualiza tu información personal y de seguridad.
          </p>
        </div>
      </section>
      {renderContent()}
    </div>
  );
}
