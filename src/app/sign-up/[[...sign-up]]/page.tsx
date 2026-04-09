import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20">
      <div className="relative">
        <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-primary to-blue-600 opacity-25 blur"></div>
        <SignUp 
          appearance={{
            elements: {
              formButtonPrimary: 'bg-primary hover:bg-primary/90 text-sm normal-case',
              card: 'bg-background shadow-none border-none'
            }
          }}
        />
      </div>
    </div>
  );
}
