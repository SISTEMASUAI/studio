'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UserCog, Search } from 'lucide-react';

export default function AdminProfileView() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><UserCog /> Administración de Perfiles</CardTitle>
                <CardDescription>Busca y gestiona la información de cualquier usuario en el sistema.</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="flex gap-2 mb-6">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Buscar por nombre, email o matrícula..." className="pl-9" />
                    </div>
                    <Button><Search/> Buscar</Button>
                </div>
                 <Alert>
                    <UserCog className="h-4 w-4" />
                    <AlertTitle>En Desarrollo</AlertTitle>
                    <AlertDescription>
                        Las funcionalidades para ver y editar los perfiles de los usuarios, aplicar cambios con justificación y auditar modificaciones estarán disponibles próximamente en esta sección.
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
    )
}
