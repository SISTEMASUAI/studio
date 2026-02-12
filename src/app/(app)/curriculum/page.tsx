
'use client';

import { useState, useRef, useEffect } from 'react';
import { useUser, useFirestore, useStorage, updateDocumentNonBlocking } from '@/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Upload, Loader2, Download, AlertCircle, CheckCircle2, Sparkles, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { parseCV, ParseCVOutput } from '@/ai/flows/parse-cv-flow';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const CurriculumSchema = z.object({
  professionalTitle: z.string().min(2, "El título es requerido."),
  summary: z.string().min(10, "El resumen debe ser más extenso."),
  skills: z.string().describe("Habilidades separadas por comas"),
  experience: z.string(),
  education: z.string(),
});

export default function CurriculumPage() {
  const { profile, user } = useUser();
  const firestore = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof CurriculumSchema>>({
    resolver: zodResolver(CurriculumSchema),
    defaultValues: {
      professionalTitle: '',
      summary: '',
      skills: '',
      experience: '',
      education: '',
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        professionalTitle: profile.professionalTitle || '',
        summary: profile.summary || '',
        skills: profile.skills?.join(', ') || '',
        experience: profile.experience || '',
        education: profile.education || '',
      });
    }
  }, [profile, form]);

  const handleFileAnalysis = async (file: File) => {
    setIsAnalyzing(true);
    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      const dataUri = await base64Promise;

      const aiResult = await parseCV({ pdfDataUri: dataUri });
      
      form.setValue('professionalTitle', aiResult.professionalTitle);
      form.setValue('summary', aiResult.summary);
      form.setValue('skills', aiResult.skills.join(', '));
      form.setValue('experience', aiResult.experience);
      form.setValue('education', aiResult.education);

      toast({
        title: "¡Análisis completado!",
        description: "Hemos extraído la información de tu CV. Por favor, revísala.",
      });
    } catch (error) {
      console.error('AI Analysis failed:', error);
      toast({
        variant: 'destructive',
        title: 'Error de análisis',
        description: 'No pudimos analizar el PDF automáticamente, pero aún puedes completar los campos manualmente.',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

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
      // 1. Upload to Storage
      const storageRef = ref(storage, `users/${user.uid}/curriculum/cv_${user.uid}.pdf`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);

      // 2. Save file URL to profile
      const userDocRef = doc(firestore, 'users', user.uid);
      await updateDocumentNonBlocking(userDocRef, {
        cvUrl: downloadUrl,
        cvLastUpdated: new Date().toISOString(),
      });

      // 3. Trigger AI Analysis
      await handleFileAnalysis(file);

    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        variant: 'destructive',
        title: 'Error al subir',
        description: 'No se pudo completar la subida.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const onSaveProfile = async (values: z.infer<typeof CurriculumSchema>) => {
    if (!firestore || !user) return;
    try {
      const skillsArray = values.skills.split(',').map(s => s.trim()).filter(s => s !== '');
      const userDocRef = doc(firestore, 'users', user.uid);
      await updateDocumentNonBlocking(userDocRef, {
        ...values,
        skills: skillsArray,
      });
      toast({
        title: "Currículum guardado",
        description: "Tu perfil profesional ha sido actualizado.",
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error al guardar',
        description: 'Hubo un problema al guardar tus datos.',
      });
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
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <section>
        <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
          <FileText className="text-primary" />
          Mi Perfil Profesional con IA
        </h1>
        <p className="text-muted-foreground mt-2">
          Sube tu CV para que la IA autocomplete tu perfil. Podrás editar los campos manualmente después.
        </p>
      </section>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Archivo CV (PDF)</CardTitle>
              <CardDescription>Sube tu documento para análisis.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="group relative cursor-pointer border-2 border-dashed rounded-xl p-8 transition-colors hover:border-primary/50 hover:bg-primary/5 flex flex-col items-center text-center gap-3"
              >
                {isUploading || isAnalyzing ? (
                  <>
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-sm font-medium animate-pulse">
                      {isUploading ? 'Subiendo archivo...' : 'IA Analizando CV...'}
                    </p>
                  </>
                ) : profile?.cvUrl ? (
                  <>
                    <CheckCircle2 className="h-10 w-10 text-green-500" />
                    <p className="text-sm font-medium text-green-600">CV Cargado</p>
                    <p className="text-xs text-muted-foreground">Haz clic para reemplazar</p>
                  </>
                ) : (
                  <>
                    <Upload className="h-10 w-10 text-muted-foreground group-hover:text-primary transition-colors" />
                    <p className="text-sm font-medium">Subir PDF</p>
                    <p className="text-xs text-muted-foreground">Máximo 5MB</p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleUpload}
                  disabled={isUploading || isAnalyzing}
                />
              </div>

              {profile?.cvUrl && (
                <Button variant="outline" className="w-full" asChild>
                  <a href={profile.cvUrl} target="_blank" rel="noopener noreferrer">
                    <Download className="mr-2 h-4 w-4" /> Descargar mi PDF
                  </a>
                </Button>
              )}

              <Alert className="bg-primary/5 border-primary/20">
                <Sparkles className="h-4 w-4 text-primary" />
                <AlertTitle className="text-xs font-bold text-primary uppercase tracking-wider">Tip IA</AlertTitle>
                <AlertDescription className="text-xs leading-relaxed">
                  Nuestra IA extrae experiencia, habilidades y educación para facilitar tu postulación a ofertas.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Perfil Extraído
              </CardTitle>
              <CardDescription>
                Revisa y completa los campos. Lo que no detecte la IA, complétalo manualmente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSaveProfile)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="professionalTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título Profesional / Headline</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Desarrollador Web Full Stack | Estudiante de Software" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="summary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Resumen Profesional</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Breve descripción de quién eres y tus objetivos..." 
                            className="min-h-[100px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="skills"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Habilidades (separadas por comas)</FormLabel>
                        <FormControl>
                          <Input placeholder="React, Node.js, Inglés Avanzado, Liderazgo..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="experience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Experiencia Laboral</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Resume tu experiencia..." 
                              className="min-h-[150px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="education"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Educación</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Resumen de estudios..." 
                              className="min-h-[150px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="pt-4 border-t flex justify-end">
                    <Button type="submit" size="lg" className="px-8 shadow-lg">
                      <Save className="mr-2 h-4 w-4" />
                      Guardar Perfil Profesional
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
