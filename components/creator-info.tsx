import Link from "next/link"
import Image from "next/image"
import { Github, Mail, Code, Award, ExternalLink } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function CreatorInfo() {
  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden border-0">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          <div className="relative w-full md:w-1/3 h-48 md:h-auto overflow-hidden">
            <Image src="https://github.com/abizer007.png" alt="Abizer Masavi" fill className="object-cover" priority />
          </div>

          <div className="p-6 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-rose-500 text-lg">🚀</span>
              <h2 className="text-xl font-bold">Hi, I'm Abizer Masavi!</h2>
            </div>

            <p className="text-gray-300 mb-4">Finance Enthusiast • Tech Explorer • Aspiring Full Stack Developer</p>

            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-2">
                <Award className="h-5 w-5 text-rose-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-200">B.tech CSBS @ MPSTME, NMIMS Mumbai</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Code className="h-5 w-5 text-rose-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-200">
                    Currently building dev projects and solving challenges on LeetCode & HackerRank
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="https://github.com/abizer007"
                target="_blank"
                className="inline-flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-white text-sm py-1.5 px-3 rounded-full transition-colors"
              >
                <Github className="h-4 w-4" />
                GitHub
              </Link>

              <Link
                href="mailto:abizermasavi@gmail.com"
                className="inline-flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-white text-sm py-1.5 px-3 rounded-full transition-colors"
              >
                <Mail className="h-4 w-4" />
                Email
              </Link>

              <Link
                href="https://leetcode.com/abizer_masavi"
                target="_blank"
                className="inline-flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-white text-sm py-1.5 px-3 rounded-full transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                LeetCode
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
