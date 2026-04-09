'use client';

import { useState } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, DocumentData, getDocs } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BarChart3, Loader2, User, AlertTriangle, Lightbulb, ShieldAlert,
  GraduationCap, ClipboardList, CheckCircle2, Bell, Activity, TrendingUp
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { analyzeStudentRisk } from '@/ai/flows/analyze-student-risk';
import type { RiskAnalysisOutput } from '@/lib/academic-risk-engine';
import { useEffect } from 'react';

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

// Extendemos el output para incluir los campos extras del motor
type RiskResult = RiskAnalysisOutput & {
  notificationSent?: boolean;
};

export default function AnalyticsPage() {
  const { profile, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<RiskResult | null>(null);
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
      // 1. Obtener asistencias
      const attSnap = await getDocs(query(collection(firestore, 'attendance'), where('studentId', '==', selectedStudentId)));
      const attendance = attSnap.docs.map(doc => doc.data() as AttendanceRecord);

      // 2. Obtener inscripciones para saber en qué cursos buscar
      const enrollSnap = await getDocs(query(collection(firestore, 'enrollments'), where('studentId', '==', selectedStudentId)));
      const courseIds = enrollSnap.docs.map(doc => doc.data().courseId);

      // 3. Obtener entregas y exámenes por cada curso
      let allSubmissions: AssignmentSubmission[] = [];
      let allQuizzes: QuizResult[] = [];

      await Promise.all(courseIds.map(async (courseId) => {
        const subSnap = await getDocs(query(
          collection(firestore, 'courses', courseId, 'submissions'),
          where('studentId', '==', selectedStudentId)
        ));
        const subs = subSnap.docs.map(d => ({ ...d.data(), courseId } as AssignmentSubmission));
        allSubmissions = [...allSubmissions, ...subs];

        const quizSnap = await getDocs(query(
          collection(firestore, 'courses', courseId, 'quizResults'),
          where('userId', '==', selectedStudentId)
        ));
        const results = quizSnap.docs.map(d => ({ ...d.data(), courseId } as QuizResult));
        allQuizzes = [...allQuizzes, ...results];
      }));

      // 4. Llamada al motor de cálculo propio (sin IA externa)
      const result = await analyzeStudentRisk({
        student: { uid: student.uid, firstName: student.firstName, lastName: student.lastName },
        attendance,
        submissions: allSubmissions,
        quizzes: allQuizzes,
      });

      setAnalysisResult(result as RiskResult);
    } catch (error: any) {
      console.error('Análisis fallido:', error);
      setAnalysisError('Ocurrió un error al procesar los datos del alumno. Intenta nuevamente.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getAlertStyles = (alert: string) => {
    switch (alert) {
      case 'Rojo':    return { border: 'border-red-500',    bg: 'bg-red-50',    text: 'text-red-700',    bar: 'bg-red-500',    icon: <AlertTriangle className="text-red-500" /> };
      case 'Naranja': return { border: 'border-orange-500', bg: 'bg-orange-50', text: 'text-orange-700', bar: 'bg-orange-500', icon: <AlertTriangle className="text-orange-500" /> };
      case 'Amarillo':return { border: 'border-yellow-500', bg: 'bg-yellow-50', text: 'text-yellow-700', bar: 'bg-yellow-500', icon: <AlertTriangle className="text-yellow-500" /> };
      case 'Verde':   return { border: 'border-green-500',  bg: 'bg-green-50',  text: 'text-green-700',  bar: 'bg-green-500',  icon: <CheckCircle2 className="text-green-500" /> };
      default:        return { border: 'border-gray-200',   bg: 'bg-gray-50',   text: 'text-gray-700',   bar: 'bg-gray-400',   icon: null };
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
      {/* Header */}
      <section>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ShieldAlert className="text-primary" />
          Analítica de Riesgo Académico
        </h1>
        <p className="text-muted-foreground mt-2">
          Motor de cálculo propio — analiza asistencias, tareas y exámenes para generar un perfil de riesgo y notificar al alumno.
        </p>
      </section>

      {/* Selección de alumno */}
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
                Calculando...
              </>
            ) : (
              <>
                <BarChart3 className="mr-2 h-4 w-4" />
                Generar Reporte
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Error */}
      {analysisError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error en el proceso</AlertTitle>
          <AlertDescription>{analysisError}</AlertDescription>
        </Alert>
      )}

      {/* Loading state */}
      {isAnalyzing && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="relative">
            <Loader2 className="h-16 w-16 animate-spin text-primary opacity-20" />
            <Activity className="h-8 w-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="font-semibold text-lg animate-pulse">Procesando datos académicos...</p>
          <div className="flex gap-2">
            <Badge variant="outline" className="animate-bounce delay-75">Asistencia</Badge>
            <Badge variant="outline" className="animate-bounce delay-150">Tareas</Badge>
            <Badge variant="outline" className="animate-bounce delay-300">Exámenes</Badge>
          </div>
        </div>
      )}

      {/* Resultado */}
      {analysisResult && studentSelected && (
        <Card className={`border-l-8 ${getAlertStyles(analysisResult.alertLevel).border}`}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start gap-4 flex-wrap">
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

            {/* Notificación enviada */}
            {analysisResult.notificationSent && (
              <Alert className="bg-blue-50 border-blue-300">
                <Bell className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-800">Notificación enviada al alumno</AlertTitle>
                <AlertDescription className="text-blue-700">
                  Se ha enviado una notificación a <strong>{studentSelected.firstName}</strong> informando sobre su situación académica (Alerta {analysisResult.alertLevel}).
                </AlertDescription>
              </Alert>
            )}

            {/* Métricas reales */}
            {analysisResult.metrics && (
              <div className="grid gap-4 md:grid-cols-3">

                {/* Asistencia */}
                <Card className="bg-muted/30">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-blue-500" />
                      <p className="text-xs text-muted-foreground uppercase font-bold">Asistencia</p>
                    </div>
                    <p className="text-2xl font-bold">{analysisResult.metrics.attendanceRate.toFixed(1)}%</p>
                    <Progress value={analysisResult.metrics.attendanceRate} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {analysisResult.metrics.totalAbsences} ausencia(s) de {analysisResult.metrics.totalRecords} clases
                    </p>
                  </CardContent>
                </Card>

                {/* Promedio Tareas */}
                <Card className="bg-muted/30">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <ClipboardList className="h-5 w-5 text-green-500" />
                      <p className="text-xs text-muted-foreground uppercase font-bold">Prom. Tareas</p>
                    </div>
                    <p className="text-2xl font-bold">
                      {analysisResult.metrics.averageGrade !== null
                        ? `${analysisResult.metrics.averageGrade.toFixed(1)}/20`
                        : 'Sin datos'}
                    </p>
                    <Progress
                      value={analysisResult.metrics.averageGrade !== null
                        ? (analysisResult.metrics.averageGrade / 20) * 100
                        : 0}
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground">Escala 0–20 puntos</p>
                  </CardContent>
                </Card>

                {/* Promedio Exámenes */}
                <Card className="bg-muted/30">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-purple-500" />
                      <p className="text-xs text-muted-foreground uppercase font-bold">Prom. Exámenes</p>
                    </div>
                    <p className="text-2xl font-bold">
                      {analysisResult.metrics.quizAverage !== null
                        ? `${analysisResult.metrics.quizAverage.toFixed(1)}/20`
                        : 'Sin datos'}
                    </p>
                    <Progress
                      value={analysisResult.metrics.quizAverage !== null
                        ? (analysisResult.metrics.quizAverage / 20) * 100
                        : 0}
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground">Escala 0–20 puntos</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Score compuesto */}
            {analysisResult.metrics && (
              <Card className="bg-muted/20">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <p className="font-semibold">Puntuación Compuesta de Riesgo</p>
                    </div>
                    <span className={`font-bold text-lg ${getAlertStyles(analysisResult.alertLevel).text}`}>
                      {analysisResult.metrics.finalScore.toFixed(0)}/100
                    </span>
                  </div>
                  <Progress value={analysisResult.metrics.finalScore} className="h-3" />
                  <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground text-center pt-1">
                    <div>
                      <p className="font-medium">Asistencia (35%)</p>
                      <p>{analysisResult.metrics.attendanceScore.toFixed(0)} pts</p>
                    </div>
                    <div>
                      <p className="font-medium">Notas (40%)</p>
                      <p>{analysisResult.metrics.gradeScore.toFixed(0)} pts</p>
                    </div>
                    <div>
                      <p className="font-medium">Tendencia (25%)</p>
                      <p>{analysisResult.metrics.trendScore.toFixed(0)} pts</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Diagnóstico */}
            <div className="bg-muted/50 p-6 rounded-xl border">
              <h3 className="font-bold flex items-center gap-2 mb-4 text-lg">
                <User className="h-5 w-5 text-primary" /> Diagnóstico del Sistema
              </h3>
              <p className="text-base leading-relaxed text-foreground/90 whitespace-pre-wrap">
                {analysisResult.summary}
              </p>
            </div>

            {/* Recomendaciones */}
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

            {/* Nota del sistema */}
            <Alert className="bg-slate-50 border-slate-200">
              <Activity className="h-4 w-4 text-slate-600" />
              <AlertTitle className="text-slate-800">Metodología de Cálculo</AlertTitle>
              <AlertDescription className="text-slate-700">
                El riesgo se calcula con un motor de reglas propio sin dependencia de IA externa. Pondera asistencia (35%), promedio académico (40%) y tendencia reciente (25%).
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
