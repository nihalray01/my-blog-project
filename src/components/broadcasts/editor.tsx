"use client"

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  Bold, Italic, Link, Image as ImageIcon, List, 
  Code, Eye, Layout, Save, Send, Globe, ChevronDown 
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { createPost, updatePost } from "@/lib/actions/post.actions"

interface EditorProps {
  initialData?: {
    id: string
    title: string
    content: string
    tags: string[]
  }
}

export function BroadcastEditor({ initialData }: EditorProps) {
  const router = useRouter()
  const [title, setTitle] = useState(initialData?.title || "")
  const [content, setContent] = useState(initialData?.content || "")
  const [showPreview, setShowPreview] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-save logic
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (!title || !content || initialData?.id) return // Only auto-save existing or valid drafts
      // For now, we'll just log or save to local storage as a "silent" draft
      // Advanced: implement server-side draft persistence here
      localStorage.setItem('nexus-draft', JSON.stringify({ title, content, date: new Date() }))
      setLastSaved(new Date())
    }, 2000)

    return () => clearTimeout(delayDebounceFn)
  }, [title, content])
  const templates = {
    "dev-story": `# Problem\n\n# Approach\n\n# Code Implementation\n\`\`\`javascript\n\n\`\`\`\n\n# Outcome\n`,
    "release": `# 🚀 Feature Release: \n\n## What's New?\n\n## Why it matters?\n`,
  }

  const applyTemplate = (key: keyof typeof templates) => {
    setContent(templates[key])
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const fileName = `${Date.now()}-${file.name}`
      const { data, error } = await supabase.storage
        .from('image-uploads')
        .upload(fileName, file)

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('image-uploads')
        .getPublicUrl(data.path)

      const imageMarkdown = `\n![${file.name}](${publicUrl})\n`
      setContent(prev => prev + imageMarkdown)
    } catch (err) {
      console.error("Upload failed", err)
    } finally {
      setIsUploading(false)
    }
  }

  const handleSave = async (status: "draft" | "broadcast") => {
    if (!title || !content) return
    setIsSaving(true)
    try {
      if (initialData?.id) {
        await updatePost(initialData.id, { title, content, status })
      } else {
        await createPost({ title, content, status })
      }
      router.push("/feed")
    } catch (err) {
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] border rounded-xl bg-card overflow-hidden shadow-2xl transition-all">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between p-3 border-b bg-muted/30 backdrop-blur-sm">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => setShowPreview(!showPreview)} className={cn(showPreview && "bg-accent text-accent-foreground")}>
            <Eye className="h-4 w-4" />
          </Button>
          <div className="h-4 w-[1px] bg-border mx-2" />
          <Button variant="ghost" size="icon" onClick={() => applyTemplate("dev-story")} title="Dev Story Template">
            <Layout className="h-4 w-4" />
          </Button>
          <div className="relative">
            <input type="file" className="hidden" id="img-upload" onChange={handleImageUpload} />
            <Button variant="ghost" size="icon" onClick={() => document.getElementById('img-upload')?.click()} disabled={isUploading}>
              <ImageIcon className={cn("h-4 w-4", isUploading && "animate-pulse")} />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => handleSave("draft")} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" /> Draft
          </Button>
          <Button size="sm" onClick={() => handleSave("broadcast")} disabled={isSaving}>
            <Send className="h-4 w-4 mr-2" /> Broadcast
          </Button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex flex-1 overflow-hidden relative">
        <div className={cn("flex-1 transition-all duration-300", showPreview ? "w-1/2" : "w-full")}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Broadcast Title..."
            className="w-full p-6 text-3xl font-bold bg-transparent border-none outline-none placeholder:text-muted-foreground/30"
          />
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Tell your narrative... (Markdown supported)"
            className="w-full h-full p-6 bg-transparent border-none outline-none resize-none font-mono text-sm leading-relaxed"
          />
        </div>

        <AnimatePresence>
          {showPreview && (
            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              className="w-1/2 h-full p-8 border-l bg-background overflow-y-auto prose dark:prose-invert max-w-none"
            >
              <h1 className="text-4xl font-bold mb-6">{title || "Untitled Broadcast"}</h1>
              <div className="whitespace-pre-wrap font-sans">
                {content || "Nothing to preview yet..."}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
