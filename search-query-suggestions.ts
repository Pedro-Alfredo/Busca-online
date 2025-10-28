'use server';

/**
 * @fileOverview A search query suggestions AI agent.
 *
 * - getSearchQuerySuggestions - A function that handles the search query suggestions process.
 * - SearchQuerySuggestionsInput - The input type for the getSearchQuerySuggestions function.
 * - SearchQuerySuggestionsOutput - The return type for the getSearchQuerySuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SearchQuerySuggestionsInputSchema = z.object({
  query: z.string().describe('The current search query.'),
});
export type SearchQuerySuggestionsInput = z.infer<
  typeof SearchQuerySuggestionsInputSchema
>;

const SearchQuerySuggestionsOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('An array of suggested search queries.'),
});
export type SearchQuerySuggestionsOutput = z.infer<
  typeof SearchQuerySuggestionsOutputSchema
>;

export async function getSearchQuerySuggestions(
  input: SearchQuerySuggestionsInput
): Promise<SearchQuerySuggestionsOutput> {
  return searchQuerySuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'searchQuerySuggestionsPrompt',
  input: {schema: SearchQuerySuggestionsInputSchema},
  output: {schema: SearchQuerySuggestionsOutputSchema},
  prompt: `You are a search query suggestion engine. Given the current search query, suggest related search queries.

Current search query: {{{query}}}

Suggestions:`,
});

const searchQuerySuggestionsFlow = ai.defineFlow(
  {
    name: 'searchQuerySuggestionsFlow',
    inputSchema: SearchQuerySuggestionsInputSchema,
    outputSchema: SearchQuerySuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
