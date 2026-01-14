'use client';

import { useUser } from '@/firebase';
import AlumnosView from '@/components/alumnos/AlumnosView';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AlumnosPage() {
  const { profile, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && profile?.role !== 'admin') {
      router.replace('/intranet');
    }
  }, [isUserLoading, profile, router]);

  if (isUserLoading || !profile) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (profile.role !== 'admin') {
    return (
      <Card>
        <CardContent className="pt-6">
          <p>No tienes permiso para ver esta página.</p>
        </CardContent>
      </Card>
    );
  }

  return <AlumnosView />;
}
