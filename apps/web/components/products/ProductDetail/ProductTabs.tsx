'use client';

/**
 * ProductTabs - Tabbed Content Component for Product Details
 *
 * Features:
 * - Description tab with rich content
 * - Technical specifications/characteristics
 * - Documents tab (PDFs, technical sheets)
 * - Reviews/Questions tab
 * - Responsive tab design
 * - Deep linking support
 *
 * @packageDocumentation
 */

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Settings2,
  Download,
  MessageSquare,
  Star,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FileSpreadsheet,
  FileImage,
  File,
  ThumbsUp,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

// ============================================================================
// Types
// ============================================================================

export type TabId = 'description' | 'specifications' | 'documents' | 'reviews';

export interface ProductSpecification {
  id: string;
  label: string;
  value: string;
  group?: string;
  unit?: string;
}

export interface ProductDocument {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'spreadsheet' | 'other';
  url: string;
  size?: string;
  description?: string;
}

export interface ProductReview {
  id: string;
  author: string;
  authorCompany?: string;
  rating: number;
  date: string;
  title?: string;
  content: string;
  helpful?: number;
  verified?: boolean;
}

export interface ProductQuestion {
  id: string;
  author: string;
  date: string;
  question: string;
  answer?: {
    content: string;
    author: string;
    date: string;
  };
}

export interface ProductTabsProps {
  /** Detailed product description (HTML allowed) */
  description?: string;
  /** Technical specifications */
  specifications?: ProductSpecification[];
  /** Product documents */
  documents?: ProductDocument[];
  /** Product reviews */
  reviews?: ProductReview[];
  /** Product questions */
  questions?: ProductQuestion[];
  /** Initial active tab */
  defaultTab?: TabId;
  /** Callback when tab changes */
  onTabChange?: (tabId: TabId) => void;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Constants
// ============================================================================

const TAB_CONFIG = {
  description: {
    id: 'description' as TabId,
    label: 'Description',
    icon: <FileText className="w-4 h-4" />,
  },
  specifications: {
    id: 'specifications' as TabId,
    label: 'Caracteristiques',
    icon: <Settings2 className="w-4 h-4" />,
  },
  documents: {
    id: 'documents' as TabId,
    label: 'Documents',
    icon: <Download className="w-4 h-4" />,
  },
  reviews: {
    id: 'reviews' as TabId,
    label: 'Avis & Questions',
    icon: <MessageSquare className="w-4 h-4" />,
  },
};

// ============================================================================
// Animation Variants
// ============================================================================

const tabContentVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2 },
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

function getDocumentIcon(type: ProductDocument['type']) {
  switch (type) {
    case 'pdf':
      return <FileText className="w-5 h-5 text-red-500" />;
    case 'image':
      return <FileImage className="w-5 h-5 text-blue-500" />;
    case 'spreadsheet':
      return <FileSpreadsheet className="w-5 h-5 text-green-500" />;
    default:
      return <File className="w-5 h-5 text-neutral-500" />;
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// ============================================================================
// Sub-Components
// ============================================================================

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md';
}

function RatingStars({ rating, maxRating = 5, size = 'md' }: RatingStarsProps) {
  const sizeClass = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  return (
    <div className="flex items-center gap-0.5" aria-label={`Note: ${rating} sur ${maxRating}`}>
      {Array.from({ length: maxRating }).map((_, index) => (
        <Star
          key={index}
          className={cn(
            sizeClass,
            index < rating
              ? 'text-yellow-400 fill-yellow-400'
              : 'text-neutral-200'
          )}
        />
      ))}
    </div>
  );
}

interface SpecificationsTableProps {
  specifications: ProductSpecification[];
}

function SpecificationsTable({ specifications }: SpecificationsTableProps) {
  // Group specifications by group property
  const grouped = specifications.reduce<Record<string, ProductSpecification[]>>(
    (acc, spec) => {
      const group = spec.group || 'Autres';
      if (!acc[group]) acc[group] = [];
      acc[group].push(spec);
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([groupName, specs]) => (
        <div key={groupName}>
          {Object.keys(grouped).length > 1 && (
            <h4 className="text-sm font-medium text-neutral-900 mb-3">
              {groupName}
            </h4>
          )}
          <div className="border border-neutral-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <tbody>
                {specs.map((spec, index) => (
                  <tr
                    key={spec.id}
                    className={cn(
                      index % 2 === 0 ? 'bg-white' : 'bg-neutral-50'
                    )}
                  >
                    <td className="px-4 py-3 text-sm text-neutral-600 font-medium w-1/2">
                      {spec.label}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-900">
                      {spec.value}
                      {spec.unit && (
                        <span className="text-neutral-500 ml-1">{spec.unit}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

interface DocumentsListProps {
  documents: ProductDocument[];
}

function DocumentsList({ documents }: DocumentsListProps) {
  return (
    <div className="grid gap-3">
      {documents.map((doc) => (
        <a
          key={doc.id}
          href={doc.url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'flex items-center gap-4 p-4 rounded-lg',
            'bg-neutral-50 border border-neutral-200',
            'hover:border-accent hover:bg-accent/5',
            'transition-all duration-200 group'
          )}
        >
          <div className="flex-shrink-0">{getDocumentIcon(doc.type)}</div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-neutral-900 group-hover:text-accent truncate">
              {doc.name}
            </div>
            {(doc.description || doc.size) && (
              <div className="text-sm text-neutral-500">
                {doc.description}
                {doc.description && doc.size && ' - '}
                {doc.size}
              </div>
            )}
          </div>
          <ExternalLink className="w-4 h-4 text-neutral-500 group-hover:text-accent transition-colors" />
        </a>
      ))}
    </div>
  );
}

interface ReviewCardProps {
  review: ProductReview;
}

function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
            <User className="w-5 h-5 text-neutral-500" />
          </div>
          <div>
            <div className="font-medium text-neutral-900">{review.author}</div>
            {review.authorCompany && (
              <div className="text-sm text-neutral-500">{review.authorCompany}</div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <RatingStars rating={review.rating} size="sm" />
          {review.verified && (
            <Badge variant="success" size="xs">
              Achat verifie
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      {review.title && (
        <h5 className="font-medium text-neutral-900 mb-2">{review.title}</h5>
      )}
      <p className="text-sm text-neutral-600 leading-relaxed">{review.content}</p>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-200">
        <span className="text-xs text-neutral-500">{formatDate(review.date)}</span>
        {review.helpful !== undefined && (
          <button
            type="button"
            className="flex items-center gap-1 text-xs text-neutral-500 hover:text-accent transition-colors"
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            Utile ({review.helpful})
          </button>
        )}
      </div>
    </div>
  );
}

interface QuestionCardProps {
  question: ProductQuestion;
}

function QuestionCard({ question }: QuestionCardProps) {
  const [isExpanded, setIsExpanded] = useState(!!question.answer);

  return (
    <div className="border border-neutral-200 rounded-lg overflow-hidden">
      {/* Question */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-full flex items-start gap-4 p-4 text-left',
          'hover:bg-neutral-50 transition-colors'
        )}
      >
        <MessageSquare className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-neutral-900 font-medium">{question.question}</p>
          <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500">
            <span>{question.author}</span>
            <span>-</span>
            <span>{formatDate(question.date)}</span>
          </div>
        </div>
        {question.answer && (
          <div className="flex-shrink-0">
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-neutral-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-neutral-500" />
            )}
          </div>
        )}
      </button>

      {/* Answer */}
      <AnimatePresence>
        {isExpanded && question.answer && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pl-12">
              <div className="p-4 bg-neutral-50 rounded-lg">
                <p className="text-sm text-neutral-600">
                  {question.answer.content}
                </p>
                <div className="flex items-center gap-2 mt-2 text-xs text-neutral-500">
                  <Badge variant="primary" size="xs">
                    Reponse officielle
                  </Badge>
                  <span>{formatDate(question.answer.date)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function ProductTabs({
  description,
  specifications = [],
  documents = [],
  reviews = [],
  questions = [],
  defaultTab = 'description',
  onTabChange,
  className,
}: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>(defaultTab);

  // Build visible tabs based on content
  const visibleTabs = [
    description && TAB_CONFIG.description,
    specifications.length > 0 && TAB_CONFIG.specifications,
    documents.length > 0 && TAB_CONFIG.documents,
    (reviews.length > 0 || questions.length > 0) && TAB_CONFIG.reviews,
  ].filter(Boolean) as typeof TAB_CONFIG[keyof typeof TAB_CONFIG][];

  // Handle tab change
  const handleTabChange = useCallback(
    (tabId: TabId) => {
      setActiveTab(tabId);
      onTabChange?.(tabId);
    },
    [onTabChange]
  );

  // Update from URL hash on mount
  useEffect(() => {
    const hash = window.location.hash.replace('#', '') as TabId;
    if (hash && visibleTabs.some((t) => t.id === hash)) {
      setActiveTab(hash);
    }
  }, [visibleTabs]);

  // Calculate review stats
  const reviewStats = reviews.length > 0
    ? {
        average: reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length,
        count: reviews.length,
      }
    : null;

  if (visibleTabs.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Tab Navigation */}
      <div className="border-b border-neutral-200">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide -mb-px">
          {visibleTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const count =
              tab.id === 'documents'
                ? documents.length
                : tab.id === 'reviews'
                ? reviews.length + questions.length
                : undefined;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap',
                  'border-b-2 transition-colors duration-200',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset',
                  isActive
                    ? 'border-accent text-accent'
                    : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-200'
                )}
                role="tab"
                aria-selected={isActive}
                aria-controls={`tabpanel-${tab.id}`}
                id={`tab-${tab.id}`}
              >
                {tab.icon}
                {tab.label}
                {count !== undefined && count > 0 && (
                  <Badge
                    variant={isActive ? 'primary' : 'light'}
                    size="xs"
                  >
                    {count}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          variants={tabContentVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          role="tabpanel"
          id={`tabpanel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
          tabIndex={0}
        >
          {/* Description Tab */}
          {activeTab === 'description' && description && (
            <div
              className="prose prose-sm max-w-none text-neutral-600"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          )}

          {/* Specifications Tab */}
          {activeTab === 'specifications' && specifications.length > 0 && (
            <SpecificationsTable specifications={specifications} />
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && documents.length > 0 && (
            <DocumentsList documents={documents} />
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="space-y-8">
              {/* Review Summary */}
              {reviewStats && (
                <div className="flex items-center gap-6 p-4 bg-neutral-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-neutral-900">
                      {reviewStats.average.toFixed(1)}
                    </div>
                    <RatingStars rating={Math.round(reviewStats.average)} />
                    <div className="text-xs text-neutral-500 mt-1">
                      {reviewStats.count} avis
                    </div>
                  </div>
                </div>
              )}

              {/* Reviews List */}
              {reviews.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-neutral-900">
                    Avis clients ({reviews.length})
                  </h4>
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <ReviewCard key={review.id} review={review} />
                    ))}
                  </div>
                </div>
              )}

              {/* Questions List */}
              {questions.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-neutral-900">
                    Questions & Reponses ({questions.length})
                  </h4>
                  <div className="space-y-3">
                    {questions.map((question) => (
                      <QuestionCard key={question.id} question={question} />
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {reviews.length === 0 && questions.length === 0 && (
                <div className="text-center py-12 text-neutral-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Aucun avis pour le moment</p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default ProductTabs;
