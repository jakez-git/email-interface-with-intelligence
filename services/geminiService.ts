import { GoogleGenAI, Type } from "@google/genai";
import type { Label } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    console.error("Gemini API key is not set. Please set the API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const analyzeEmailForLabels = async (emailBody: string): Promise<Omit<Label, 'source' | 'id'>[]> => {
    if (!API_KEY) {
        console.error("Cannot analyze email: Gemini API key is missing.");
        return [{ name: 'API Key Missing', confidence: 1.0 }];
    }

    const prompt = `
        Analyze the following email body and suggest up to 15 relevant labels. 
        For each label, provide a confidence score between 0.0 and 1.0.
        The list of labels should be ordered from most confident to least confident.
        Common labels include: "Invoice", "Receipt", "Marketing", "Promotion", "Newsletter", "Important", "Personal", "Work", "Project Update", "Support Request", "Travel", "Social Notification", "Finance", "Urgent", "Spam", "Junk".
        You can also generate other relevant labels if needed.
        Respond ONLY with the JSON object.

        Email Body:
        ---
        ${emailBody}
        ---
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        labels: {
                            type: Type.ARRAY,
                            description: "A list of suggested labels for the email, ordered by confidence.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: {
                                        type: Type.STRING,
                                        description: "The suggested label name."
                                    },
                                    confidence: {
                                        type: Type.NUMBER,
                                        description: "The confidence score for the label (0.0 to 1.0)."
                                    }
                                },
                                required: ["name", "confidence"]
                            }
                        }
                    },
                    required: ["labels"]
                },
                temperature: 0.3,
            }
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);

        if (result && Array.isArray(result.labels)) {
            return result.labels.filter(
                (label: any): label is Omit<Label, 'source'| 'id'> =>
                    typeof label.name === 'string' && typeof label.confidence === 'number'
            );
        }

        return [];

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to get labels from Gemini API.");
    }
};
