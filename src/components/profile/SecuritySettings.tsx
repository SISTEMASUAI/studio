'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button';
import {
  Shield,
  UserCog,
  KeyRound,
  Fingerprint,
  Monitor,
  LogOut,
  QrCode,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

const activeSessions = [
    { id: 'sess-1', device: 'Chrome on Windows', location: 'Lima, PE (190.42.XX.XX)', lastActive: 'Ahora', isCurrent: true, icon: Monitor },
    { id: 'sess-2', device: 'Safari on iPhone', location: 'Arequipa, PE (179.7.XX.XX)', lastActive: 'Hace 2 horas', isCurrent: false, icon: Smartphone },
    { id: 'sess-3', device: 'Firefox on macOS', location: 'Bogotá, CO (200.118.XX.XX)', lastActive: 'Ayer', isCurrent: false, icon: Monitor },
];

export default function SecuritySettings() {
    return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield /> Seguridad
            </CardTitle>
            <CardDescription>Gestiona tu contraseña y seguridad.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-start"><KeyRound className="mr-2"/> Cambiar Contraseña</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cambiar Contraseña</DialogTitle>
                        <DialogDescription>
                            Para mayor seguridad, tu nueva contraseña debe cumplir con los requisitos mínimos.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="current-password">Contraseña Actual</Label>
                            <Input id="current-password" type="password" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-password">Nueva Contraseña</Label>
                            <Input id="new-password" type="password" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirmar Nueva Contraseña</Label>
                            <Input id="confirm-password" type="password" />
                        </div>
                        <Alert variant="destructive">
                            <ShieldCheck className="h-4 w-4"/>
                            <AlertTitle>Requisitos de Contraseña</AlertTitle>
                            <AlertDescription>
                                <ul className="list-disc list-inside text-xs">
                                    <li>Mínimo 8 caracteres</li>
                                    <li>Al menos una mayúscula</li>
                                    <li>Al menos un número</li>
                                    <li>Al menos un carácter especial</li>
                                </ul>
                            </AlertDescription>
                        </Alert>
                    </div>
                    <DialogFooter>
                        <Button variant="outline">Cancelar</Button>
                        <Button>Actualizar Contraseña</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-start"><Fingerprint className="mr-2"/> Configurar 2FA</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Autenticación de Dos Factores (2FA)</DialogTitle>
                        <DialogDescription>
                            Añade una capa extra de seguridad a tu cuenta.
                        </DialogDescription>
                    </DialogHeader>
                     <div className="py-4 space-y-6">
                        <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                                <Label>Habilitar 2FA</Label>
                                <p className="text-xs text-muted-foreground">
                                    Se te pedirá un código de tu app de autenticación al iniciar sesión.
                                </p>
                            </div>
                            <Switch />
                        </div>
                        <div className="text-center space-y-2">
                             <Label>1. Escanea el código QR</Label>
                             <div className="flex justify-center items-center h-40 w-40 bg-muted rounded-lg mx-auto">
                                <QrCode className="h-16 w-16 text-muted-foreground"/>
                             </div>
                             <p className="text-xs text-muted-foreground">Usa una app como Google Authenticator o Authy.</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="2fa-code">2. Ingresa el código de verificación</Label>
                            <Input id="2fa-code" placeholder="123456"/>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline">Cancelar</Button>
                        <Button>Verificar y Habilitar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
             <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-start"><Monitor className="mr-2"/> Ver Sesiones Activas</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                     <DialogHeader>
                        <DialogTitle>Sesiones Activas</DialogTitle>
                        <DialogDescription>
                            Estas son las sesiones donde tu cuenta está actualmente iniciada.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <ul className="space-y-4">
                            {activeSessions.map(session => (
                                <li key={session.id} className="flex items-center gap-4 p-3 rounded-lg border">
                                    <session.icon className="h-8 w-8 text-muted-foreground" />
                                    <div className="flex-grow">
                                        <p className="font-semibold">{session.device}</p>
                                        <p className="text-sm text-muted-foreground">{session.location} - Última actividad: {session.lastActive}</p>
                                    </div>
                                    {session.isCurrent ? (
                                        <Badge variant="secondary">Esta sesión</Badge>
                                    ) : (
                                        <Button variant="ghost" size="sm">Cerrar sesión</Button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <DialogFooter>
                        <Button variant="destructive"><LogOut className="mr-2"/> Cerrar todas las sesiones remotas</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
    );
}
