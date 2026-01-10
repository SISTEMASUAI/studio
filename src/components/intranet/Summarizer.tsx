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
    message: 'Content must be at least 50 characters.',
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
        title: "Summarization Failed",
        description: "Could not generate summary. Please try again.",
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
                <FormLabel>Content to summarize</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Paste your news, announcement, or any text here..."
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
            Generate Summary
          </Button>
        </form>
      </Form>
      {summary && (
        <Card className="bg-accent/50">
          <CardContent className="p-4">
            <h3 className="font-headline font-semibold mb-2">Summary</h3>
            <p className="text-sm text-foreground/90">{summary}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
