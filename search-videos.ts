'use server';

/**
 * @fileOverview A video search AI agent using Serper.dev.
 *
 * - searchVideos - A function that fetches video search results from the web.
 * - VideoSearchInput - The input type for the searchVideos function.
 * - VideoSearchOutput - The return type for the searchVideos function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const VideoSearchInputSchema = z.object({
  query: z.string().describe('The search query.'),
});
export type VideoSearchInput = z.infer<typeof VideoSearchInputSchema>;

const VideoSearchOutputSchema = z.object({
  results: z.array(
    z.object({
      title: z.string(),
      link: z.string(),
      snippet: z.string(),
      imageUrl: z.string(),
      duration: z.string(),
      source: z.string(),
      position: z.number(),
    })
  ).describe('An array of video search results.'),
});
export type VideoSearchOutput = z.infer<typeof VideoSearchOutputSchema>;

const searchVideosFlow = ai.defineFlow(
  {
    name: 'searchVideosFlow',
    inputSchema: VideoSearchInputSchema,
    outputSchema: VideoSearchOutputSchema,
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
      
      const results = data.videos || [];

      return {
        results: results.map((result: any) => ({
          title: result.title,
          link: result.link,
          snippet: result.snippet,
          imageUrl: result.imageUrl,
          duration: result.duration,
          source: result.source,
          position: result.position,
        })),
      };
    } catch (error) {
      console.error('Failed to fetch video results:', error);
      return { results: [] };
    }
  }
);

export async function searchVideos(
  input: VideoSearchInput
): Promise<VideoSearchOutput> {
  return searchVideosFlow(input);
}
