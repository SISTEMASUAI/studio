
'use client';

import ActivityCard from './ActivityCard';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState, useMemo } from 'react';

interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  category: string;
  location: string;
  imageUrl?: string;
}

export default function ActivityList({ events }: { events: Event[] }) {
  const [search, setSearch] = useState('');

  const filteredEvents = useMemo(() => {
    return events.filter(e => 
      e.name.toLowerCase().includes(search.toLowerCase()) || 
      e.category.toLowerCase().includes(search.toLowerCase())
    );
  }, [events, search]);

  return (
    <div className="space-y-6">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Buscar por nombre o categoría..." 
          className="pl-9" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredEvents.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <ActivityCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center border-2 border-dashed rounded-xl opacity-50">
          <p>No se encontraron actividades.</p>
        </div>
      )}
    </div>
  );
}
