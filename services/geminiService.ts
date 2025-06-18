// FIX: Import GoogleGenAI correctly
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import type { GeminiRecipeResponse, CuisineType, AudienceType, Recipe, RecipeError } from '../types'; // Recipe type used for casting

// FIX: API key must be obtained exclusively from process.env.API_KEY
const API_KEY = process.env.API_KEY;

// FIX: Initialize GoogleGenAI with named apiKey parameter
const ai = new GoogleGenAI({ apiKey: API_KEY! });

// Definitions for baby rules, matching user's suggestion for organization
const BABY_RULES: Partial<Record<AudienceType, string>> = {
  'Baby (6-8 months)': `
- **Texture:** SMOOTH PUREE, completely free of lumps. Easily spoon-fed.
- **Ingredients:** Simple combinations (1-2 ingredients are best) to monitor for allergies and aid digestion.
- **Preparation:** Steam, boil, or bake ingredients until very soft before pureeing.`,
  'Baby (9-12 months)': `
- **Texture:** Mashed foods with some soft lumps, or small, soft, melt-in-the-mouth finger foods.
- **Ingredients:** Can introduce more combinations of ingredients. Mild herbs (e.g., parsley, dill) are okay.
- **Preparation:** Ensure finger foods are soft, grabbable, and cut into safe shapes/sizes (e.g., pea-sized or thin strips).`,
  'Baby (12+ months)': `
- **Texture:** Soft, chopped, easily chewable, more varied. Can be similar to family meals but cut smaller and softer.
- **Flavor:** Still mild. Minimal salt if any, wider range of mild spices/herbs acceptable.
- **Preparation:** Cook soft, chop small. Vigilant about choking hazards (e.g., halve grapes).`
};

const GENERAL_BABY_INSTRUCTIONS = `
**CRITICAL General Guidelines for ALL Baby Recipes (6-12+ months):**
- **Flavor Profile:** ABSOLUTELY NO added salt, NO added sugar, NO honey (especially under 1 year due to botulism risk). Focus on natural flavors. Avoid strong/hot spices (e.g., chili, excessive black pepper) and excessive citrus for younger babies.
- **Safety First:** ALWAYS prioritize avoiding choking hazards. Ensure foods are cooked to appropriate softness. Introduce common allergens cautiously, one at a time.
- **Forbidden Items:** NO honey (under 1 year). NO whole nuts or seeds. NO cow's milk as main drink (under 1 year; small amounts in cooking okay if appropriate). NO highly processed foods.
`;


const PROMPT_TEMPLATE = (
  ingredientsList: string[],
  cuisine: CuisineType,
  audience: AudienceType,
  servings: number,
  allTitlesToAvoid?: string[] // Consolidated list of titles to avoid
) => {
  const ingredientsString = ingredientsList.join(', ');
  const assumedStaples = "salt, black pepper, water, neutral cooking oil (e.g., vegetable, canola)";

  let audienceSpecificInstructions = BABY_RULES[audience] || "Standard seasoning and preparation.";
  if (audience.startsWith('Baby')) {
    audienceSpecificInstructions = GENERAL_BABY_INSTRUCTIONS + "\n" + audienceSpecificInstructions;
  }

  let cuisineInstructions = "";
  if (cuisine !== 'Any') {
    cuisineInstructions = `The desired cuisine style is **${cuisine}**. Strive to create a recipe that authentically reflects this style, using appropriate flavor profiles and techniques.`;
  } else {
    cuisineInstructions = "The user has not specified a particular cuisine. You have flexibility, but ensure the dish is coherent and appealing based on the provided ingredients."
  }
  
  let recipeVarietyContent = "";
  const titlesToAvoidString = (allTitlesToAvoid && allTitlesToAvoid.length > 0) 
    ? `"${allTitlesToAvoid.join('; ')}"` 
    : "N/A";

  if (titlesToAvoidString !== "N/A") {
    recipeVarietyContent = `To provide variety, please try to AVOID generating recipes that are very similar to these titles: ${titlesToAvoidString}
    Guidance: Aim for a fresh culinary experience. If ingredients strongly point to one of these, or creativity is limited, you may still suggest it, but ideally, offer a different dish or a new angle. Prioritize novelty.`;
  } else {
    recipeVarietyContent = "No specific meals to avoid were provided. Generate freely."
  }

  return `
You are "Recipify AI Chef".
Your *entire response* MUST be *ONLY* a single JSON object. No other text, explanations, or conversational fluff before, after, or inside the JSON. Adhere strictly to JSON syntax.

### Expected JSON Output Structure:
If successful:
\`\`\`json
{
  "title": "Recipe Title (e.g., 'Simple Chicken and Veggie Stir-fry')",
  "description": "A short, appealing description of the dish (1-2 sentences).",
  "prepTime": "e.g., '15 minutes'",
  "cookTime": "e.g., '25 minutes'",
  "servings": "e.g., '${servings} adult servings' or 'Approx. ${servings} baby portions (6-8 months)'",
  "ingredientsUsed": [
    { "name": "Ingredient Name", "quantity": "Amount", "unit": "e.g., cups, grams, tbsp, or 'to taste' (if appropriate for audience)" }
  ],
  "instructions": [
    "Clear, step-by-step cooking instruction.",
    "Another step..."
  ],
  "notes": "Optional: cooking tips, storage advice, simple variations using ONLY provided ingredients or assumed staples. Notes must be age-appropriate for babies/toddlers."
}
\`\`\`
If a recipe cannot be generated due to constraints:
\`\`\`json
{
  "error": "A polite and clear message explaining why a recipe cannot be generated. E.g., 'The ingredients (e.g., only chili peppers) are not suitable for a baby food recipe.' or 'With just water and salt, I can\\'t create a full recipe.'"
}
\`\`\`

### Recipe Generation Rules:
1.  **Ingredients Source:**
    *   Primarily use a subset or all of the user-provided ingredients: "${ingredientsString}".
    *   **Assumed Staples:** You may assume the user has basic staples: **${assumedStaples}**.
    *   **CRITICAL:** If your recipe *requires* any of these assumed staples for a standard preparation, you **MUST include them in the "ingredientsUsed" list** with appropriate quantities (e.g., "1 tsp salt", "2 tbsp oil"). Do NOT introduce other ingredients.
    *   If a liquid base is needed (e.g., for a shake, soup) and not provided by user, 'Water' from assumed staples may be used if sensible, and MUST be listed in 'ingredientsUsed'.

2.  **Edibility & Sanity:** The recipe must be for an **edible dish** with **common and sensible ingredient combinations**. Avoid unsafe or bizarre pairings.

3.  **Sufficiency Check:** If provided ingredients (even with staples) are insufficient for ANY reasonable recipe (e.g., just "water"), nonsensical, or cannot form a coherent dish, respond with the error JSON.

4.  **Cuisine Style:** ${cuisineInstructions}

5.  **Audience & Servings:**
    *   Target Audience: **${audience}**. Adhere to the following guidelines:
        ${audienceSpecificInstructions}
    *   Desired Servings: Approximately **${servings} serving(s)**. Adjust ingredient quantities and "servings" field accordingly. Note: A "serving" for babies/toddlers is smaller than an adult's.

6.  **Recipe Variety:** ${recipeVarietyContent}

7.  **No External Text:** Absolutely NO text or characters outside the main JSON object.

---
User provided ingredients: "${ingredientsString}"
Selected cuisine: "${cuisine}"
Selected audience: "${audience}"
Desired servings: ${servings}
${(allTitlesToAvoid && allTitlesToAvoid.length > 0) ? `Avoid these titles if possible: ${titlesToAvoidString}` : ''}
---
Respond with ONLY the JSON object.
`;
};

// Helper to check if parsed data is a valid Recipe or RecipeError
function isValidRecipeOrError(data: any): data is GeminiRecipeResponse {
  return typeof data === 'object' && data !== null && ('title' in data || 'error' in data);
}


export async function generateRecipeFromIngredients(
  ingredients: string[],
  cuisine: CuisineType,
  audience: AudienceType,
  servings: number,
  allTitlesToAvoid?: string[] 
): Promise<GeminiRecipeResponse> {
  if (!API_KEY) {
    return { error: "Recipify's AI brain isn't connected: API Key is not configured. Please check environment variables." };
  }

  try {
    const model = 'gemini-2.5-flash-preview-04-17'; 
    const prompt = PROMPT_TEMPLATE(ingredients, cuisine, audience, servings, allTitlesToAvoid);

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            temperature: 0.6, 
        },
    });

    let jsonStr = response.text;
    if (!jsonStr) {
        console.error("Recipify AI Error: Empty response text from Gemini.");
        return { error: "Recipify received an empty response from the AI. Please try again."};
    }
    jsonStr = jsonStr.trim();
    
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }

    try {
      const parsedData = JSON.parse(jsonStr);
      if (isValidRecipeOrError(parsedData)) {
        return parsedData; 
      }
      console.error("Recipify AI Error: Parsed JSON is not a valid Recipe or RecipeError structure:", parsedData);
      return { error: "Recipify received an improperly structured recipe from the AI. The content might be missing key fields." };
    } catch (initialError: any) {
      console.warn("Recipify AI Warning: Initial JSON.parse failed.", initialError.message, "Original string:", `"${jsonStr}"`);
      let processedJsonStr = jsonStr;
      let attemptDescription = "initial";

      if (processedJsonStr.includes("effluents\":")) { 
        const effluentsFixRegex = /(\})\s*effluents":/g; 
        const newStr = processedJsonStr.replace(effluentsFixRegex, '$1],"instructions":');
        if (newStr !== processedJsonStr) { 
          processedJsonStr = newStr;
          attemptDescription = "'effluents' key fix";
          console.log(`Recipify AI Info: Applied ${attemptDescription}. New string:`, `"${processedJsonStr}"`);
          try {
            const parsedDataAfterEffluentsFix = JSON.parse(processedJsonStr);
            if (isValidRecipeOrError(parsedDataAfterEffluentsFix)) {
               console.log(`Recipify AI Info: JSON parsing successful after ${attemptDescription}.`);
               return parsedDataAfterEffluentsFix; 
            }
             console.error(`Recipify AI Error: Parsed JSON after ${attemptDescription} is not a valid Recipe/Error structure:`, parsedDataAfterEffluentsFix);
          } catch (effluentsFixError: any) {
            console.warn(`Recipify AI Warning: Parse after ${attemptDescription} failed.`, effluentsFixError.message);
          }
        }
      }

      const generalCleanupErrorCondition = initialError instanceof SyntaxError &&
        (initialError.message.includes("Expected ',' or '}' after property value") ||
         initialError.message.includes("Unexpected token"));

      if (generalCleanupErrorCondition) {
        const cleanupRegexPattern = '(:"\\s*[^"]*?")\\s*(.*?)\\s*(?=[,}\\\\]])';
        const cleanupRegex = new RegExp(cleanupRegexPattern, "g");
        const newStr = processedJsonStr.replace(cleanupRegex, '$1'); 

        if (newStr !== processedJsonStr) { 
          processedJsonStr = newStr; 
          attemptDescription = "general value cleanup";
          console.log(`Recipify AI Info: Applied ${attemptDescription}. New string:`, `"${processedJsonStr}"`);
          try {
            const parsedDataAfterGeneralCleanup = JSON.parse(processedJsonStr);
            if (isValidRecipeOrError(parsedDataAfterGeneralCleanup)) {
               console.log(`Recipify AI Info: JSON parsing successful after ${attemptDescription}.`);
               return parsedDataAfterGeneralCleanup; 
            }
            console.error(`Recipify AI Error: Parsed JSON after ${attemptDescription} is not a valid Recipe/Error structure:`, parsedDataAfterGeneralCleanup);
          } catch (generalCleanupParseError: any) {
            console.error(`Recipify AI Error: Parse after ${attemptDescription} failed.`, generalCleanupParseError.message);
          }
        }
      }
      
      console.error("Recipify AI Error: Failed to parse JSON response from Gemini (final attempt). String was:", `"${processedJsonStr}"`,"Original error message:", initialError.message);
      if (processedJsonStr.toLowerCase().includes("i'm sorry") || processedJsonStr.toLowerCase().includes("i cannot fulfill this request") || processedJsonStr.toLowerCase().includes("i am unable to")) {
        return { error: "Recipify's AI chef is a bit stumped! It was unable to generate a recipe with the current selections, possibly due to conflicting choices or highly unusual ingredient combinations. Please try different options." };
      }
      return { error: "Recipify received an unexpected recipe format from the AI. The AI might have provided a non-JSON response or the JSON is malformed. Please try refreshing or adjusting your selections." };
    }

  } catch (error: unknown) {
    console.error('Recipify AI Error: Error calling Gemini API:', error);
    if (error instanceof Error) {
        if (error.message.includes("API key not valid")) {
             return { error: "Invalid Gemini API Key for Recipify. Please check your configuration." };
        }
        if (error.message.toLowerCase().includes("quota") || error.message.toLowerCase().includes("rate limit")) {
            return { error: "Recipify's kitchen is very busy right now (quota or rate limit exceeded)! Please try again in a few moments." };
        }
        if (error.message.includes("candidate. HarmThreshold") || error.message.includes("blocked")) {
             return { error: "The AI deemed the request potentially problematic or harmful based on the provided inputs. Please adjust your ingredients or prompt."}
        }
        return { error: `Recipify encountered an issue with the Gemini API: ${error.message}. If this persists, please check your API key and usage limits.` };
    }
    return { error: 'An unknown error occurred while Recipify was communicating with the AI. Please try again.' };
  }
}