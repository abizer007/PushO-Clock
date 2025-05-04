import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Clock, Github, GitCommit, Globe, Palette, Settings, Share2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-6 w-6" />
            <span className="text-xl font-bold">PushO-Clock</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="#features" className="text-sm font-medium transition-colors hover:text-primary">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium transition-colors hover:text-primary">
              How It Works
            </Link>
            <Link href="#customization" className="text-sm font-medium transition-colors hover:text-primary">
              Customization
            </Link>
            <Link href="/about" className="text-sm font-medium transition-colors hover:text-primary">
              About
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="https://github.com" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="icon">
                <Github className="h-4 w-4" />
                <span className="sr-only">GitHub</span>
              </Button>
            </Link>
            <Button>Get Started</Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 md:py-32">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="container relative z-10 flex flex-col items-center text-center">
            <div className="max-w-3xl space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Visualize Your GitHub Commit Activity Like Never Before
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Transform your contributions into dynamic, insightful heatmaps that tell the story of your coding
                journey.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                <Button size="lg" className="gap-2" asChild>
                  <Link href="/generate">
                    Generate Your Heatmap <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="https://github.com/abizer007/pusho-clock" target="_blank" rel="noopener noreferrer">
                    View on GitHub
                  </Link>
                </Button>
              </div>
            </div>
            <div className="mt-16 w-full max-w-4xl">
              <div className="relative rounded-lg border bg-background p-2 shadow-lg">
                <Tabs defaultValue="rectangular" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="rectangular">Rectangular Heatmap</TabsTrigger>
                    <TabsTrigger value="radial">Radial Clock</TabsTrigger>
                  </TabsList>
                  <TabsContent value="rectangular" className="p-4">
                    <div className="aspect-video w-full overflow-hidden rounded-md bg-muted">
                      <div className="flex h-full w-full items-center justify-center">
                        <HeatmapRectangular />
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="radial" className="p-4">
                    <div className="aspect-video w-full overflow-hidden rounded-md bg-muted">
                      <div className="flex h-full w-full items-center justify-center">
                        <HeatmapRadial />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-muted/50">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Powerful Features</h2>
              <p className="mx-auto mt-4 max-w-[700px] text-muted-foreground md:text-xl">
                Everything you need to visualize and understand your GitHub commit patterns.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <FeatureCard
                icon={<GitCommit className="h-10 w-10" />}
                title="Dynamic SVG Heatmaps"
                description="Visualize your commit patterns with beautiful, responsive SVG heatmaps that adapt to any display."
              />
              <FeatureCard
                icon={<Github className="h-10 w-10" />}
                title="GitHub Integration"
                description="Seamlessly connect with GitHub's GraphQL API to fetch and analyze your commit timestamps."
              />
              <FeatureCard
                icon={<Settings className="h-10 w-10" />}
                title="Customization Options"
                description="Personalize your visualization with different chart types, themes, and timezone settings."
              />
              <FeatureCard
                icon={<Share2 className="h-10 w-10" />}
                title="Easy Embedding"
                description="Generate and embed your heatmap directly in your GitHub README or personal website."
              />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How It Works</h2>
              <p className="mx-auto mt-4 max-w-[700px] text-muted-foreground md:text-xl">
                Generate your GitHub commit heatmap in three simple steps.
              </p>
            </div>
            <div className="grid gap-12 md:grid-cols-3">
              <StepCard
                number="1"
                title="Enter GitHub Username"
                description="Simply provide your GitHub username to start the visualization process."
                image="/placeholder.svg?height=200&width=350"
              />
              <StepCard
                number="2"
                title="Choose Chart Type & Theme"
                description="Select between rectangular or radial clock visualization and pick your preferred theme."
                image="/placeholder.svg?height=200&width=350"
              />
              <StepCard
                number="3"
                title="Generate & Embed"
                description="Generate your SVG and embed it directly in your README or download for use anywhere."
                image="/placeholder.svg?height=200&width=350"
              />
            </div>
          </div>
        </section>

        {/* Customization Section */}
        <section id="customization" className="py-20 bg-muted/50">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Customization Options</h2>
              <p className="mx-auto mt-4 max-w-[700px] text-muted-foreground md:text-xl">
                Tailor your heatmap to match your style and preferences.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <CustomizationCard
                icon={<Palette className="h-8 w-8" />}
                title="Theme Selection"
                description="Choose from light, dark, or custom color themes to match your GitHub profile or website."
              >
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div className="h-12 rounded-md bg-background border flex items-center justify-center">Light</div>
                  <div className="h-12 rounded-md bg-slate-800 text-white flex items-center justify-center">Dark</div>
                  <div className="h-12 rounded-md bg-emerald-100 flex items-center justify-center">Forest</div>
                  <div className="h-12 rounded-md bg-purple-100 flex items-center justify-center">Lavender</div>
                </div>
              </CustomizationCard>
              <CustomizationCard
                icon={<Clock className="h-8 w-8" />}
                title="Chart Type"
                description="Select between rectangular (7x24) or radial clock-style visualization for your commit data."
              >
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div className="h-12 rounded-md border flex items-center justify-center">Rectangular</div>
                  <div className="h-12 rounded-md border flex items-center justify-center">Radial Clock</div>
                </div>
              </CustomizationCard>
              <CustomizationCard
                icon={<Globe className="h-8 w-8" />}
                title="Timezone Adjustment"
                description="Set your preferred timezone to ensure your commit patterns are accurately represented."
              >
                <div className="mt-4 border rounded-md p-2">
                  <select className="w-full bg-transparent p-2 outline-none">
                    <option>UTC (GMT+0)</option>
                    <option>EST (GMT-5)</option>
                    <option>PST (GMT-8)</option>
                    <option>IST (GMT+5:30)</option>
                    <option>JST (GMT+9)</option>
                  </select>
                </div>
              </CustomizationCard>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-muted/50">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">What Developers Say</h2>
              <p className="mx-auto mt-4 max-w-[700px] text-muted-foreground md:text-xl">
                Hear from developers who use PushO-Clock to visualize their GitHub activity.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <TestimonialCard
                quote="PushO-Clock has completely changed how I view my coding habits. The radial visualization helped me realize I'm most productive in the mornings."
                author="Sarah Chen"
                role="Frontend Developer"
                avatar="/placeholder.svg?height=64&width=64"
              />
              <TestimonialCard
                quote="I embedded the heatmap in my GitHub profile README and it's become a great conversation starter during interviews. Love the customization options!"
                author="Miguel Rodriguez"
                role="Full Stack Engineer"
                avatar="/placeholder.svg?height=64&width=64"
              />
              <TestimonialCard
                quote="As a team lead, I use PushO-Clock to understand my team's commit patterns. It's been invaluable for optimizing our workflow and planning."
                author="Alex Johnson"
                role="Engineering Manager"
                avatar="/placeholder.svg?height=64&width=64"
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container">
            <div className="mx-auto max-w-3xl rounded-lg bg-primary/5 p-8 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                Ready to visualize your GitHub activity?
              </h2>
              <p className="mx-auto mt-4 max-w-[700px] text-muted-foreground md:text-xl">
                Generate your custom heatmap in seconds and gain insights into your coding patterns.
              </p>
              <Button size="lg" className="mt-8">
                Get Started Now
              </Button>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-12">
        <div className="container">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <div className="flex items-center gap-2">
              <Clock className="h-6 w-6" />
              <span className="text-xl font-bold">PushO-Clock</span>
            </div>
            <nav className="flex gap-8">
              <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground">
                Features
              </Link>
              <Link href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground">
                How It Works
              </Link>
              <Link href="#customization" className="text-sm text-muted-foreground hover:text-foreground">
                Customization
              </Link>
              <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">
                About
              </Link>
            </nav>
            <div className="flex items-center gap-4">
              <Link href="https://github.com" target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon">
                  <Github className="h-4 w-4" />
                  <span className="sr-only">GitHub</span>
                </Button>
              </Link>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} PushO-Clock. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="text-primary">{icon}</div>
        <CardTitle className="mt-4">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardContent>
    </Card>
  )
}

function StepCard({ number, title, description, image }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
        {number}
      </div>
      <h3 className="mt-4 text-xl font-bold">{title}</h3>
      <p className="mt-2 text-muted-foreground">{description}</p>
      <div className="mt-6 overflow-hidden rounded-lg border">
        <Image src={image || "/placeholder.svg"} alt={title} width={350} height={200} className="object-cover" />
      </div>
    </div>
  )
}

function CustomizationCard({ icon, title, description, children }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="text-primary">{icon}</div>
        <CardTitle className="mt-4">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base">{description}</CardDescription>
        {children}
      </CardContent>
    </Card>
  )
}

function TestimonialCard({ quote, author, role, avatar }) {
  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <div className="mb-4 text-muted-foreground">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6 opacity-50"
          >
            <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
            <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
          </svg>
        </div>
        <p className="mb-6">{quote}</p>
        <div className="flex items-center gap-4">
          <Image src={avatar || "/placeholder.svg"} alt={author} width={48} height={48} className="rounded-full" />
          <div>
            <h4 className="font-semibold">{author}</h4>
            <p className="text-sm text-muted-foreground">{role}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function HeatmapRectangular() {
  return (
    <svg width="700" height="300" viewBox="0 0 700 300" className="max-w-full">
      <g transform="translate(50, 20)">
        {/* Days labels */}
        <text x="-30" y="20" className="text-xs fill-current opacity-70">
          Mon
        </text>
        <text x="-30" y="60" className="text-xs fill-current opacity-70">
          Tue
        </text>
        <text x="-30" y="100" className="text-xs fill-current opacity-70">
          Wed
        </text>
        <text x="-30" y="140" className="text-xs fill-current opacity-70">
          Thu
        </text>
        <text x="-30" y="180" className="text-xs fill-current opacity-70">
          Fri
        </text>
        <text x="-30" y="220" className="text-xs fill-current opacity-70">
          Sat
        </text>
        <text x="-30" y="260" className="text-xs fill-current opacity-70">
          Sun
        </text>

        {/* Hours labels */}
        {Array.from({ length: 24 }).map((_, i) => (
          <text key={i} x={i * 25} y="-5" className="text-xs fill-current opacity-70">
            {i % 3 === 0 ? `${i}h` : ""}
          </text>
        ))}

        {/* Heatmap cells */}
        {Array.from({ length: 7 }).map((_, day) =>
          Array.from({ length: 24 }).map((_, hour) => {
            // Generate random intensity for demo
            const intensity = Math.floor(Math.random() * 5)
            const colors = [
              "fill-emerald-100",
              "fill-emerald-200",
              "fill-emerald-300",
              "fill-emerald-400",
              "fill-emerald-500",
            ]
            return (
              <rect
                key={`${day}-${hour}`}
                x={hour * 25}
                y={day * 40}
                width="20"
                height="20"
                rx="2"
                className={intensity === 0 ? "fill-muted stroke-border" : colors[intensity - 1]}
              />
            )
          }),
        )}
      </g>
    </svg>
  )
}

function HeatmapRadial() {
  return (
    <svg width="500" height="500" viewBox="0 0 500 500" className="max-w-full">
      <defs>
        <radialGradient id="heatmapGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" stopColor="rgba(16, 185, 129, 0.05)" />
          <stop offset="100%" stopColor="rgba(16, 185, 129, 0)" />
        </radialGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <g transform="translate(250, 250)">
        {/* Background gradient */}
        <circle cx="0" cy="0" r="200" fill="url(#heatmapGradient)" />

        {/* Clock face */}
        <circle cx="0" cy="0" r="200" className="fill-none stroke-border stroke-1" />

        {/* Hour circles */}
        {Array.from({ length: 6 }).map((_, i) => (
          <circle key={i} cx="0" cy="0" r={200 - i * 30} className="fill-none stroke-border stroke-[0.5] opacity-60" />
        ))}

        {/* Day segments */}
        {Array.from({ length: 7 }).map((_, i) => {
          const innerRadius = 80
          const outerRadius = 200
          const startAngle = (i * 51.43 * Math.PI) / 180
          const endAngle = ((i + 1) * 51.43 * Math.PI) / 180

          const startX1 = Math.sin(startAngle) * innerRadius
          const startY1 = -Math.cos(startAngle) * innerRadius
          const startX2 = Math.sin(startAngle) * outerRadius
          const startY2 = -Math.cos(startAngle) * outerRadius

          return (
            <line
              key={`day-line-${i}`}
              x1={startX1}
              y1={startY1}
              x2={startX2}
              y2={startY2}
              className="stroke-border stroke-[0.5] opacity-30"
            />
          )
        })}

        {/* Hour marks */}
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i * 15 * Math.PI) / 180
          const x1 = Math.sin(angle) * 200
          const y1 = -Math.cos(angle) * 200
          const x2 = Math.sin(angle) * 190
          const y2 = -Math.cos(angle) * 190
          const labelX = Math.sin(angle) * 220
          const labelY = -Math.cos(angle) * 220

          const isMainHour = i % 6 === 0

          return (
            <g key={i}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                className={`stroke-border ${isMainHour ? "stroke-2" : "stroke-1"}`}
              />
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                className={`fill-current ${isMainHour ? "text-sm font-medium" : "text-xs opacity-70"}`}
              >
                {i}
              </text>
            </g>
          )
        })}

        {/* Commit dots */}
        {Array.from({ length: 120 }).map((_, i) => {
          // Random position for demo
          const hour = Math.floor(Math.random() * 24)
          const day = Math.floor(Math.random() * 7) + 1
          const angle = (hour * 15 * Math.PI) / 180
          const dayOffset = day * 17
          const radius = 190 - dayOffset
          const x = Math.sin(angle) * radius
          const y = -Math.cos(angle) * radius

          // Random intensity for demo
          const intensity = Math.floor(Math.random() * 5)
          const colors = [
            "fill-emerald-100 hover:fill-emerald-200",
            "fill-emerald-200 hover:fill-emerald-300",
            "fill-emerald-300 hover:fill-emerald-400",
            "fill-emerald-400 hover:fill-emerald-500",
            "fill-emerald-500 hover:fill-emerald-600",
          ]

          const sizes = [3, 4, 5, 6, 7]

          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={sizes[intensity]}
              className={`transition-all duration-300 ${intensity === 0 ? "fill-muted stroke-border" : colors[intensity]}`}
              filter={intensity > 2 ? "url(#glow)" : ""}
            />
          )
        })}

        {/* Day labels */}
        <g className="text-xs fill-current font-medium">
          <text x="-35" y="-10" textAnchor="end">
            Mon
          </text>
          <text x="-55" y="-30" textAnchor="end">
            Tue
          </text>
          <text x="-75" y="-50" textAnchor="end">
            Wed
          </text>
          <text x="-95" y="-70" textAnchor="end">
            Thu
          </text>
          <text x="-115" y="-90" textAnchor="end">
            Fri
          </text>
          <text x="-135" y="-110" textAnchor="end">
            Sat
          </text>
          <text x="-155" y="-130" textAnchor="end">
            Sun
          </text>
        </g>

        {/* Center decoration */}
        <circle cx="0" cy="0" r="15" className="fill-primary opacity-20" />
        <circle cx="0" cy="0" r="10" className="fill-primary opacity-40" />
        <circle cx="0" cy="0" r="5" className="fill-primary" />
      </g>
    </svg>
  )
}
