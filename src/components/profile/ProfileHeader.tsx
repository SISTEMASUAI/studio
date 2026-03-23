
'use client';

import { useState, useRef } from 'react';
import { useUser, useFirestore, useStorage, updateDocumentNonBlocking } from '@/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Edit, Loader2, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ProfileHeader() {
  const { profile, user } = useUser();
  const firestore = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!profile) return (
      <Card>
          <CardContent className="pt-6 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin"/>
          </CardContent>
      </Card>
  );

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !firestore || !storage) return;

    setIsUploading(true);
    try {
      const storageRef = ref(storage, `users/${user.uid}/profile_picture`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);

      const userDocRef = doc(firestore, 'users', user.uid);
      await updateDocumentNonBlocking(userDocRef, { profilePicture: downloadUrl });

      toast({
        title: "Foto actualizada",
        description: "Tu imagen de perfil se ha actualizado correctamente.",
      });
    } catch (error) {
      console.error("Upload failed:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo subir la imagen.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="border-none shadow-md overflow-hidden bg-gradient-to-r from-primary/5 to-background">
      <CardContent className="pt-8 pb-8 flex flex-col items-center text-center gap-6 sm:flex-row sm:text-left px-8">
        <div className="relative group">
          <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
            <AvatarImage src={profile.profilePicture} alt={profile.firstName} className="object-cover" />
            <AvatarFallback className="text-3xl font-bold bg-primary/10 text-primary">
              {profile.firstName?.[0]}{profile.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-not-allowed"
          >
            {isUploading ? <Loader2 className="animate-spin" /> : <Camera className="h-8 w-8" />}
          </button>
          <input 
            ref={fileInputRef}
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handlePhotoChange}
          />
        </div>
        <div className="flex-grow space-y-1">
          <h2 className="text-3xl font-bold font-headline text-foreground">
            {profile.firstName} {profile.lastName}
          </h2>
          <p className="text-lg text-muted-foreground flex items-center justify-center sm:justify-start gap-2">
            {profile.email}
          </p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
            <Badge variant="default" className="capitalize px-4 py-1">
              {profile.role === 'student' ? 'Estudiante' : profile.role === 'professor' ? 'Docente' : 'Administrador'}
            </Badge>
            <Badge variant="outline" className="bg-background">
              ID: {profile.uid.substring(0, 8)}...
            </Badge>
          </div>
        </div>
        <Button 
          variant="outline" 
          onClick={() => fileInputRef.current?.click()} 
          disabled={isUploading}
          className="shadow-sm"
        >
          {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Edit className="mr-2 h-4 w-4" />}
          Cambiar Foto
        </Button>
      </CardContent>
    </Card>
  );
}
