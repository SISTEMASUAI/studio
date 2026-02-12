
'use client';

import { useState, useRef, useEffect } from 'react';
import { useUser, useFirestore, useStorage, updateDocumentNonBlocking } from '@/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Upload, Loader2, Download, AlertCircle, CheckCircle2, Sparkles, Save, GraduationCap, Briefcase } from 'lucide-react';
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
        variant: "destructive",
        title: "Error al guardar",
        description: "Hubo un problema al guardar tus datos.",
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
    <div className="max-w-6xl mx-auto space-y-8 pb-20 px-4">
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
            <FileText className="text-primary" />
            Perfil Profesional Inteligente
          </h1>
          <p className="text-muted-foreground mt-1">
            Optimiza tu perfil con nuestra IA para destacar en la bolsa de trabajo.
          </p>
        </div>
        <div className="flex gap-2">
           {profile?.cvUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a href={profile.cvUrl} target="_blank" rel="noopener noreferrer">
                    <Download className="mr-2 h-4 w-4" /> Ver PDF actual
                  </a>
                </Button>
              )}
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Sidebar de subida */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-primary/10 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Tu Archivo CV</CardTitle>
              <CardDescription>Formatos aceptados: PDF</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="group relative cursor-pointer border-2 border-dashed rounded-xl p-6 transition-all hover:border-primary/50 hover:bg-primary/5 flex flex-col items-center text-center gap-3"
              >
                {isUploading || isAnalyzing ? (
                  <>
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-xs font-medium animate-pulse">
                      {isUploading ? 'Subiendo...' : 'IA Analizando...'}
                    </p>
                  </>
                ) : profile?.cvUrl ? (
                  <>
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    </div>
                    <p className="text-xs font-semibold text-green-700">Archivo en la nube</p>
                    <p className="text-[10px] text-muted-foreground px-2">Haz clic para reemplazar tu CV</p>
                  </>
                ) : (
                  <>
                    <Upload className="h-10 w-10 text-muted-foreground group-hover:text-primary transition-colors" />
                    <p className="text-xs font-medium">Sube tu PDF aquí</p>
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

              <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-xs font-bold text-primary uppercase">Asistente IA</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Al subir tu CV, Gemini extraerá automáticamente tu experiencia para ahorrarte tiempo.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Formulario Principal */}
        <div className="lg:col-span-3">
          <Card className="shadow-md">
            <CardHeader className="border-b bg-muted/30">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Información Profesional
                  </CardTitle>
                  <CardDescription>
                    Revisa y ajusta los datos que la IA ha detectado.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSaveProfile)} className="space-y-8">
                  <div className="grid gap-6">
                    <FormField
                      control={form.control}
                      name="professionalTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-bold">Título / Headline</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: Desarrollador Full Stack | Estudiante de Ingeniería" className="h-12 text-lg shadow-sm" {...field} />
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
                          <FormLabel className="text-base font-bold">Resumen Ejecutivo</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Breve descripción de tu perfil profesional..." 
                              className="min-h-[120px] text-base leading-relaxed resize-y shadow-sm" 
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
                          <FormLabel className="text-base font-bold">Habilidades clave</FormLabel>
                          <FormControl>
                            <Input placeholder="Java, SQL, Liderazgo, Agile..." className="h-11 shadow-sm" {...field} />
                          </FormControl>
                          <FormDescription className="text-xs">Separa tus habilidades con comas.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-8 pt-4">
                      <FormField
                        control={form.control}
                        name="experience"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-bold flex items-center gap-2">
                              <Briefcase className="h-4 w-4 text-primary" />
                              Trayectoria Laboral
                            </FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Detalla tus roles anteriores..." 
                                className="min-h-[200px] text-sm leading-relaxed shadow-sm font-sans" 
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
                            <FormLabel className="text-base font-bold flex items-center gap-2">
                              <GraduationCap className="h-4 w-4 text-primary" />
                              Formación Académica
                            </FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Títulos, cursos y certificaciones..." 
                                className="min-h-[180px] text-sm leading-relaxed shadow-sm font-sans" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-muted-foreground italic">
                      Última actualización: {profile?.cvLastUpdated ? new Date(profile.cvLastUpdated).toLocaleString() : 'Nunca'}
                    </p>
                    <Button type="submit" size="lg" className="w-full sm:w-auto px-10 shadow-lg transition-transform active:scale-95">
                      <Save className="mr-2 h-5 w-5" />
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
