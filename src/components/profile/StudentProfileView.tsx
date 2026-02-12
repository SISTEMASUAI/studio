
'use client';

import { useUser, useFirestore, updateDocumentNonBlocking } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User as UserIcon, Mail, Phone, Home, Loader2, Save } from 'lucide-react';
import ProfileHeader from './ProfileHeader';
import SecuritySettings from './SecuritySettings';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { doc } from 'firebase/firestore';

const ProfileSchema = z.object({
  phone: z.string().min(9, "El teléfono debe tener al menos 9 dígitos."),
  address: z.string().min(5, "Por favor, ingresa una dirección válida."),
});

export default function StudentProfileView() {
  const { profile, user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof ProfileSchema>>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      phone: profile?.phone || '',
      address: profile?.address || '',
    },
  });

  if (!profile) return null;

  async function onSubmit(values: z.infer<typeof ProfileSchema>) {
    if (!firestore || !user) return;
    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      await updateDocumentNonBlocking(userDocRef, values);
      toast({
        title: "Perfil actualizado",
        description: "Tus datos personales se han guardado correctamente.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al guardar",
        description: "No se pudieron actualizar los datos.",
      });
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-3">
        <ProfileHeader />
      </div>
      <div className="lg:col-span-2 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="text-primary" /> Datos Personales
            </CardTitle>
            <CardDescription>Actualiza tu información de contacto institucional.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Mail className="h-4 w-4" /> Email Institucional</Label>
                    <Input value={profile.email} disabled className="bg-muted" />
                  </FormItem>
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2"><Phone className="h-4 w-4" /> Teléfono</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: 987654321" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Home className="h-4 w-4" /> Dirección de Residencia</FormLabel>
                      <FormControl>
                        <Input placeholder="Av. Siempre Viva 123, Lima" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Guardar Cambios
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      <aside className="space-y-8">
        <SecuritySettings />
      </aside>
    </div>
  );
}
