import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { apiUrl } = await request.json()
    console.log("[v0] Data API request URL:", apiUrl)

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })

    console.log("[v0] Data API response status:", response.status)
    
    console.log("[v0] Data API response:", response)

    if (!response.ok) {
      throw new Error(`Data API failed: ${response.status}`)
    }

    const data = await response.json()
    console.log("[v0] Data API response data:", data)
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Data API Error:", error)
    return NextResponse.json({ error: "Failed to fetch data API" }, { status: 500 })
  }
}
