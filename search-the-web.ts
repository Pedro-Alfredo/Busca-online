'use server';

/**
 * @fileOverview A web search AI agent using Serper.dev.
 *
 * - searchTheWeb - A function that fetches search results from the web.
 * - WebSearchInput - The input type for the searchTheWeb function.
 * - WebSearchOutput - The return type for the searchTheWeb function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const WebSearchInputSchema = z.object({
  query: z.string().describe('The search query.'),
});
export type WebSearchInput = z.infer<typeof WebSearchInputSchema>;

const WebSearchOutputSchema = z.object({
  results: z.array(
    z.object({
      title: z.string(),
      link: z.string(),
      snippet: z.string(),
      position: z.number(),
    })
  ).describe('An array of search results.'),
});
export type WebSearchOutput = z.infer<typeof WebSearchOutputSchema>;

const searchTheWebFlow = ai.defineFlow(
  {
    name: 'searchTheWebFlow',
    inputSchema: WebSearchInputSchema,
    outputSchema: WebSearchOutputSchema,
  },
  async ({ query }) => {
    const apiKey = process.env.SERPER_API_KEY;
    if (!apiKey) {
      throw new Error('SERPER_API_KEY environment variable not set.');
    }

    try {
      const response = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: {
          'X-API-KEY': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ q: query, hl: 'pt' }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Serper API request failed with status ${response.status}: ${errorBody}`);
      }

      const data = await response.json();
      
      const results = data.organic || [];

      return {
        results: results.map((result: any) => ({
          title: result.title,
          link: result.link,
          snippet: result.snippet,
          position: result.position,
        })),
      };
    } catch (error) {
      console.error('Failed to fetch search results:', error);
      // Return empty results on error to prevent crashing the page
      return { results: [] };
    }
  }
);


export async function searchTheWeb(
  input: WebSearchInput
): Promise<WebSearchOutput> {
  return searchTheWebFlow(input);
}
