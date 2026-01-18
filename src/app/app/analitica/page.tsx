'use client';

import { useState, useMemo } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, DocumentData } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { BarChart, Loader2, User, AlertTriangle, Wand2, Lightbulb } from 'lucide-react';
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
}

interface AssignmentSubmission extends DocumentData {
  grade?: number;
}

export default function AnalyticsPage() {
  const { profile, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeStudentRiskOutput | null>(null);

  if (!isUserLoading && profile?.role !== 'admin') {
    router.replace('/intranet');
    return null;
  }

  const studentsQuery = useMemoFirebase(
    () => firestore ? query(collection(firestore, 'users'), where('role', '==', 'student')) : null,
    [firestore]
  );
  const { data: students, isLoading: areStudentsLoading } = useCollection<StudentProfile>(studentsQuery);

  const selectedStudent = useMemo(() => {
    return students?.find(s => s.id === selectedStudentId) || null;
  }, [students, selectedStudentId]);

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

    try {
      const result = await analyzeStudentRisk({
        student: selectedStudent,
        attendance: attendance,
        submissions: submissions,
      });
      setAnalysisResult(result);
    } catch (error) {
      console.error("Analysis failed:", error);
      // Here you could show a toast or an error message
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskCardClassNames = (riskLevel: string | undefined) => {
    switch (riskLevel) {
      case 'Alto':
        return 'border-destructive bg-destructive/5';
      case 'Medio':
        return 'border-yellow-500 bg-yellow-500/5';
      case 'Bajo':
        return 'border-green-500 bg-green-500/5';
      default:
        return '';
    }
  };
  
  if (isUserLoading || !profile) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section>
        <div>
          <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
            <Wand2 className="text-primary" />
            Asistente de Analítica IA
          </h1>
          <p className="text-muted-foreground">
            Analiza el rendimiento estudiantil para identificar alumnos en riesgo.
          </p>
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Análisis de Riesgo Académico</CardTitle>
          <CardDescription>Selecciona un estudiante para que la IA analice su situación académica y estime su nivel de riesgo.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-center gap-4">
          <Select onValueChange={setSelectedStudentId} disabled={areStudentsLoading}>
            <SelectTrigger className="w-full sm:w-[320px]">
              <SelectValue placeholder={areStudentsLoading ? 'Cargando estudiantes...' : 'Selecciona un estudiante...'} />
            </SelectTrigger>
            <SelectContent>
              {students?.map(student => (
                <SelectItem key={student.id} value={student.id}>{student.lastName}, {student.firstName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleAnalyze} disabled={!selectedStudentId || isAnalyzing || isAttendanceLoading || areSubmissionsLoading}>
            {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BarChart className="mr-2" />}
            Analizar Estudiante
          </Button>
        </CardContent>
      </Card>

      {isAnalyzing && (
        <div className="flex flex-col items-center justify-center text-center p-8 bg-card rounded-lg border">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="font-semibold">Analizando datos del estudiante...</p>
            <p className="text-sm text-muted-foreground">La IA está procesando asistencias y calificaciones para generar un perfil de riesgo.</p>
        </div>
      )}

      {analysisResult && (
        <Card className={getRiskCardClassNames(analysisResult.riskLevel)}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
                <span>Reporte de Riesgo para {selectedStudent?.firstName} {selectedStudent?.lastName}</span>
                <Badge variant={analysisResult.riskLevel === 'Alto' ? 'destructive' : 'secondary'}>
                    Nivel de Riesgo: {analysisResult.riskLevel}
                </Badge>
            </CardTitle>
            <CardDescription>Análisis generado por IA basado en los datos académicos disponibles.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold flex items-center gap-2 mb-2"><User className="h-4 w-4"/> Resumen</h3>
              <p className="text-sm text-muted-foreground bg-background p-4 rounded-md">{analysisResult.summary}</p>
            </div>
             <div>
              <h3 className="font-semibold flex items-center gap-2 mb-2"><Lightbulb className="h-4 w-4"/> Recomendaciones</h3>
              <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground bg-background p-4 rounded-md">
                {analysisResult.recommendations.map((rec, index) => <li key={index}>{rec}</li>)}
              </ul>
            </div>
             <Alert variant="default">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Análisis Preliminar</AlertTitle>
                <AlertDescription>
                    Esta es una estimación basada en datos limitados. Se recomienda una revisión manual y contacto directo con el estudiante para una evaluación completa.
                </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
