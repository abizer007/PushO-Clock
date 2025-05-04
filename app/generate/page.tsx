"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Check, Clock, Copy, Github } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function GeneratePage() {
  const [username, setUsername] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [chartType, setChartType] = useState("rectangular")
  const [theme, setTheme] = useState("green")
  const [copied, setCopied] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (username.trim()) {
      setSubmitted(true)
    }
  }

  const embedCode = `![${username}'s GitHub Commit Heatmap](https://pusho-clock.vercel.app/api/heatmap?username=${username}&type=${chartType}&theme=${theme})`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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
          <h1 className="text-3xl font-bold">Generate Your Heatmap</h1>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="username">GitHub Username</Label>
                  <div className="flex gap-2">
                    <Input
                      id="username"
                      placeholder="e.g., abizer007"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                    <Button type="submit">Generate</Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Chart Type</Label>
                  <RadioGroup
                    defaultValue="rectangular"
                    className="flex gap-4"
                    value={chartType}
                    onValueChange={setChartType}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="rectangular" id="rectangular" />
                      <Label htmlFor="rectangular">Rectangular</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="radial" id="radial" />
                      <Label htmlFor="radial">Radial Clock</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Theme</Label>
                  <RadioGroup
                    defaultValue="green"
                    className="grid grid-cols-2 gap-4"
                    value={theme}
                    onValueChange={setTheme}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="green" id="green" />
                      <Label htmlFor="green">Green</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="blue" id="blue" />
                      <Label htmlFor="blue">Blue</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="purple" id="purple" />
                      <Label htmlFor="purple">Purple</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="orange" id="orange" />
                      <Label htmlFor="orange">Orange</Label>
                    </div>
                  </RadioGroup>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {submitted ? (
              <>
                <Card>
                  <CardContent className="pt-6">
                    <Tabs defaultValue={chartType}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="rectangular">Rectangular</TabsTrigger>
                        <TabsTrigger value="radial">Radial Clock</TabsTrigger>
                      </TabsList>
                      <TabsContent value="rectangular" className="p-4">
                        <div className="aspect-video w-full overflow-hidden rounded-md bg-muted flex items-center justify-center">
                          <HeatmapRectangular username={username} theme={theme} />
                        </div>
                      </TabsContent>
                      <TabsContent value="radial" className="p-4">
                        <div className="aspect-video w-full overflow-hidden rounded-md bg-muted flex items-center justify-center">
                          <HeatmapRadial username={username} theme={theme} />
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <Label>Embed in your GitHub README</Label>
                      <div className="relative">
                        <div className="bg-muted p-4 rounded-md font-mono text-sm overflow-x-auto">{embedCode}</div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={copyToClipboard}
                        >
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          <span className="sr-only">Copy</span>
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Copy and paste this code into your GitHub README.md file to display your commit heatmap.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                  <Clock className="h-16 w-16 mx-auto text-muted-foreground" />
                  <h3 className="text-xl font-medium">Enter your GitHub username</h3>
                  <p className="text-muted-foreground">Generate a beautiful visualization of your commit patterns</p>
                </div>
              </div>
            )}
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

function HeatmapRectangular({ username, theme }) {
  // This would normally fetch real data from the GitHub API
  // For demo purposes, we're generating random data
  const colorMap = {
    green: ["fill-emerald-100", "fill-emerald-200", "fill-emerald-300", "fill-emerald-400", "fill-emerald-500"],
    blue: ["fill-blue-100", "fill-blue-200", "fill-blue-300", "fill-blue-400", "fill-blue-500"],
    purple: ["fill-purple-100", "fill-purple-200", "fill-purple-300", "fill-purple-400", "fill-purple-500"],
    orange: ["fill-orange-100", "fill-orange-200", "fill-orange-300", "fill-orange-400", "fill-orange-500"],
  }

  const colors = colorMap[theme] || colorMap.green

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

        {/* Username watermark */}
        <text x="280" y="140" className="text-lg font-bold fill-current opacity-10">
          {username || "GitHub Username"}
        </text>

        {/* Heatmap cells */}
        {Array.from({ length: 7 }).map((_, day) =>
          Array.from({ length: 24 }).map((_, hour) => {
            // Generate random intensity for demo
            // In a real app, this would be based on actual commit data
            const intensity = Math.floor(Math.random() * 5)
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

function HeatmapRadial({ username, theme }) {
  // This would normally fetch real data from the GitHub API
  // For demo purposes, we're generating random data
  const colorMap = {
    green: [
      "fill-emerald-100 hover:fill-emerald-200",
      "fill-emerald-200 hover:fill-emerald-300",
      "fill-emerald-300 hover:fill-emerald-400",
      "fill-emerald-400 hover:fill-emerald-500",
      "fill-emerald-500 hover:fill-emerald-600",
    ],
    blue: [
      "fill-blue-100 hover:fill-blue-200",
      "fill-blue-200 hover:fill-blue-300",
      "fill-blue-300 hover:fill-blue-400",
      "fill-blue-400 hover:fill-blue-500",
      "fill-blue-500 hover:fill-blue-600",
    ],
    purple: [
      "fill-purple-100 hover:fill-purple-200",
      "fill-purple-200 hover:fill-purple-300",
      "fill-purple-300 hover:fill-purple-400",
      "fill-purple-400 hover:fill-purple-500",
      "fill-purple-500 hover:fill-purple-600",
    ],
    orange: [
      "fill-orange-100 hover:fill-orange-200",
      "fill-orange-200 hover:fill-orange-300",
      "fill-orange-300 hover:fill-orange-400",
      "fill-orange-400 hover:fill-orange-500",
      "fill-orange-500 hover:fill-orange-600",
    ],
  }

  const colors = colorMap[theme] || colorMap.green
  const gradientColor =
    theme === "green"
      ? "rgba(16, 185, 129, 0.05)"
      : theme === "blue"
        ? "rgba(59, 130, 246, 0.05)"
        : theme === "purple"
          ? "rgba(168, 85, 247, 0.05)"
          : "rgba(249, 115, 22, 0.05)"

  return (
    <svg width="500" height="500" viewBox="0 0 500 500" className="max-w-full">
      <defs>
        <radialGradient id={`heatmapGradient-${theme}`} cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" stopColor={gradientColor} />
          <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
        </radialGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <g transform="translate(250, 250)">
        {/* Background gradient */}
        <circle cx="0" cy="0" r="200" fill={`url(#heatmapGradient-${theme})`} />

        {/* Username watermark */}
        <text
          x="0"
          y="0"
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-lg font-bold fill-current opacity-10"
        >
          {username || "GitHub Username"}
        </text>

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
