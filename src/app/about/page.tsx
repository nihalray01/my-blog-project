import { Navbar } from "@/components/navigation/navbar"
import { constructMetadata } from "@/lib/seo"
import { Shield, Zap, Globe, Cpu } from "lucide-react"

export const metadata = constructMetadata({
  title: "Our Mission | Nexus",
  description: "Accelerating the future of developer narrative and digital humanism."
})

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-muted/20">
      <Navbar />
      
      <main className="container pt-32 pb-20">
        <section className="max-w-4xl mx-auto text-center mb-20">
            <h1 className="text-5xl font-extrabold tracking-tight mb-6">
                Our Mission <br />
                <span className="text-primary italic">Accelerating Digital Humanism</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                Nexus was born out of a simple realization: code isn't just logic—it's a story. We're building the infrastructure that lets developers broadcast their narratives, get elite feedback, and grow into the architects of tomorrow.
            </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
            <div className="p-8 rounded-2xl bg-card border hover:border-primary/50 transition-colors">
                <Shield className="h-8 w-8 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">Deep Narratives</h3>
                <p className="text-sm text-muted-foreground">We prioritize high-signal content over noise. Our platform is designed for deep dives and technical insights.</p>
            </div>
            <div className="p-8 rounded-2xl bg-card border hover:border-primary/50 transition-colors">
                <Cpu className="h-8 w-8 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">Elite Feedback</h3>
                <p className="text-sm text-muted-foreground">Peer-to-peer technical audits that sharpen your craft through rigorous, line-level feedback.</p>
            </div>
            <div className="p-8 rounded-2xl bg-card border hover:border-primary/50 transition-colors">
                <Globe className="h-8 w-8 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">Universal Growth</h3>
                <p className="text-sm text-muted-foreground">Connect your narratives with a global network of senior developers and industry leaders.</p>
            </div>
        </section>

        <section className="p-12 rounded-3xl bg-primary text-primary-foreground text-center space-y-6 shadow-2xl shadow-primary/20">
            <h2 className="text-3xl font-bold">Building for the Future</h2>
            <p className="text-lg opacity-80 max-w-xl mx-auto">
                Nexus is more than a platform—it's an operating system for the developer narrative. Join us in shaping the architecture of the future.
            </p>
        </section>
      </main>
    </div>
  )
}
