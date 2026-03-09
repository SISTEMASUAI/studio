
'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Activity, PlusCircle, Users, BarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { collection, query, orderBy } from 'firebase/firestore';
import ActivityList from '@/components/actividades/ActivityList';
import ActivityForm from '@/components/actividades/ActivityForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function ActivitiesPage() {
  const { profile } = useUser();
  const firestore = useFirestore();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const eventsQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'events'), orderBy('date', 'desc')) : null),
    [firestore]
  );
  const { data: events, isLoading } = useCollection(eventsQuery);

  const canCreate = profile?.role === 'admin' || profile?.role === 'professor' || profile?.role === 'staff';
  const isAdminOrStaff = profile?.role === 'admin' || profile?.role === 'staff';

  return (
    <div className="space-y-8">
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
            <Activity className="text-primary" />
            Actividades Extracurriculares
          </h1>
          <p className="text-muted-foreground">
            Talleres, clubes y equipos deportivos para tu desarrollo integral.
          </p>
        </div>
        {canCreate && (
          <div className="flex gap-2">
            <ActivityForm 
              isOpen={isCreateOpen} 
              onOpenChange={setIsCreateOpen} 
            />
            {isAdminOrStaff && (
              <Button variant="outline">
                <BarChart className="mr-2" /> Estadísticas
              </Button>
            )}
          </div>
        )}
      </section>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
        </div>
      ) : (
        <ActivityList events={events || []} />
      )}

      {isAdminOrStaff && (
         <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users /> Resumen de Participación</CardTitle>
                <CardDescription>Visualización global de inscripciones por categoría.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground italic text-center py-10">
                  Funcionalidad de analítica de participación en desarrollo.
                </p>
            </CardContent>
         </Card> 
      )}
    </div>
  );
}
