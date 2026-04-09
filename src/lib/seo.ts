import { Metadata } from "next"

export function constructMetadata({
  title = "Nexus | The Architect's Network",
  description = "The immersive narrative platform for high-performance developers. Build, share, and grow your global project reach.",
  image = "/og-image.png",
  icons = "/favicon.ico",
  noIndex = false
}: {
  title?: string
  description?: string
  image?: string
  icons?: string
  noIndex?: boolean
} = {}): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: image
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
      creator: "@nexus_platform"
    },
    icons,
    metadataBase: new URL('https://my-blog-project-3.onrender.com'),
    ...(noIndex && {
      robots: {
        index: false,
        follow: false
      }
    })
  }
}
