
'use client';

import { useUser } from '@/firebase';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
    Landmark,
    CreditCard,
    Receipt,
    History,
    ShieldCheck,
    DollarSign,
    FileDown,
    Banknote,
    UserCog,
    Scale,
    Percent,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const studentFinancials = {
    balance: -250.00, // Negative means debt
    pendingPayments: [
        { id: 'P001', concept: 'Matrícula Semestre 2024-2', amount: 150.00, dueDate: '2024-08-30' },
        { id: 'P002', concept: 'Cuota Laboratorio de Química', amount: 100.00, dueDate: '2024-09-15' },
    ],
    paymentHistory: [
        { id: 'H001', concept: 'Cuota 1 - Semestre 2024-1', amount: 500.00, date: '2024-03-15', status: 'Completado' },
        { id: 'H002', concept: 'Materiales Curso Arte', amount: 75.00, date: '2024-04-02', status: 'Completado' },
    ],
    scholarships: {
        active: true,
        name: 'Beca al Mérito Académico',
        coverage: '50% de la matrícula',
    }
};

const allStudentsFinancials = [
    { student: 'Juan Pérez', balance: -250.00, pending: 2 },
    { student: 'Ana García', balance: 0.00, pending: 0 },
    { student: 'Luis Martínez', balance: -1200.00, pending: 4 },
];


function getStatusVariant(status: string) {
    switch (status) {
      case 'Completado':
        return 'bg-green-100 text-green-800';
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
}


function StudentFinanceView() {
  return (
    <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><CreditCard /> Pagos Pendientes</CardTitle>
                    <CardDescription>Pagos que requieren tu atención.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Concepto</TableHead>
                                <TableHead>Vencimiento</TableHead>
                                <TableHead className="text-right">Monto</TableHead>
                                <TableHead className="text-right">Acción</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {studentFinancials.pendingPayments.map(p => (
                                <TableRow key={p.id}>
                                    <TableCell>{p.concept}</TableCell>
                                    <TableCell>{p.dueDate}</TableCell>
                                    <TableCell className="text-right font-medium">${p.amount.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">
                                        <Button size="sm"><Banknote className="mr-2"/> Pagar</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><History /> Historial de Pagos</CardTitle>
                    <CardDescription>Tus transacciones y recibos anteriores.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Concepto</TableHead>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Monto</TableHead>
                                <TableHead className="text-right">Recibo</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {studentFinancials.paymentHistory.map(p => (
                                <TableRow key={p.id}>
                                    <TableCell>{p.concept}</TableCell>
                                    <TableCell>{p.date}</TableCell>
                                    <TableCell><Badge className={getStatusVariant(p.status)}>{p.status}</Badge></TableCell>
                                    <TableCell className="text-right">${p.amount.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">
                                        <Button size="sm" variant="outline"><FileDown className="mr-2"/> Descargar</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
        <aside className="space-y-8">
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><DollarSign /> Estado de Cuenta</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-center">
                        <p className="text-muted-foreground">Deuda Total</p>
                        <p className="text-4xl font-bold text-destructive">${Math.abs(studentFinancials.balance).toFixed(2)}</p>
                    </div>
                    <Button className="w-full"><CreditCard className="mr-2"/> Realizar Pago General</Button>
                    <Button variant="secondary" className="w-full"><Scale className="mr-2"/> Solicitar Plan de Pagos</Button>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ShieldCheck /> Becas y Beneficios</CardTitle>
                </CardHeader>
                <CardContent>
                    {studentFinancials.scholarships.active ? (
                        <div>
                            <p className="font-semibold">{studentFinancials.scholarships.name}</p>
                            <p className="text-sm text-muted-foreground">Cobertura: {studentFinancials.scholarships.coverage}</p>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">Actualmente no tienes becas o beneficios activos.</p>
                    )}
                </CardContent>
            </Card>
        </aside>
    </div>
  );
}

function AdminFinanceView() {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2"><UserCog /> Gestión Financiera</CardTitle>
            <CardDescription>
                Administra los pagos, becas y estados de cuenta de los estudiantes.
            </CardDescription>
          </div>
           <div className="flex gap-2">
                <Button variant="outline"><Percent className="mr-2"/> Aplicar Descuentos</Button>
                <Button><Banknote className="mr-2"/> Registrar Pago</Button>
           </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Estudiante</TableHead>
                    <TableHead>Saldo</TableHead>
                    <TableHead>Pagos Pendientes</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {allStudentsFinancials.map(s => (
                    <TableRow key={s.student}>
                        <TableCell className="font-medium">{s.student}</TableCell>
                        <TableCell className={s.balance < 0 ? 'text-destructive' : ''}>${s.balance.toFixed(2)}</TableCell>
                        <TableCell>{s.pending}</TableCell>
                        <TableCell className="text-right">
                            <Button size="sm">Ver Detalles</Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function ProfessorFinanceView() {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pagos y Finanzas</CardTitle>
          <CardDescription>
            Este módulo es para la gestión financiera por parte de alumnos y administradores.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="default">
            <Landmark className="h-4 w-4" />
            <AlertTitle>No hay acciones disponibles</AlertTitle>
            <AlertDescription>
              Los docentes no tienen acceso a la información financiera desde este panel.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

export default function PaymentsPage() {
  const { profile } = useUser();

  const renderContent = () => {
    switch (profile?.role) {
      case 'student':
        return <StudentFinanceView />;
      case 'admin':
        return <AdminFinanceView />;
      case 'professor':
        return <ProfessorFinanceView />;
      default:
        return (
          <Card>
            <CardContent className="pt-6">
              <p>Cargando información del usuario...</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-8">
      <section>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
              <Landmark className="text-primary" />
              Pagos y Finanzas
            </h1>
            <p className="text-muted-foreground">
              {profile?.role === 'student'
                ? 'Consulta tu estado de cuenta, realiza pagos y gestiona tus finanzas.'
                : 'Gestiona la información financiera de los estudiantes.'}
            </p>
          </div>
        </div>
      </section>

      {renderContent()}
    </div>
  );
}
