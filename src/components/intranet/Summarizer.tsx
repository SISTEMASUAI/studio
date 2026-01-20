'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { summarizeIntranetContent } from '@/ai/flows/summarize-intranet-content';

import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { Wand2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const FormSchema = z.object({
  content: z.string().min(50, {
    message: 'El contenido debe tener al menos 50 caracteres.',
  }),
});

export default function Summarizer() {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      content: '',
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    setSummary('');
    try {
      const result = await summarizeIntranetContent(data);
      setSummary(result.summary);
    } catch (error) {
      console.error('Summarization failed:', error);
      toast({
        variant: "destructive",
        title: "Falló la Creación de Resumen",
        description: "No se pudo generar el resumen. Por favor, inténtalo de nuevo.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contenido a resumir</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Pega tus noticias, anuncios o cualquier texto aquí..."
                    className="resize-y min-h-[150px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            Generar Resumen
          </Button>
        </form>
      </Form>
      {summary && (
        <Card className="bg-accent/50">
          <CardContent className="p-4">
            <h3 className="font-headline font-semibold mb-2">Resumen</h3>
            <p className="text-sm text-foreground/90">{summary}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
