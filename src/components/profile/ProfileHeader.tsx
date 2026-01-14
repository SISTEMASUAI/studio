'use client';

import { useUser } from '@/firebase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Edit, Loader2 } from 'lucide-react';

export default function ProfileHeader() {
  const { profile } = useUser();
  if (!profile) return (
      <Card>
          <CardContent className="pt-6 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin"/>
          </CardContent>
      </Card>
  );

  return (
    <Card>
      <CardContent className="pt-6 flex flex-col items-center text-center gap-4 sm:flex-row sm:text-left">
        <Avatar className="h-24 w-24">
          <AvatarImage src={profile.profilePicture} alt={profile.firstName} />
          <AvatarFallback>
            {profile.firstName?.[0]}
            {profile.lastName?.[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex-grow">
          <h2 className="text-2xl font-bold font-headline">
            {profile.firstName} {profile.lastName}
          </h2>
          <p className="text-muted-foreground">{profile.email}</p>
          <Badge variant="outline" className="mt-2 capitalize">
            {profile.role}
          </Badge>
        </div>
        <Button variant="outline" disabled>
          <Edit className="mr-2" /> Cambiar Foto
        </Button>
      </CardContent>
    </Card>
  );
}
