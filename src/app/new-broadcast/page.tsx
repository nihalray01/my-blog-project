import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/navigation/navbar"
import { BroadcastEditor } from "@/components/broadcasts/editor"

export default async function NewBroadcastPage() {
  const { userId } = auth()
  if (!userId) redirect("/sign-in")

  return (
    <div className="min-h-screen bg-muted/20">
      <Navbar />
      
      <main className="container pt-32 pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col gap-2 mb-8">
            <h1 className="text-3xl font-bold tracking-tight">New Broadcast</h1>
            <p className="text-muted-foreground">Draft your technical story or project announcement.</p>
          </div>

          <BroadcastEditor />
        </div>
      </main>
    </div>
  )
}
