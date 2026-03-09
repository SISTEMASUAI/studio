
'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { HeartPulse, History, Users, CalendarIcon, LifeBuoy, AlertTriangle, PlusCircle, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppointmentForm from '@/components/bienestar/AppointmentForm';
import AppointmentList from '@/components/bienestar/AppointmentList';
import ResourceManagement from '@/components/bienestar/ResourceManagement';
import ServiceManagement from '@/components/bienestar/ServiceManagement';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function WellnessPage() {
  const { profile, user, isUserLoading } = useUser();
  const firestore = useFirestore();

  // 1. Cargar Recursos de Apoyo dinámicos
  const resourcesQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'wellness_resources') : null),
    [firestore]
  );
  const { data: dbResources, isLoading: isLoadingResources } = useCollection(resourcesQuery);

  // 2. Cargar Historial del Usuario
  const userAppointmentsQuery = useMemoFirebase(
    () => (firestore && user ? query(
      collection(firestore, 'wellness_services'), 
      where('userId', '==', user.uid),
      orderBy('requestedAt', 'desc')
    ) : null),
    [firestore, user?.uid]
  );
  const { data: myAppointments, isLoading: isMyHistoryLoading, error: myError } = useCollection(userAppointmentsQuery);

  const isAdmin = profile?.role === 'admin';
  const isStaff = profile?.role === 'staff';

  // 3. Cargar solicitudes para Admin o Staff
  const staffAppointmentsQuery = useMemoFirebase(
    () => {
      if (!firestore) return null;
      if (isAdmin) return query(collection(firestore, 'wellness_services'), orderBy('requestedAt', 'desc'));
      if (isStaff && user) return query(collection(firestore, 'wellness_services'), where('assignedStaffId', '==', user.uid), orderBy('requestedAt', 'desc'));
      return null;
    },
    [firestore, isAdmin, isStaff, user?.uid]
  );
  const { data: staffAppointments, isLoading: isStaffLoading } = useCollection(staffAppointmentsQuery);

  if (isUserLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
          <HeartPulse className="text-primary" />
          Servicios de Bienestar
        </h1>
        <p className="text-muted-foreground mt-1">
          Atención especializada y recursos para tu equilibrio emocional y académico.
        </p>
      </section>

      {myError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error de conexión</AlertTitle>
          <AlertDescription>{myError.message}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="appointments" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-grid">
          <TabsTrigger value="appointments">Mis Citas</TabsTrigger>
          {(isAdmin || isStaff) && <TabsTrigger value="management">Gestión Institucional</TabsTrigger>}
        </TabsList>

        <TabsContent value="appointments" className="space-y-8 pt-4">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><CalendarIcon className="text-primary" /> Solicitar una Cita</CardTitle>
                  <CardDescription>Explica tu motivo para asignarte al especialista correcto.</CardDescription>
                </CardHeader>
                <CardContent>
                  <AppointmentForm />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><History className="text-primary" /> Mi Historial de Atención</CardTitle>
                </CardHeader>
                <CardContent>
                  {isMyHistoryLoading ? (
                    <div className="flex justify-center p-8"><Loader2 className="animate-spin opacity-20" /></div>
                  ) : (
                    <AppointmentList appointments={myAppointments || []} />
                  )}
                </CardContent>
              </Card>
            </div>

            <aside className="space-y-8">
              <Card className="border-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg"><LifeBuoy className="text-primary" /> Recursos de Apoyo</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingResources ? (
                    <Loader2 className="animate-spin h-4 w-4 opacity-20 mx-auto" />
                  ) : dbResources && dbResources.length > 0 ? (
                    <ul className="space-y-2">
                      {dbResources.map((res) => (
                        <li key={res.id}>
                          <Button variant="link" className="p-0 h-auto font-normal text-muted-foreground hover:text-primary" asChild>
                            <a href={res.url} target="_blank" rel="noopener noreferrer">{res.title}</a>
                          </Button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">No hay recursos disponibles.</p>
                  )}
                </CardContent>
              </Card>
            </aside>
          </div>
        </TabsContent>

        {(isAdmin || isStaff) && (
          <TabsContent value="management" className="space-y-8 pt-4">
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="text-primary" /> 
                      {isAdmin ? 'Cola de Atención Global' : 'Mis Citas Asignadas'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isStaffLoading ? (
                      <div className="flex justify-center p-8"><Loader2 className="animate-spin opacity-20" /></div>
                    ) : (
                      <AppointmentList appointments={staffAppointments || []} isAdminView />
                    )}
                  </CardContent>
                </Card>
              </div>

              {isAdmin && (
                <div className="space-y-8">
                  <ServiceManagement />
                  <ResourceManagement />
                </div>
              )}
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
