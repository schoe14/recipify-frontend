
import React from 'react';
import type { CommunityPost, User, CommunityPostId } from '../types';

interface CommunityPostCardProps {
  post: CommunityPost;
  currentUser: User | null;
  onViewPost: (post: CommunityPost) => void;
  onLikePost: (postId: CommunityPostId) => void;
  onFollowUser: (userId: string) => void;
  layout?: 'grid' | 'list'; 
  onOpenSignUpPromptModal: () => void;
}

const HeartIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
  </svg>
);

const ChatBubbleLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m2.252 4.906a2.25 2.25 0 0 1-2.252 2.25H4.5A2.25 2.25 0 0 1 2.25 18V7.5A2.25 2.25 0 0 1 4.5 5.25h9.75a2.25 2.25 0 0 1 2.25 2.25Z" />
  </svg>
);

const UserPlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3.375 19.5h17.25c.621 0 1.125-.504 1.125-1.125V6.375c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125Z" />
    </svg>
);

const PremiumBadge: React.FC = () => (
    <span className="inline-flex items-center gap-1 text-xs font-semibold bg-[#FFECB3] text-[#FF8F00] px-1.5 py-0.5 rounded-full">
        ⭐ Pro Creator
    </span>
);


export const CommunityPostCard: React.FC<CommunityPostCardProps> = ({ post, currentUser, onViewPost, onLikePost, onFollowUser, layout = 'grid', onOpenSignUpPromptModal }) => {
  const cardBaseClasses = "bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl";
  const isOwnPost = currentUser?.id === post.authorId;

  return (
    <div className={`${cardBaseClasses} ${layout === 'list' ? 'flex flex-col sm:flex-row' : 'flex flex-col'}`}>
      <div 
        className={`bg-neutral-200 ${layout === 'list' ? 'sm:w-1/3 h-48 sm:h-auto' : 'h-48'} flex items-center justify-center cursor-pointer`}
        onClick={() => onViewPost(post)}
      >
         {post.imageUrl ? (
            <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
        ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 text-neutral-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
        )}
      </div>

      <div className={`p-4 flex flex-col flex-grow ${layout === 'list' ? 'sm:w-2/3' : ''}`}>
        <h3 
            className="text-lg font-semibold text-[#394240] mb-1.5 font-['Poppins'] cursor-pointer hover:text-[#80CBC4] truncate"
            onClick={() => onViewPost(post)}
            title={post.title}
        >
            {post.title}
        </h3>
        
        <div className="flex items-center gap-2 mb-2 text-xs text-[#607D8B] font-['Roboto']">
            {post.authorAvatarUrl ? (
                <img src={post.authorAvatarUrl} alt={post.authorName} className="w-5 h-5 rounded-full"/>
            ) : (
                <UserPlusIcon className="w-5 h-5 text-neutral-400"/>
            )}
            <span>by {post.authorName}</span>
            {post.isAuthorPro && <PremiumBadge />}
        </div>
        
        {layout === 'grid' && (
            <p className="text-sm text-[#607D8B] mb-3 font-['Roboto'] flex-grow min-h-[40px] overflow-hidden text-ellipsis line-clamp-2" title={post.description}>
            {post.description}
            </p>
        )}


        <div className="mt-auto flex items-center justify-between pt-2 border-t border-neutral-100">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                if (!currentUser) {
                  onOpenSignUpPromptModal();
                  return;
                }
                onLikePost(post.id);
              }} 
              className="flex items-center gap-1 text-[#FF8A65] hover:text-[#E65100] transition-colors text-sm"
              title="Like post"
            >
              <HeartIcon /> 
              <span>{post.likes}</span>
            </button>
            <button 
                className="flex items-center gap-1 text-[#607D8B] hover:text-[#394240] transition-colors text-sm"
                title="View comments"
                onClick={() => onViewPost(post)}
            >
                <ChatBubbleLeftIcon />
                <span>{post.commentsCount}</span>
            </button>
          </div>
          {!isOwnPost && (
            <button 
                onClick={() => {
                  if (!currentUser) {
                    onOpenSignUpPromptModal(); 
                    return;
                  }
                  onFollowUser(post.authorId);
                }}
                className="text-xs bg-[#E0F2F1] text-[#00796B] hover:bg-[#B2DFDB] px-2.5 py-1 rounded-md transition-colors"
                title={`Follow ${post.authorName}`}
            >
                Follow
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
