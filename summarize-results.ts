'use server';

/**
 * @fileOverview Um agente de IA que resume os resultados da pesquisa.
 *
 * - summarizeSearchResults - Uma função que lida com o processo de sumarização.
 * - SummarizeSearchResultsInput - O tipo de entrada para a função summarizeSearchResults.
 * - SummarizeSearchResultsOutput - O tipo de retorno para a função summarizeSearchResults.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeSearchResultsInputSchema = z.object({
  query: z.string().describe('A consulta de pesquisa original.'),
  results: z
    .array(
      z.object({
        title: z.string(),
        link: z.string(),
        snippet: z.string(),
      })
    )
    .describe('Uma lista de resultados de pesquisa para resumir.'),
});
export type SummarizeSearchResultsInput = z.infer<
  typeof SummarizeSearchResultsInputSchema
>;

const SummarizeSearchResultsOutputSchema = z.object({
  summary: z.string().describe('O resumo dos resultados da pesquisa.'),
});
export type SummarizeSearchResultsOutput = z.infer<
  typeof SummarizeSearchResultsOutputSchema
>;

export async function summarizeSearchResults(
  input: SummarizeSearchResultsInput
): Promise<SummarizeSearchResultsOutput> {
  return summarizeSearchResultsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeSearchResultsPrompt',
  input: {schema: SummarizeSearchResultsInputSchema},
  output: {schema: SummarizeSearchResultsOutputSchema},
  prompt: `Você é um assistente de pesquisa. Resuma os resultados da pesquisa a seguir para a consulta do usuário. Responda em português.

Consulta do usuário: {{{query}}}

Resultados da pesquisa:
{{#each results}}
- Título: {{{title}}}
  Snippet: {{{snippet}}}
  Link: {{{link}}}
{{/each}}

Resumo conciso:`,
});

const summarizeSearchResultsFlow = ai.defineFlow(
  {
    name: 'summarizeSearchResultsFlow',
    inputSchema: SummarizeSearchResultsInputSchema,
    outputSchema: SummarizeSearchResultsOutputSchema,
  },
  async input => {
    if (input.results.length === 0) {
      return { summary: '' };
    }
    const {output} = await prompt(input);
    return output!;
  }
);
