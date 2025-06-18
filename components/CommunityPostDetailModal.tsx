
import React from 'react';
import type { CommunityPost, User, CommunityPostId } from '../types';

interface CommunityPostDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: CommunityPost | null;
  currentUser: User | null;
  onLikePost: (postId: CommunityPostId) => void;
  onFollowUser: (userId: string) => void;
  onOpenSignUpPromptModal: () => void; 
}

const XMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const HeartIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
  </svg>
);

const PremiumBadge: React.FC = () => (
    <span className="inline-flex items-center gap-1 text-xs font-semibold bg-[#FFECB3] text-[#FF8F00] px-1.5 py-0.5 rounded-full ml-2">
        ⭐ Pro Creator
    </span>
);

const UserPlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3.375 19.5h17.25c.621 0 1.125-.504 1.125-1.125V6.375c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125Z" />
    </svg>
);


export const CommunityPostDetailModal: React.FC<CommunityPostDetailModalProps> = ({ 
    isOpen, onClose, post, currentUser, onLikePost, onFollowUser, 
    onOpenSignUpPromptModal
}) => {
  if (!isOpen || !post) return null;

  const isOwnPost = currentUser?.id === post.authorId;

  const handleLike = () => {
      if (!currentUser) {
          onOpenSignUpPromptModal();
          return;
      }
      onLikePost(post.id);
  }

  const handleFollow = () => {
      if (!currentUser) {
          onOpenSignUpPromptModal();
          return;
      }
      onFollowUser(post.authorId);
  }
  
  const handleCommentPlaceholderClick = () => {
      if (!currentUser) {
          onOpenSignUpPromptModal();
      } else if (!currentUser.isPaid) {
          onOpenSignUpPromptModal(); 
          alert("Commenting is a Recipify Pro feature. Please upgrade to comment!"); 
      }
  }


  return (
    <div 
      className="fixed inset-0 bg-[#394240]/80 flex items-center justify-center z-[1000] p-4 animate-fadeInScale" 
      aria-modal="true" role="dialog" aria-labelledby="community-post-detail-title"
    >
      <div className="bg-[#FAFAFA] rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-neutral-200 sticky top-0 bg-[#FAFAFA] z-10">
          <div className="flex items-center gap-3 overflow-hidden">
            {post.authorAvatarUrl ? (
                <img src={post.authorAvatarUrl} alt={post.authorName} className="w-8 h-8 rounded-full"/>
            ) : (
                <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center">
                    <UserPlusIcon className="w-5 h-5 text-neutral-400"/>
                </div>
            )}
            <div>
                <h2 id="community-post-detail-title" className="text-base sm:text-lg font-semibold text-[#394240] font-['Poppins'] truncate">
                    {post.title}
                </h2>
                <p className="text-xs text-[#607D8B] font-['Roboto']">
                    By {post.authorName} {post.isAuthorPro && <PremiumBadge />}
                </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-neutral-500 hover:text-neutral-700 p-1 rounded-full hover:bg-neutral-100"
            aria-label="Close post details"
          >
            <XMarkIcon />
          </button>
        </div>

        <div className="overflow-y-auto p-4 sm:p-6 space-y-4">
          <div className="bg-neutral-200 h-64 w-full rounded-lg flex items-center justify-center mb-4">
            {post.imageUrl ? (
                <img src={post.imageUrl} alt={post.title} className="max-h-full max-w-full object-contain rounded-lg" />
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-20 h-20 text-neutral-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
            )}
          </div>
          
          <p className="text-md text-[#394240] leading-relaxed font-['Roboto'] whitespace-pre-wrap">
            {post.description}
          </p>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
                {post.tags.map(tag => (
                    <span key={tag} className="text-xs bg-neutral-200 text-neutral-600 px-2 py-0.5 rounded-full">#{tag}</span>
                ))}
            </div>
          )}

          <div className="text-xs text-neutral-500 font-['Roboto']">
            Posted on: {new Date(post.timestamp).toLocaleString()}
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-neutral-200">
            <button 
                onClick={handleLike}
                className="flex items-center gap-1.5 text-[#FF8A65] hover:text-[#E65100] font-semibold py-2 px-3 rounded-md bg-[#FFF0E6] hover:bg-[#FFCCBC] transition-colors text-sm"
            >
                <HeartIcon /> Like ({post.likes})
            </button>
            {!isOwnPost && currentUser && ( 
                 <button 
                    onClick={handleFollow}
                    className="text-sm bg-[#E0F2F1] text-[#00796B] hover:bg-[#B2DFDB] px-3 py-2 rounded-md transition-colors font-semibold"
                >
                    Follow {post.authorName}
                </button>
            )}
             {!isOwnPost && !currentUser && ( 
                 <button 
                    onClick={handleFollow} // This will trigger onOpenSignUpPromptModal via handleFollow
                    className="text-sm bg-[#E0F2F1] text-[#00796B] hover:bg-[#B2DFDB] px-3 py-2 rounded-md transition-colors font-semibold"
                >
                    Follow {post.authorName}
                </button>
            )}
          </div>

          <div className="pt-4">
            <h4 className="text-lg font-semibold text-[#394240] mb-2 font-['Poppins']">Comments ({post.commentsCount})</h4>
            {currentUser?.isPaid ? (
                <p className="text-neutral-500 font-['Roboto']">Comments feature coming soon for Pro users!</p>
            ) : (
                <p className="text-neutral-500 p-3 bg-neutral-100 rounded-md font-['Roboto']">
                    <button onClick={handleCommentPlaceholderClick} className="text-[#80CBC4] hover:underline font-semibold">
                        {currentUser ? 'Upgrade to Pro' : 'Sign up'}
                    </button> to join the conversation and post comments.
                </p>
            )}
          </div>

        </div>
      </div>
      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-fadeInScale {
          animation: fadeInScale 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
