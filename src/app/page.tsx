import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2 } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-8">
        <div className="text-center">
            <div className="flex justify-center mb-4">
                <Building2 className="w-12 h-12 text-primary" />
            </div>
          <h1 className="text-4xl font-headline font-bold text-foreground">Campus Hub</h1>
          <p className="mt-2 text-muted-foreground">Your unified campus portal.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Login</CardTitle>
            <CardDescription>Enter your credentials to access your dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" asChild>
                <Link href="/dashboard">Sign In</Link>
            </Button>
            <p className="text-xs text-center text-muted-foreground">
                This is a demo. Click "Sign In" to continue.
            </p>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
