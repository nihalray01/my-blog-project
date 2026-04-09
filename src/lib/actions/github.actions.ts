"use server"

import { auth, clerkClient } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"

export async function getGithubRepos() {
  const { userId } = auth()
  if (!userId) throw new Error("Unauthorized")

  // 1. Get OAuth token from Clerk
  const response = await (await clerkClient()).users.getUserOauthAccessToken(
    userId,
    'oauth_github'
  )

  const token = response.data[0]?.token
  if (!token) throw new Error("GitHub account not linked or token missing")

  // 2. Fetch repos from GitHub
  const res = await fetch('https://api.github.com/user/repos?sort=updated&per_page=50', {
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  })

  if (!res.ok) throw new Error("Failed to fetch GitHub repositories")

  const repos = await res.json()
  
  return repos.map((repo: any) => ({
    name: repo.name,
    description: repo.description,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    language: repo.language,
    url: repo.html_url,
    id: repo.id.toString(),
  }))
}

export async function importProjects(selectedRepos: any[]) {
  const { userId } = auth()
  if (!userId) throw new Error("Unauthorized")

  const projects = await Promise.all(
    selectedRepos.map((repo) =>
      db.project.upsert({
        where: { id: repo.id }, // Using GitHub repo ID for unique mapping
        update: {
          stars: repo.stars,
          forks: repo.forks,
          description: repo.description,
        },
        create: {
          id: repo.id, // Using the same ID for easy sync
          userId: userId,
          repoName: repo.name,
          description: repo.description,
          stars: repo.stars,
          forks: repo.forks,
          language: repo.language,
          repoUrl: repo.url,
        },
      })
    )
  )

  revalidatePath("/dashboard")
  return projects
}
