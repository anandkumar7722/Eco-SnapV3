// This is an autogenerated file from Firebase Studio.
'use server';
/**
 * @fileOverview Waste classification AI agent.
 *
 * - classifyWaste - A function that handles the waste classification process.
 * - ClassifyWasteInput - The input type for the classifyWaste function.
 * - ClassifyWasteOutput - The return type for the classifyWaste function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ClassifyWasteInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of waste, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ClassifyWasteInput = z.infer<typeof ClassifyWasteInputSchema>;

const ClassifyWasteOutputSchema = z.object({
  category: z
    .enum(["ewaste", "plastic", "biowaste", "cardboard", "paper", "glass", "other"])
    .describe('The predicted category of the waste: ewaste, plastic, biowaste, cardboard, paper, glass, or other.'),
  confidence: z.number().min(0).max(1).describe('The confidence level of the prediction (0-1).'),
});
export type ClassifyWasteOutput = z.infer<typeof ClassifyWasteOutputSchema>;

export async function classifyWaste(input: ClassifyWasteInput): Promise<ClassifyWasteOutput> {
  return classifyWasteFlow(input);
}

const classifyWastePrompt = ai.definePrompt({
  name: 'classifyWastePrompt',
  input: {schema: ClassifyWasteInputSchema},
  output: {schema: ClassifyWasteOutputSchema},
  prompt: `You are an expert in waste management and sustainable practices.

You will classify the waste item in the provided photo into one of the following categories:
1. ewaste: Electronic waste (e.g., old phones, computers, batteries, cables, chargers).
2. plastic: Various types of plastic items (e.g., bottles, containers, packaging, bags, toys).
3. biowaste: Organic waste (e.g., food scraps, fruit peels, vegetable waste, garden trimmings, coffee grounds).
4. cardboard: Corrugated cardboard boxes, paperboard (e.g., cereal boxes, shoe boxes).
5. paper: Office paper, newspapers, magazines, junk mail, paper bags (not contaminated with food).
6. glass: Glass bottles and jars (clear, brown, green).
7. other: Items that do not fit into the above categories or are difficult to classify (e.g., mixed materials, certain textiles, styrofoam, broken ceramics).

Analyze the following image and determine the most appropriate category. Provide the predicted waste category and your confidence level (0-1).

Photo: {{media url=photoDataUri}}

Ensure the 'category' field ONLY contains one of "ewaste", "plastic", "biowaste", "cardboard", "paper", "glass", or "other".
The 'confidence' field should be a number between 0 and 1.`,
});

const classifyWasteFlow = ai.defineFlow(
  {
    name: 'classifyWasteFlow',
    inputSchema: ClassifyWasteInputSchema,
    outputSchema: ClassifyWasteOutputSchema,
  },
  async input => {
    const {output} = await classifyWastePrompt(input);
    // Ensure output conforms to the schema, especially the enum for category.
    if (output && output.category) {
        const lowerCaseCategory = output.category.toLowerCase();
        const validCategories: Array<ClassifyWasteOutput['category']> = ["ewaste", "plastic", "biowaste", "cardboard", "paper", "glass", "other"];
        if (validCategories.includes(lowerCaseCategory as ClassifyWasteOutput['category'])) {
            output.category = lowerCaseCategory as ClassifyWasteOutput['category'];
        } else {
            // If LLM returns an invalid category, default to 'other' or handle as an error.
            // For now, we let Zod validation catch this if it's truly out of enum.
            // A more robust solution might map common synonyms or misspellings if the LLM is inconsistent.
        }
    }
    return output!;
  }
);
