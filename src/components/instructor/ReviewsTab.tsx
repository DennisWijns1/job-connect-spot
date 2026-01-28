import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Star, 
  CheckCircle, 
  MessageCircle, 
  ThumbsUp,
  Calendar,
  User,
  ChevronDown,
  ChevronUp,
  Send
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  lesson: {
    title: string;
  };
  response?: string;
  approved?: boolean;
}

interface ReviewsTabProps {
  reviews: Review[];
  averageRating: number;
}

// Mock reviewer data
const mockReviewers = [
  { id: '1', name: 'Anna De Groot', avatar: 'https://randomuser.me/api/portraits/women/32.jpg' },
  { id: '2', name: 'Koen Van Damme', avatar: 'https://randomuser.me/api/portraits/men/44.jpg' },
  { id: '3', name: 'Lisa Vermeer', avatar: 'https://randomuser.me/api/portraits/women/55.jpg' },
];

export const ReviewsTab = ({ reviews, averageRating }: ReviewsTabProps) => {
  const [expandedReview, setExpandedReview] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const handleSendReply = (reviewId: string) => {
    // In een echte app zou dit naar de database gaan
    console.log('Sending reply to review:', reviewId, replyText);
    setReplyText('');
    setReplyingTo(null);
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star}
            className={`${sizeClass} ${star <= rating ? 'text-accent fill-accent' : 'text-muted-foreground'}`}
          />
        ))}
      </div>
    );
  };

  const ratingBreakdown = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100 : 0
  }));

  return (
    <motion.div
      key="reviews"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4"
    >
      {/* Average Rating Card */}
      <div className="bg-card rounded-2xl p-5 border border-border">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-4xl font-bold text-foreground mb-1">{averageRating.toFixed(1)}</p>
            {renderStars(Math.round(averageRating), 'lg')}
            <p className="text-sm text-muted-foreground mt-1">{reviews.length} reviews</p>
          </div>

          <div className="flex-1 space-y-1.5">
            {ratingBreakdown.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-3">{rating}</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-accent rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-6">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="bg-card rounded-2xl p-8 text-center border border-border">
          <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">Nog geen reviews</h3>
          <p className="text-sm text-muted-foreground">Reviews verschijnen hier wanneer deelnemers je lessen beoordelen</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review, index) => {
            const reviewer = mockReviewers[index % mockReviewers.length];
            const isExpanded = expandedReview === review.id;
            const isReplying = replyingTo === review.id;

            return (
              <div
                key={review.id}
                className="bg-card rounded-2xl border border-border overflow-hidden"
              >
                {/* Review Header */}
                <div className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <img 
                      src={reviewer.avatar}
                      alt={reviewer.name}
                      className="w-10 h-10 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-medium text-foreground">{reviewer.name}</p>
                        {review.approved && (
                          <CheckCircle className="w-4 h-4 text-success" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {renderStars(review.rating, 'sm')}
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString('nl-BE')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Lesson Title */}
                  <Badge variant="secondary" className="mb-2">
                    {review.lesson.title}
                  </Badge>

                  {/* Review Comment */}
                  {review.comment && (
                    <p className="text-sm text-foreground">"{review.comment}"</p>
                  )}
                </div>

                {/* Response Section */}
                {(review.response || isReplying) && (
                  <div className="px-4 pb-4">
                    {review.response && (
                      <div className="bg-secondary/50 rounded-xl p-3 mb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <MessageCircle className="w-3.5 h-3.5 text-primary" />
                          <span className="text-xs font-medium text-primary">Jouw reactie</span>
                        </div>
                        <p className="text-sm text-foreground">{review.response}</p>
                      </div>
                    )}

                    {isReplying && (
                      <div className="space-y-2">
                        <Textarea 
                          placeholder="Schrijf een reactie..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="min-h-20 rounded-xl resize-none"
                        />
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="rounded-lg"
                            onClick={() => setReplyingTo(null)}
                          >
                            Annuleren
                          </Button>
                          <Button 
                            size="sm" 
                            className="rounded-lg bg-primary"
                            onClick={() => handleSendReply(review.id)}
                            disabled={!replyText.trim()}
                          >
                            <Send className="w-3.5 h-3.5 mr-1" />
                            Verstuur
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="px-4 py-3 bg-secondary/30 flex items-center gap-2">
                  {!review.response && !isReplying && (
                    <Button 
                      size="sm" 
                      variant="ghost"
                      className="rounded-lg text-muted-foreground hover:text-foreground"
                      onClick={() => setReplyingTo(review.id)}
                    >
                      <MessageCircle className="w-3.5 h-3.5 mr-1" />
                      Reageren
                    </Button>
                  )}
                  
                  {!review.approved && (
                    <Button 
                      size="sm" 
                      variant="ghost"
                      className="rounded-lg text-muted-foreground hover:text-success"
                    >
                      <CheckCircle className="w-3.5 h-3.5 mr-1" />
                      Goedkeuren
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};
