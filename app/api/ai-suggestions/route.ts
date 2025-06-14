import { generateText } from "ai"
import { createGroq } from "@ai-sdk/groq"

// Initialize Groq with API key
const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { userQuery, financialData, preferences, conversationHistory } = await request.json()

    // Detect if this is a hypothetical scenario
    const isHypothetical = detectHypotheticalScenario(userQuery)
    const hypotheticalData = isHypothetical ? extractHypotheticalData(userQuery, financialData) : null

    const dataToUse = hypotheticalData || financialData

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"), // Using more powerful model
      system: `You are an expert Filipino financial advisor AI assistant for an expense tracking app. 

CORE PRINCIPLES:
- Always use Philippine Peso (₱) currency
- Provide specific, actionable advice
- Be conversational but professional
- Understand context and hypothetical scenarios
- Give personalized recommendations based on user's actual data
- Use Filipino financial context (BPI, BDO, Jollibee, etc.)

RESPONSE STYLE:
- Start with a direct answer to their question
- Use bullet points for clarity
- Include specific peso amounts
- Provide 2-3 actionable next steps
- Be encouraging but realistic

HYPOTHETICAL SCENARIOS:
- If user asks "what if" or gives hypothetical numbers, use those numbers
- Clearly acknowledge you're working with their hypothetical scenario
- Don't reference their actual data when answering hypothetical questions

FINANCIAL EXPERTISE:
- 50/30/20 rule applications
- Emergency fund recommendations (3-6 months expenses)
- Philippine investment options (UITF, mutual funds, stocks)
- Local banking products and services
- Debt management strategies
- Goal-based financial planning`,

      prompt: `User Query: "${userQuery}"

${
  isHypothetical
    ? `
HYPOTHETICAL SCENARIO DETECTED:
Working with hypothetical data: ${JSON.stringify(hypotheticalData, null, 2)}
`
    : `
CURRENT FINANCIAL DATA:
${JSON.stringify(dataToUse, null, 2)}
`
}

USER PREFERENCES:
${JSON.stringify(preferences, null, 2)}

${
  conversationHistory
    ? `
RECENT CONVERSATION:
${conversationHistory
  .slice(-3)
  .map((msg: any) => `${msg.type}: ${msg.message}`)
  .join("\n")}
`
    : ""
}

Provide a helpful, specific response that directly addresses their question using the ${isHypothetical ? "hypothetical" : "actual"} financial data.`,
    })

    return Response.json({
      suggestion: text,
      isHypothetical,
      dataUsed: isHypothetical ? "hypothetical" : "actual",
    })
  } catch (error) {
    console.error("AI suggestion error:", error)

    const { userQuery, financialData } = await request.json()
    const fallbackResponse = generateEnhancedFallbackResponse(userQuery, financialData)
    return Response.json({
      suggestion: fallbackResponse,
      isHypothetical: false,
      dataUsed: "fallback",
    })
  }
}

function detectHypotheticalScenario(query: string): boolean {
  const hypotheticalKeywords = [
    "what if",
    "if my",
    "suppose",
    "assuming",
    "hypothetically",
    "let's say",
    "imagine",
    "if i had",
    "if i have",
    "if my balance",
    "if my income",
    "if i earn",
    "if i spend",
  ]

  return hypotheticalKeywords.some((keyword) => query.toLowerCase().includes(keyword.toLowerCase()))
}

function extractHypotheticalData(query: string, originalData: any): any {
  const hypotheticalData = { ...originalData }

  // Extract hypothetical balance
  const balanceMatch = query.match(/balance.*?(\d+(?:,\d{3})*)/i)
  if (balanceMatch) {
    const amount = Number.parseInt(balanceMatch[1].replace(/,/g, ""))
    hypotheticalData.totalBalance = amount
    hypotheticalData.hypotheticalBalance = amount
  }

  // Extract hypothetical income
  const incomeMatch = query.match(/income.*?(\d+(?:,\d{3})*)/i)
  if (incomeMatch) {
    const amount = Number.parseInt(incomeMatch[1].replace(/,/g, ""))
    hypotheticalData.monthlyIncome = amount
    hypotheticalData.totalIncome = amount
  }

  // Extract hypothetical expenses
  const expenseMatch = query.match(/expens.*?(\d+(?:,\d{3})*)/i)
  if (expenseMatch) {
    const amount = Number.parseInt(expenseMatch[1].replace(/,/g, ""))
    hypotheticalData.monthlyExpenses = amount
    hypotheticalData.totalExpenses = amount
  }

  return hypotheticalData
}

function generateEnhancedFallbackResponse(message: string, financialData: any): string {
  const lowerMessage = message.toLowerCase()
  const isHypothetical = detectHypotheticalScenario(message)
  const dataToUse = isHypothetical ? extractHypotheticalData(message, financialData) : financialData

  const {
    totalIncome = 0,
    totalExpenses = 0,
    totalBalance = 0,
    hypotheticalBalance,
    savingsRate = 0,
    goals = 0,
    wallets = 0,
  } = dataToUse

  const workingBalance = hypotheticalBalance || totalBalance

  if (lowerMessage.includes("allocate") || lowerMessage.includes("50/30/20") || lowerMessage.includes("balance")) {
    return `${isHypothetical ? `For your hypothetical balance of ₱${workingBalance.toLocaleString()}` : `With your current balance of ₱${workingBalance.toLocaleString()}`}, here's a smart allocation strategy:

**🎯 PRIORITY-BASED ALLOCATION:**

**Emergency Fund (40% - ₱${Math.round(workingBalance * 0.4).toLocaleString()})**
• Keep in your most accessible account
• Covers unexpected expenses and emergencies
• Don't touch unless absolutely necessary

**Goal Progress (30% - ₱${Math.round(workingBalance * 0.3).toLocaleString()})**
• Add to your highest priority financial goal
• Accelerates your timeline to achieve targets
• Consider automated transfers

**Next Month Buffer (20% - ₱${Math.round(workingBalance * 0.2).toLocaleString()})**
• Keep in your main spending account
• Helps you start next month ahead
• Reduces financial stress

**Growth/Investment (10% - ₱${Math.round(workingBalance * 0.1).toLocaleString()})**
• High-yield savings or time deposit
• Consider UITF or mutual funds for long-term
• Let your money work for you

**💡 NEXT STEPS:**
1. Move emergency fund to separate savings account
2. Set up automatic goal contributions
3. Research investment options at BPI, BDO, or Metrobank

Would you like specific recommendations for any of these categories?`
  }

  if (lowerMessage.includes("budget") || lowerMessage.includes("spending")) {
    return `Based on your ${isHypothetical ? "hypothetical scenario" : "current situation"}, here's your spending analysis:

**📊 SPENDING BREAKDOWN:**
• Total Balance: ₱${workingBalance.toLocaleString()}
• Monthly Expenses: ₱${Math.abs(totalExpenses).toLocaleString()}
• Savings Rate: ${savingsRate.toFixed(1)}%

**🎯 BUDGET RECOMMENDATIONS:**
1. **50/30/20 Rule Application:**
   - Needs: ₱${Math.round(totalIncome * 0.5).toLocaleString()}
   - Wants: ₱${Math.round(totalIncome * 0.3).toLocaleString()}
   - Savings: ₱${Math.round(totalIncome * 0.2).toLocaleString()}

2. **Quick Wins:**
   - Track daily expenses using this app
   - Set category budgets for top spending areas
   - Use the envelope method for discretionary spending

3. **Filipino-Specific Tips:**
   - Use GCash or PayMaya for better expense tracking
   - Take advantage of cashback credit cards
   - Consider bulk buying at S&R or Landers for savings

**🚀 ACTION PLAN:**
1. Set up category budgets in the app
2. Review and adjust weekly
3. Celebrate small wins to stay motivated`
  }

  if (lowerMessage.includes("save") || lowerMessage.includes("goal")) {
    return `${isHypothetical ? "For your hypothetical scenario" : "Based on your current data"}, here's your savings strategy:

**💰 SAVINGS OPTIMIZATION:**
• Current Balance: ₱${workingBalance.toLocaleString()}
• Active Goals: ${goals} goal${goals !== 1 ? "s" : ""}
• Savings Rate: ${savingsRate.toFixed(1)}%

**🎯 SAVINGS STRATEGIES:**
1. **Automate Everything:**
   - Set up automatic transfers on payday
   - Use separate savings accounts for each goal
   - Consider BPI Save-Up or BDO Kabayan Savings

2. **Boost Your Savings:**
   - Save ₱${Math.round(workingBalance * 0.1).toLocaleString()} monthly (10% of balance)
   - Use the 52-week challenge: Start with ₱50, increase weekly
   - Round up purchases and save the difference

3. **Goal-Based Approach:**
   - Emergency Fund: ₱${Math.round(Math.abs(totalExpenses) * 3).toLocaleString()} (3 months expenses)
   - Vacation Fund: ₱${Math.round(workingBalance * 0.2).toLocaleString()}
   - Investment Fund: ₱${Math.round(workingBalance * 0.15).toLocaleString()}

**📈 NEXT STEPS:**
1. Open a high-yield savings account
2. Set up automatic transfers
3. Track progress weekly in this app`
  }

  if (lowerMessage.includes("investment") || lowerMessage.includes("invest")) {
    return `${isHypothetical ? "With your hypothetical balance" : "With your current balance"} of ₱${workingBalance.toLocaleString()}, here are investment options:

**🇵🇭 PHILIPPINE INVESTMENT OPTIONS:**

**Beginner-Friendly (₱${Math.round(workingBalance * 0.3).toLocaleString()}):**
• Time Deposits (3-6% annually)
• Money Market Funds
• Government bonds (RTBs)

**Moderate Risk (₱${Math.round(workingBalance * 0.4).toLocaleString()}):**
• UITF Balanced Funds
• Mutual Funds (Philam, Sun Life)
• Blue-chip stocks (Jollibee, SM, Ayala)

**Growth-Oriented (₱${Math.round(workingBalance * 0.3).toLocaleString()}):**
• PSE Index Fund
• Equity mutual funds
• REITs (Ayala Land REIT, AREIT)

**🏦 WHERE TO START:**
• **BPI**: BPI Investment Funds, Trade platform
• **BDO**: BDO Nomura, BDO Securities
• **COL Financial**: Online stock trading
• **GCash**: GInvest for mutual funds

**⚠️ INVESTMENT RULES:**
1. Only invest money you won't need for 5+ years
2. Start with 10-20% of your balance
3. Diversify across different asset classes
4. Continue learning about investments

Ready to start your investment journey?`
  }

  // Default enhanced response
  return `I understand you're asking about your finances. ${isHypothetical ? `For your hypothetical scenario with ₱${workingBalance.toLocaleString()}` : `With your current balance of ₱${workingBalance.toLocaleString()}`}, here's what I recommend:

**📊 QUICK FINANCIAL SNAPSHOT:**
• Balance: ₱${workingBalance.toLocaleString()}
• Wallets: ${wallets} account${wallets !== 1 ? "s" : ""}
• Goals: ${goals} active goal${goals !== 1 ? "s" : ""}
• Savings Rate: ${savingsRate.toFixed(1)}%

**🎯 IMMEDIATE ACTIONS:**
1. **Emergency Fund**: Aim for ₱${Math.round(workingBalance * 0.3).toLocaleString()} (30% of balance)
2. **Goal Funding**: Allocate ₱${Math.round(workingBalance * 0.4).toLocaleString()} to your priorities
3. **Growth**: Invest ₱${Math.round(workingBalance * 0.2).toLocaleString()} for long-term wealth

**💡 PERSONALIZED TIPS:**
• Use this app to track daily expenses
• Set up automatic savings transfers
• Consider high-yield accounts at digital banks (CIMB, ING)

What specific area would you like me to dive deeper into - budgeting, saving strategies, investment options, or debt management?`
}
