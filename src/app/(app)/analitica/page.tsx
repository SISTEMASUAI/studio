'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, DocumentData, getDocs } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart, Loader2, User, AlertTriangle, Lightbulb, ShieldAlert, GraduationCap, ClipboardList, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { analyzeStudentRisk, AnalyzeStudentRiskOutput } from '@/ai/flows/analyze-student-risk';

interface StudentProfile extends DocumentData {
  id: string;
  uid: string;
  firstName: string;
  lastName: string;
}

interface AttendanceRecord extends DocumentData {
  status: 'presente' | 'ausente' | 'tarde' | 'justificado';
  date: string;
  courseId: string;
}

interface AssignmentSubmission extends DocumentData {
  grade?: number;
  assignmentId: string;
  submittedAt: string;
  courseId?: string;
}

interface QuizResult extends DocumentData {
  score: number;
  quizId: string;
  completionDate: string;
  courseId: string;
  userId: string;
}

export default function AnalyticsPage() {
  const { profile, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeStudentRiskOutput | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  useEffect(() => {
    if (!isUserLoading && profile?.role !== 'admin') {
      router.replace('/intranet');
    }
  }, [isUserLoading, profile, router]);

  const studentsQuery = useMemoFirebase(
    () => firestore ? query(collection(firestore, 'users'), where('role', '==', 'student')) : null,
    [firestore]
  );
  const { data: students, isLoading: areStudentsLoading } = useCollection<StudentProfile>(studentsQuery);

  const handleAnalyze = async () => {
    if (!firestore || !selectedStudentId) return;

    const student = students?.find(s => s.uid === selectedStudentId);
    if (!student) return;

    setIsAnalyzing(true);
    setAnalysisResult(null);
    setAnalysisError(null);

    try {
      // 1. Obtener asistencias (colección de primer nivel)
      const attSnap = await getDocs(query(collection(firestore, 'attendance'), where('studentId', '==', selectedStudentId)));
      const attendance = attSnap.docs.map(doc => doc.data() as AttendanceRecord);

      // 2. Obtener inscripciones para saber en qué cursos buscar las subcolecciones
      const enrollSnap = await getDocs(query(collection(firestore, 'enrollments'), where('studentId', '==', selectedStudentId)));
      const courseIds = enrollSnap.docs.map(doc => doc.data().courseId);

      // 3. Obtener entregas y exámenes por cada curso (evitando collectionGroup para no requerir índices manuales)
      let allSubmissions: AssignmentSubmission[] = [];
      let allQuizzes: QuizResult[] = [];

      // Procesamos las subcolecciones de cada curso del alumno
      await Promise.all(courseIds.map(async (courseId) => {
        // Buscar entregas del alumno en este curso específico
        const subSnap = await getDocs(query(
          collection(firestore, 'courses', courseId, 'submissions'), 
          where('studentId', '==', selectedStudentId)
        ));
        const subs = subSnap.docs.map(d => ({ ...d.data(), courseId } as AssignmentSubmission));
        allSubmissions = [...allSubmissions, ...subs];

        // Buscar resultados de exámenes del alumno en este curso específico
        const quizSnap = await getDocs(query(
          collection(firestore, 'courses', courseId, 'quizResults'), 
          where('userId', '==', selectedStudentId)
        ));
        const results = quizSnap.docs.map(d => ({ ...d.data(), courseId } as QuizResult));
        allQuizzes = [...allQuizzes, ...results];
      }));

      // 4. Llamada al flujo de IA con todos los datos recolectados
      const result = await analyzeStudentRisk({
        student: { uid: student.uid, firstName: student.firstName, lastName: student.lastName },
        attendance,
        submissions: allSubmissions,
        quizzes: allQuizzes,
      });

      setAnalysisResult(result);
    } catch (error: any) {
      console.error("Análisis fallido:", error);
      let message = "Ocurrió un error al procesar los datos. Intenta nuevamente.";
      
      if (error.message?.includes('fetch failed')) {
        message = "No se pudo conectar con el servidor de IA local (Ollama). Asegúrate de que Ollama esté ejecutándose y que hayas descargado el modelo con 'ollama pull llama3'.";
      }
      
      setAnalysisError(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getAlertStyles = (alert: string) => {
    switch (alert) {
      case 'Rojo': return { border: 'border-red-500', bg: 'bg-red-50', text: 'text-red-700', icon: <AlertTriangle className="text-red-500" /> };
      case 'Naranja': return { border: 'border-orange-500', bg: 'bg-orange-50', text: 'text-orange-700', icon: <AlertTriangle className="text-orange-500" /> };
      case 'Amarillo': return { border: 'border-yellow-500', bg: 'bg-yellow-50', text: 'text-yellow-700', icon: <AlertTriangle className="text-yellow-500" /> };
      case 'Verde': return { border: 'border-green-500', bg: 'bg-green-50', text: 'text-green-700', icon: <CheckCircle2 className="text-green-500" /> };
      default: return { border: 'border-gray-200', bg: 'bg-gray-50', text: 'text-gray-700', icon: null };
    }
  };

  if (isUserLoading || !profile || profile.role !== 'admin') {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const studentSelected = students?.find(s => s.uid === selectedStudentId);

  return (
    <div className="space-y-8 p-6">
      <section>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ShieldAlert className="text-primary" />
          Analítica IA Avanzada - Riesgo Académico
        </h1>
        <p className="text-muted-foreground mt-2">
          La IA evalúa asistencias, tareas y exámenes para generar un perfil de riesgo integral.
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Selección de Alumno</CardTitle>
          <CardDescription>El análisis cruzará datos de todas las materias en las que está inscrito.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-center gap-4">
          <Select onValueChange={setSelectedStudentId} disabled={areStudentsLoading}>
            <SelectTrigger className="w-full sm:w-[320px]">
              <SelectValue placeholder={areStudentsLoading ? 'Cargando lista...' : 'Selecciona un alumno...'} />
            </SelectTrigger>
            <SelectContent>
              {students?.map(student => (
                <SelectItem key={student.uid} value={student.uid}>
                  {student.lastName}, {student.firstName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            onClick={handleAnalyze} 
            disabled={!selectedStudentId || isAnalyzing}
            className="w-full sm:w-auto"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando Big Data...
              </>
            ) : (
              <>
                <BarChart className="mr-2 h-4 w-4" />
                Generar Reporte IA
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {analysisError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error en el proceso</AlertTitle>
          <AlertDescription>{analysisError}</AlertDescription>
        </Alert>
      )}

      {isAnalyzing && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="relative">
            <Loader2 className="h-16 w-16 animate-spin text-primary opacity-20" />
            <ShieldAlert className="h-8 w-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="font-semibold text-lg animate-pulse">Correlacionando asistencias con calificaciones...</p>
          <div className="flex gap-2">
            <Badge variant="outline" className="animate-bounce delay-75">Firestore</Badge>
            <Badge variant="outline" className="animate-bounce delay-150">Genkit AI</Badge>
            <Badge variant="outline" className="animate-bounce delay-300">Ollama Local</Badge>
          </div>
        </div>
      )}

      {analysisResult && studentSelected && (
        <Card className={`border-l-8 ${getAlertStyles(analysisResult.alertLevel).border}`}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start gap-4">
              <div>
                <CardTitle className="text-2xl">
                  Reporte de Situación: {studentSelected.firstName} {studentSelected.lastName}
                </CardTitle>
                <CardDescription className="text-base mt-1">
                  Probabilidad de deserción: <span className="font-bold underline">{analysisResult.riskOfDropout}</span>
                </CardDescription>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge className="text-sm px-3 py-1" variant={analysisResult.riskLevel === 'Alto' ? 'destructive' : 'secondary'}>
                  Riesgo {analysisResult.riskLevel}
                </Badge>
                <div className={`flex items-center gap-1 text-sm font-bold ${getAlertStyles(analysisResult.alertLevel).text}`}>
                  {getAlertStyles(analysisResult.alertLevel).icon}
                  Alerta {analysisResult.alertLevel}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-8 pt-4">
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="bg-muted/30">
                    <CardContent className="p-4 flex items-center gap-3">
                        <BarChart className="h-8 w-8 text-blue-500" />
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-bold">Asistencias</p>
                            <p className="text-sm font-medium">Analizadas</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-muted/30">
                    <CardContent className="p-4 flex items-center gap-3">
                        <ClipboardList className="h-8 w-8 text-green-500" />
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-bold">Tareas</p>
                            <p className="text-sm font-medium">Calificadas</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-muted/30">
                    <CardContent className="p-4 flex items-center gap-3">
                        <GraduationCap className="h-8 w-8 text-purple-500" />
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-bold">Exámenes</p>
                            <p className="text-sm font-medium">Procesados</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="bg-muted/50 p-6 rounded-xl border">
              <h3 className="font-bold flex items-center gap-2 mb-4 text-lg">
                <User className="h-5 w-5 text-primary" /> Diagnóstico de la IA
              </h3>
              <p className="text-base leading-relaxed text-foreground/90 whitespace-pre-wrap">
                {analysisResult.summary}
              </p>
            </div>

            <div>
              <h3 className="font-bold flex items-center gap-2 mb-4 text-lg">
                <Lightbulb className="h-5 w-5 text-amber-500" /> Plan de Acción Recomendado
              </h3>
              <div className="grid gap-3">
                {analysisResult.supportRecommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-background border rounded-lg shadow-sm">
                    <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                      {index + 1}
                    </div>
                    <p className="text-sm">{rec}</p>
                  </div>
                ))}
              </div>
            </div>

            <Alert className="bg-blue-50 border-blue-200">
              <AlertTriangle className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800">Nota del Sistema</AlertTitle>
              <AlertDescription className="text-blue-700">
                Este análisis ha sido generado cruzando datos históricos de asistencia, notas de tareas y el desempeño en los últimos exámenes de todos los cursos registrados.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
