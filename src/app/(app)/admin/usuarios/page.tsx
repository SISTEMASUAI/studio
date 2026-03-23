'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import UserManagementView from '@/components/admin/UserManagementView';

export default function UserAdminPage() {
  const { profile, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && profile?.role !== 'admin') {
      router.replace('/intranet');
    }
  }, [isUserLoading, profile, router]);

  if (isUserLoading || !profile) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <UserManagementView />;
}
