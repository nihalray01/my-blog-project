"use client"

import { useState } from "react"
import Link from "next/link"
import { Heart, MessageSquare, Share2, MoreVertical } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PostCardProps {
  id: string
  title: string
  content: string
  author: {
    username: string
    imageUrl?: string
  }
  likes: number
  comments: number
  hasLiked?: boolean
  createdAt: string
}

export function PostCard({ id, title, content, author, likes: initialLikes, comments, hasLiked: initialHasLiked, createdAt }: PostCardProps) {
  const [likes, setLikes] = useState(initialLikes)
  const [hasLiked, setHasLiked] = useState(initialHasLiked)

  const handleLike = () => {
    setHasLiked(!hasLiked)
    setLikes(prev => hasLiked ? prev - 1 : prev + 1)
    // Server action call will go here
  }

  return (
    <article className="group bg-card border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-muted overflow-hidden">
               {author.imageUrl ? <img src={author.imageUrl} alt={author.username} /> : null}
            </div>
            <div className="flex flex-col">
              <Link href={`/profile/${author.username}`} className="text-sm font-semibold hover:text-primary transition-colors">@{author.username}</Link>
              <span className="text-[10px] text-muted-foreground uppercase font-medium">{createdAt}</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>

        <h2 className="text-xl font-bold mb-2 tracking-tight">{title}</h2>
        <p className="text-muted-foreground text-sm line-clamp-3 mb-6 whitespace-pre-wrap">
          {content}
        </p>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-4">
             <button 
                onClick={handleLike}
                className={cn(
                  "flex items-center gap-1.5 text-xs font-medium transition-colors hover:text-red-500",
                  hasLiked ? "text-red-500" : "text-muted-foreground"
                )}
             >
                <Heart className={cn("h-4 w-4", hasLiked && "fill-current")} />
                {likes}
             </button>
             <Link href={`/post/${id}`} className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors">
                <MessageSquare className="h-4 w-4" />
                {comments}
             </Link>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </article>
  )
}
