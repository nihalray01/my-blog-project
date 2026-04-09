"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function submitFeedback(data: {
  name: string
  email: string
  message: string
}) {
  if (!data.message || !data.email) {
    throw new Error("Message and Email are required")
  }

  const feedback = await db.feedback.create({
    data: {
      name: data.name,
      email: data.email,
      message: data.message,
    }
  })

  revalidatePath("/admin") // For future admin view
  return feedback
}
