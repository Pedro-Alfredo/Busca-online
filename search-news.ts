'use server';

/**
 * @fileOverview A news search AI agent using Serper.dev.
 *
 * - searchNews - A function that fetches news search results from the web.
 * - NewsSearchInput - The input type for the searchNews function.
 * - NewsSearchOutput - The return type for the searchNews function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const NewsSearchInputSchema = z.object({
  query: z.string().describe('The search query.'),
});
export type NewsSearchInput = z.infer<typeof NewsSearchInputSchema>;

const NewsSearchOutputSchema = z.object({
  results: z.array(
    z.object({
      title: z.string(),
      link: z.string(),
      snippet: z.string(),
      imageUrl: z.string().optional(),
      source: z.string(),
      date: z.string(),
      position: z.number(),
    })
  ).describe('An array of news search results.'),
});
export type NewsSearchOutput = z.infer<typeof NewsSearchOutputSchema>;

const searchNewsFlow = ai.defineFlow(
  {
    name: 'searchNewsFlow',
    inputSchema: NewsSearchInputSchema,
    outputSchema: NewsSearchOutputSchema,
  },
  async ({ query }) => {
    const apiKey = process.env.SERPER_API_KEY;
    if (!apiKey) {
      throw new Error('SERPER_API_KEY environment variable not set.');
    }

    try {
      const response = await fetch('https://google.serper.dev/news', {
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
      
      const results = data.news || [];

      return {
        results: results.map((result: any) => ({
          title: result.title,
          link: result.link,
          snippet: result.snippet,
          imageUrl: result.imageUrl,
          source: result.source,
          date: result.date,
          position: result.position,
        })),
      };
    } catch (error) {
      console.error('Failed to fetch news results:', error);
      return { results: [] };
    }
  }
);

export async function searchNews(
  input: NewsSearchInput
): Promise<NewsSearchOutput> {
  return searchNewsFlow(input);
}
