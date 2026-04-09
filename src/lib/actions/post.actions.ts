"use server"

import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"

import { db } from "@/lib/db"

export async function createPost(data: {
  title: string
  content: string
  tags?: string[]
  status?: "draft" | "broadcast"
}) {
  const { userId } = auth()
  if (!userId) throw new Error("Unauthorized")

  const post = await db.$transaction(async (tx) => {
    const p = await tx.post.create({
      data: {
        title: data.title,
        content: data.content,
        tags: data.tags || [],
        status: data.status || "broadcast",
        authorId: userId,
      },
    })

    if (data.status === "broadcast") {
      const profile = await tx.profile.findUnique({
        where: { userId },
        select: { lastActivityDate: true, streakCount: true }
      })

      if (profile) {
        const now = new Date()
        const lastDate = profile.lastActivityDate ? new Date(profile.lastActivityDate) : null
        
        // Streak logic
        let newStreak = profile.streakCount
        const isNextDay = lastDate && 
          now.getDate() === lastDate.getDate() + 1 && 
          now.getMonth() === lastDate.getMonth() && 
          now.getFullYear() === lastDate.getFullYear()
        
        const isSameDay = lastDate && 
          now.getDate() === lastDate.getDate() && 
          now.getMonth() === lastDate.getMonth() && 
          now.getFullYear() === lastDate.getFullYear()

        if (isNextDay || !lastDate) {
          newStreak += 1
        } else if (!isSameDay) {
          newStreak = 1
        }

        await tx.profile.update({
          where: { userId },
          data: {
            streakCount: newStreak,
            lastActivityDate: now,
            reputation: { increment: 50 } // Reward for broadcasting
          }
        })
      }
    }
    return p
  })

  revalidatePath("/feed")
  revalidatePath(`/profile/${userId}`)
  return post
}

export async function updatePost(id: string, data: {
  title?: string
  content?: string
  tags?: string[]
  status?: "draft" | "broadcast"
}) {
  const { userId } = auth()
  if (!userId) throw new Error("Unauthorized")

  const post = await db.post.update({
    where: { 
      id,
      authorId: userId // Ensure user owns the post
    },
    data: {
      ...data
    },
  })

  revalidatePath("/feed")
  revalidatePath(`/post/${id}`)
  return post
}

export async function deletePost(id: string) {
  const { userId } = auth()
  if (!userId) throw new Error("Unauthorized")

  await db.post.delete({
    where: { 
      id,
      authorId: userId 
    },
  })

  revalidatePath("/feed")
}
