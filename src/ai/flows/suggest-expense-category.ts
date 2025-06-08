'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting expense categories based on a transaction description.
 *
 * - suggestExpenseCategory - A function that takes a transaction description and returns a suggested expense category.
 * - SuggestExpenseCategoryInput - The input type for the suggestExpenseCategory function.
 * - SuggestExpenseCategoryOutput - The return type for the suggestExpenseCategory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestExpenseCategoryInputSchema = z.object({
  transactionDescription: z
    .string()
    .describe('The description of the uncategorized transaction.'),
});
export type SuggestExpenseCategoryInput = z.infer<typeof SuggestExpenseCategoryInputSchema>;

const SuggestExpenseCategoryOutputSchema = z.object({
  suggestedCategory: z.string().describe('The suggested expense category for the transaction.'),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe('A confidence score (0-1) for the category suggestion.'),
});
export type SuggestExpenseCategoryOutput = z.infer<typeof SuggestExpenseCategoryOutputSchema>;

export async function suggestExpenseCategory(
  input: SuggestExpenseCategoryInput
): Promise<SuggestExpenseCategoryOutput> {
  return suggestExpenseCategoryFlow(input);
}

const suggestExpenseCategoryPrompt = ai.definePrompt({
  name: 'suggestExpenseCategoryPrompt',
  input: {schema: SuggestExpenseCategoryInputSchema},
  output: {schema: SuggestExpenseCategoryOutputSchema},
  prompt: `You are a personal finance expert. Given the following transaction description,
you will suggest an expense category and a confidence level (between 0 and 1) that the category is correct.

Transaction Description: {{{transactionDescription}}}

Respond with a JSON object.
`,
});

const suggestExpenseCategoryFlow = ai.defineFlow(
  {
    name: 'suggestExpenseCategoryFlow',
    inputSchema: SuggestExpenseCategoryInputSchema,
    outputSchema: SuggestExpenseCategoryOutputSchema,
  },
  async input => {
    const {output} = await suggestExpenseCategoryPrompt(input);
    return output!;
  }
);
