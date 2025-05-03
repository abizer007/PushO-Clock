"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Github, Clock, Download, Share2 } from "lucide-react"

export default function Home() {
  const [username, setUsername] = useState("")
  const [theme, setTheme] = useState("light")
  const [timezone, setTimezone] = useState("UTC")
  const [imageUrl, setImageUrl] = useState("")
  const [embedMarkdown, setEmbedMarkdown] = useState("")
  const [loading, setLoading] = useState(false)

  const timezones = [
    "UTC",
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "Europe/London",
    "Europe/Paris",
    "Europe/Berlin",
    "Asia/Tokyo",
    "Asia/Shanghai",
    "Asia/Kolkata",
    "Australia/Sydney",
    "Pacific/Auckland",
  ]

  const generateImage = () => {
    if (!username) return

    const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
    const apiPath = `/api/${username}?type=radial&theme=${theme}&tz=${timezone}`
    const fullUrl = `${baseUrl}${apiPath}`

    setImageUrl(apiPath)
    setEmbedMarkdown(`![GitHub Commit Clock](${fullUrl})`)
  }

  const downloadImage = async () => {
    if (!imageUrl) return

    try {
      const res = await fetch(imageUrl)
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${username}-github-commit-clock.svg`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error("Download failed:", err)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    alert("Copied to clipboard!")
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Github className="h-6 w-6" />
            GitHub Commit Clock
          </CardTitle>
          <CardDescription>Visualize when you code the most — by day and hour</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="generate" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="generate">Generate</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="generate" className="space-y-4">
              <div className="space-y-2">
                <Label>GitHub Username</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. octocat"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <Button onClick={generateImage} disabled={!username || loading}>
                    {loading ? "Loading..." : "Generate"}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <div className="flex items-center justify-between">
                    <span>Light</span>
                    <Switch
                      checked={theme === "dark"}
                      onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                    />
                    <span>Dark</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((tz) => (
                        <SelectItem key={tz} value={tz}>
                          {tz}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preview">
              {imageUrl ? (
                <div className="flex flex-col items-center space-y-4 w-full">
                  <div className="border rounded-md overflow-hidden w-full">
                    <iframe
                      src={imageUrl}
                      className="w-full h-[500px]"
                      title="GitHub Activity Clock"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={downloadImage}>
                      <Download className="mr-2 h-4 w-4" />
                      Download SVG
                    </Button>
                    <Button variant="outline" onClick={() => copyToClipboard(imageUrl)}>
                      <Share2 className="mr-2 h-4 w-4" />
                      Copy Share Link
                    </Button>
                  </div>

                  <div className="w-full">
                    <Label>README Embed Markdown</Label>
                    <div className="flex gap-2 mt-1">
                      <Input readOnly value={embedMarkdown} className="font-mono text-xs" />
                      <Button
                        variant="outline"
                        onClick={() => copyToClipboard(embedMarkdown)}
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                  <Clock className="h-12 w-12 mb-4" />
                  <p>Generate a commit clock to see the preview</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between text-sm text-muted-foreground">
          <p>Powered by GitHub GraphQL + REST API</p>
          <p>Timezone: {timezone}</p>
        </CardFooter>
      </Card>
    </main>
  )
}

