"use client"

import { useState } from "react"
import { MessageSquarePlus, ChevronRight, MessageSquare, Trophy, ThumbsUp } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface CodeExplorerProps {
  code: string
  language: string
  comments?: any[]
  currentUserId?: string
  isAuthor?: boolean
  onAddComment?: (line: number, content: string) => void
  onUpvote?: (commentId: string) => void
  onMarkBest?: (commentId: string) => void
}

export function CodeExplorer({ 
  code, 
  language, 
  comments = [], 
  currentUserId,
  isAuthor,
  onAddComment, 
  onUpvote, 
  onMarkBest 
}: CodeExplorerProps) {
  const [activeLine, setActiveLine] = useState<number | null>(null)
  const [newCommentLine, setNewCommentLine] = useState<number | null>(null)
  const [commentValue, setCommentValue] = useState("")

  const lines = code.split("\n")

  const handleAddComment = () => {
    if (!commentValue || newCommentLine === null) return
    onAddComment?.(newCommentLine, commentValue)
    setCommentValue("")
    setNewCommentLine(null)
  }

  return (
    <div className="border rounded-xl bg-[#0d1117] text-white overflow-hidden shadow-2xl font-mono text-xs sm:text-sm">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5">
        <span className="text-muted-foreground uppercase tracking-widest font-bold text-[10px]">{language}</span>
        <div className="flex gap-2">
            <div className="h-2 w-2 rounded-full bg-red-500/50"></div>
            <div className="h-2 w-2 rounded-full bg-yellow-500/50"></div>
            <div className="h-2 w-2 rounded-full bg-green-500/50"></div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => {
              const lineNum = idx + 1
              const lineComments = comments.filter(c => c.lineNumber === lineNum)
              const isReplying = newCommentLine === lineNum

              return (
                <React.Fragment key={idx}>
                  <tr 
                    onMouseEnter={() => setActiveLine(lineNum)}
                    onMouseLeave={() => setActiveLine(null)}
                    className={cn(
                      "group transition-colors",
                      activeLine === lineNum ? "bg-primary/10" : "hover:bg-white/5"
                    )}
                  >
                    <td className="w-12 text-center select-none text-muted-foreground border-r border-white/5 py-0.5 sticky left-0 bg-[#0d1117] z-10">
                      {lineNum}
                    </td>
                    <td className="px-4 py-0.5 relative whitespace-pre">
                      {line || " "}
                      {activeLine === lineNum && (
                        <button 
                          onClick={() => setNewCommentLine(lineNum)}
                          className="absolute left-0 -translate-x-1/2 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-primary flex items-center justify-center text-white shadow-lg z-20 hover:scale-110 transition-transform"
                        >
                          <MessageSquarePlus className="h-3 w-3" />
                        </button>
                      )}
                    </td>
                  </tr>

                  {/* Comments for this line */}
                  <AnimatePresence>
                    {(lineComments.length > 0 || isReplying) && (
                      <tr className="bg-muted/5">
                        <td className="border-r border-white/5"></td>
                        <td className="p-4">
                          <div className="flex flex-col gap-3">
                            {lineComments.map((comment) => (
                              <motion.div 
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={comment.id} 
                                className={cn(
                                    "p-3 rounded-lg border bg-card/50 max-w-2xl relative",
                                    comment.isBest && "border-yellow-500/50 ring-1 ring-yellow-500/20"
                                )}
                              >
                                {comment.isBest && (
                                    <div className="absolute -top-2 -right-2 bg-yellow-500 text-black rounded-full p-1 shadow-lg">
                                        <Trophy className="h-3 w-3" />
                                    </div>
                                )}
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest">@{comment.author.username}</span>
                                  <div className="flex items-center gap-2">
                                     <button 
                                        onClick={() => onUpvote?.(comment.id)}
                                        className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-white transition-colors"
                                     >
                                        <ThumbsUp className="h-3 w-3" /> {comment.upvotes}
                                     </button>
                                     {isAuthor && !comment.isBest && (
                                         <button 
                                            onClick={() => onMarkBest?.(comment.id)}
                                            className="text-[10px] font-bold text-yellow-500/70 hover:text-yellow-500 transition-colors"
                                         >
                                            Mark Best
                                         </button>
                                     )}
                                  </div>
                                </div>
                                <p className="text-xs text-foreground/90 leading-relaxed font-sans">{comment.content}</p>
                              </motion.div>
                            ))}

                            {isReplying && (
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col gap-2 p-3 rounded-lg border bg-background"
                              >
                                <textarea 
                                  autoFocus
                                  value={commentValue}
                                  onChange={(e) => setCommentValue(e.target.value)}
                                  placeholder="What's your take on this logic?"
                                  className="w-full bg-transparent outline-none text-xs font-sans resize-none"
                                />
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="sm" onClick={() => setNewCommentLine(null)}>Cancel</Button>
                                  <Button size="sm" onClick={handleAddComment}>Comment</Button>
                                </div>
                              </motion.div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
