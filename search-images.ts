'use server';

/**
 * @fileOverview A image search AI agent using Serper.dev.
 *
 * - searchImages - A function that fetches image search results from the web.
 * - ImageSearchInput - The input type for the searchImages function.
 * - ImageSearchOutput - The return type for the searchImages function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ImageSearchInputSchema = z.object({
  query: z.string().describe('The search query.'),
});
export type ImageSearchInput = z.infer<typeof ImageSearchInputSchema>;

const ImageSearchOutputSchema = z.object({
  results: z.array(
    z.object({
      title: z.string(),
      link: z.string(),
      imageUrl: z.string(),
      position: z.number(),
    })
  ).describe('An array of image search results.'),
});
export type ImageSearchOutput = z.infer<typeof ImageSearchOutputSchema>;


const searchImagesFlow = ai.defineFlow(
  {
    name: 'searchImagesFlow',
    inputSchema: ImageSearchInputSchema,
    outputSchema: ImageSearchOutputSchema,
  },
  async ({ query }) => {
    const apiKey = process.env.SERPER_API_KEY;
    if (!apiKey) {
      throw new Error('SERPER_API_KEY environment variable not set.');
    }

    try {
      const response = await fetch('https://google.serper.dev/images', {
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
      
      const results = data.images || [];

      return {
        results: results.map((result: any) => ({
          title: result.title,
          link: result.link,
          imageUrl: result.imageUrl,
          position: result.position,
        })),
      };
    } catch (error) {
      console.error('Failed to fetch image results:', error);
      return { results: [] };
    }
  }
);

export async function searchImages(
  input: ImageSearchInput
): Promise<ImageSearchOutput> {
  return searchImagesFlow(input);
}
