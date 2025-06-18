
export interface RecipeIngredient {
  name: string;
  quantity: string;
  unit: string;
}

export interface Recipe {
  id: string; // Unique identifier for the recipe
  timestamp: number; // Timestamp of generation/saving
  title: string;
  description:string;
  prepTime: string;
  cookTime: string;
  servings: string;
  ingredientsUsed: RecipeIngredient[];
  instructions: string[];
  notes?: string;
  cuisine?: CuisineType; // Added for filtering
}

export interface RecipeError {
  error: string;
}

export type GeminiRecipeResponse = Recipe | RecipeError; // AI response might not have id/timestamp initially

export type CuisineType =
  | 'American'
  | 'Chinese'
  | 'French'
  | 'Indian'
  | 'Italian'
  | 'Japanese'
  | 'Korean'
  | 'Mediterranean'
  | 'Mexican'
  | 'Middle Eastern'
  | 'Thai'
  | 'Dessert'
  | 'Any';

export type AudienceType =
  | 'Everyone'
  | 'Baby (6-8 months)'
  | 'Baby (9-12 months)'
  | 'Baby (12+ months)';


export type IngredientCategory =
  | 'Vegetable'
  | 'Fruit'
  | 'Protein'
  | 'Dairy'
  | 'Pantry Staple'
  | 'Spice'
  | 'Herb'
  | 'Grain'
  | 'Legume'
  | 'Condiment'
  | 'Oil/Fat'
  | 'Sweetener'
  | 'Beverage'
  | 'Other'
  | 'Dairy Alternative' // Added this for clarity
  | 'Nut'
  | 'Seed';


export interface IngredientDataItem {
  id: string;
  name: string;
  category: IngredientCategory;
}

export type ActiveTab = 'generator' | 'history' | 'saved' | 'feed' | 'mykitchen' | 'calendar'; // Changed 'community' to 'feed'

export interface CookedRecipeEntry {
  recipeId: string; // Corresponds to Recipe.id
  title: string;    // For displaying in potential future UI or for AI prompt context
  cookedAt: number; // Timestamp when marked as cooked
}

// --- Meal Calendar Types ---
export type StandardMealSlotType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
export type MealSlotType = StandardMealSlotType | string; // Allows for custom string slots
export const OTHER_SLOT_KEY = "__OTHER__"; // Key for custom slot option

export interface CalendarEntry {
  id: string; // Unique ID for the calendar entry itself
  recipeId: string; // ID of the recipe
  recipeTitle: string; // Title of the recipe (for quick display)
  date: string; // YYYY-MM-DD format
  slot: MealSlotType; // Can be StandardMealSlotType or a custom string
  timestamp: number; // When this calendar entry was created or last updated
  orderInSlot?: number; // For premium users to order multiple items in the same slot
  userNotes?: string; // For premium users
}

export interface MealSlotDefinition {
  name: StandardMealSlotType;
  displayName: string;
  icon?: string; // e.g., emoji or SVG path data
  color: string; // tailwind bg color class for dot/indicator
  borderColor: string; // tailwind border color class
  textColor: string; // tailwind text color class
}

export const STANDARD_MEAL_SLOTS: MealSlotDefinition[] = [
  { name: 'Breakfast', displayName: 'Breakfast', icon: '🍳', color: 'bg-yellow-400', borderColor: 'border-yellow-500', textColor: 'text-yellow-800' },
  { name: 'Lunch', displayName: 'Lunch', icon: '🥗', color: 'bg-sky-400', borderColor: 'border-sky-500', textColor: 'text-sky-800' },
  { name: 'Dinner', displayName: 'Dinner', icon: '🍕', color: 'bg-emerald-400', borderColor: 'border-emerald-500', textColor: 'text-emerald-800' },
  { name: 'Snack', displayName: 'Snack', icon: '🍪', color: 'bg-purple-400', borderColor: 'border-purple-500', textColor: 'text-purple-800' },
];

export const CUSTOM_SLOT_DISPLAY_INFO = {
  icon: '➕',
  color: 'bg-slate-400',
  borderColor: 'border-slate-500',
  textColor: 'text-slate-800',
  displayName: 'Custom Slot',
};

export function getSlotDisplayInfo(slot: MealSlotType): MealSlotDefinition | typeof CUSTOM_SLOT_DISPLAY_INFO & {name: string} {
  const standardSlot = STANDARD_MEAL_SLOTS.find(s => s.name === slot);
  if (standardSlot) {
    return standardSlot;
  }
  return { ...CUSTOM_SLOT_DISPLAY_INFO, name: slot, displayName: slot }; // Return custom slot name as display name
}


// --- Tier Limits Constants ---
export const FREE_TIER_GENERATIONS_PER_DAY = 5;
export const PREMIUM_TIER_GENERATIONS_PER_DAY = 200; 

export const FREE_TIER_SURPRISE_ME_USES_PER_WEEK = 1;
// Premium Surprise Me counts towards PREMIUM_TIER_GENERATIONS_PER_DAY.

export const FREE_TIER_MAX_SAVED_RECIPES = 25;
export const PREMIUM_TIER_MAX_SAVED_RECIPES = 1000;

export const FREE_TIER_MAX_HISTORY_ITEMS = 50;
export const PREMIUM_TIER_MAX_HISTORY_ITEMS = 500;

export const FREE_TIER_CALENDAR_VIEW_DAYS = 14; // Free users can see last 14 days on calendar
// Premium users have unlimited calendar view and future planning

export const ANONYMOUS_FREE_GENERATIONS = 1; // New constant

// --- localStorage Keys ---
// Note: USER_KEY is no longer used for storing the main user object, Supabase session is the source of truth.
// Other keys will be dynamically appended with user ID if a user is logged in.
export const RECIPE_HISTORY_KEY = 'recipify_recipeHistory';
export const SAVED_RECIPES_KEY = 'recipify_savedRecipes';
export const COOKED_HISTORY_KEY = 'recipify_cookedHistory';
// export const USER_KEY = 'recipify_user'; // Deprecated for user object storage
export const MY_KITCHEN_KEY = 'recipify_myKitchen';
export const RECENTLY_USED_FOR_GENERATOR_KEY = 'recipify_recentlyUsedForGenerator';
export const RECENTLY_ADDED_TO_KITCHEN_KEY = 'recipify_recentlyAddedToKitchen';
export const GENERATION_STATUS_KEY = 'recipify_generationStatus';
export const SURPRISE_ME_STATUS_KEY = 'recipify_surpriseMeStatus';
export const EXCLUDED_RECIPE_IDS_KEY = 'recipify_excludedRecipeIds';
export const CALENDAR_ENTRIES_KEY = 'recipify_calendarEntries';
export const USER_PROGRESS_KEY = 'recipify_userProgress';
export const COMMUNITY_POSTS_KEY = 'recipify_communityPosts';
export const ANONYMOUS_GENERATION_STATUS_KEY = 'recipify_anonymousGenerationStatus';


// --- User Tier & Usage Tracking ---
export interface User { // This is our app's User type
  id: string; // Corresponds to Supabase auth.users.id
  name: string;
  email?: string;
  avatarUrl?: string;
  isPaid: boolean;
}

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

export interface UserGenerationStatus {
  count: number;
  lastUsedDate: string; // YYYY-MM-DD
  extraGenerationsGranted: number; // For "watch ad" feature
}

export interface AnonymousGenerationStatus { 
  count: number;
}

export interface UserSurpriseMeStatus {
  countThisWeek: number;
  lastUsedTimestamp: number; // To determine week boundary
}

export interface UpgradeModalInfo {
  isOpen: boolean;
  featureName: string; 
  limitDetails: string; 
  premiumBenefit: string; 
  onGrantExtra?: () => void; 
}


// --- New type for Animations ---
export type AnimationType = 'none' | 'generating' | 'surprising';

// --- New type for Batch Add Message ---
export type BatchAddMessage = {type: 'success' | 'error' | 'info', text: string} | null;

// --- Prop Types for Components that handle exclusions ---
export interface ExclusionProps {
  excludedRecipeIds: string[];
  onToggleExcludeRecipe: (recipeId: string) => void;
}
// Minimal recipe info needed for adding to calendar when full recipe object isn't available/needed
export interface MinimalRecipeInfo {
  id: string;
  title: string;
}

// --- Achievements System Types ---
export type AchievementId =
  | 'rookieCook'
  | 'homeChef'
  | 'ingredientExplorer'
  | 'streakStarter'
  | 'streakMaster'
  | 'recipeSaver'
  | 'premiumPioneer';

export interface Achievement {
  id: AchievementId;
  name: string;
  description: string;
  icon: string; 
  xp: number;
  unlockHint: (progress: UserProgress, config: Achievement) => string; 
  isUnlocked: (progress: UserProgress, user: User | null) => boolean;
}

export interface UserProgress {
  userId: string; // Associated with User.id
  xp: number;
  currentStreak: number;
  longestStreak: number;
  lastCookedDate: string | null; // YYYY-MM-DD
  unlockedAchievementIds: AchievementId[];
  metrics: {
    generatedRecipeCount: number;
    cookedRecipeCount: number;
    distinctIngredientsUsed: string[]; 
    savedRecipeCount: number;
  };
  viewedAchievements: AchievementId[]; 
}

export const ACHIEVEMENTS_CONFIG: Record<AchievementId, Achievement> = {
  rookieCook: { id: 'rookieCook', name: 'Rookie Cook', description: 'Generate your first recipe.', icon: '🧑‍🍳', xp: 10, unlockHint: (p) => `Generate 1 recipe to unlock. (${p.metrics.generatedRecipeCount}/1)`, isUnlocked: (p) => p.metrics.generatedRecipeCount >= 1, },
  homeChef: { id: 'homeChef', name: 'Home Chef', description: 'Mark 10 recipes as cooked.', icon: '🍳', xp: 50, unlockHint: (p) => `Mark 10 recipes as cooked. (${p.metrics.cookedRecipeCount}/10)`, isUnlocked: (p) => p.metrics.cookedRecipeCount >= 10, },
  ingredientExplorer: { id: 'ingredientExplorer', name: 'Ingredient Explorer', description: 'Use 20 unique ingredients in generated recipes.', icon: '🥕', xp: 30, unlockHint: (p) => `Use 20 unique ingredients. (${p.metrics.distinctIngredientsUsed.length}/20)`, isUnlocked: (p) => p.metrics.distinctIngredientsUsed.length >= 20, },
  streakStarter: { id: 'streakStarter', name: 'Streak Starter', description: 'Cook 3 days in a row.', icon: '🔥', xp: 20, unlockHint: (p) => `Cook 3 days in a row. (Current: ${p.currentStreak}/3)`, isUnlocked: (p) => p.currentStreak >= 3, },
  streakMaster: { id: 'streakMaster', name: 'Streak Master', description: 'Cook 14 days in a row.', icon: '🏆', xp: 100, unlockHint: (p) => `Cook 14 days in a row. (Current: ${p.currentStreak}/14)`, isUnlocked: (p) => p.currentStreak >= 14, },
  recipeSaver: { id: 'recipeSaver', name: 'Recipe Saver', description: 'Save 10 recipes.', icon: '💾', xp: 25, unlockHint: (p) => `Save 10 recipes. (${p.metrics.savedRecipeCount}/10)`, isUnlocked: (p) => p.metrics.savedRecipeCount >= 10, },
  premiumPioneer: { id: 'premiumPioneer', name: 'Premium Pioneer', description: 'Become a Recipify Pro user.', icon: '⭐', xp: 50, unlockHint: () => `Upgrade to Recipify Pro.`, isUnlocked: (p, user) => !!user?.isPaid, },
};


// --- Community Feed Types ---
export type CommunityPostId = string;

export interface CommunityPost {
  id: CommunityPostId;
  authorId: string; // Corresponds to User.id
  authorName: string;
  authorAvatarUrl?: string;
  isAuthorPro: boolean;
  recipeId?: string; 
  title: string; 
  description: string; 
  imageUrl?: string; 
  videoUrl?: string; 
  timestamp: number; 
  likes: number;
  commentsCount: number; 
  tags?: string[]; 
}
