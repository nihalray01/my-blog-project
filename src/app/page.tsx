import Link from "next/link";
import { ArrowRight, Code, Globe, Shield, Zap } from "lucide-react";
import { constructMetadata } from "@/lib/seo";
import { Navbar } from "@/components/navigation/navbar";
import { Button } from "@/components/ui/button";

export const metadata = constructMetadata();

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* --- HERO SECTION --- */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_50%,rgba(59,130,246,0.1)_0%,rgba(0,0,0,0)_100%)]"></div>
          
          <div className="container flex flex-col items-center text-center">
            <div className="inline-flex items-center rounded-full border bg-muted/50 px-3 py-1 text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4">
              <span className="text-primary mr-2">New</span> Nexus 5.0 is now in Private Beta
            </div>
            
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl mb-6 max-w-4xl">
              Accelerating Developer <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Narratives & Growth</span>
            </h1>
            
            <p className="max-w-2xl text-lg text-muted-foreground mb-10 md:text-xl">
              The immersive project hub for the architects of tomorrow. Build deep narratives around your code, get elite feedback, and scale your reach globally.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-16">
              <Link href="/sign-up">
                <Button size="lg" className="h-12 px-8 text-base">
                  Join Community <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/feed">
                <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                  Explore Feed
                </Button>
              </Link>
            </div>

            {/* --- HERO PREVIEW --- */}
            <div className="relative w-full max-w-5xl mx-auto border rounded-xl bg-card shadow-2xl overflow-hidden aspect-video group">
               <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/20 z-10 transition-opacity group-hover:opacity-0"></div>
               <div className="p-4 border-b bg-muted/30 flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-destructive/50"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-500/50"></div>
                  <div className="h-3 w-3 rounded-full bg-green-500/50"></div>
                  <div className="ml-4 h-5 w-64 rounded bg-muted"></div>
               </div>
               <div className="p-8 grid grid-cols-3 gap-8 text-left h-full">
                  <div className="col-span-2 space-y-4">
                    <div className="h-8 w-1/3 rounded bg-muted animate-pulse"></div>
                    <div className="h-4 w-full rounded bg-muted/50"></div>
                    <div className="h-4 w-full rounded bg-muted/50"></div>
                    <div className="h-4 w-2/3 rounded bg-muted/50"></div>
                    <div className="mt-8 space-y-2">
                      <div className="h-6 w-1/4 rounded bg-muted"></div>
                      <div className="h-32 w-full rounded border bg-black/40 flex items-center justify-center font-mono text-sm text-primary/60">
                         {`// Nexus Project Dashboard Loading...`}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="h-32 w-full rounded bg-muted/30 border border-dashed flex items-center justify-center">
                       <Zap className="h-8 w-8 text-muted" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-1/2 rounded bg-muted"></div>
                      <div className="h-4 w-full rounded bg-muted/50"></div>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* --- FEATURES GRID --- */}
        <section className="py-20 bg-muted/30 border-y">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="flex flex-col items-start p-6 rounded-lg bg-background border hover:border-primary/50 transition-colors">
                <Code className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2 text-foreground">Code Narrative</h3>
                <p className="text-sm text-muted-foreground">Transform static Git repos into living project stories with Markdown support and syntax highlighting.</p>
              </div>
              <div className="flex flex-col items-start p-6 rounded-lg bg-background border hover:border-primary/50 transition-colors">
                <Zap className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2 text-foreground">Elite Feedback</h3>
                <p className="text-sm text-muted-foreground">Get line-by-line feedback on your logic from top-tier community architects.</p>
              </div>
              <div className="flex flex-col items-start p-6 rounded-lg bg-background border hover:border-primary/50 transition-colors">
                <Globe className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2 text-foreground">Global Reach</h3>
                <p className="text-sm text-muted-foreground">Broadcast your projects to a global network of senior developers and hiring managers.</p>
              </div>
              <div className="flex flex-col items-start p-6 rounded-lg bg-background border hover:border-primary/50 transition-colors">
                <Shield className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2 text-foreground">Cloud Sync</h3>
                <p className="text-sm text-muted-foreground">Real-time persistence with Supabase PostgreSQL. Never lose a project or a narrative.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* --- FOOTER --- */}
      <footer className="border-t py-12 bg-background">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col gap-2">
            <span className="font-bold text-xl tracking-tight">Nexus<span className="text-primary">.</span></span>
            <p className="text-sm text-muted-foreground tracking-tight">© 2026 Nexus Inc. Building for the future.</p>
          </div>
          <div className="flex gap-8 text-sm font-medium text-muted-foreground">
             <Link href="/about" className="hover:text-primary transition-colors">About</Link>
             <Link href="/roadmap" className="hover:text-primary transition-colors">Roadmap</Link>
             <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
             <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
