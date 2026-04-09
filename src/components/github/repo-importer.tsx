"use client"

import { useState, useEffect } from "react"
import { Github, Star, GitFork, CheckCircle2, Loader2, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getGithubRepos, importProjects } from "@/lib/actions/github.actions"

import { toast } from "sonner"

export function RepoImporter() {
  const [repos, setRepos] = useState<any[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)

  const fetchRepos = async () => {
    setLoading(true)
    try {
      const data = await getGithubRepos()
      setRepos(data)
      toast.success("Repositories discovered.")
    } catch (err) {
      console.error(err)
      toast.error("Failed to fetch repositories.")
    } finally {
      setLoading(false)
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleImport = async () => {
    if (selectedIds.length === 0) return
    setImporting(true)
    try {
      const selectedRepos = repos.filter(r => selectedIds.includes(r.id))
      await importProjects(selectedRepos)
      toast.success("Workspace synchronized successfully!")
      setSelectedIds([])
    } catch (err) {
      console.error(err)
      toast.error("Synchronization failed.")
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-black text-white">
            <Github className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight">Import Projects</h3>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Sync from your GitHub account</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchRepos} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          Fetch Repositories
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {repos.length === 0 && !loading && (
          <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl ">
             <p className="text-muted-foreground">Click the button above to discover your repositories.</p>
          </div>
        )}

        {repos.map((repo) => {
          const isSelected = selectedIds.includes(repo.id)
          return (
            <div 
              key={repo.id}
              onClick={() => toggleSelect(repo.id)}
              className={cn(
                "group cursor-pointer p-5 rounded-xl border-2 transition-all relative overflow-hidden",
                isSelected ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-muted bg-card hover:border-muted-foreground/30"
              )}
            >
              <div className="flex justify-between items-start mb-3">
                <span className="font-bold text-sm truncate max-w-[200px]">{repo.name}</span>
                {isSelected && <CheckCircle2 className="h-5 w-5 text-primary" />}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 min-h-[32px] mb-4">
                {repo.description || "No description provided."}
              </p>
              <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                <span className="flex items-center gap-1.5"><Star className="h-3 w-3 fill-yellow-500/50 text-yellow-500" /> {repo.stars}</span>
                <span className="flex items-center gap-1.5"><GitFork className="h-3 w-3" /> {repo.forks}</span>
                {repo.language && <span className="bg-muted px-2 py-0.5 rounded-full">{repo.language}</span>}
              </div>
            </div>
          )
        })}
      </div>

      {selectedIds.length > 0 && (
        <div className="flex justify-center pt-4 sticky bottom-0 bg-background/80 backdrop-blur-md pb-2 border-t mt-4">
          <Button 
            className="w-full h-12 shadow-xl shadow-primary/20 transition-transform active:scale-95"
            onClick={handleImport}
            disabled={importing}
          >
            {importing ? "Importing Workspace..." : `Sync ${selectedIds.length} Repositories`}
          </Button>
        </div>
      )}
    </div>
  )
}
