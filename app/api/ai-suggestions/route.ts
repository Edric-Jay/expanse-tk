import { generateText } from "ai";
import { createGroq } from "@ai-sdk/groq";

// Initialize Groq with free API key
const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY || "your-free-groq-api-key",
});

export async function POST(request: Request) {
  try {
    const { userQuery, financialData } = await request.json();
    console.log(financialData);

    const { text } = await generateText({
      model: groq("llama-3.1-8b-instant"), // Fast and free model
      system: `You are a helpful financial advisor AI assistant for an expense tracking app. 
      The user is from the Philippines and uses Philippine Peso (₱) as their currency.
      Provide practical, actionable financial advice based on their spending patterns and goals.
      Keep responses concise and helpful. Always format currency amounts with ₱ symbol.`,
      prompt: `User question: ${userQuery}
      
      Financial context:
      - Current balance: ₱${financialData.totalBalance?.toLocaleString() || "0"}
      - This month's income: ₱${financialData.monthlyIncome?.toLocaleString() || "0"}
      - This month's expenses: ₱${Math.abs(
        financialData.monthlyExpenses || 0
      ).toLocaleString()}
      - Overall income: ₱${financialData.totalIncome?.toLocaleString() || "0"}
      - Overall expenses: ₱${Math.abs(
        financialData.totalExpenses || 0
      ).toLocaleString()}
      - This month's savings: ₱${
        financialData.monthlySavings?.toLocaleString() || "0"
      }
      - Savings rate: ${financialData.savingsRate?.toFixed(1) || "0"}%
      - Top spending categories: ${financialData.topCategories}
      - Number of goals: ${financialData.goals || 0}
      - Number of wallets: ${financialData.wallets || 0}
      
      Please provide helpful financial advice based on this context.`,
    });
    console.log(text);
    return Response.json({ suggestion: text });
  } catch (error) {
    console.error("AI suggestion error:", error);

    // Fallback to rule-based responses if API fails
    const { userQuery, financialData } = await request.json();
    const fallbackResponse = generateFallbackResponse(userQuery, financialData);
    return Response.json({ suggestion: fallbackResponse });
  }
}

// Fallback rule-based AI responses (completely free)
function generateFallbackResponse(message: string, financialData: any) {
  const lowerMessage = message.toLowerCase();
  const {
    totalIncome = 0,
    totalExpenses = 0,
    totalBalance = 0,
    savingsRate = 0,
    goals = 0,
    wallets = 0,
  } = financialData;

  if (lowerMessage.includes("budget") || lowerMessage.includes("spending")) {
    return `Based on your data, your total expenses are ₱${Math.abs(
      totalExpenses
    ).toLocaleString()}. Here are some budgeting tips:

1. **50/30/20 Rule**: Allocate 50% for needs, 30% for wants, 20% for savings
2. **Track Daily**: Monitor small expenses that add up
3. **Set Category Limits**: Create spending limits for each category
4. **Review Weekly**: Check your progress every week

Your current savings rate is ${savingsRate.toFixed(
      1
    )}%. Try to gradually increase this to 20% or higher.`;
  }

  if (lowerMessage.includes("save") || lowerMessage.includes("goal")) {
    return `You currently have ${goals} financial goal${
      goals !== 1 ? "s" : ""
    } set up. Your total balance is ₱${totalBalance.toLocaleString()}. 

**Savings Tips:**
1. **Automate Savings**: Set up automatic transfers to avoid spending temptation
2. **Emergency Fund First**: Build 3-6 months of expenses (₱${(
      Math.abs(totalExpenses) * 3
    ).toLocaleString()})
3. **Goal-Based Saving**: Create specific goals with target dates
4. **High-Yield Accounts**: Move savings to accounts with better interest rates

**Quick Win**: Try saving ₱100 daily - that's ₱36,500 per year!`;
  }

  if (lowerMessage.includes("investment") || lowerMessage.includes("invest")) {
    return `You have ₱${totalBalance.toLocaleString()} across ${wallets} wallet${
      wallets !== 1 ? "s" : ""
    }. 

**Investment Basics for Philippines:**
1. **Emergency Fund First**: Ensure 3-6 months expenses saved
2. **Start Small**: Begin with ₱1,000-5,000 monthly
3. **Diversify**: Consider index funds, bonds, and blue-chip stocks
4. **Local Options**: Look into PSE index funds, government bonds
5. **Digital Platforms**: Use COL Financial, BPI Trade, or similar

**Risk Rule**: Only invest money you won't need for 5+ years. Start conservative and learn as you go.`;
  }

  if (lowerMessage.includes("debt") || lowerMessage.includes("loan")) {
    return `**Debt Management Strategy:**

1. **List All Debts**: Write down amounts, interest rates, minimum payments
2. **Avalanche Method**: Pay minimums on all, extra on highest interest rate
3. **Snowball Method**: Pay minimums on all, extra on smallest balance
4. **Negotiate**: Call creditors to discuss payment plans or rate reductions
5. **Avoid New Debt**: Stop using credit cards until existing debt is cleared

**Emergency**: If struggling, contact a financial counselor or debt management service.`;
  }

  // Default response
  return `Based on your financial data:
- **Total Balance**: ₱${totalBalance.toLocaleString()}
- **Monthly Expenses**: ₱${Math.abs(totalExpenses).toLocaleString()}
- **Savings Rate**: ${savingsRate.toFixed(1)}%
- **Goals**: ${goals} active goal${goals !== 1 ? "s" : ""}

**Quick Recommendations:**
1. ${
    savingsRate < 10
      ? "Increase your savings rate to at least 10%"
      : "Great savings rate! Consider investing excess funds"
  }
2. ${
    goals === 0
      ? "Set up your first financial goal to stay motivated"
      : "Keep working towards your financial goals"
  }
3. ${
    wallets < 2
      ? "Consider separating savings and spending money into different wallets"
      : "Good wallet organization"
  }

What specific area would you like help with - budgeting, saving, investing, or debt management?`;
}
