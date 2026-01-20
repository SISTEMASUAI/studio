'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, DocumentData } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart, Loader2, User, AlertTriangle, Lightbulb, ShieldAlert } from 'lucide-react';
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

  // Usar useMemoFirebase en lugar de useMemo para los queries
  const studentsQuery = useMemoFirebase(
    () => firestore ? query(collection(firestore, 'users'), where('role', '==', 'student')) : null,
    [firestore]
  );
  const { data: students, isLoading: areStudentsLoading } = useCollection<StudentProfile>(studentsQuery);

  const selectedStudent = students?.find(s => s.id === selectedStudentId) || null;

  const attendanceQuery = useMemoFirebase(
    () => (firestore && selectedStudentId) ? query(collection(firestore, 'attendance'), where('studentId', '==', selectedStudentId)) : null,
    [firestore, selectedStudentId]
  );
  const { data: attendance, isLoading: isAttendanceLoading } = useCollection<AttendanceRecord>(attendanceQuery);

  const submissionsQuery = useMemoFirebase(
    () => (firestore && selectedStudentId) ? query(collection(firestore, 'submissions'), where('studentId', '==', selectedStudentId)) : null,
    [firestore, selectedStudentId]
  );
  const { data: submissions, isLoading: areSubmissionsLoading } = useCollection<AssignmentSubmission>(submissionsQuery);

  const handleAnalyze = async () => {
    if (!selectedStudent || !attendance || !submissions) return;

    setIsAnalyzing(true);
    setAnalysisResult(null);
    setAnalysisError(null);

    try {
      const result = await analyzeStudentRisk({
        student: selectedStudent,
        attendance,
        submissions,
      });
      setAnalysisResult(result);
    } catch (error: any) {
      console.error("Analysis failed:", error);
      setAnalysisError(error.message || "Ocurrió un error al analizar al estudiante. Intenta nuevamente.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskVariant = (risk: string) => {
    switch (risk) {
      case 'Alto': return 'destructive';
      case 'Medio': return 'secondary';
      default: return 'default';
    }
  };

  const getAlertVariant = (alert: string) => {
    switch (alert) {
      case 'Rojo': return 'destructive';
      case 'Naranja': return 'secondary';
      case 'Amarillo': return 'outline';
      case 'Verde': return 'default';
      default: return 'default';
    }
  };

  if (isUserLoading || !profile || profile.role !== 'admin') {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      <section>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ShieldAlert className="text-primary" />
          Asistente de Analítica IA - Retención Estudiantil
        </h1>
        <p className="text-muted-foreground mt-2">
          Analiza asistencias, calificaciones y patrones para identificar alumnos en riesgo de deserción.
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Selecciona un estudiante</CardTitle>
          <CardDescription>La IA analizará sus asistencias y rendimiento para estimar riesgo de deserción.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-center gap-4">
          <Select onValueChange={setSelectedStudentId} disabled={areStudentsLoading}>
            <SelectTrigger className="w-full sm:w-[320px]">
              <SelectValue placeholder={areStudentsLoading ? 'Cargando estudiantes...' : 'Selecciona un estudiante...'} />
            </SelectTrigger>
            <SelectContent>
              {students?.map(student => (
                <SelectItem key={student.id} value={student.id}>
                  {student.lastName}, {student.firstName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            onClick={handleAnalyze} 
            disabled={!selectedStudentId || isAnalyzing || isAttendanceLoading || areSubmissionsLoading}
            className="w-full sm:w-auto"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analizando...
              </>
            ) : (
              <>
                <BarChart className="mr-2 h-4 w-4" />
                Analizar Riesgo
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {analysisError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error en el análisis</AlertTitle>
          <AlertDescription>{analysisError}</AlertDescription>
        </Alert>
      )}

      {isAnalyzing && (
        <Card className="bg-muted/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="font-semibold text-lg">Procesando datos del estudiante...</p>
            <p className="text-sm text-muted-foreground mt-2">Evaluando asistencias, tendencias y riesgo de deserción</p>
          </CardContent>
        </Card>
      )}

      {analysisResult && selectedStudent && (
        <Card className="border-t-4" style={{ borderTopColor: 
          analysisResult.alertLevel === 'Rojo' ? '#ef4444' :
          analysisResult.alertLevel === 'Naranja' ? '#f97316' :
          analysisResult.alertLevel === 'Amarillo' ? '#eab308' :
          '#22c55e'
        }}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between flex-wrap gap-4">
              <span>
                Reporte de Riesgo para {selectedStudent.firstName} {selectedStudent.lastName}
              </span>
              <div className="flex gap-2">
                <Badge variant={getRiskVariant(analysisResult.riskLevel)}>
                  Riesgo Académico: {analysisResult.riskLevel}
                </Badge>
                <Badge variant={getAlertVariant(analysisResult.alertLevel)}>
                  Alerta: {analysisResult.alertLevel}
                </Badge>
              </div>
            </CardTitle>
            <CardDescription>
              Riesgo de deserción estimado: <strong>{analysisResult.riskOfDropout}</strong>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold flex items-center gap-2 mb-2">
                <User className="h-4 w-4" /> Resumen del análisis
              </h3>
              <p className="text-sm bg-muted p-4 rounded-md whitespace-pre-wrap">
                {analysisResult.summary}
              </p>
            </div>

            <div>
              <h3 className="font-semibold flex items-center gap-2 mb-2">
                <Lightbulb className="h-4 w-4" /> Recomendaciones de apoyo
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-sm">
                {analysisResult.supportRecommendations.map((rec, index) => (
                  <li key={index} className="text-muted-foreground">{rec}</li>
                ))}
              </ul>
            </div>

            <Alert variant="default" className="bg-amber-50 border-amber-200">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Importante</AlertTitle>
              <AlertDescription>
                Este análisis es una estimación preliminar realizada por IA. Recomendamos una evaluación humana completa, 
                contacto directo con el estudiante y revisión de datos adicionales.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}