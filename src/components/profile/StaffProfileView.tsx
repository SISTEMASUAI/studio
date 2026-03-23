
'use client';

import { useUser, useFirestore, updateDocumentNonBlocking } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { User as UserIcon, Mail, Phone, Home, Loader2, Save, Briefcase } from 'lucide-react';
import ProfileHeader from './ProfileHeader';
import SecuritySettings from './SecuritySettings';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { doc } from 'firebase/firestore';
import { useEffect } from 'react';

const ProfileSchema = z.object({
  phone: z.string().min(9, "El teléfono debe tener al menos 9 dígitos."),
  address: z.string().min(5, "Por favor, ingresa una dirección válida."),
  bio: z.string().optional(),
  professionalTitle: z.string().optional(),
});

export default function StaffProfileView() {
  const { profile, user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof ProfileSchema>>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      phone: profile?.phone || '',
      address: profile?.address || '',
      bio: profile?.bio || '',
      professionalTitle: profile?.professionalTitle || '',
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        phone: profile.phone || '',
        address: profile.address || '',
        bio: profile.bio || '',
        professionalTitle: profile.professionalTitle || '',
      });
    }
  }, [profile, form]);

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
              <UserIcon className="text-primary" /> Información de Contacto
            </CardTitle>
            <CardDescription>Datos para la comunicación institucional.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Mail className="h-4 w-4" /> Email Institucional
                    </FormLabel>
                    <FormControl>
                      <Input value={profile.email} disabled className="bg-muted" />
                    </FormControl>
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
                      <FormLabel className="flex items-center gap-2"><Home className="h-4 w-4" /> Dirección de Oficina / Residencia</FormLabel>
                      <FormControl>
                        <Input placeholder="Av. Siempre Viva 123, Lima" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-6 pt-4 border-t">
                  <h3 className="font-bold flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-primary" /> Perfil Profesional
                  </h3>
                  
                  <FormField
                    control={form.control}
                    name="professionalTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título / Especialidad (Ej: Psicólogo Clínico)</FormLabel>
                        <FormControl>
                          <Input placeholder="Especialidad profesional..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Breve Biografía</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe tu rol y experiencia para que los alumnos te conozcan..." 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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
