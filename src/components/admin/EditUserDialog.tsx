
'use client';

import { useState, useRef, useEffect } from 'react';
import { useFirestore, useStorage, updateDocumentNonBlocking } from '@/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera, Loader2, Save, X } from 'lucide-react';

const UserSchema = z.object({
  phone: z.string().optional(),
  address: z.string().optional(),
  birthDate: z.string().optional(),
  role: z.enum(['student', 'professor', 'admin', 'staff']),
  status: z.enum(['active', 'inactive']),
});

interface EditUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
}

export default function EditUserDialog({ isOpen, onOpenChange, user }: EditUserDialogProps) {
  const firestore = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(user?.profilePicture);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof UserSchema>>({
    resolver: zodResolver(UserSchema),
    defaultValues: {
      phone: user?.phone || '',
      address: user?.address || '',
      birthDate: user?.birthDate || '',
      role: user?.role || 'student',
      status: user?.status || 'active',
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        phone: user.phone || '',
        address: user.address || '',
        birthDate: user.birthDate || '',
        role: user.role,
        status: user.status || 'active',
      });
      setPreviewImage(user.profilePicture);
    }
  }, [user, form]);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !firestore || !storage || !user) return;

    setIsUploading(true);
    try {
      const storageRef = ref(storage, `users/${user.uid}/profile_picture`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);

      const userDocRef = doc(firestore, 'users', user.uid);
      updateDocumentNonBlocking(userDocRef, { profilePicture: downloadUrl });
      setPreviewImage(downloadUrl);

      toast({ title: "Foto actualizada", description: "La imagen de perfil se ha guardado correctamente." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo subir la imagen." });
    } finally {
      setIsUploading(false);
    }
  };

  async function onSubmit(values: z.infer<typeof UserSchema>) {
    if (!firestore || !user) return;
    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      updateDocumentNonBlocking(userDocRef, values);
      toast({ title: "Perfil actualizado", description: `Los datos de ${user.firstName} se han guardado correctamente.` });
      onOpenChange(false);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudieron actualizar los datos." });
    }
  }

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Editar Perfil de Usuario</DialogTitle>
          <DialogDescription>Modifica los datos personales y de contacto del usuario seleccionado.</DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="bg-primary h-24 relative">
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2 text-white hover:bg-white/20 rounded-full"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="px-8 pb-8 -mt-12 relative">
              <div className="flex flex-col sm:flex-row items-end gap-6 mb-8">
                <div className="relative group">
                  <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                    <AvatarImage src={previewImage} className="object-cover" />
                    <AvatarFallback className="text-3xl font-bold bg-neutral-100 text-neutral-400">
                      {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    {isUploading ? <Loader2 className="animate-spin" /> : <Camera className="h-8 w-8" />}
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                </div>
                <div className="flex-grow pb-2">
                  <h2 className="text-2xl font-bold font-headline">{user.firstName} {user.lastName}</h2>
                  <p className="text-muted-foreground font-medium">{user.email}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">Rol Institucional</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar rol" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="student">Estudiante</SelectItem>
                            <SelectItem value="professor">Docente</SelectItem>
                            <SelectItem value="staff">Personal (Staff)</SelectItem>
                            <SelectItem value="admin">Administrador</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">Estado de Cuenta</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Estado" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Activo</SelectItem>
                            <SelectItem value="inactive">Suspendido / Inactivo</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">Teléfono de Contacto</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: 987654321" className="h-11" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="birthDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">Fecha de Nacimiento</FormLabel>
                        <FormControl>
                          <Input type="date" className="h-11" {...field} />
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
                      <FormLabel className="font-bold">Dirección Residencial</FormLabel>
                      <FormControl>
                        <Input placeholder="Calle, Número, Distrito" className="h-11" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <DialogFooter className="px-8 py-6 bg-neutral-50 border-t">
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)} className="h-11 px-6">
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting} className="h-11 px-8 font-bold shadow-md">
                {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Guardar Cambios
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
