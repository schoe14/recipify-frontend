
import React from 'react';
import type { CommunityPost, User, CommunityPostId } from '../types';
import { CommunityPostCard } from './CommunityPostCard';

interface FeedPageProps {
  posts: CommunityPost[];
  currentUser: User | null;
  onViewPost: (post: CommunityPost) => void;
  onLikePost: (postId: CommunityPostId) => void;
  onFollowUser: (userId: string) => void;
  onOpenSignUpPromptModal: () => void;
}

export const FeedPage: React.FC<FeedPageProps> = ({ posts, currentUser, onViewPost, onLikePost, onFollowUser, onOpenSignUpPromptModal }) => {
  // For MVP, "Top" and "New" will show all posts. Sorting/filtering can be added later.
  const topPosts = [...posts].sort((a, b) => b.likes - a.likes).slice(0, 5); // Example: Top 5 by likes
  const newPosts = [...posts].sort((a, b) => b.timestamp - a.timestamp); // Sort by newest

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-[#394240] mb-4 font-['Poppins']">🔥 Top Recipes This Week</h2>
        {topPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topPosts.map(post => (
              <CommunityPostCard 
                key={post.id} 
                post={post} 
                currentUser={currentUser}
                onViewPost={onViewPost} 
                onLikePost={onLikePost}
                onFollowUser={onFollowUser}
                onOpenSignUpPromptModal={onOpenSignUpPromptModal} 
              />
            ))}
          </div>
        ) : (
          <p className="text-neutral-500 text-center py-4 font-['Roboto']">No top posts yet. Be the first to shine!</p>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-bold text-[#394240] mb-4 font-['Poppins']">🆕 Just Posted</h2>
        {newPosts.length > 0 ? (
          <div className="space-y-6">
            {newPosts.map(post => (
              <CommunityPostCard 
                key={post.id} 
                post={post}
                currentUser={currentUser} 
                onViewPost={onViewPost} 
                onLikePost={onLikePost}
                onFollowUser={onFollowUser}
                onOpenSignUpPromptModal={onOpenSignUpPromptModal} 
                layout="list" 
              />
            ))}
          </div>
        ) : (
          <p className="text-neutral-500 text-center py-4 font-['Roboto']">Nothing new yet. Check back soon!</p>
        )}
      </div>
       <div className="text-center py-6">
            <button 
                className="bg-[#80CBC4] hover:bg-[#00796B] text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-150 shadow-md"
                disabled 
            >
                Load More Posts (Coming Soon)
            </button>
        </div>
    </div>
  );
};
