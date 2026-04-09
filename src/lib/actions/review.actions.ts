"use server"

import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"

export async function createReview(data: {
  title: string
  codeSnippet: string
  language: string
  projectId?: string
}) {
  const { userId } = auth()
  if (!userId) throw new Error("Unauthorized")

  const review = await db.codeReview.create({
    data: {
      ...data,
      authorId: userId,
    },
  })

  revalidatePath("/reviews")
  return review
}

export async function addReviewComment(data: {
  reviewId: string
  content: string
  lineNumber: number
}) {
  const { userId } = auth()
  if (!userId) throw new Error("Unauthorized")

  const comment = await db.reviewComment.create({
    data: {
      ...data,
      authorId: userId,
    },
  })

  revalidatePath(`/reviews/${data.reviewId}`)
  return comment
}

export async function upvoteComment(commentId: string) {
  const { userId } = auth()
  if (!userId) throw new Error("Unauthorized")

  const comment = await db.reviewComment.update({
    where: { id: commentId },
    data: {
      upvotes: { increment: 1 }
    }
  })

  return comment
}

export async function markBestReview(commentId: string, reviewId: string) {
  const { userId } = auth()
  if (!userId) throw new Error("Unauthorized")

  // Verify user is the author of the review
  const review = await db.codeReview.findUnique({
    where: { id: reviewId },
    select: { authorId: true }
  })

  if (review?.authorId !== userId) throw new Error("Only the author can mark the best review")

  // Reset all other comments for this review
  await db.reviewComment.updateMany({
    where: { reviewId },
    data: { isBest: false }
  })

  // Mark this one as best
  await db.reviewComment.update({
    where: { id: commentId },
    data: { isBest: true }
  })

  revalidatePath(`/reviews/${reviewId}`)
}
