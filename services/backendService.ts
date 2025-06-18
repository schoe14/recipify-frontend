
import type { GeminiRecipeResponse, CuisineType, AudienceType, Recipe, RecipeError } from '../types';

// Type guard to check if the response is a valid Recipe or RecipeError
function isValidRecipeOrError(data: any): data is GeminiRecipeResponse {
  if (typeof data !== 'object' || data === null) return false;
  // Check for Recipe structure
  const isRecipe = 'title' in data &&
                   'description' in data &&
                   'prepTime' in data &&
                   'cookTime' in data &&
                   'servings' in data &&
                   Array.isArray(data.ingredientsUsed) &&
                   Array.isArray(data.instructions);
  // Check for RecipeError structure
  const isError = 'error' in data && typeof data.error === 'string';
  return isRecipe || isError;
}


export async function generateRecipeFromBackend(
  ingredients: string[],
  cuisine: CuisineType,
  audience: AudienceType,
  servings: number,
  allTitlesToAvoid?: string[]
): Promise<GeminiRecipeResponse> {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  if (!apiBaseUrl) {
    console.error("VITE_API_BASE_URL is not defined in environment variables.");
    return { error: "Recipify's kitchen is currently offline: API configuration error." };
  }
  const endpoint = `${apiBaseUrl}/api/generate-recipe`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ingredients,
        cuisine,
        audience,
        servings,
        titlesToAvoid: allTitlesToAvoid || [], // Ensure titlesToAvoid is always an array
      }),
    });

    if (!response.ok) {
      // Try to parse error from backend if available
      try {
        const errorData = await response.json();
        if (errorData && errorData.error && typeof errorData.error === 'string') {
          return { error: `Backend Error: ${errorData.error} (Status: ${response.status})` };
        }
      } catch (parseError) {
        // Ignore if error response is not JSON
      }
      return { error: `Recipify's kitchen encountered an issue communicating with the server (Status: ${response.status}). Please try again.` };
    }

    const data = await response.json();

    // Validate the structure of the response
    if (isValidRecipeOrError(data)) {
      return data;
    } else {
      console.error("Backend Error: Parsed JSON is not a valid Recipe or RecipeError structure:", data);
      return { error: "Recipify received an improperly structured recipe from the server. The content might be missing key fields." };
    }

  } catch (error: unknown) {
    console.error('Error calling backend to generate recipe:', error);
    let errorMessage = 'An unknown error occurred while Recipify was preparing your recipe with its own kitchen staff.';
    if (error instanceof Error) {
      errorMessage = `Failed to connect to Recipify's kitchen: ${error.message}. Please check your internet connection and try again.`;
    }
    return { error: errorMessage };
  }
}