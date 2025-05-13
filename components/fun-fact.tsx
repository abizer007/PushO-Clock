"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Lightbulb } from "lucide-react"

const facts = [
  "The first Git commit was made by Linus Torvalds on April 7, 2005.",
  "GitHub was founded in 2008 and now hosts over 200 million repositories.",
  "The most starred repository on GitHub is the 'freeCodeCamp' learning platform.",
  "GitHub's mascot is an octocat named 'Mona', a cat with octopus tentacles.",
  "The average developer creates about 15 repositories during their career.",
  "The most common commit message on GitHub is 'fix typo'.",
  "JavaScript is the most used language on GitHub, followed by Python.",
  "GitHub was acquired by Microsoft in 2018 for $7.5 billion.",
  "The longest streak of daily contributions on GitHub exceeded 4 years!",
  "Over 73 million developers use GitHub worldwide.",
  "The GitHub API processes over 2 billion requests per day.",
  "The first version of Git was written in just two weeks.",
  "GitHub's headquarters features a replica of the Oval Office called the 'Octocat Office'.",
]

export function FunFact() {
  const [fact, setFact] = useState("")

  useEffect(() => {
    const randomFact = facts[Math.floor(Math.random() * facts.length)]
    setFact(randomFact)
  }, [])

  if (!fact) return null

  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <Lightbulb className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-sm mb-1">Did you know?</h3>
            <p className="text-sm text-muted-foreground">{fact}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
