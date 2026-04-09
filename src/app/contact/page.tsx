"use client"

import { useState } from "react"
import { Navbar } from "@/components/navigation/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, MessageSquare, Send, CheckCircle2 } from "lucide-react"
import { submitFeedback } from "@/lib/actions/feedback.actions"
import { toast } from "sonner"

export default function ContactPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      message: formData.get("message") as string,
    }

    try {
      await submitFeedback(data)
      setSuccess(true)
      toast.success("Narrative transmitted successfully.")
    } catch (err) {
      console.error(err)
      toast.error("Transmission failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <Navbar />
      
      <main className="container pt-32 pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-16 items-start">
            
            {/* Left: Contact Info */}
            <div className="flex-1 space-y-8">
              <div className="space-y-4 text-left">
                <h1 className="text-5xl font-extrabold tracking-tight">Get in <span className="text-primary italic">Touch</span></h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Have a vision for the future of developer narratives? Or just need technical assistance? Our architects are ready to listen.
                </p>
              </div>

              <div className="grid gap-6">
                <div className="flex items-center gap-4 p-6 rounded-2xl border bg-card">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary">
                     <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Direct Intel</h3>
                    <p className="text-xs text-muted-foreground">support@nexus-platform.dev</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-6 rounded-2xl border bg-card">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary">
                     <MessageSquare className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Community Feedback</h3>
                    <p className="text-xs text-muted-foreground">Always monitoring feature requests.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Feedback Form */}
            <div className="w-full lg:w-[450px]">
              <div className="p-8 rounded-3xl border bg-card shadow-2xl relative overflow-hidden">
                {success ? (
                  <div className="text-center py-12 space-y-4 animate-in fade-in zoom-in">
                     <CheckCircle2 className="h-16 w-16 text-primary mx-auto" />
                     <h3 className="text-2xl font-bold">Feedback Received</h3>
                     <p className="text-sm text-muted-foreground">Our architects will review your narrative shortly.</p>
                     <Button variant="outline" className="mt-8" onClick={() => setSuccess(false)}>Send another</Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Full Name</label>
                      <Input name="name" placeholder="John Architect" required />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Email Address</label>
                       <Input name="email" type="email" placeholder="dev@narrative.com" required />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Your Narrative</label>
                       <Textarea name="message" placeholder="Describe your feature request or support need..." className="min-h-[150px] resize-none" required />
                    </div>
                    <Button type="submit" className="w-full h-12 shadow-xl shadow-primary/20" disabled={loading}>
                      {loading ? "Transmitting..." : "Send Narrative"} <Send className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
