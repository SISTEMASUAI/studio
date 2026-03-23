
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2, Send } from 'lucide-react';

const AppointmentSchema = z.object({
  serviceId: z.string().min(1, "Selecciona un tipo de servicio."),
  reason: z.string().min(10, "Explica brevemente el motivo."),
  preferredTime: z.string().optional(),
});

export default function AppointmentForm() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  // Cargar configuración de servicios dinámicamente
  const configQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'wellness_service_config') : null),
    [firestore]
  );
  const { data: services, isLoading } = useCollection(configQuery);

  const form = useForm<z.infer<typeof AppointmentSchema>>({
    resolver: zodResolver(AppointmentSchema),
    defaultValues: { serviceId: '', reason: '' },
  });

  async function onSubmit(values: z.infer<typeof AppointmentSchema>) {
    if (!firestore || !user || !services) return;
    
    const selectedService = services.find(s => s.id === values.serviceId);
    if (!selectedService) return;

    try {
      await addDocumentNonBlocking(collection(firestore, 'wellness_services'), {
        userId: user.uid,
        serviceName: selectedService.name,
        assignedStaffId: selectedService.staffId,
        reason: values.reason,
        preferredTime: values.preferredTime || '',
        status: 'requested',
        requestedAt: new Date().toISOString(),
      });
      toast({ title: "Solicitud enviada", description: `Tu mensaje llegará a ${selectedService.staffName || 'un especialista'}.` });
      form.reset();
    } catch (e) {
      toast({ variant: 'destructive', title: "Error", description: "No se pudo procesar tu solicitud." });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid sm:grid-cols-2 gap-6">
          <FormField control={form.control} name="serviceId" render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Servicio</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={isLoading ? "Cargando..." : "Selecciona un servicio"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {services?.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="preferredTime" render={({ field }) => (
            <FormItem>
              <FormLabel>Preferencia Horaria (Opcional)</FormLabel>
              <FormControl><Input placeholder="Ej: Mañanas, 10:00 - 12:00" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <FormField control={form.control} name="reason" render={({ field }) => (
          <FormItem>
            <FormLabel>Motivo de la Consulta</FormLabel>
            <FormControl><Textarea className="min-h-[100px]" placeholder="Escribe aquí tu situación..." {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit" disabled={form.formState.isSubmitting || isLoading} className="w-full sm:w-auto px-10 shadow-lg">
          {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
          Enviar Solicitud
        </Button>
      </form>
    </Form>
  );
}
