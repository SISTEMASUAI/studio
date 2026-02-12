
'use client';

import { useState, useRef } from 'react';
import { useUser, useFirestore, useStorage, updateDocumentNonBlocking } from '@/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Upload, Loader2, Download, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function CurriculumPage() {
  const { profile, user } = useUser();
  const firestore = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !firestore || !storage) return;

    if (file.type !== 'application/pdf') {
      toast({
        variant: 'destructive',
        title: 'Error de formato',
        description: 'Por favor, sube solo archivos PDF.',
      });
      return;
    }

    setIsUploading(true);
    try {
      const storageRef = ref(storage, `users/${user.uid}/curriculum/cv_${user.uid}.pdf`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);

      const userDocRef = doc(firestore, 'users', user.uid);
      await updateDocumentNonBlocking(userDocRef, {
        cvUrl: downloadUrl,
        cvLastUpdated: new Date().toISOString(),
      });

      toast({
        title: '¡Currículum actualizado!',
        description: 'Tu CV ha sido subido correctamente.',
      });
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        variant: 'destructive',
        title: 'Error al subir',
        description: 'No se pudo completar la subida. Inténtalo de nuevo.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (profile?.role !== 'student') {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Acceso restringido</AlertTitle>
          <AlertDescription>Esta sección solo está disponible para estudiantes.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <section>
        <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
          <FileText className="text-primary" />
          Mi Currículum Profesional
        </h1>
        <p className="text-muted-foreground mt-2">
          Mantén tu perfil profesional actualizado para que las empresas puedan encontrarte en la Bolsa de Trabajo.
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Gestionar Currículum (CV)</CardTitle>
          <CardDescription>
            Sube tu currículum en formato PDF. Tamaño máximo: 5MB.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {profile?.cvUrl ? (
            <div className="flex flex-col sm:flex-row items-center gap-4 p-6 border-2 border-dashed rounded-xl bg-primary/5">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-grow text-center sm:text-left">
                <h3 className="font-bold text-lg">Currículum Actual</h3>
                <p className="text-sm text-muted-foreground">
                  Última actualización: {profile.cvLastUpdated ? new Date(profile.cvLastUpdated).toLocaleDateString() : 'Desconocida'}
                </p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="outline" asChild className="flex-1 sm:flex-none">
                  <a href={profile.cvUrl} target="_blank" rel="noopener noreferrer">
                    <Download className="mr-2 h-4 w-4" /> Ver CV
                  </a>
                </Button>
                <Button 
                  onClick={() => fileInputRef.current?.click()} 
                  disabled={isUploading}
                  className="flex-1 sm:flex-none"
                >
                  {isUploading ? <Loader2 className="animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                  Reemplazar
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed rounded-xl space-y-4">
              <div className="mx-auto h-16 w-16 bg-muted rounded-full flex items-center justify-center">
                <Upload className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Aún no has subido tu currículum</h3>
                <p className="text-sm text-muted-foreground">Sube tu archivo PDF para empezar a postular.</p>
              </div>
              <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                {isUploading ? <Loader2 className="animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                Subir CV (PDF)
              </Button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleUpload}
          />

          <Alert>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle>Recomendaciones para tu CV</AlertTitle>
            <AlertDescription className="text-sm">
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Usa un formato estándar y legible.</li>
                <li>Incluye tus habilidades técnicas y proyectos realizados en clase.</li>
                <li>Mantén tu información de contacto actualizada.</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
