
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { supabase, getSupabaseAccessToken } from './services/supabaseClient'; // Import Supabase client & getAccessToken
import type { Session, User as SupabaseUser, AuthError } from '@supabase/supabase-js'; // Supabase specific types

import { Header } from './components/Header';
import { IngredientSelector } from './components/IngredientSelector';
import { RecipeDisplay } from './components/RecipeDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { Footer } from './components/Footer';
import { Tabs } from './components/Tabs';
import { RecipeList } from './components/RecipeList';
import { MyKitchen } from './components/MyKitchen';
import { CookingAnimation } from './components/CookingAnimation';
import { UpgradeModal } from './components/UpgradeModal';
import { MealCalendar } from './components/MealCalendar';
import { AddToCalendarModal } from './components/AddToCalendarModal';
import { EditCalendarEntryModal } from './components/EditCalendarEntryModal';
import { DayViewModal } from './components/DayViewModal';
import { CalendarRecipeDetailModal } from './components/CalendarRecipeDetailModal';
import { SelectRecipeForCalendarModal } from './components/SelectRecipeForCalendarModal';
import { ProfilePanel } from './components/ProfilePanel';
import { AchievementToast } from './components/AchievementToast';
import { FeedPage } from './components/FeedPage';
import { CommunityPostDetailModal } from './components/CommunityPostDetailModal';
import { ConfirmModal } from './components/ConfirmModal';
import { AuthModal } from './components/AuthModal'; // NEW Auth Modal
import { generateRecipeFromBackend } from './services/backendService';
import type {
  Recipe, GeminiRecipeResponse, RecipeError, CuisineType, AudienceType,
  IngredientDataItem, ActiveTab, CookedRecipeEntry, User, AuthStatus,
  AnimationType, BatchAddMessage, UserGenerationStatus, UserSurpriseMeStatus, UpgradeModalInfo, RecipeIngredient,
  CalendarEntry, MealSlotType, MinimalRecipeInfo, StandardMealSlotType,
  UserProgress, Achievement, AchievementId, CommunityPost, CommunityPostId, AnonymousGenerationStatus
} from './types';
import { ALL_INGREDIENTS } from './data/ingredients';
import {
  FREE_TIER_GENERATIONS_PER_DAY, PREMIUM_TIER_GENERATIONS_PER_DAY,
  FREE_TIER_SURPRISE_ME_USES_PER_WEEK,
  FREE_TIER_MAX_SAVED_RECIPES, PREMIUM_TIER_MAX_SAVED_RECIPES,
  FREE_TIER_MAX_HISTORY_ITEMS, PREMIUM_TIER_MAX_HISTORY_ITEMS,
  FREE_TIER_CALENDAR_VIEW_DAYS, STANDARD_MEAL_SLOTS, OTHER_SLOT_KEY,
  RECIPE_HISTORY_KEY, SAVED_RECIPES_KEY, COOKED_HISTORY_KEY,
  MY_KITCHEN_KEY, RECENTLY_USED_FOR_GENERATOR_KEY, RECENTLY_ADDED_TO_KITCHEN_KEY, GENERATION_STATUS_KEY,
  SURPRISE_ME_STATUS_KEY, EXCLUDED_RECIPE_IDS_KEY, CALENDAR_ENTRIES_KEY,
  USER_PROGRESS_KEY, ACHIEVEMENTS_CONFIG, COMMUNITY_POSTS_KEY,
  ANONYMOUS_GENERATION_STATUS_KEY, ANONYMOUS_FREE_GENERATIONS
} from './types';


// Type guard
function isActualRecipe(response: GeminiRecipeResponse | Recipe): response is Recipe {
  return !!response && typeof response === 'object' && 'title' in response && !('error' in response);
}
function isRecipeError(response: GeminiRecipeResponse): response is RecipeError {
  return !!response && typeof response === 'object' && 'error' in response;
}

interface BackendUserProfileResponse {
  name?: string;
  is_paid_status?: boolean;
  avatar_url?: string; // Optional, in case backend doesn't return it
  email?: string;
  // Include other fields your backend might return that are relevant
}


const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" {...props}>
    <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62 3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z" clipRule="evenodd" />
  </svg>
);
const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.56 0c1.153 0 2.24.03 3.22.076M7.908 3.75h4.184c.928 0 1.68.752 1.68 1.68v1.536H6.228V5.43c0-.928.752-1.68 1.68-1.68Z" />
  </svg>
);

const KitchenIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-1.5m-15-13.5H18M15 7.5h3M4.5 7.5H6M10.5 7.5h3M3 12a9 9 0 1 1 18 0 9 9 0 0 1-18 0Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 15a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5h-15a.75.75 0 0 1-.75-.75Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h7.5v6.75h-7.5V6.75Z"/>
  </svg>
);


const MAX_INGREDIENTS = 15;
const RECENTLY_GENERATED_COUNT = 5;
const MAX_RECENT_ITEMS_DISPLAY = 7;

const COOK_HISTORY_AVOID_DAYS = 7;
const COOK_HISTORY_MAX_AGE_MS = COOK_HISTORY_AVOID_DAYS * 24 * 60 * 60 * 1000;
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const INGREDIENT_ALIASES: Record<string, string> = {
  "strawberries": "Strawberry", "onions": "Onion", "apples": "Apple", "tomatoes": "Tomato",
  "potatoes": "Potato", "carrots": "Carrot", "mangoes": "Mango", "peaches": "Peach",
  "cherries": "Cherry", "grape": "Grapes", "mushrooms": "Mushroom", "scallions": "Green Onion (Scallion)",
  "chillis": "Chili Pepper", "chillies": "Chili Pepper", "bell peppers": "Bell Pepper",
  "pepper": "Bell Pepper", "courgette": "Zucchini", "aubergine": "Eggplant",
  "coriander": "Cilantro (Fresh)", "potatoe": "Potato", "tomatoe": "Tomato",
};

interface ConfirmModalState {
  isOpen: boolean;
  title: string;
  message: string | React.ReactNode;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
}

const App: React.FC = () => {
  const [selectedIngredients, setSelectedIngredients] = useState<IngredientDataItem[]>([]);
  const [selectedCuisine, setSelectedCuisine] = useState<CuisineType>('Any');
  const [selectedAudience, setSelectedAudience] = useState<AudienceType>('Everyone');
  const [desiredServings, setDesiredServings] = useState<number>(2);

  const [generatedRecipe, setGeneratedRecipe] = useState<Recipe | null>(null);
  const [viewingRecipeFromList, setViewingRecipeFromList] = useState<Recipe | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false); // For AI generation loading

  const [activeTab, setActiveTab] = useState<ActiveTab>('generator');
  const [recipeHistory, setRecipeHistory] = useState<Recipe[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [cookedHistory, setCookedHistory] = useState<CookedRecipeEntry[]>([]);
  const [excludedRecipeIds, setExcludedRecipeIds] = useState<string[]>([]);
  const [calendarEntries, setCalendarEntries] = useState<CalendarEntry[]>([]);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading'); // For profile fetching/auth process
  const [loadingAuth, setLoadingAuth] = useState(true); // For main page initial load screen
  const [userToFetchProfileFor, setUserToFetchProfileFor] = useState<SupabaseUser | null>(null); // For Supabase auth workaround

  const [myKitchenIngredients, setMyKitchenIngredients] = useState<IngredientDataItem[]>([]);

  const [recentlyUsedForGenerator, setRecentlyUsedForGenerator] = useState<IngredientDataItem[]>([]);
  const [recentlyAddedToKitchen, setRecentlyAddedToKitchen] = useState<IngredientDataItem[]>([]);
  const [animationType, setAnimationType] = useState<AnimationType>('none');
  const [batchAddMessage, setBatchAddMessage] = useState<BatchAddMessage>(null);

  const [generationStatus, setGenerationStatus] = useState<UserGenerationStatus>({ count: 0, lastUsedDate: new Date().toISOString().split('T')[0], extraGenerationsGranted: 0 });
  const [surpriseMeStatus, setSurpriseMeStatus] = useState<UserSurpriseMeStatus>({ countThisWeek: 0, lastUsedTimestamp: 0 });
  const [upgradeModalInfo, setUpgradeModalInfo] = useState<UpgradeModalInfo>({ isOpen: false, featureName: '', limitDetails: '', premiumBenefit: '' });

  const [anonymousGenerationStatus, setAnonymousGenerationStatus] = useState<AnonymousGenerationStatus>({ count: 0 });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [isAddToCalendarModalOpen, setIsAddToCalendarModalOpen] = useState(false);
  const [recipeForCalendar, setRecipeForCalendar] = useState<MinimalRecipeInfo | null>(null);
  const [prefillCalendarSlot, setPrefillCalendarSlot] = useState<MealSlotType | undefined>(undefined);
  const [prefillCalendarDate, setPrefillCalendarDate] = useState<string | undefined>(undefined);
  const [originForAddToCalendar, setOriginForAddToCalendar] = useState<'dayView' | 'calendarDetailView' | null>(null);

  const [isEditCalendarEntryModalOpen, setIsEditCalendarEntryModalOpen] = useState(false);
  const [entryToEdit, setEntryToEdit] = useState<CalendarEntry | null>(null);

  const [isDayViewModalOpen, setIsDayViewModalOpen] = useState(false);
  const [selectedDateForDayView, setSelectedDateForDayView] = useState<string | null>(null);

  const [isCalendarRecipeDetailModalOpen, setIsCalendarRecipeDetailModalOpen] = useState(false);
  const [calendarRecipeDetail, setCalendarRecipeDetail] = useState<Recipe | null>(null);

  const [isSelectRecipeForCalendarModalOpen, setIsSelectRecipeForCalendarModalOpen] = useState(false);
  const [selectRecipeForCalendarContext, setSelectRecipeForCalendarContext] = useState<{ date: string, slot?: MealSlotType } | null>(null);

  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [isProfilePanelOpen, setIsProfilePanelOpen] = useState(false);
  const [newlyUnlockedAchievement, setNewlyUnlockedAchievement] = useState<Achievement | null>(null);

  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [isCommunityPostDetailModalOpen, setIsCommunityPostDetailModalOpen] = useState(false);
  const [selectedCommunityPost, setSelectedCommunityPost] = useState<CommunityPost | null>(null);

  const [historySearchTerm, setHistorySearchTerm] = useState('');
  const [historyFilterCuisine, setHistoryFilterCuisine] = useState<CuisineType | 'All'>('All');
  const [savedSearchTerm, setSavedSearchTerm] = useState('');
  const [savedFilterCuisine, setSavedFilterCuisine] = useState<CuisineType | 'All'>('All');

  const [confirmModalState, setConfirmModalState] = useState<ConfirmModalState>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });


  const handleOpenAuthModal = useCallback(() => {
    setIsAuthModalOpen(true);
  }, []);

  const handleCloseAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const getDefaultUserProgress = (userId: string): UserProgress => ({
    userId,
    xp: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastCookedDate: null,
    unlockedAchievementIds: [],
    metrics: {
      generatedRecipeCount: 0,
      cookedRecipeCount: 0,
      distinctIngredientsUsed: [],
      savedRecipeCount: 0,
    },
    viewedAchievements: [],
  });

  const getInitialCommunityPosts = (): CommunityPost[] => {
    return [
      { id: 'post1', authorId: 'user123', authorName: 'Chef Recipify', isAuthorPro: true, title: 'My Famous Lasagna', description: 'A classic lasagna recipe that everyone loves!', timestamp: Date.now() - 86400000 * 2, likes: 150, commentsCount: 12, imageUrl: 'https://via.placeholder.com/600x400.png?text=Lasagna', recipeId: 'recipe-lasagna-1', tags: ['italian', 'pasta', 'comfortfood'], },
      { id: 'post2', authorId: 'user456', authorName: 'Foodie Fan', isAuthorPro: false, title: 'Quick Weeknight Stir-fry', description: 'Super easy and delicious stir-fry for busy nights.', timestamp: Date.now() - 86400000 * 1, likes: 75, commentsCount: 5, imageUrl: 'https://via.placeholder.com/600x400.png?text=Stir-fry', recipeId: 'recipe-stirfry-2', tags: ['asian', 'quickmeal', 'healthy'], },
      { id: 'post3', authorId: 'user789', authorName: 'Baker Extraordinaire', isAuthorPro: true, title: 'Ultimate Chocolate Chip Cookies', description: 'The only chocolate chip cookie recipe you will ever need. So chewy and good!', timestamp: Date.now() - 86400000 * 5, likes: 230, commentsCount: 25, imageUrl: 'https://via.placeholder.com/600x400.png?text=Cookies', tags: ['dessert', 'baking', 'cookies', 'chocolate'], },
      { id: 'post4', authorId: 'user123', authorName: 'Chef Recipify', isAuthorPro: true, title: 'Refreshing Summer Salad', description: 'A light and vibrant salad perfect for warm days. Packed with seasonal veggies.', timestamp: Date.now() - 86400000 * 0.5, likes: 45, commentsCount: 3, imageUrl: 'https://via.placeholder.com/600x400.png?text=Summer+Salad', recipeId: 'recipe-salad-3', tags: ['salad', 'healthy', 'summer', 'vegetarian'], },
    ];
  };

  const userKey = (baseKey: string, userId?: string | null) => userId ? `${baseKey}_${userId}` : baseKey;

  // Load user-specific or anonymous data from localStorage
  const loadUserData = useCallback((userId: string | null) => {
    console.log(`Auth: loadUserData called for userId: ${userId ?? 'anonymous'}`);
    try {
      const storedHistory = localStorage.getItem(userKey(RECIPE_HISTORY_KEY, userId));
      setRecipeHistory(storedHistory ? JSON.parse(storedHistory) : []);

      const storedSavedRecipes = localStorage.getItem(userKey(SAVED_RECIPES_KEY, userId));
      setSavedRecipes(storedSavedRecipes ? JSON.parse(storedSavedRecipes) : []);

      const storedCookedHistory = localStorage.getItem(userKey(COOKED_HISTORY_KEY, userId));
      setCookedHistory(storedCookedHistory ? JSON.parse(storedCookedHistory) : []);

      const storedExcludedIds = localStorage.getItem(userKey(EXCLUDED_RECIPE_IDS_KEY, userId));
      setExcludedRecipeIds(storedExcludedIds ? JSON.parse(storedExcludedIds) : []);

      const storedCalendarEntries = localStorage.getItem(userKey(CALENDAR_ENTRIES_KEY, userId));
      setCalendarEntries(storedCalendarEntries ? JSON.parse(storedCalendarEntries) : []);

      const storedMyKitchen = localStorage.getItem(userKey(MY_KITCHEN_KEY, userId));
      setMyKitchenIngredients(storedMyKitchen ? JSON.parse(storedMyKitchen) : []);

      const storedRecentlyUsedGen = localStorage.getItem(userKey(RECENTLY_USED_FOR_GENERATOR_KEY, userId));
      setRecentlyUsedForGenerator(storedRecentlyUsedGen ? JSON.parse(storedRecentlyUsedGen) : []);

      const storedRecentlyAddedKit = localStorage.getItem(userKey(RECENTLY_ADDED_TO_KITCHEN_KEY, userId));
      setRecentlyAddedToKitchen(storedRecentlyAddedKit ? JSON.parse(storedRecentlyAddedKit) : []);

      if (userId) {
        const storedGenStatus = localStorage.getItem(userKey(GENERATION_STATUS_KEY, userId));
        if (storedGenStatus) {
          const parsedStatus: UserGenerationStatus = JSON.parse(storedGenStatus);
          const today = new Date().toISOString().split('T')[0];
          setGenerationStatus(parsedStatus.lastUsedDate !== today ? { count: 0, lastUsedDate: today, extraGenerationsGranted: 0 } : parsedStatus);
        } else {
          setGenerationStatus({ count: 0, lastUsedDate: new Date().toISOString().split('T')[0], extraGenerationsGranted: 0 });
        }

        const storedSurpriseStatus = localStorage.getItem(userKey(SURPRISE_ME_STATUS_KEY, userId));
        if (storedSurpriseStatus) {
          const parsedStatus: UserSurpriseMeStatus = JSON.parse(storedSurpriseStatus);
          setSurpriseMeStatus(Date.now() - parsedStatus.lastUsedTimestamp >= ONE_WEEK_MS ? { countThisWeek: 0, lastUsedTimestamp: 0 } : parsedStatus);
        } else {
          setSurpriseMeStatus({ countThisWeek: 0, lastUsedTimestamp: 0 });
        }
      } else { // Anonymous user
        const storedAnonGenStatus = localStorage.getItem(ANONYMOUS_GENERATION_STATUS_KEY);
        setAnonymousGenerationStatus(storedAnonGenStatus ? JSON.parse(storedAnonGenStatus) : { count: 0 });
        setGenerationStatus({ count: 0, lastUsedDate: new Date().toISOString().split('T')[0], extraGenerationsGranted: 0 });
        setSurpriseMeStatus({ countThisWeek: 0, lastUsedTimestamp: 0 });
      }

      const storedCommunityPosts = localStorage.getItem(COMMUNITY_POSTS_KEY);
      setCommunityPosts(storedCommunityPosts ? JSON.parse(storedCommunityPosts) : getInitialCommunityPosts());

    } catch (e) {
      console.error("Error loading data from localStorage", e);
       setError("Failed to load some user data from local storage. Your data might be partially reset.");
    }
  }, []);


  const fetchAndSetUserProfile = useCallback(async (supabaseUser: SupabaseUser) => {
    console.log('Auth: fetchAndSetUserProfile started for user ID:', supabaseUser.id);
    if (!supabaseUser || !supabaseUser.id) {
      console.error('Auth: fetchAndSetUserProfile called with invalid SupabaseUser object.');
      setCurrentUser(null);
      setAuthStatus('unauthenticated');
      loadUserData(null);
      setLoadingAuth(false);
      return;
    }
    setAuthStatus('loading');

    try {
      const token = await getSupabaseAccessToken();
      if (!token) {
        throw new Error('Failed to retrieve access token.');
      }

      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
      if (!apiBaseUrl) {
        throw new Error('API base URL is not configured.');
      }
      
      const response = await fetch(`${apiBaseUrl}/api/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
         const errorBody = await response.text();
        console.error('Auth: Backend /api/users/me fetch error for user ID:', supabaseUser.id, `Status: ${response.status}`, errorBody);
        throw new Error(`Failed to fetch profile from backend: ${response.status} ${response.statusText}. ${errorBody}`);
      }

      const profileDataFromBackend = await response.json() as BackendUserProfileResponse;
      console.log('Auth: Profile data from backend /api/users/me:', profileDataFromBackend);

      // Ensure profileDataFromBackend contains expected fields
      if (typeof profileDataFromBackend.name === 'undefined' || typeof profileDataFromBackend.is_paid_status === 'undefined') {
         console.error('Auth: Backend /api/users/me response missing required fields (name, is_paid_status). Response:', profileDataFromBackend);
         throw new Error('Backend profile response is missing required fields.');
      }

      const appUser: User = {
        id: supabaseUser.id,
        email: supabaseUser.email,
        name: profileDataFromBackend.name || supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'Recipify User',
        avatarUrl: supabaseUser.user_metadata?.avatar_url || `https://avatar.iran.liara.run/username?username=${encodeURIComponent(profileDataFromBackend.name || supabaseUser.email || 'User')}&length=1`,
        isPaid: profileDataFromBackend.is_paid_status || false,
      };
      
      setCurrentUser(appUser);
      setAuthStatus('authenticated');
      console.log('Auth: User authenticated, currentUser set via backend for user ID:', supabaseUser.id);

      loadUserData(appUser.id);

      const storedProgress = localStorage.getItem(userKey(USER_PROGRESS_KEY, appUser.id));
      setUserProgress(storedProgress ? JSON.parse(storedProgress) : getDefaultUserProgress(appUser.id));
      
      localStorage.removeItem(ANONYMOUS_GENERATION_STATUS_KEY);
      setAnonymousGenerationStatus({ count: 0 });
      setIsAuthModalOpen(false);

    } catch (e: any) {
      console.error('Auth: Error in fetchAndSetUserProfile (backend) for user ID:', supabaseUser?.id, e);
      setError(`Could not load your profile: ${e.message || 'Unknown error'}. Please try again.`);
      setCurrentUser(null);
      setAuthStatus('unauthenticated');
      loadUserData(null); 
    } finally {
      console.log('Auth: fetchAndSetUserProfile (backend) finally block. Setting loadingAuth to false for user ID:', supabaseUser?.id);
      setLoadingAuth(false);
    }
  }, [loadUserData]);


  useEffect(() => {
    console.log('Auth: Main auth listener useEffect setup.');
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        console.log('Auth: onAuthStateChange event:', _event, 'Session User ID:', session?.user?.id);

        if (_event === 'INITIAL_SESSION' || _event === 'SIGNED_IN' || _event === 'TOKEN_REFRESHED' || _event === 'USER_UPDATED') {
          if (session?.user) {
            console.log('Auth: Setting userToFetchProfileFor:', session.user.id);
            setUserToFetchProfileFor(session.user); // Set state to trigger profile fetch
          } else {
            console.log('Auth: No session user on relevant event. Setting unauthenticated state.');
            setCurrentUser(null);
            setUserProgress(null);
            setAuthStatus('unauthenticated');
            loadUserData(null); 
            setLoadingAuth(false);
            setUserToFetchProfileFor(null); 
          }
        } else if (_event === 'SIGNED_OUT') {
          console.log('Auth: SIGNED_OUT event. Setting unauthenticated state.');
          setCurrentUser(null);
          setUserProgress(null);
          setAuthStatus('unauthenticated');
          loadUserData(null); 
          setLoadingAuth(false);
          setIsProfilePanelOpen(false);
          setIsAuthModalOpen(false); 
          setUserToFetchProfileFor(null);
        }
      }
    );

    return () => {
      console.log('Auth: Unsubscribing auth listener.');
      authListener?.subscription.unsubscribe();
    };
  }, [loadUserData]); 

  // New useEffect to handle fetching profile when userToFetchProfileFor changes
  useEffect(() => {
    if (userToFetchProfileFor) {
      console.log('Auth: useEffect detected userToFetchProfileFor, calling fetchAndSetUserProfile for:', userToFetchProfileFor.id);
      fetchAndSetUserProfile(userToFetchProfileFor);
      setUserToFetchProfileFor(null); // Reset the trigger after initiating fetch
    }
  }, [userToFetchProfileFor, fetchAndSetUserProfile]);


  useEffect(() => { try { localStorage.setItem(userKey(RECIPE_HISTORY_KEY, currentUser?.id), JSON.stringify(recipeHistory)); } catch (e) { console.error("Error saving history", e); }}, [recipeHistory, currentUser?.id]);
  useEffect(() => { try { localStorage.setItem(userKey(SAVED_RECIPES_KEY, currentUser?.id), JSON.stringify(savedRecipes)); } catch (e) { console.error("Error saving saved recipes", e); }}, [savedRecipes, currentUser?.id]);
  useEffect(() => { try { localStorage.setItem(userKey(COOKED_HISTORY_KEY, currentUser?.id), JSON.stringify(cookedHistory)); } catch (e) { console.error("Error saving cooked history", e); }}, [cookedHistory, currentUser?.id]);
  useEffect(() => { try { localStorage.setItem(userKey(EXCLUDED_RECIPE_IDS_KEY, currentUser?.id), JSON.stringify(excludedRecipeIds)); } catch (e) { console.error("Error saving excluded IDs", e); }}, [excludedRecipeIds, currentUser?.id]);
  useEffect(() => { try { localStorage.setItem(userKey(CALENDAR_ENTRIES_KEY, currentUser?.id), JSON.stringify(calendarEntries)); } catch (e) { console.error("Error saving calendar entries", e); }}, [calendarEntries, currentUser?.id]);
  useEffect(() => { try { localStorage.setItem(userKey(MY_KITCHEN_KEY, currentUser?.id), JSON.stringify(myKitchenIngredients)); } catch (e) { console.error("Error saving My Kitchen", e); }}, [myKitchenIngredients, currentUser?.id]);
  useEffect(() => { try { localStorage.setItem(userKey(RECENTLY_USED_FOR_GENERATOR_KEY, currentUser?.id), JSON.stringify(recentlyUsedForGenerator)); } catch (e) { console.error("Error saving recently used for gen", e); }}, [recentlyUsedForGenerator, currentUser?.id]);
  useEffect(() => { try { localStorage.setItem(userKey(RECENTLY_ADDED_TO_KITCHEN_KEY, currentUser?.id), JSON.stringify(recentlyAddedToKitchen)); } catch (e) { console.error("Error saving recently added to kitchen", e); }}, [recentlyAddedToKitchen, currentUser?.id]);

  useEffect(() => {
    if (currentUser) {
      try { localStorage.setItem(userKey(GENERATION_STATUS_KEY, currentUser.id), JSON.stringify(generationStatus)); } catch (e) { console.error("Error saving generation status", e); }
    }
  }, [generationStatus, currentUser?.id]);

  useEffect(() => {
    if (currentUser) {
      try { localStorage.setItem(userKey(SURPRISE_ME_STATUS_KEY, currentUser.id), JSON.stringify(surpriseMeStatus)); } catch (e) { console.error("Error saving surprise me status", e); }
    }
  }, [surpriseMeStatus, currentUser?.id]);

  useEffect(() => {
    if (userProgress && currentUser) {
      try {
        localStorage.setItem(userKey(USER_PROGRESS_KEY, currentUser.id), JSON.stringify(userProgress));
      } catch (e) {
        console.error("Error saving user progress", e);
      }
    }
  }, [userProgress, currentUser?.id]);

  useEffect(() => { try { localStorage.setItem(COMMUNITY_POSTS_KEY, JSON.stringify(communityPosts)); } catch (e) { console.error("Error saving community posts", e); }}, [communityPosts]);

  useEffect(() => {
    if (!currentUser) {
      try { localStorage.setItem(ANONYMOUS_GENERATION_STATUS_KEY, JSON.stringify(anonymousGenerationStatus)); } catch (e) { console.error("Error saving anonymous generation status", e); }
    }
  }, [anonymousGenerationStatus, currentUser]);


  const handleOpenConfirmModal = ( title: string, message: string | React.ReactNode, onConfirmCallback: () => void, confirmText?: string, cancelText?: string ) => {
    setConfirmModalState({ isOpen: true, title, message, onConfirm: onConfirmCallback, confirmText, cancelText, });
  };

  const handleCloseConfirmModal = () => {
    setConfirmModalState(prev => ({ ...prev, isOpen: false }));
  };

  const handleExecuteConfirm = () => {
    confirmModalState.onConfirm();
    handleCloseConfirmModal();
  };

  const updateUserMetric = useCallback((metricName: keyof UserProgress['metrics'], value: number | string[]) => {
    if (!currentUser || !userProgress) return;
    setUserProgress(prev => {
      if (!prev) return null;
      const newMetrics = { ...prev.metrics };
      if (typeof value === 'number' && typeof newMetrics[metricName] === 'number') {
        (newMetrics[metricName] as number) += value;
      } else if (Array.isArray(value) && metricName === 'distinctIngredientsUsed') {
         const currentSet = new Set(newMetrics.distinctIngredientsUsed);
         value.forEach(item => currentSet.add(item));
         newMetrics.distinctIngredientsUsed = Array.from(currentSet);
      } else if (typeof value === 'number' && metricName === 'savedRecipeCount') {
        newMetrics.savedRecipeCount = value;
      }
      return { ...prev, metrics: newMetrics };
    });
  }, [currentUser, userProgress]);

  const checkAndUnlockAchievements = useCallback(() => {
    if (!userProgress || !currentUser) return;
    let newAchievementUnlockedThisCheck: Achievement | null = null;
    for (const achievementId in ACHIEVEMENTS_CONFIG) {
      const achievement = ACHIEVEMENTS_CONFIG[achievementId as AchievementId];
      if (!userProgress.unlockedAchievementIds.includes(achievement.id) && achievement.isUnlocked(userProgress, currentUser)) {
        setUserProgress(prev => {
          if (!prev) return null;
          newAchievementUnlockedThisCheck = achievement;
          return { ...prev, xp: prev.xp + achievement.xp, unlockedAchievementIds: [...prev.unlockedAchievementIds, achievement.id], };
        });
        if (newAchievementUnlockedThisCheck) break; // Show one at a time
      }
    }
    if (newAchievementUnlockedThisCheck) {
      setNewlyUnlockedAchievement(newAchievementUnlockedThisCheck);
    }
  }, [userProgress, currentUser]);

  useEffect(() => {
    if (userProgress && currentUser) {
      checkAndUnlockAchievements();
    }
  }, [userProgress, currentUser, checkAndUnlockAchievements]);

  const handleViewCommunityPostDetail = (post: CommunityPost) => { setSelectedCommunityPost(post); setIsCommunityPostDetailModalOpen(true); };
  const handleCloseCommunityPostDetailModal = () => { setSelectedCommunityPost(null); setIsCommunityPostDetailModalOpen(false); };

  const handleLikePost = (postId: CommunityPostId) => {
    if (!currentUser) { handleOpenAuthModal(); return; }
    console.log(`Liked post: ${postId}`);
    setCommunityPosts(prevPosts => prevPosts.map(post => post.id === postId ? { ...post, likes: post.likes + 1 } : post));
  };

  const handleFollowUser = (userId: string) => {
    if (!currentUser) { handleOpenAuthModal(); return; }
    console.log(`Followed user: ${userId}`);
  };

  const handleEmailSignUp = async (email_address: string, password_strong: string): Promise<{ error: AuthError | null; requiresConfirmation?: boolean }> => {
    setAuthStatus('loading'); 
    const { data, error } = await supabase.auth.signUp({
      email: email_address,
      password: password_strong,
      options: {
        data: {
          name: 'Test User FullName', // Placeholder, will be updated later
        }
      }
    });
    if (error) {
      setAuthStatus('unauthenticated');
      return { error };
    }
    const requiresConfirmation = !data.user && !data.session; 
    if (requiresConfirmation) {
        setAuthStatus('unauthenticated');
    }
    return { error: null, requiresConfirmation };
  };

  const handleEmailSignIn = async (email_address: string, password_input: string): Promise<{ error: AuthError | null }> => {
    setAuthStatus('loading');
    const { error } = await supabase.auth.signInWithPassword({
      email: email_address,
      password: password_input,
    });
    if (error) {
      setAuthStatus('unauthenticated');
    }
    return { error };
  };

  const handleGoogleAuth = async (): Promise<void> => {
    setAuthStatus('loading');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) {
      setError(`Google Auth failed: ${error.message}`);
      setAuthStatus('unauthenticated');
    }
  };

  const handleSignOut = async () => {
    setAuthStatus('loading'); 
    const { error } = await supabase.auth.signOut();
    if (error) {
        setError(`Sign-out failed: ${error.message}`);
        setAuthStatus(currentUser ? 'authenticated' : 'unauthenticated'); 
    }
  };


  const handleToggleProfilePanel = () => {
    if (currentUser && userProgress) {
        setIsProfilePanelOpen(prev => !prev);
        if (!isProfilePanelOpen && newlyUnlockedAchievement && userProgress && !userProgress.viewedAchievements.includes(newlyUnlockedAchievement.id)) {
             setUserProgress(prev => prev ? { ...prev, viewedAchievements: [...new Set([...prev.viewedAchievements, newlyUnlockedAchievement.id])] } : null);
        }
    }
  };

  const handleTogglePaidStatus = async () => {
    if (!currentUser) { handleOpenAuthModal(); return; }
    const newPaidStatus = !currentUser.isPaid;
    setLoadingAuth(true); 
    setAuthStatus('loading');
    try {
        // TODO: This should eventually call a backend endpoint to update paid status
        // For now, it updates Supabase directly. If /api/users/me is the source of truth,
        // this direct Supabase update might cause temporary inconsistencies until the next
        // full profile fetch via /api/users/me.
        const { error: updateError } = await supabase
            .from('users') 
            .update({ is_paid_status: newPaidStatus, updated_at: new Date().toISOString() }) 
            .eq('id', currentUser.id);

        if (updateError) throw updateError;

        setCurrentUser(prevUser => {
            if (!prevUser) return null;
            if (newPaidStatus) {
                setGenerationStatus({ count: 0, lastUsedDate: new Date().toISOString().split('T')[0], extraGenerationsGranted: 0});
                setSurpriseMeStatus({ countThisWeek: 0, lastUsedTimestamp: 0 });
            }
            return { ...prevUser, isPaid: newPaidStatus };
        });
        setAuthStatus('authenticated');
    } catch (e: any) {
        console.error("Error updating paid status:", e);
        setError(`Failed to update subscription status: ${e.message}`);
        setAuthStatus('authenticated'); 
    } finally {
        setLoadingAuth(false);
        setUpgradeModalInfo(prev => ({...prev, isOpen: false}));
    }
  };


  const handleAddToMyKitchen = (ingredient: IngredientDataItem) => {
    if (!currentUser) { handleOpenAuthModal(); return; }
    if (!myKitchenIngredients.find(i => i.id === ingredient.id)) {
      setMyKitchenIngredients(prev => [...prev, ingredient]);
      setRecentlyAddedToKitchen(prevRecent => {
        const updatedRecent = [ingredient, ...prevRecent.filter(ri => ri.id !== ingredient.id)];
        return updatedRecent.slice(0, MAX_RECENT_ITEMS_DISPLAY);
      });
    }
  };

  const handleRemoveFromMyKitchen = (ingredientId: string) => {
     if (!currentUser) { handleOpenAuthModal(); return; }
    setMyKitchenIngredients(prev => prev.filter(i => i.id !== ingredientId));
  };

  const handleAddAllFromMyKitchenToSelection = () => {
    if (!currentUser) { handleOpenAuthModal(); return; }
    const currentSelectedIds = new Set(selectedIngredients.map(i => i.id));
    const ingredientsToAdd = myKitchenIngredients.filter(kitchenIng => !currentSelectedIds.has(kitchenIng.id));
    const availableSlots = MAX_INGREDIENTS - selectedIngredients.length;
    const finalIngredientsToAdd = ingredientsToAdd.slice(0, availableSlots);
    setSelectedIngredients(prev => [...prev, ...finalIngredientsToAdd]);
    if (ingredientsToAdd.length > availableSlots) { setBatchAddMessage({type: 'info', text: `Added ${finalIngredientsToAdd.length} ingredients. Max limit reached.`}); }
    else if (finalIngredientsToAdd.length > 0){ setBatchAddMessage({type: 'success', text: `Added ${finalIngredientsToAdd.length} ingredients from your kitchen.`}); }
    else if (myKitchenIngredients.length > 0 && ingredientsToAdd.length === 0) { setBatchAddMessage({type: 'info', text: "All your kitchen ingredients are already in the selection."}); }
    else if (myKitchenIngredients.length === 0) { setBatchAddMessage({type: 'info', text: "Your kitchen is empty."}); }
  };

  const addRecipeToHistory = useCallback((newRecipeData: Omit<Recipe, 'id' | 'timestamp' | 'cuisine'>, generatedCuisine: CuisineType): Recipe => {
    const fullRecipe: Recipe = { ...newRecipeData, id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, timestamp: Date.now(), cuisine: generatedCuisine, };
    const maxHistory = currentUser?.isPaid ? PREMIUM_TIER_MAX_HISTORY_ITEMS : FREE_TIER_MAX_HISTORY_ITEMS;
    setRecipeHistory(prevHistory => {
      const historyWithoutCurrent = prevHistory.filter(r => r.id !== fullRecipe.id);
      const updatedHistory = [fullRecipe, ...historyWithoutCurrent];
      return updatedHistory.slice(0, maxHistory);
    });
    return fullRecipe;
  }, [currentUser?.isPaid]);

  const handleRemoveRecipeFromHistory = useCallback((recipeId: string) => {
    if (!currentUser) { handleOpenAuthModal(); return; }
    setRecipeHistory(prevRecipeHistory => prevRecipeHistory.filter(recipe => recipe.id !== recipeId));
  }, [currentUser, handleOpenAuthModal]);


  const handleSaveRecipe = (recipeToSave: Recipe) => {
    if (!currentUser) { handleOpenAuthModal(); return; }
    const maxSaved = currentUser.isPaid ? PREMIUM_TIER_MAX_SAVED_RECIPES : FREE_TIER_MAX_SAVED_RECIPES;
    if (!currentUser.isPaid && savedRecipes.length >= maxSaved) {
      setUpgradeModalInfo({ isOpen: true, featureName: "Saving Recipes", limitDetails: `You've reached the limit of ${maxSaved} saved recipes for free users.`, premiumBenefit: `Save up to ${PREMIUM_TIER_MAX_SAVED_RECIPES} recipes with Recipify Pro.` });
      return;
    }
    if (savedRecipes.length >= maxSaved && currentUser.isPaid) { setError(`You have reached the maximum of ${maxSaved} saved recipes.`); return; }
    if (!savedRecipes.find(r => r.id === recipeToSave.id)) {
      setSavedRecipes(prev => {
        const newSaved = [recipeToSave, ...prev];
        if (currentUser && userProgress) { updateUserMetric('savedRecipeCount', newSaved.length); }
        return newSaved;
      });
    }
  };

  const handleUnsaveRecipe = (recipeId: string) => {
    if (!currentUser) { handleOpenAuthModal(); return; }
    setSavedRecipes(prev => {
        const newSaved = prev.filter(r => r.id !== recipeId);
        if (currentUser && userProgress) { updateUserMetric('savedRecipeCount', newSaved.length); }
        return newSaved;
    });
  };

  const handleMarkRecipeAsCooked = (recipe: Recipe) => {
    if (!currentUser) { handleOpenAuthModal(); return; }
    const newCookedEntry: CookedRecipeEntry = { recipeId: recipe.id, title: recipe.title, cookedAt: Date.now(), };
    setCookedHistory(prev => [newCookedEntry, ...prev.filter(entry => entry.recipeId !== recipe.id)]);
    if (currentUser && userProgress) {
      updateUserMetric('cookedRecipeCount', 1);
      const todayStr = new Date().toISOString().split('T')[0];
      if (userProgress.lastCookedDate !== todayStr) {
        const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        let newStreak = userProgress.currentStreak;
        if (userProgress.lastCookedDate === yesterdayStr) { newStreak += 1; } else { newStreak = 1; }
        setUserProgress(prevProg => prevProg ? { ...prevProg, lastCookedDate: todayStr, currentStreak: newStreak, longestStreak: Math.max(prevProg.longestStreak, newStreak), } : null);
      }
    }
  };

  const handleUnmarkRecipeAsCooked = (recipeId: string) => {
    if (!currentUser) { handleOpenAuthModal(); return; }
    setCookedHistory(prev => prev.filter(entry => entry.recipeId !== recipeId));
  };

  const handleToggleExcludeRecipe = (recipeId: string) => {
     if (!currentUser) { handleOpenAuthModal(); return; }
    setExcludedRecipeIds(prevExcluded => prevExcluded.includes(recipeId) ? prevExcluded.filter(id => id !== recipeId) : [...prevExcluded, recipeId]);
  };

  const handleOpenAddToCalendarModal = ( recipe: MinimalRecipeInfo, date?: string, slot?: MealSlotType, origin?: 'dayView' | 'calendarDetailView' | null ) => {
    if (!currentUser) { handleOpenAuthModal(); return; }
    setRecipeForCalendar(recipe);
    setPrefillCalendarDate(date || new Date().toISOString().split('T')[0]);
    setPrefillCalendarSlot(slot);
    setOriginForAddToCalendar(origin || null);
    setIsAddToCalendarModalOpen(true);
  };

  const handleCloseAddToCalendarModal = () => {
    setIsAddToCalendarModalOpen(false); setRecipeForCalendar(null); setPrefillCalendarDate(undefined); setPrefillCalendarSlot(undefined);
    if (originForAddToCalendar === 'dayView' && selectedDateForDayView) { setIsDayViewModalOpen(true); }
    else if (originForAddToCalendar === 'calendarDetailView' && calendarRecipeDetail) { setIsCalendarRecipeDetailModalOpen(true); }
    setOriginForAddToCalendar(null);
  };

  const handleAddRecipeToCalendar = (recipe: MinimalRecipeInfo, date: string, slot: MealSlotType, customSlotName?: string) => {
    if (!currentUser) { handleOpenAuthModal(); return; }
    const today = new Date(); today.setHours(0,0,0,0);
    const selectedDateObj = new Date(date); selectedDateObj.setHours(0,0,0,0);
    const finalSlot = customSlotName && currentUser?.isPaid ? customSlotName.trim() : slot;
    if (!finalSlot) { setError("Slot name cannot be empty."); return; }
    const freeTierPastViewLimit = new Date(); freeTierPastViewLimit.setDate(freeTierPastViewLimit.getDate() - FREE_TIER_CALENDAR_VIEW_DAYS); freeTierPastViewLimit.setHours(0,0,0,0);
    if (!currentUser?.isPaid) {
        if (selectedDateObj.getTime() > today.getTime()) { setUpgradeModalInfo({ isOpen: true, featureName: "Future Meal Planning", limitDetails: "Free users can only log meals for today or past dates.", premiumBenefit: "Plan your meals ahead with Recipify Pro!" }); return; }
        if (selectedDateObj.getTime() < freeTierPastViewLimit.getTime()) { setUpgradeModalInfo({ isOpen: true, featureName: "Extended Past Meal Logging", limitDetails: `Free users can log meals only within the last ${FREE_TIER_CALENDAR_VIEW_DAYS} days.`, premiumBenefit: `Upgrade to Pro to access and manage your full meal history beyond ${FREE_TIER_CALENDAR_VIEW_DAYS} days.` }); return; }
        if (customSlotName || !STANDARD_MEAL_SLOTS.some(s => s.name === finalSlot)) { setUpgradeModalInfo({ isOpen: true, featureName: "Custom Meal Slots", limitDetails: "Custom meal slots are a premium feature.", premiumBenefit: "Organize your meal plan with custom slots in Recipify Pro!" }); return; }
    }
    const newEntry: CalendarEntry = { id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, recipeId: recipe.id, recipeTitle: recipe.title, date, slot: finalSlot, timestamp: Date.now() };
    setCalendarEntries(prevEntries => {
        if (!currentUser?.isPaid) { const filteredEntries = prevEntries.filter(entry => !(entry.date === date && entry.slot === finalSlot)); return [newEntry, ...filteredEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.timestamp - a.timestamp); }
        return [...prevEntries, newEntry].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.timestamp - a.timestamp);
    });
    handleCloseAddToCalendarModal();
  };

  const handleRemoveRecipeFromCalendar = (calendarEntryId: string) => {
    if (!currentUser) { handleOpenAuthModal(); return; }
    setCalendarEntries(prev => prev.filter(entry => entry.id !== calendarEntryId));
    setIsEditCalendarEntryModalOpen(false); setEntryToEdit(null);
  };

  const handleOpenEditCalendarEntryModal = (entry: CalendarEntry) => {
    if (!currentUser) { handleOpenAuthModal(); return; }
    setEntryToEdit(entry); setIsEditCalendarEntryModalOpen(true);
    if (isDayViewModalOpen) setIsDayViewModalOpen(false);
  };

  const handleCloseEditCalendarEntryModal = () => {
    setIsEditCalendarEntryModalOpen(false); setEntryToEdit(null);
    if (selectedDateForDayView) setIsDayViewModalOpen(true);
  }

  const handleUpdateCalendarEntry = ( entryId: string, updates: { newDate?: string; newSlot?: MealSlotType; newCustomSlotName?: string } ): { success: boolean; message?: string } => {
    if (!currentUser) { return { success: false, message: "Please sign in to update calendar entries." }; }
    const entryToUpdate = calendarEntries.find(e => e.id === entryId);
    if (!entryToUpdate) return { success: false, message: "Entry not found." };
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const freeTierPastViewLimit = new Date(); freeTierPastViewLimit.setDate(freeTierPastViewLimit.getDate() - FREE_TIER_CALENDAR_VIEW_DAYS); freeTierPastViewLimit.setHours(0,0,0,0);
    let finalDate = updates.newDate || entryToUpdate.date;
    let finalSlot = updates.newCustomSlotName && currentUser?.isPaid ? updates.newCustomSlotName.trim() : updates.newSlot || entryToUpdate.slot;
    if (!finalSlot) return { success: false, message: "Slot name cannot be empty."};
    const finalDateObj = new Date(finalDate); finalDateObj.setHours(0,0,0,0);
    if (!currentUser?.isPaid) {
        if (finalDateObj.getTime() > today.getTime()) { setUpgradeModalInfo({ isOpen: true, featureName: "Future Meal Planning", limitDetails: "Free users cannot move meals to future dates.", premiumBenefit: "Plan your meals ahead with Recipify Pro!" }); return { success: false, message: "Free users cannot move meals to future dates." }; }
        if (finalDateObj.getTime() < freeTierPastViewLimit.getTime()) { setUpgradeModalInfo({ isOpen: true, featureName: "Extended Past Meal Logging", limitDetails: `Free users can move meals only within the last ${FREE_TIER_CALENDAR_VIEW_DAYS} days.`, premiumBenefit: `Upgrade to Pro to access and manage your full meal history beyond ${FREE_TIER_CALENDAR_VIEW_DAYS} days.` }); return { success: false, message: `Free users cannot move meals beyond their ${FREE_TIER_CALENDAR_VIEW_DAYS}-day viewable history.` }; }
        if (updates.newCustomSlotName || !STANDARD_MEAL_SLOTS.some(sds => sds.name === finalSlot)) { setUpgradeModalInfo({ isOpen: true, featureName: "Custom Meal Slots", limitDetails: "Custom meal slots are a premium feature.", premiumBenefit: "Organize your meal plan with custom slots in Recipify Pro!" }); return { success: false, message: "Custom slots are a premium feature." }; }
    }
    const conflict = calendarEntries.find(e => e.id !== entryId && e.date === finalDate && e.slot === finalSlot && !currentUser?.isPaid );
    if (conflict) { return { success: false, message: `The slot '${finalSlot}' on ${finalDate} is already taken by "${conflict.recipeTitle}". Free users can only have one item per slot.` }; }
    setCalendarEntries(prevEntries => prevEntries.map(e => e.id === entryId ? { ...e, date: finalDate, slot: finalSlot, timestamp: Date.now() } : e ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.timestamp - a.timestamp) );
    handleCloseEditCalendarEntryModal();
    return { success: true };
  };

  const handleMoveCalendarEntry = (entryId: string, newDate: string, newSlot: MealSlotType): void => {
    if (!currentUser) { handleOpenAuthModal(); return; }
    const entryToMove = calendarEntries.find(e => e.id === entryId);
    if (!entryToMove) { return; }
    if (entryToMove.date === newDate && entryToMove.slot === newSlot) return;
    const today = new Date(); today.setHours(0,0,0,0);
    const targetDateObj = new Date(newDate); targetDateObj.setHours(0,0,0,0);
    const freeTierPastViewLimit = new Date(); freeTierPastViewLimit.setDate(freeTierPastViewLimit.getDate() - FREE_TIER_CALENDAR_VIEW_DAYS); freeTierPastViewLimit.setHours(0,0,0,0);
    if (!currentUser?.isPaid) {
        if (targetDateObj.getTime() > today.getTime()) { setUpgradeModalInfo({ isOpen: true, featureName: "Future Meal Planning", limitDetails: "Free users cannot move meals to future dates.", premiumBenefit: "Plan your meals ahead with Recipify Pro!"}); return; }
        if (targetDateObj.getTime() < freeTierPastViewLimit.getTime()) { setUpgradeModalInfo({ isOpen: true, featureName: "Extended Past Meal Logging", limitDetails: `Free users can move meals only within the last ${FREE_TIER_CALENDAR_VIEW_DAYS} days.`, premiumBenefit: `Upgrade to Pro to access and manage your full meal history beyond ${FREE_TIER_CALENDAR_VIEW_DAYS} days.` }); return; }
        if (!STANDARD_MEAL_SLOTS.some(sds => sds.name === newSlot)) { setUpgradeModalInfo({ isOpen: true, featureName: "Custom Meal Slots", limitDetails: "Free users cannot use custom meal slots.", premiumBenefit: "Organize with custom slots in Recipify Pro!"}); return; }
    }
    setCalendarEntries(prevEntries => {
        let newEntries = prevEntries;
        if (!currentUser?.isPaid) { newEntries = newEntries.filter(e => !(e.date === newDate && e.slot === newSlot && e.id !== entryId)); }
        return newEntries.map(e => e.id === entryId ? { ...e, date: newDate, slot: newSlot, timestamp: Date.now() } : e ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.timestamp - a.timestamp);
    });
  };

  const handleOpenDayViewModal = (date: string) => {
    if (!currentUser) { handleOpenAuthModal(); return; }
    setSelectedDateForDayView(date); setIsDayViewModalOpen(true); setViewingRecipeFromList(null); setGeneratedRecipe(null);
  };

  const handleCloseDayViewModal = () => { setIsDayViewModalOpen(false); setSelectedDateForDayView(null); }

  const handleViewCalendarRecipeDetail = (recipeId: string) => {
    const recipeFromHistory = recipeHistory.find(r => r.id === recipeId);
    const recipeFromSaved = savedRecipes.find(s => s.id === recipeId);
    let recipeToView = recipeFromHistory || recipeFromSaved;
    if (recipeToView) { setCalendarRecipeDetail(recipeToView); }
    else {
        const calendarEntryRecipe = calendarEntries.find(e => e.recipeId === recipeId);
        if (calendarEntryRecipe) {
             const minimalRecipe: Recipe = { id: calendarEntryRecipe.recipeId, title: calendarEntryRecipe.recipeTitle, cuisine: 'Any', description: "Details may be limited for this calendar entry if original recipe data is not found in history or saved items.", prepTime: "N/A", cookTime: "N/A", servings: "N/A", ingredientsUsed: [], instructions: ["Full instructions may not be available if the original recipe is no longer in your history or saved lists."], timestamp: calendarEntryRecipe.timestamp, };
            setCalendarRecipeDetail(minimalRecipe);
        } else { setError("Could not find details for the selected recipe to view in calendar context."); setCalendarRecipeDetail(null); return; }
    }
    setError(null); setIsCalendarRecipeDetailModalOpen(true);
    if (isDayViewModalOpen) setIsDayViewModalOpen(false);
    if (isEditCalendarEntryModalOpen) setIsEditCalendarEntryModalOpen(false);
  };

  const handleCloseCalendarRecipeDetailModal = () => {
    setIsCalendarRecipeDetailModalOpen(false); setCalendarRecipeDetail(null);
    if (entryToEdit) { setIsEditCalendarEntryModalOpen(true); }
    else if (selectedDateForDayView) { setIsDayViewModalOpen(true); }
  };

  const handleOpenSelectRecipeForSlot = (date: string, slot?: MealSlotType) => {
    if (!currentUser) { handleOpenAuthModal(); return; }
    setSelectRecipeForCalendarContext({ date, slot }); setIsSelectRecipeForCalendarModalOpen(true);
    if (isDayViewModalOpen) setIsDayViewModalOpen(false);
  };

  const handleCancelSelectRecipeForCalendar = () => {
    setIsSelectRecipeForCalendarModalOpen(false); setSelectRecipeForCalendarContext(null);
    if (selectedDateForDayView && currentUser) setIsDayViewModalOpen(true);
  };

  const handleRecipeChosenForCalendar = (selectedRecipe: MinimalRecipeInfo) => {
    if (!currentUser) { handleOpenAuthModal(); return; }
    if (selectRecipeForCalendarContext) { handleOpenAddToCalendarModal( selectedRecipe, selectRecipeForCalendarContext.date, selectRecipeForCalendarContext.slot, 'dayView' ); }
    setIsSelectRecipeForCalendarModalOpen(false); setSelectRecipeForCalendarContext(null);
  };

  const handleSelectIngredient = (ingredient: IngredientDataItem) => {
    if (selectedIngredients.length < MAX_INGREDIENTS && !selectedIngredients.find(i => i.id === ingredient.id)) { setSelectedIngredients(prev => [...prev, ingredient]); }
  };

  const handleRemoveIngredient = (ingredientId: string) => { setSelectedIngredients(prev => prev.filter(i => i.id !== ingredientId)); };

  const clearSelections = () => {
    setSelectedIngredients([]); setSelectedCuisine('Any'); setSelectedAudience('Everyone');
    setDesiredServings(2); setGeneratedRecipe(null); setViewingRecipeFromList(null);
    setError(null); setBatchAddMessage(null);
    if (activeTab !== 'generator') setActiveTab('generator');
  };

  const processBatchAdd = ( names: string[], currentList: IngredientDataItem[], addFunction: (item: IngredientDataItem) => void, limit: number, requireAuth: boolean = false ): string[] => {
    if (requireAuth && !currentUser) { handleOpenAuthModal(); setBatchAddMessage({type: 'info', text: 'Please sign in to manage your kitchen.'}); return []; }
    const added: string[] = []; const notFound: string[] = []; const alreadyPresent: string[] = []; const limitReachedFor: string[] = [];
    names.forEach(originalName => {
      const inputName = originalName.trim(); if (!inputName) return;
      if (currentList.length + added.length >= limit) { limitReachedFor.push(inputName); return; }
      const lowerInputName = inputName.toLowerCase();
      if (currentList.some(item => item.name.toLowerCase() === lowerInputName) || added.some(addedItemName => addedItemName.toLowerCase() === lowerInputName)) { alreadyPresent.push(inputName); return; }
      let foundIngredient = ALL_INGREDIENTS.find(item => item.name.toLowerCase() === lowerInputName);
      if (!foundIngredient) {
        const aliasedCanonicalName = INGREDIENT_ALIASES[lowerInputName];
        if (aliasedCanonicalName) {
          if (currentList.some(item => item.name.toLowerCase() === aliasedCanonicalName.toLowerCase()) || added.some(addedItemName => addedItemName.toLowerCase() === aliasedCanonicalName.toLowerCase())) { alreadyPresent.push(inputName); return; }
          foundIngredient = ALL_INGREDIENTS.find(item => item.name.toLowerCase() === aliasedCanonicalName.toLowerCase());
        }
      }
      if (foundIngredient) {
        if (currentList.some(item => item.id === foundIngredient!.id) || selectedIngredients.some(selItem => selItem.id === foundIngredient!.id && addFunction === handleSelectIngredient) || myKitchenIngredients.some(kitItem => kitItem.id === foundIngredient!.id && addFunction === handleAddToMyKitchen) ) { alreadyPresent.push(inputName); }
        else { addFunction(foundIngredient); added.push(foundIngredient.name); }
      } else { notFound.push(inputName); }
    });
    let messageText = "";
    if (added.length > 0) messageText += `Added: ${added.join(', ')}. `;
    if (notFound.length > 0) messageText += `Not found: ${notFound.join(', ')}. `;
    if (alreadyPresent.length > 0) messageText += `Already present/in list: ${alreadyPresent.join(', ')}. `;
    if (limitReachedFor.length > 0) messageText += `Max limit reached, could not add: ${limitReachedFor.join(', ')}.`;
    setBatchAddMessage({ type: added.length > 0 ? 'success' : (notFound.length > 0 || alreadyPresent.length > 0 || limitReachedFor.length > 0 ? 'info' : 'info'), text: messageText.trim() || "No new ingredients were added from the list." });
    return added;
  };


  const handleBatchAddIngredientsToSelection = (ingredientNames: string[]) => { processBatchAdd(ingredientNames, selectedIngredients, handleSelectIngredient, MAX_INGREDIENTS); };
  const handleBatchAddIngredientsToKitchen = (ingredientNames: string[]) => { processBatchAdd(ingredientNames, myKitchenIngredients, handleAddToMyKitchen, Infinity, true); };

  const grantExtraGeneration = () => {
    if (!currentUser) { handleOpenAuthModal(); return; }
    setGenerationStatus(prev => ({...prev, extraGenerationsGranted: prev.extraGenerationsGranted + 1}));
    setUpgradeModalInfo(prev => ({...prev, isOpen: false}));
  };

  const checkAndResetGenerationCount = () => {
    if (!currentUser) return false;
    const today = new Date().toISOString().split('T')[0];
    if (generationStatus.lastUsedDate !== today) {
      setGenerationStatus({ count: 0, lastUsedDate: today, extraGenerationsGranted: 0 });
      return true;
    }
    return false;
  };

  const handleGenerateRecipeWithOptions = useCallback(async ( ingredientsToUse: string[], cuisineToUse: CuisineType, audienceToUse: AudienceType, servingsToUse: number, animType: AnimationType, additionalAvoidTitles: string[] = [] ) => {
    if (ingredientsToUse.length === 0) { setError("Please select some ingredients."); return; }
    if (servingsToUse <= 0) { setError("Please enter a valid number of servings."); return; }

    if (!currentUser) {
        if (anonymousGenerationStatus.count >= ANONYMOUS_FREE_GENERATIONS) { handleOpenAuthModal(); return; }
    } else {
        const wasReset = checkAndResetGenerationCount();
        const currentGenCount = wasReset ? 0 : generationStatus.count;
        const extraGranted = wasReset ? 0 : generationStatus.extraGenerationsGranted;
        if (animType !== 'surprising' && !currentUser.isPaid && currentGenCount >= (FREE_TIER_GENERATIONS_PER_DAY + extraGranted)) {
            setUpgradeModalInfo({ isOpen: true, featureName: "Recipe Generations", limitDetails: `You've used your ${FREE_TIER_GENERATIONS_PER_DAY + extraGranted} recipe generations for today.`, premiumBenefit: `Get up to ${PREMIUM_TIER_GENERATIONS_PER_DAY} daily generations with Recipify Pro.`, onGrantExtra: generationStatus.extraGenerationsGranted < 1 ? grantExtraGeneration : undefined });
            return;
        }
    }
    setIsLoading(true); setAnimationType(animType); setError(null); setGeneratedRecipe(null); setViewingRecipeFromList(null); setBatchAddMessage(null);
    try {
      const recentlyCooked = cookedHistory.filter(e => (Date.now() - e.cookedAt) < COOK_HISTORY_MAX_AGE_MS).map(e => e.title);
      const recentlyGenerated = [...new Set(recipeHistory.map(r => r.title))].slice(0, RECENTLY_GENERATED_COUNT);
      const explicitlyExcluded = recipeHistory.filter(r => excludedRecipeIds.includes(r.id)).map(r => r.title);
      const allTitlesToAvoid = [...new Set([...recentlyCooked, ...recentlyGenerated, ...explicitlyExcluded, ...additionalAvoidTitles])];

      const resultFromAI = await generateRecipeFromBackend( ingredientsToUse, cuisineToUse, audienceToUse, servingsToUse, allTitlesToAvoid );

      if (isActualRecipe(resultFromAI)) {
        const fullRecipe = addRecipeToHistory(resultFromAI, cuisineToUse);
        setGeneratedRecipe(fullRecipe);
        if (!currentUser) { setAnonymousGenerationStatus(prev => ({ count: prev.count + 1 })); }
        else {
            setGenerationStatus(prev => ({ ...prev, count: prev.count + 1, lastUsedDate: new Date().toISOString().split('T')[0] }));
            if (userProgress) { updateUserMetric('generatedRecipeCount', 1); }
        }
        if (animType === 'generating') {
            const usedIngredientData = ingredientsToUse.map(name => ALL_INGREDIENTS.find(ing => ing.name === name)).filter(Boolean) as IngredientDataItem[];
            setRecentlyUsedForGenerator([...usedIngredientData].slice(0, MAX_RECENT_ITEMS_DISPLAY));
            if (currentUser && userProgress) {
                const canonicalIngredientNames = fullRecipe.ingredientsUsed.map(recipeIng => { const found = ALL_INGREDIENTS.find(dataIng => dataIng.name.toLowerCase() === recipeIng.name.toLowerCase()); return found ? found.name : null; }).filter(Boolean) as string[];
                updateUserMetric('distinctIngredientsUsed', canonicalIngredientNames);
            }
        }
        setActiveTab('generator');
      } else if (isRecipeError(resultFromAI)) { setError(resultFromAI.error); if (animType === 'surprising') setActiveTab('mykitchen'); }
      else { setError("Received an unexpected response format from the server."); if (animType === 'surprising') setActiveTab('mykitchen'); }
    } catch (e: unknown) {
      console.error("Error generating recipe via backend:", e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to generate recipe. ${errorMessage}`);
      if (animType === 'surprising') setActiveTab('mykitchen');
    } finally {
      setIsLoading(false); setAnimationType('none');
    }
  }, [ addRecipeToHistory, cookedHistory, recipeHistory, currentUser, generationStatus, excludedRecipeIds, userProgress, updateUserMetric, anonymousGenerationStatus, handleOpenAuthModal ]);

  const handleGenerateRecipe = useCallback(() => { handleGenerateRecipeWithOptions( selectedIngredients.map(ing => ing.name), selectedCuisine, selectedAudience, desiredServings, 'generating' ); }, [selectedIngredients, selectedCuisine, selectedAudience, desiredServings, handleGenerateRecipeWithOptions]);

  const handleSurpriseMeRecipe = useCallback(async () => {
    if (!currentUser && myKitchenIngredients.length === 0) { setError("Your kitchen is empty! Add some ingredients first."); setActiveTab('mykitchen'); return; }
    if (currentUser && myKitchenIngredients.length === 0) { setError("Your kitchen is empty! Add some ingredients first."); setActiveTab('mykitchen'); return; }
    if (desiredServings <= 0) { setError("Please set valid servings in generator options."); setActiveTab('generator'); return; }
    await handleGenerateRecipeWithOptions( myKitchenIngredients.map(ing => ing.name), selectedCuisine, selectedAudience, desiredServings, 'surprising' );
    if (currentUser) {
        const newTimestamp = Date.now();
        const newCount = (newTimestamp - surpriseMeStatus.lastUsedTimestamp >= ONE_WEEK_MS) ? 1 : surpriseMeStatus.countThisWeek + 1;
        setSurpriseMeStatus({ countThisWeek: newCount, lastUsedTimestamp: newTimestamp });
    }
  }, [ myKitchenIngredients, selectedCuisine, selectedAudience, desiredServings, surpriseMeStatus, handleGenerateRecipeWithOptions, currentUser, anonymousGenerationStatus ]); 

  const handleRegenerateRecipe = useCallback((originalRecipe: Recipe) => {
    const ingredientDataItemsFromRecipe = originalRecipe.ingredientsUsed.map((ing: RecipeIngredient) => ALL_INGREDIENTS.find(dataIng => dataIng.name === ing.name)).filter(Boolean) as IngredientDataItem[];
    if (ingredientDataItemsFromRecipe.length === 0) { setError("Cannot re-roll: Original recipe ingredients couldn't be processed or found."); return; }
    setSelectedIngredients(ingredientDataItemsFromRecipe);
    const cuisineForRegen = originalRecipe.cuisine || selectedCuisine;
    handleGenerateRecipeWithOptions( ingredientDataItemsFromRecipe.map(item => item.name), cuisineForRegen, selectedAudience, desiredServings, 'generating', [originalRecipe.title] );
    setActiveTab('generator');
  }, [selectedCuisine, selectedAudience, desiredServings, handleGenerateRecipeWithOptions, setSelectedIngredients]);


  const handleTabChange = (tab: ActiveTab) => {
    if (!currentUser && (tab === 'calendar' || tab === 'mykitchen' || tab === 'history' || tab === 'saved' || tab === 'feed')) {
        handleOpenAuthModal();
    }
    setActiveTab(tab);
    setViewingRecipeFromList(null); setGeneratedRecipe(null); setError(null); setBatchAddMessage(null);
    setIsDayViewModalOpen(false); setIsCalendarRecipeDetailModalOpen(false); setIsSelectRecipeForCalendarModalOpen(false);
    setIsAddToCalendarModalOpen(false); setIsEditCalendarEntryModalOpen(false); setIsProfilePanelOpen(false);
    setIsCommunityPostDetailModalOpen(false);
    setHistorySearchTerm(''); setHistoryFilterCuisine('All'); setSavedSearchTerm(''); setSavedFilterCuisine('All');
  };

  const handleViewRecipeDetailsFromList = (recipeId: string) => {
    const recipeFromHistory = recipeHistory.find(r => r.id === recipeId);
    const recipeFromSaved = savedRecipes.find(s => s.id === recipeId);
    let recipeToView = recipeFromHistory || recipeFromSaved;
    if (recipeToView) { setViewingRecipeFromList(recipeToView); setGeneratedRecipe(null); }
    else { setError("Could not find details for the selected recipe."); setViewingRecipeFromList(null); }
    setError(null);
  };

  const recipeToDisplayOnMainTab = viewingRecipeFromList || generatedRecipe;
  const isCurrentRecipeSaved = recipeToDisplayOnMainTab && currentUser ? savedRecipes.some(r => r.id === recipeToDisplayOnMainTab.id) : false;
  const isRecipeRecentlyCooked = (recipeId: string): boolean => {
    if (!currentUser) return false;
    const now = Date.now();
    return cookedHistory.some(entry => entry.recipeId === recipeId && (now - entry.cookedAt) < COOK_HISTORY_MAX_AGE_MS);
  }

  const cuisineOptions: { value: CuisineType; label: string }[] = [ { value: 'Any', label: 'Any Cuisine' },{ value: 'American', label: 'American' },{ value: 'Chinese', label: 'Chinese' },{ value: 'French', label: 'French' },{ value: 'Indian', label: 'Indian' },{ value: 'Italian', label: 'Italian' },{ value: 'Japanese', label: 'Japanese' },{ value: 'Korean', label: 'Korean' },{ value: 'Mediterranean', label: 'Mediterranean' },{ value: 'Mexican', label: 'Mexican' },{ value: 'Middle Eastern', label: 'Middle Eastern' },{ value: 'Thai', label: 'Thai' },{ value: 'Dessert', label: 'Dessert' }, ];
  const filterCuisineOptions: { value: CuisineType | 'All'; label: string }[] = [ { value: 'All', label: 'All Cuisines' }, ...cuisineOptions.filter(c => c.value !== 'Any') ];
  const audienceOptions: { value: AudienceType; label: string }[] = [ { value: 'Everyone', label: 'Everyone' },{ value: 'Baby (6-8 months)', label: 'Baby (6-8 months)' },{ value: 'Baby (9-12 months)', label: 'Baby (9-12 months)' },{ value: 'Baby (12+ months)', label: 'Baby (12+ months)' }, ];

  const dailyGenerationsUsed = currentUser ? (generationStatus.lastUsedDate === new Date().toISOString().split('T')[0] ? generationStatus.count : 0) : anonymousGenerationStatus.count;
  const dailyGenerationsLimit = currentUser?.isPaid ? PREMIUM_TIER_GENERATIONS_PER_DAY : currentUser ? (FREE_TIER_GENERATIONS_PER_DAY + generationStatus.extraGenerationsGranted) : ANONYMOUS_FREE_GENERATIONS;
  const canGenerate = currentUser ? (dailyGenerationsUsed < dailyGenerationsLimit) : (anonymousGenerationStatus.count < ANONYMOUS_FREE_GENERATIONS);

  const generatorForm = (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl space-y-6">
      {!currentUser && anonymousGenerationStatus.count === 0 && (
        <div className="bg-[#E0F2F1] p-3 text-center text-[#394240] text-sm rounded-md shadow-inner">
            ✨ Try Recipify – generate one recipe before signing up! ✨
        </div>
      )}
      <p className="text-[#607D8B] text-center text-lg"> Select ingredients and options below, and let our kitchen craft your next meal. </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div> <label htmlFor="cuisine-select" className="block text-sm font-medium text-[#394240] mb-1">Preferred Cuisine:</label> <select id="cuisine-select" value={selectedCuisine} onChange={(e) => setSelectedCuisine(e.target.value as CuisineType)} disabled={isLoading} className="w-full p-3 border border-slate-300 bg-white rounded-lg shadow-sm focus:ring-[#80CBC4] focus:border-[#80CBC4] transition-colors duration-150 disabled:bg-neutral-200 disabled:text-neutral-500" > {cuisineOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)} </select> </div>
        <div> <label htmlFor="audience-select" className="block text-sm font-medium text-[#394240] mb-1">Recipe For:</label> <select id="audience-select" value={selectedAudience} onChange={(e) => setSelectedAudience(e.target.value as AudienceType)} disabled={isLoading} className="w-full p-3 border border-slate-300 bg-white rounded-lg shadow-sm focus:ring-[#80CBC4] focus:border-[#80CBC4] transition-colors duration-150 disabled:bg-neutral-200 disabled:text-neutral-500" > {audienceOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)} </select> </div>
        <div> <label htmlFor="servings-input" className="block text-sm font-medium text-[#394240] mb-1">Servings:</label> <input type="number" id="servings-input" value={desiredServings} onChange={(e) => setDesiredServings(Math.max(1, parseInt(e.target.value, 10) || 1))} min="1" disabled={isLoading} className="w-full p-3 border border-slate-300 bg-white rounded-lg shadow-sm focus:ring-[#80CBC4] focus:border-[#80CBC4] transition-colors duration-150 disabled:bg-neutral-200 disabled:text-neutral-500" /> </div>
      </div>
      <IngredientSelector allIngredients={ALL_INGREDIENTS} selectedIngredients={selectedIngredients} onSelectIngredient={handleSelectIngredient} onRemoveIngredient={handleRemoveIngredient} maxIngredients={MAX_INGREDIENTS} disabled={isLoading} recentlyUsedIngredients={recentlyUsedForGenerator} onBatchAdd={handleBatchAddIngredientsToSelection} batchAddMessage={batchAddMessage} clearBatchAddMessage={() => setBatchAddMessage(null)} setBatchAddMessage={setBatchAddMessage} currentUser={currentUser} anonymousGenerationStatus={anonymousGenerationStatus} />
      {myKitchenIngredients.length > 0 && currentUser && (
         <div className="pt-4 border-t border-neutral-200"> <button onClick={handleAddAllFromMyKitchenToSelection} disabled={isLoading || selectedIngredients.length >= MAX_INGREDIENTS} className="w-full flex items-center justify-center gap-2 bg-[#E0F2F1] hover:bg-[#B2DFDB] disabled:bg-neutral-200 text-[#00796B] disabled:text-neutral-500 font-medium py-2.5 px-4 rounded-lg transition-colors duration-150 text-sm" title="Add all ingredients from 'My Kitchen' to current selection (up to max limit)" > <KitchenIcon className="w-4 h-4"/> Add All from My Kitchen ({myKitchenIngredients.length}) </button> {selectedIngredients.length >= MAX_INGREDIENTS && <p className="text-xs text-[#FF8A65] mt-1 text-center">Max ingredients reached for generator.</p>} </div>
      )}
      <div className="flex flex-col sm:flex-row gap-3">
           <button onClick={handleGenerateRecipe} disabled={isLoading || selectedIngredients.length === 0 || desiredServings <=0 || !canGenerate} className="flex-grow flex items-center justify-center gap-2 bg-[#9CCC65] hover:bg-[#8BC34A] disabled:bg-[#BDBDBD] text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#9CCC65] focus:ring-offset-2 text-lg shadow-md" aria-label="Generate Recipe with selected options" > {isLoading && animationType === 'generating' ? 'Cooking...' : isLoading ? 'Thinking...' : 'Generate Recipe'} {!isLoading && <SparklesIcon />} </button>
        <button onClick={clearSelections} disabled={isLoading} className="flex-shrink-0 flex items-center justify-center gap-2 bg-[#546E7A] hover:bg-[#455A64] disabled:bg-[#BDBDBD] text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#546E7A] focus:ring-offset-2 text-lg shadow-md" aria-label="Clear all selections" > <TrashIcon /> Clear </button>
      </div>
      {!canGenerate && !currentUser && ( <p className="text-sm text-center text-[#FF8A65] mt-2"> You've used your free recipe! <button onClick={handleOpenAuthModal} className="underline font-semibold hover:text-[#E65100]">Sign up</button> to generate more. </p> )}
    </div>
  );

  // Main page loader based on loadingAuth state
  if (loadingAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA]">
        <LoadingSpinner />
        <p className="text-[#607D8B] mt-2">Loading Recipify...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-[#394240]">
      <Header user={currentUser} authStatus={authStatus} onOpenAuthModal={handleOpenAuthModal} onSignOut={handleSignOut} onTogglePaid={handleTogglePaidStatus} dailyGenerations={{used: dailyGenerationsUsed, limit: dailyGenerationsLimit }} onToggleProfilePanel={handleToggleProfilePanel} hasNewAchievements={!!newlyUnlockedAchievement && !!userProgress && !userProgress.viewedAchievements.includes(newlyUnlockedAchievement.id)} />
      <Tabs activeTab={activeTab} onTabChange={handleTabChange} isUserPaid={currentUser?.isPaid || false} />
      {isLoading && animationType !== 'none' && <CookingAnimation type={animationType} />}
      {!currentUser?.isPaid && activeTab === 'generator' && ( <div className="container mx-auto px-4 py-2 max-w-3xl"> <div className="bg-[#E0F2F1] p-3 text-center text-[#394240] text-sm rounded-md shadow"> ✨ <button onClick={handleTogglePaidStatus} className="underline font-semibold hover:text-[#80CBC4]">Upgrade to Recipify Pro</button> for an ad-free experience & more features! ✨ </div> </div> )}
      <main className="flex-grow container mx-auto px-4 py-8 max-w-3xl">
        {activeTab === 'generator' && generatorForm}
        {activeTab === 'history' && ( <RecipeList recipes={recipeHistory} onSelectRecipe={(recipe) => { handleViewRecipeDetailsFromList(recipe.id); }} title="Recipe History" emptyMessage="You haven't generated any recipes yet." excludedRecipeIds={excludedRecipeIds} onToggleExcludeRecipe={handleToggleExcludeRecipe} onAddToCalendar={(recipeInfo) => handleOpenAddToCalendarModal(recipeInfo)} searchTerm={historySearchTerm} onSearchTermChange={setHistorySearchTerm} filterCuisine={historyFilterCuisine} onFilterCuisineChange={setHistoryFilterCuisine} cuisineOptions={filterCuisineOptions} cookedHistory={cookedHistory} onRemoveItem={currentUser ? handleRemoveRecipeFromHistory : undefined} onOpenConfirmModal={currentUser ? handleOpenConfirmModal : undefined}  currentUser={currentUser} onOpenSignUpPromptModal={handleOpenAuthModal} /> )}
        {activeTab === 'saved' && ( <RecipeList recipes={savedRecipes} onSelectRecipe={(recipe) => { handleViewRecipeDetailsFromList(recipe.id); }} title="Saved Recipes" emptyMessage="You haven't saved any recipes yet." excludedRecipeIds={excludedRecipeIds} onToggleExcludeRecipe={handleToggleExcludeRecipe} onAddToCalendar={(recipeInfo) => handleOpenAddToCalendarModal(recipeInfo)} searchTerm={savedSearchTerm} onSearchTermChange={setSavedSearchTerm} filterCuisine={savedFilterCuisine} onFilterCuisineChange={setSavedFilterCuisine} cuisineOptions={filterCuisineOptions} cookedHistory={cookedHistory} currentUser={currentUser} onOpenSignUpPromptModal={handleOpenAuthModal} /> )}
        {activeTab === 'mykitchen' && ( <MyKitchen allIngredients={ALL_INGREDIENTS} myKitchenIngredients={myKitchenIngredients} onAddToMyKitchen={handleAddToMyKitchen} onRemoveFromMyKitchen={handleRemoveFromMyKitchen} maxIngredients={Infinity}  disabled={isLoading || (!currentUser && myKitchenIngredients.length > 0) } onSurpriseMe={handleSurpriseMeRecipe} isLoading={isLoading && animationType === 'surprising'} recentlyAddedIngredients={recentlyAddedToKitchen} onBatchAdd={handleBatchAddIngredientsToKitchen} batchAddMessage={batchAddMessage} clearBatchAddMessage={() => setBatchAddMessage(null)} setBatchAddMessage={setBatchAddMessage} animationType={animationType} currentUser={currentUser} anonymousGenerationStatus={anonymousGenerationStatus} onOpenSignUpPromptModal={handleOpenAuthModal} canGenerate={canGenerate} /> )}
        {activeTab === 'calendar' && ( currentUser ? ( <MealCalendar entries={calendarEntries} onSelectDay={handleOpenDayViewModal} currentUser={currentUser} onShowUpgradeModal={(feature, limit, benefit) => setUpgradeModalInfo({ isOpen: true, featureName: feature, limitDetails: limit, premiumBenefit: benefit })} /> ) : ( <div className="text-center p-8 bg-white rounded-lg shadow-xl"> <h3 className="text-xl font-semibold text-[#394240] mb-3">Meal Calendar is a Perk!</h3> <p className="text-[#607D8B] mb-4">Sign up or sign in to plan your meals and keep track of your culinary adventures.</p> <button onClick={handleOpenAuthModal} className="bg-[#9CCC65] hover:bg-[#8BC34A] text-white font-semibold py-2.5 px-6 rounded-lg transition-colors" > Sign Up / Sign In </button> </div> ) )}
        {activeTab === 'feed' && ( <FeedPage posts={communityPosts} currentUser={currentUser} onViewPost={handleViewCommunityPostDetail} onLikePost={handleLikePost} onFollowUser={handleFollowUser} onOpenSignUpPromptModal={handleOpenAuthModal} /> )}
        {isLoading && animationType === 'none' && <div className="mt-6"><LoadingSpinner /></div>}
        {error && !isLoading && <div className="mt-6"><ErrorMessage message={error} /></div>}
        {recipeToDisplayOnMainTab && !isLoading && !error && activeTab !== 'calendar' && activeTab !== 'feed' && (
          <div className={`mt-6 ${activeTab !== 'generator' || generatedRecipe ? 'border-t border-neutral-300 pt-6' : ''}`}>
            { (activeTab !== 'generator' || generatedRecipe) && <h3 className="text-xl font-semibold text-[#80CBC4] mb-3"> {activeTab === 'history' && viewingRecipeFromList ? 'Viewing from History:' : activeTab === 'saved' && viewingRecipeFromList ? 'Viewing Saved Recipe:' : generatedRecipe && activeTab === 'generator' ? '' : 'Viewing Recipe:'} </h3> }
            <RecipeDisplay recipe={recipeToDisplayOnMainTab} onSaveRecipe={handleSaveRecipe} onUnsaveRecipe={handleUnsaveRecipe} isRecipeSaved={isCurrentRecipeSaved} onMarkAsCooked={handleMarkRecipeAsCooked} onUnmarkAsCooked={handleUnmarkRecipeAsCooked} isRecentlyCooked={isRecipeRecentlyCooked(recipeToDisplayOnMainTab.id)} cookedTimestamp={currentUser ? cookedHistory.find(c => c.recipeId === recipeToDisplayOnMainTab.id)?.cookedAt : undefined} excludedRecipeIds={excludedRecipeIds} onToggleExcludeRecipe={handleToggleExcludeRecipe} onRegenerate={handleRegenerateRecipe} onAddToCalendar={(recipeInfo) => handleOpenAddToCalendarModal(recipeInfo)} currentUser={currentUser} anonymousGenerationStatus={anonymousGenerationStatus} onOpenSignUpPromptModal={handleOpenAuthModal} canGenerate={canGenerate} />
          </div>
        )}
      </main>
      <Footer />
      {upgradeModalInfo.isOpen && ( <UpgradeModal isOpen={upgradeModalInfo.isOpen} onClose={() => setUpgradeModalInfo(prev => ({ ...prev, isOpen: false }))} featureName={upgradeModalInfo.featureName} limitDetails={upgradeModalInfo.limitDetails} premiumBenefit={upgradeModalInfo.premiumBenefit} onUpgrade={handleTogglePaidStatus} onGrantExtra={upgradeModalInfo.onGrantExtra} /> )}
      {isAuthModalOpen && ( <AuthModal isOpen={isAuthModalOpen} onClose={handleCloseAuthModal} onEmailSignUp={handleEmailSignUp} onEmailSignIn={handleEmailSignIn} onGoogleAuth={handleGoogleAuth} /> )}
      {isAddToCalendarModalOpen && recipeForCalendar && currentUser && ( <AddToCalendarModal isOpen={isAddToCalendarModalOpen} onClose={handleCloseAddToCalendarModal} recipe={recipeForCalendar} onAddEntry={handleAddRecipeToCalendar} currentUser={currentUser} onShowUpgradeModal={(feature, limit, benefit) => setUpgradeModalInfo({ isOpen: true, featureName: feature, limitDetails: limit, premiumBenefit: benefit })} prefillDate={prefillCalendarDate} prefillSlot={prefillCalendarSlot} /> )}
      {isEditCalendarEntryModalOpen && entryToEdit && currentUser && ( <EditCalendarEntryModal isOpen={isEditCalendarEntryModalOpen} onClose={handleCloseEditCalendarEntryModal} entry={entryToEdit} onUpdateEntry={handleUpdateCalendarEntry} onRemoveEntry={(entryId) => {  handleOpenConfirmModal( "Confirm Removal", <>Are you sure you want to remove "<strong>{entryToEdit?.recipeTitle}</strong>" from your calendar?</>, () => handleRemoveRecipeFromCalendar(entryId), "Remove", "Cancel" ); }} onViewRecipeDetails={(recipeId) => handleViewCalendarRecipeDetail(recipeId)} currentUser={currentUser} onShowUpgradeModal={(feature, limit, benefit) => setUpgradeModalInfo({ isOpen: true, featureName: feature, limitDetails: limit, premiumBenefit: benefit })} /> )}
      {isDayViewModalOpen && selectedDateForDayView && currentUser && ( <DayViewModal isOpen={isDayViewModalOpen} onClose={handleCloseDayViewModal} date={selectedDateForDayView} entries={calendarEntries.filter(e => e.date === selectedDateForDayView)} currentUser={currentUser} onRequestAddEntryToSlot={handleOpenSelectRecipeForSlot} onOpenEditCalendar={handleOpenEditCalendarEntryModal} onViewCalendarRecipeDetail={handleViewCalendarRecipeDetail} onMoveEntry={handleMoveCalendarEntry} onShowUpgradeModal={(feature, limit, benefit) => setUpgradeModalInfo({ isOpen: true, featureName: feature, limitDetails: limit, premiumBenefit: benefit })} onOpenSignUpPromptModal={handleOpenAuthModal} /> )}
      {isCalendarRecipeDetailModalOpen && calendarRecipeDetail && ( <CalendarRecipeDetailModal isOpen={isCalendarRecipeDetailModalOpen} onClose={handleCloseCalendarRecipeDetailModal} recipe={calendarRecipeDetail} onSaveRecipe={handleSaveRecipe} onUnsaveRecipe={handleUnsaveRecipe} isRecipeSaved={isCurrentRecipeSaved} onMarkAsCooked={handleMarkRecipeAsCooked} onUnmarkAsCooked={handleUnmarkRecipeAsCooked} isRecentlyCooked={currentUser ? isRecipeRecentlyCooked(calendarRecipeDetail.id) : false} cookedTimestamp={currentUser ? cookedHistory.find(c => c.recipeId === calendarRecipeDetail.id)?.cookedAt : undefined} excludedRecipeIds={excludedRecipeIds} onToggleExcludeRecipe={handleToggleExcludeRecipe} onRegenerate={handleRegenerateRecipe} onAddToCalendar={(recipeInfo) => handleOpenAddToCalendarModal(recipeInfo, undefined, undefined, 'calendarDetailView')} currentUser={currentUser} anonymousGenerationStatus={anonymousGenerationStatus} onOpenSignUpPromptModal={handleOpenAuthModal} canGenerate={canGenerate} /> )}
      {isSelectRecipeForCalendarModalOpen && selectRecipeForCalendarContext && currentUser && ( <SelectRecipeForCalendarModal isOpen={isSelectRecipeForCalendarModalOpen} onClose={handleCancelSelectRecipeForCalendar} onRecipeSelect={handleRecipeChosenForCalendar} recipeHistory={recipeHistory} savedRecipes={savedRecipes} currentUser={currentUser} /> )}
      {isCommunityPostDetailModalOpen && selectedCommunityPost && ( <CommunityPostDetailModal isOpen={isCommunityPostDetailModalOpen} onClose={handleCloseCommunityPostDetailModal} post={selectedCommunityPost} onLikePost={handleLikePost} onFollowUser={handleFollowUser} currentUser={currentUser} onOpenSignUpPromptModal={handleOpenAuthModal} /> )}
      {currentUser && userProgress && ( <ProfilePanel isOpen={isProfilePanelOpen} onClose={handleToggleProfilePanel} user={currentUser} progress={userProgress} achievementsConfig={ACHIEVEMENTS_CONFIG} onViewedAchievement={(achievementId) => { setUserProgress(prev => prev ? { ...prev, viewedAchievements: [...new Set([...prev.viewedAchievements, achievementId])] } : null); }} /> )}
      {newlyUnlockedAchievement && ( <AchievementToast achievement={newlyUnlockedAchievement} onClose={() => setNewlyUnlockedAchievement(null)} /> )}
      {confirmModalState.isOpen && ( <ConfirmModal isOpen={confirmModalState.isOpen} onClose={handleCloseConfirmModal} onConfirm={handleExecuteConfirm} title={confirmModalState.title} message={confirmModalState.message} confirmText={confirmModalState.confirmText} cancelText={confirmModalState.cancelText} /> )}
    </div>
  );
};

export default App;