'use client';
import { usePathname, useRouter } from 'next/navigation';
import {
  Building2,
  LogOut,
  Newspaper,
  Calendar,
  GraduationCap,
  Loader2,
  ClipboardList,
  BookMarked,
  FileClock,
  Landmark,
  Briefcase,
  Activity,
  HeartPulse,
  User,
  BookCopy,
  UserCheck,
  Settings,
  Users,
  ListTree,
} from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth, useUser } from '@/firebase';
import { useEffect } from 'react';
import { Skeleton } from './ui/skeleton';

const navItems = [
  { href: '/intranet', icon: Newspaper, label: 'Nuxtu', roles: ['student', 'professor', 'admin'] },
  { href: '/schedule', icon: Calendar, label: 'Horarios', roles: ['student', 'professor', 'admin'] },
  { href: '/cursos', icon: BookCopy, label: 'Cursos', roles: ['student', 'professor', 'admin'] },
  { href: '/app/modulos', icon: ListTree, label: 'Módulos', roles: ['admin'] },
  { href: '/alumnos', icon: Users, label: 'Alumnos', roles: ['admin'] },
  { href: '/asistencia', icon: UserCheck, label: 'Asistencia', roles: ['professor', 'admin'] },
  { href: '/grades', icon: GraduationCap, label: 'Calificaciones', roles: ['student', 'professor', 'admin'] },
  { href: '/matricula', icon: ClipboardList, label: 'Matrícula', roles: ['student', 'professor', 'admin'] },
  { href: '/plan-de-estudios', icon: BookMarked, label: 'Plan de Estudios', roles: ['student', 'professor', 'admin'] },
  { href: '/tramites', icon: FileClock, label: 'Trámites', roles: ['student', 'professor', 'admin'] },
  { href: '/pagos', icon: Landmark, label: 'Pagos', roles: ['student', 'professor', 'admin'] },
  { href: '/bolsa-de-trabajo', icon: Briefcase, label: 'Bolsa de Trabajo', roles: ['student', 'professor', 'admin'] },
  { href: '/actividades', icon: Activity, label: 'Actividades', roles: ['student', 'professor', 'admin'] },
  { href: '/bienestar', icon: HeartPulse, label: 'Bienestar', roles: ['student', 'professor', 'admin'] },
  { href: '/programas', icon: GraduationCap, label: 'Programas', roles: ['admin'] },
  { href: '/configuracion', icon: Settings, label: 'Configuración', roles: ['admin'] },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, profile, isUserLoading } = useUser();
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/');
    }
  }, [isUserLoading, user, router]);

  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const handleLogout = () => {
    if (auth) {
      auth.signOut();
    }
  };

  const userRole = profile?.role;

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-8 h-8 text-primary" />
            <h2 className="text-xl font-headline font-semibold text-foreground group-data-[collapsible=icon]:hidden">
              Nuxtu
            </h2>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => {
              if (userRole && item.roles.includes(userRole)) {
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      onClick={() => router.push(item.href)}
                      isActive={pathname.startsWith(item.href)}
                      tooltip={item.label}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              }
              return null;
             })}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenuButton onClick={handleLogout} tooltip="Log Out">
            <LogOut />
            <span>Log Out</span>
          </SidebarMenuButton>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center justify-between h-14 px-4 border-b bg-card">
          <div className="flex items-center gap-2 md:hidden">
            <SidebarTrigger />
            <span className="text-lg font-headline font-semibold">
              Nuxtu
            </span>
          </div>
          <div className="flex-1" />
          <UserMenu />
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

function UserMenu() {
  const { user, profile, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  if (isUserLoading) {
    return <Skeleton className="w-8 h-8 rounded-full" />;
  }

  const handleLogout = () => {
    if (auth) {
      auth.signOut();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative w-8 h-8 rounded-full">
          <Avatar className="w-8 h-8">
            <AvatarImage
              src={profile?.profilePicture || user?.photoURL || 'https://i.pravatar.cc/150'}
              alt="User avatar"
            />
            <AvatarFallback>
              {user?.email?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none font-headline">
              {profile?.firstName ? `${profile.firstName} ${profile.lastName}`: (user?.displayName || 'User')}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/profile')}>
          <User className="w-4 h-4 mr-2" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem disabled>Settings</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
