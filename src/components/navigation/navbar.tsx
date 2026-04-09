"use client"

import * as React from "react"
import Link from "next/link"
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import { useTheme } from "next-themes"
import { Moon, Sun, Monitor, Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export function Navbar() {
  const { setTheme } = useTheme()

  return (
    <nav className="fixed top-0 w-full z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="inline-block font-extrabold text-2xl tracking-tight">
              Nexus<span className="text-primary">.</span>
            </span>
          </Link>
          <div className="hidden md:flex gap-6 mt-1">
            <Link href="/feed" className="text-sm font-medium transition-colors hover:text-primary">Feed</Link>
            <Link href="/reviews" className="text-sm font-medium transition-colors hover:text-primary">Reviews</Link>
            <Link href="/leaderboard" className="text-sm font-medium transition-colors hover:text-primary">Leaderboard</Link>
            <Link href="/roadmap" className="text-sm font-medium transition-colors hover:text-primary">Roadmap</Link>
            <Link href="/about" className="text-sm font-medium transition-colors hover:text-primary">About</Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="mr-2 h-4 w-4" /> Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="mr-2 h-4 w-4" /> Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <Monitor className="mr-2 h-4 w-4" /> System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>

          <SignedOut>
            <Link href="/sign-in">
              <Button size="sm">Sign In</Button>
            </Link>
            <Link href="/sign-up" className="hidden sm:block">
              <Button variant="ghost" size="sm">Join Now</Button>
            </Link>
          </SignedOut>
        </div>
      </div>
    </nav>
  )
}
