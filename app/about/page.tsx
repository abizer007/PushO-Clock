import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Clock, Github, Globe, Mail, MapPin, Twitter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <Clock className="h-6 w-6" />
              <span className="text-xl font-bold">PushO-Clock</span>
            </Link>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="/#features" className="text-sm font-medium transition-colors hover:text-primary">
              Features
            </Link>
            <Link href="/#how-it-works" className="text-sm font-medium transition-colors hover:text-primary">
              How It Works
            </Link>
            <Link href="/#customization" className="text-sm font-medium transition-colors hover:text-primary">
              Customization
            </Link>
            <Link href="/about" className="text-sm font-medium transition-colors hover:text-primary">
              About
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="https://github.com/abizer007/pusho-clock" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="icon">
                <Github className="h-4 w-4" />
                <span className="sr-only">GitHub</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-12">
        <div className="flex items-center mb-8">
          <Button variant="ghost" size="icon" asChild className="mr-2">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">About</h1>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/10"></div>
            <CardContent className="pt-0">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="-mt-12">
                  <Image
                    src="/placeholder.svg?height=150&width=150"
                    alt="Abizer"
                    width={150}
                    height={150}
                    className="rounded-full border-4 border-background"
                  />
                </div>
                <div className="py-4">
                  <h2 className="text-2xl font-bold">Abizer</h2>
                  <p className="text-muted-foreground">@abizer007</p>

                  <p className="mt-4">Full Stack Developer | Open Source Enthusiast | Creator of PushO-Clock</p>

                  <div className="flex flex-wrap gap-4 mt-4">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>India</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Globe className="h-4 w-4" />
                      <Link href="https://abizer.dev" className="hover:text-primary">
                        abizer.dev
                      </Link>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Twitter className="h-4 w-4" />
                      <Link href="https://twitter.com/abizer007" className="hover:text-primary">
                        @abizer007
                      </Link>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <Link href="mailto:contact@abizer.dev" className="hover:text-primary">
                        contact@abizer.dev
                      </Link>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <Button asChild>
                      <Link href="https://github.com/abizer007" target="_blank" rel="noopener noreferrer">
                        <Github className="h-4 w-4 mr-2" />
                        Follow
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="https://github.com/abizer007/pusho-clock" target="_blank" rel="noopener noreferrer">
                        View PushO-Clock
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 space-y-8">
            <div>
              <h3 className="text-xl font-bold mb-4">About PushO-Clock</h3>
              <p className="text-muted-foreground">
                PushO-Clock is a tool I created to visualize GitHub commit patterns in a more intuitive way. As a
                developer, I wanted to understand my own coding habits better and create something that could help
                others do the same.
              </p>
              <p className="text-muted-foreground mt-4">
                The project uses GitHub's GraphQL API to fetch commit timestamps and transforms them into beautiful SVG
                visualizations that can be embedded in README files or personal websites.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">My Other Projects</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">Project 1</h4>
                        <p className="text-sm text-muted-foreground">Description of project 1</p>
                      </div>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href="https://github.com/abizer007" target="_blank" rel="noopener noreferrer">
                          <Github className="h-4 w-4" />
                          <span className="sr-only">GitHub</span>
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">Project 2</h4>
                        <p className="text-sm text-muted-foreground">Description of project 2</p>
                      </div>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href="https://github.com/abizer007" target="_blank" rel="noopener noreferrer">
                          <Github className="h-4 w-4" />
                          <span className="sr-only">GitHub</span>
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">Contact</h3>
              <p className="text-muted-foreground">
                Feel free to reach out if you have any questions about PushO-Clock or want to collaborate on a project.
              </p>
              <div className="flex gap-4 mt-4">
                <Button asChild>
                  <Link href="mailto:contact@abizer.dev">
                    <Mail className="h-4 w-4 mr-2" />
                    Email Me
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="https://twitter.com/abizer007" target="_blank" rel="noopener noreferrer">
                    <Twitter className="h-4 w-4 mr-2" />
                    DM on Twitter
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <footer className="border-t py-6">
        <div className="container">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} PushO-Clock. All rights reserved.
            </p>
            <Link href="https://github.com/abizer007/pusho-clock" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon">
                <Github className="h-4 w-4" />
                <span className="sr-only">GitHub</span>
              </Button>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
