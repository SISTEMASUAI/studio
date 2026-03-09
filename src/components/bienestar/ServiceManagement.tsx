
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShieldCheck, PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ServiceSchema = z.object({
  name: z.string().min(3, "Nombre inválido"),
  staffId: z.string().min(1, "Debes asignar a alguien"),
});

export default function ServiceManagement() {
  const firestore = useFirestore();
  const { toast } = useToast();

  // Cargar lista de Staff para asignar
  const staffQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'users'), where('role', 'in', ['staff', 'professor', 'admin'])) : null),
    [firestore]
  );
  const { data: staffList } = useCollection(staffQuery);

  const configQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'wellness_service_config') : null),
    [firestore]
  );
  const { data: services } = useCollection(configQuery);

  const form = useForm<z.infer<typeof ServiceSchema>>({
    resolver: zodResolver(ServiceSchema),
    defaultValues: { name: '', staffId: '' },
  });

  async function onSubmit(values: z.infer<typeof ServiceSchema>) {
    if (!firestore || !staffList) return;
    const staffMember = staffList.find(s => s.uid === values.staffId);
    
    try {
      await addDocumentNonBlocking(collection(firestore, 'wellness_service_config'), {
        ...values,
        staffName: staffMember ? `${staffMember.firstName} ${staffMember.lastName}` : 'Personal',
      });
      form.reset();
      toast({ title: "Servicio configurado" });
    } catch (e) {
      toast({ variant: 'destructive', title: "Error" });
    }
  }

  const handleDelete = (id: string) => {
    if (!firestore) return;
    deleteDocumentNonBlocking(doc(firestore, 'wellness_service_config', id));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Configurar Servicios y Especialistas</CardTitle>
        <CardDescription>Asigna a un responsable para cada tipo de consulta.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem><FormControl><Input placeholder="Nombre del servicio (Ej: Nutrición)" {...field} /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="staffId" render={({ field }) => (
              <FormItem>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Asignar a..." /></SelectTrigger></FormControl>
                  <SelectContent>
                    {staffList?.map((s) => (
                      <SelectItem key={s.uid} value={s.uid}>{s.firstName} {s.lastName} ({s.role})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )} />
            <Button type="submit" size="sm" variant="secondary" className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" /> Guardar Configuración
            </Button>
          </form>
        </Form>

        <div className="space-y-2 pt-4 border-t">
          {services?.map((s) => (
            <div key={s.id} className="flex items-center justify-between p-2 rounded bg-primary/5 text-xs border border-primary/10">
              <div className="flex flex-col">
                <span className="font-bold text-primary">{s.name}</span>
                <span className="text-muted-foreground">Responsable: {s.staffName}</span>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDelete(s.id)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
