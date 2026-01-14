// src/types/course.ts

// Tipo principal del documento en la colección 'courses'
export interface Course {
    // Campos básicos / identificadores
    courseId?: string;              // a veces se guarda como campo, aunque Firestore usa el doc ID
    name: string;
    description: string;
    facultyId: string;              // referencia a facultad
    programId: string;              // referencia a programa/carrera
    instructorId: string;           // UID del profesor
  
    // Características académicas
    level: string;                  // "Pregrado", "Posgrado", etc.
    credits: number;
    capacity: number;
    cycle: number;                  // ciclo/semestre en el que se dicta
    enrolled: number;               // estudiantes actualmente inscritos
  
    // Fechas del semestre
    semesterStartDate: string;      // formato "YYYY-MM-DD"
    semesterEndDate: string;        // formato "YYYY-MM-DD"
  
    // Modalidad y ubicación
    mode: 'Presencial' | 'Online' | 'Híbrido' | string;
    virtualRoomUrl?: string;        // Zoom, Teams, Google Meet, etc.
  
    // Contenido académico
    methodology?: string;
    objectives?: string[];
    prerequisites?: string[];
    syllabusUrl?: string;
  
    // Horario (array de sesiones/clases)
    schedule: ScheduleItem[];
  
    // Estado y metadatos
    status: 'active' | 'inactive' | 'archived' | 'draft';
  }
  
  // Item individual del horario (clase/sesión)
  export interface ScheduleItem {
    day: string;                    // "Lunes", "Martes", etc.
    startTime: string;              // "15:40" (formato HH:mm)
    endTime: string;                // "16:39" o "16:40"
    classroom: string;              // "A-01", "B-12", "" (vacío si es virtual)
    title?: string;                 // "TEORIA DE SISTEMAS", "PRACTICA SISTEMAS", etc.
  }
  
  // Perfil del instructor (documento en 'users/{instructorId}')
  export interface InstructorProfile {
    uid: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
    role?: 'instructor' | 'professor' | 'admin';
    // campos opcionales que podrías tener
    department?: string;
    facultyId?: string;
  }
  
  // Registro de asistencia (colección 'attendance' o subcolección)
  export interface AttendanceRecord {
    id: string;
    studentId: string;
    courseId: string;
    date: string;                   // "YYYY-MM-DD"
    sessionTitle?: string;
    status: 'presente' | 'ausente' | 'tarde' | 'justificado' | 'pendiente';
    notes?: string;
    justifiedAt?: string;
    justificationReason?: string;
  }
  
  // Tipo auxiliar para resumen de calificaciones por estudiante
  export interface StudentCourseSummary {
    studentId: string;
    finalGrade?: number;
    letterGrade?: string;
    attendancePercentage?: number;
    // ... otras métricas
  }
  
  // Tipo para el usuario autenticado (lo que devuelve tu hook useUser)
  export interface UserProfile {
    uid: string;
    email: string;
    role: 'student' | 'instructor' | 'admin';
    firstName?: string;
    lastName?: string;
    displayName?: string;
    profilePicture?: string;
    enrolledCourses?: string[];     // array de courseIds o courseId strings
    facultyId?: string;
    programId?: string;
  }
  
  // Helper para timestamps de Firestore (si los lees como objeto)
  export type FirestoreTimestamp = {
    seconds: number;
    nanoseconds: number;
  };
  
  // Si en algún momento lees el documento con .data() y quieres tiparlo estrictamente:
  export type CourseDocument = Course & {
    createdAt?: FirestoreTimestamp | string;
    updatedAt?: FirestoreTimestamp | string;
  };