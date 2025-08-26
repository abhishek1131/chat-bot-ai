import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("[v0] Prompt API request body:", body)

    const response = await fetch("http://3.95.246.95:5000/params", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    console.log("[v0] Prompt API response status:", response.status)

    if (!response.ok) {
      throw new Error(`Prompt API failed: ${response.status}`)
    }

    const responseText = await response.text()
    console.log("[v0] Prompt API response text:", responseText)

    try {
      const data = JSON.parse(responseText)
      console.log("[v0] Prompt API response data:", data)
      return NextResponse.json(data)
    } catch (jsonError) {
      console.error("[v0] Response is not valid JSON:", responseText)
      return NextResponse.json(
        {
          error: `API returned non-JSON response: ${responseText}`,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("[v0] Prompt API Error:", error)
    return NextResponse.json({ error: "Failed to fetch prompt API" }, { status: 500 })
  }
}
