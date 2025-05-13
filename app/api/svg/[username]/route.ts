import type { NextRequest } from "next/server"

// GitHub token from environment variables
const GITHUB_TOKEN = process.env.GITHUB_TOKEN

interface Repository {
  name: string
  created_at: string
  html_url: string
  description: string | null
  language: string | null
  stargazers_count: number
  fork: boolean
  topics: string[]
}

export async function GET(request: NextRequest, { params }: { params: { username: string } }) {
  const username = params.username

  if (!username) {
    return new Response("Username is required", { status: 400 })
  }

  try {
    // Prepare headers for GitHub API request
    const headers: HeadersInit = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "RetroRepo-Timeline-Generator",
    }

    // Add authorization header if token is available
    if (GITHUB_TOKEN) {
      headers["Authorization"] = `token ${GITHUB_TOKEN}`
    }

    // Fetch repositories from GitHub API
    const response = await fetch(`https://api.github.com/users/${username}/repos?sort=created&per_page=100`, {
      headers,
    })

    if (!response.ok) {
      return new Response("Failed to fetch GitHub repositories", { status: response.status })
    }

    const repos: Repository[] = await response.json()

    if (repos.length === 0) {
      return new Response("No public repositories found for this user", { status: 404 })
    }

    // Sort repositories by creation date
    const sortedRepos = repos.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

    // Generate SVG timeline
    const svgContent = generateNoOverlapTimelineSvg(sortedRepos, username)

    // Return SVG with proper headers
    return new Response(svgContent, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=86400",
      },
    })
  } catch (error) {
    console.error("Error generating timeline:", error)
    return new Response("Error generating timeline", { status: 500 })
  }
}

function generateNoOverlapTimelineSvg(repos: Repository[], username: string): string {
  // SVG dimensions and settings
  const width = 900
  const height = 400
  const padding = 60
  const timelineY = height / 2
  const dotRadius = 6
  const labelHeight = 24
  const labelWidth = 120
  const labelRadius = 4
  const minLabelSpacing = 130 // Minimum space between labels

  // Calculate timeline start and end dates
  const firstDate = new Date(repos[0].created_at)
  const lastDate = new Date(repos[repos.length - 1].created_at)
  const timeSpan = lastDate.getTime() - firstDate.getTime()

  // Add padding to the timeline (10% on each side)
  const paddingTime = timeSpan * 0.1
  const adjustedFirstDate = new Date(firstDate.getTime() - paddingTime)
  const adjustedLastDate = new Date(lastDate.getTime() + paddingTime)
  const adjustedTimeSpan = adjustedLastDate.getTime() - adjustedFirstDate.getTime()

  // Function to calculate x position based on date
  const getXPosition = (date: Date) => {
    const timeOffset = date.getTime() - adjustedFirstDate.getTime()
    const ratio = timeOffset / adjustedTimeSpan
    return padding + ratio * (width - 2 * padding)
  }

  // Language colors for dots
  const languageColors: Record<string, string> = {
    JavaScript: "#f1e05a",
    TypeScript: "#3178c6",
    Python: "#3572A5",
    Java: "#b07219",
    "C#": "#178600",
    PHP: "#4F5D95",
    "C++": "#f34b7d",
    Ruby: "#701516",
    Go: "#00ADD8",
    Swift: "#F05138",
    Kotlin: "#A97BFF",
    Rust: "#dea584",
    HTML: "#e34c26",
    CSS: "#563d7c",
    Shell: "#89e051",
    default: "#6e7781",
  }

  // Generate SVG elements
  let dots = ""
  let labels = ""
  let connections = ""

  // Add year markers
  const years = []
  const startYear = adjustedFirstDate.getFullYear()
  const endYear = adjustedLastDate.getFullYear()

  for (let year = startYear; year <= endYear; year++) {
    const yearDate = new Date(year, 0, 1)
    if (yearDate < adjustedFirstDate) continue
    if (yearDate > adjustedLastDate) break

    const x = getXPosition(yearDate)
    years.push(`
      <line x1="${x}" y1="${timelineY - 15}" x2="${x}" y2="${timelineY + 15}" stroke="var(--color-timeline)" stroke-width="1" stroke-dasharray="4" />
      <text x="${x}" y="${timelineY + 35}" text-anchor="middle" font-size="12" fill="var(--color-text-light)">${year}</text>
    `)
  }

  // Group repositories by time proximity to handle overlapping
  const repoGroups: Repository[][] = []

  // Clone the sorted repos array
  const reposToProcess = [...repos]

  // Process all repositories
  while (reposToProcess.length > 0) {
    const currentGroup: Repository[] = [reposToProcess.shift()!]
    const groupDate = new Date(currentGroup[0].created_at)
    const groupX = getXPosition(groupDate)

    // Check remaining repos to see if they're close in time
    let i = 0
    while (i < reposToProcess.length) {
      const nextRepo = reposToProcess[i]
      const nextDate = new Date(nextRepo.created_at)
      const nextX = getXPosition(nextDate)

      // If repos are close together (would cause label overlap), group them
      if (Math.abs(nextX - groupX) < minLabelSpacing) {
        currentGroup.push(nextRepo)
        reposToProcess.splice(i, 1)
      } else {
        i++
      }
    }

    repoGroups.push(currentGroup)
  }

  // Process repository groups
  repoGroups.forEach((group, groupIndex) => {
    // Calculate the average date for the group
    const groupTimestamp = group.reduce((sum, repo) => sum + new Date(repo.created_at).getTime(), 0) / group.length
    const groupDate = new Date(groupTimestamp)
    const x = getXPosition(groupDate)

    // Alternate between top and bottom for groups
    const isTop = groupIndex % 2 === 0

    // For groups with multiple repos, stack them vertically
    group.forEach((repo, repoIndex) => {
      // Calculate vertical offset based on position in group
      const baseOffset = isTop ? -50 : 50
      const stackOffset = repoIndex * (labelHeight + 10) * (isTop ? -1 : 1)
      const labelY = timelineY + baseOffset + stackOffset

      // Get color based on language
      const color =
        repo.language && languageColors[repo.language] ? languageColors[repo.language] : languageColors.default

      // Add dot on timeline
      const repoDate = new Date(repo.created_at)
      const repoX = getXPosition(repoDate)
      dots += `<circle cx="${repoX}" cy="${timelineY}" r="${dotRadius}" fill="${color}" />`

      // Add connection line (curved if not at group center)
      if (group.length > 1 && Math.abs(repoX - x) > 5) {
        // Create a curved connection for better visual separation
        const controlX = (repoX + x) / 2
        const controlY = timelineY + (isTop ? -20 : 20)
        connections += `
          <path 
            d="M${repoX},${timelineY} Q${controlX},${controlY} ${x},${labelY}" 
            stroke="var(--color-connection)" 
            stroke-width="1.5" 
            fill="none" 
          />
        `
      } else {
        // Straight line for single repos or center repo in group
        connections += `
          <line 
            x1="${repoX}" 
            y1="${timelineY}" 
            x2="${x}" 
            y2="${labelY}" 
            stroke="var(--color-connection)" 
            stroke-width="1.5" 
          />
        `
      }

      // Add repository label with truncation for long names
      const displayName = repo.name.length > 15 ? repo.name.substring(0, 13) + "..." : repo.name

      labels += `
        <g>
          <a href="${repo.html_url}" target="_blank">
            <rect 
              x="${x - labelWidth / 2}" 
              y="${labelY - labelHeight / 2}" 
              width="${labelWidth}" 
              height="${labelHeight}" 
              rx="${labelRadius}" 
              fill="var(--color-card)" 
              stroke="var(--color-border)" 
            />
            <text 
              x="${x}" 
              y="${labelY + 5}" 
              text-anchor="middle" 
              font-size="12" 
              fill="var(--color-text)"
            >${displayName}</text>
          </a>
        </g>
      `
    })
  })

  // Create the SVG with enhanced styling
  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <style>
        :root {
          --color-primary: #3b82f6;
          --color-text: #374151;
          --color-text-light: #6b7280;
          --color-border: #e5e7eb;
          --color-card: #ffffff;
          --color-timeline: #d1d5db;
          --color-connection: #9ca3af;
        }
        
        @media (prefers-color-scheme: dark) {
          :root {
            --color-primary: #60a5fa;
            --color-text: #e5e7eb;
            --color-text-light: #9ca3af;
            --color-border: #4b5563;
            --color-card: #1f2937;
            --color-timeline: #4b5563;
            --color-connection: #6b7280;
          }
        }
        
        text {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          fill: var(--color-text);
        }
        
        a:hover rect {
          stroke: var(--color-primary);
          stroke-width: 2;
        }
      </style>
      
      <rect width="${width}" height="${height}" fill="none" />
      
      <!-- Title -->
      <text x="${width / 2}" y="25" text-anchor="middle" font-size="16" font-weight="bold">
        ${username}'s GitHub Journey
      </text>
      
      <!-- Timeline base line -->
      <line x1="${padding}" y1="${timelineY}" x2="${width - padding}" y2="${timelineY}" stroke="var(--color-timeline)" stroke-width="2" />
      
      <!-- Year markers -->
      ${years.join("")}
      
      <!-- Repository connections -->
      ${connections}
      
      <!-- Repository labels -->
      ${labels}
      
      <!-- Timeline dots -->
      ${dots}
      
      <!-- RetroRepo branding -->
      <text x="${padding}" y="${height - 15}" text-anchor="start" font-size="10" fill="var(--color-text-light)" opacity="0.7">
        Generated by RetroRepo
      </text>
    </svg>
  `
}
