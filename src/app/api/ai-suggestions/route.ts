import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: Request) {
  try {
    const { userQuery, financialData } = await request.json()

    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: `You are a helpful financial advisor AI assistant for an expense tracking app. 
      The user is from the Philippines and uses Philippine Peso (₱) as their currency.
      Provide practical, actionable financial advice based on their spending patterns and goals.
      Keep responses concise and helpful. Always format currency amounts with ₱ symbol.`,
      prompt: `User question: ${userQuery}
      
      Financial context:
      - Monthly income: ₱50,000
      - Monthly expenses: ₱32,000
      - Current savings: ₱93,500 across 4 wallets
      - Top spending categories: Food (₱12,500), Transportation (₱6,200), Entertainment (₱3,200)
      - Financial goals: Emergency Fund (₱25,000/₱100,000), Vacation (₱32,000/₱80,000), New Laptop (₱45,000/₱120,000)
      
      Please provide helpful financial advice based on this context.`,
    })

    return Response.json({ suggestion: text })
  } catch (error) {
    console.error("AI suggestion error:", error)
    return Response.json({ error: "Failed to generate AI suggestion" }, { status: 500 })
  }
}
