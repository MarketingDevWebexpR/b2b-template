'use client';

import {
  forwardRef,
  useState,
  type ImgHTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/utils';

/**
 * Avatar size configurations - B2B Jewelry Design System
 */
const avatarSizes = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
  '2xl': 'w-20 h-20 text-xl',
  '3xl': 'w-24 h-24 text-2xl',
};

/**
 * Avatar shape variants
 */
const avatarShapes = {
  circle: 'rounded-full',
  square: 'rounded-lg',
  rounded: 'rounded-xl',
};

/**
 * Status indicator positions and colors
 */
const statusColors = {
  online: 'bg-emerald-500',
  offline: 'bg-neutral-400',
  away: 'bg-amber-500',
  busy: 'bg-red-500',
};

const statusSizes = {
  xs: 'w-1.5 h-1.5 border',
  sm: 'w-2 h-2 border',
  md: 'w-2.5 h-2.5 border-2',
  lg: 'w-3 h-3 border-2',
  xl: 'w-3.5 h-3.5 border-2',
  '2xl': 'w-4 h-4 border-2',
  '3xl': 'w-5 h-5 border-2',
};

export interface AvatarProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  /** Image source URL */
  src?: string | null;
  /** Alt text for the image */
  alt?: string;
  /** Fallback text when image fails (initials) */
  fallback?: string;
  /** Size variant */
  size?: keyof typeof avatarSizes;
  /** Shape variant */
  shape?: keyof typeof avatarShapes;
  /** Status indicator */
  status?: keyof typeof statusColors;
  /** Custom fallback icon */
  fallbackIcon?: ReactNode;
  /** Border ring */
  ring?: boolean;
  /** Ring color */
  ringColor?: string;
}

/**
 * Generate initials from a name
 */
function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

/**
 * Generate a deterministic background color based on name
 */
function getColorFromName(name: string): string {
  const colors = [
    'bg-rose-500',
    'bg-pink-500',
    'bg-fuchsia-500',
    'bg-purple-500',
    'bg-violet-500',
    'bg-indigo-500',
    'bg-blue-500',
    'bg-sky-500',
    'bg-cyan-500',
    'bg-teal-500',
    'bg-emerald-500',
    'bg-green-500',
    'bg-lime-500',
    'bg-yellow-500',
    'bg-amber-500',
    'bg-orange-500',
    'bg-red-500',
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

/**
 * Avatar component for displaying user profile images.
 *
 * B2B Jewelry Design:
 * - Clean, professional appearance
 * - Elegant fallback with initials
 * - Status indicator support
 * - Multiple sizes for different contexts
 *
 * @example
 * // With image
 * <Avatar src="/user.jpg" alt="Jean Dupont" size="lg" />
 *
 * // With fallback initials
 * <Avatar fallback="Jean Dupont" size="md" />
 *
 * // With status indicator
 * <Avatar src="/user.jpg" status="online" />
 *
 * // With ring (for selection/highlight)
 * <Avatar src="/user.jpg" ring />
 */
const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(
  (
    {
      src,
      alt = '',
      fallback,
      size = 'md',
      shape = 'circle',
      status,
      fallbackIcon,
      ring = false,
      ringColor = 'ring-accent',
      className,
      ...props
    },
    ref
  ) => {
    const [imageError, setImageError] = useState(false);
    const showFallback = !src || imageError;

    const initials = fallback ? getInitials(fallback) : '';
    const fallbackBgColor = fallback ? getColorFromName(fallback) : 'bg-neutral-400';

    return (
      <span
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center',
          'overflow-hidden',
          'flex-shrink-0',
          avatarSizes[size],
          avatarShapes[shape],
          ring && `ring-2 ring-offset-2 ${ringColor}`,
          className
        )}
      >
        {/* Image */}
        {!showFallback && (
          <img
            src={src!}
            alt={alt}
            onError={() => setImageError(true)}
            className={cn(
              'w-full h-full object-cover',
              avatarShapes[shape]
            )}
            {...props}
          />
        )}

        {/* Fallback */}
        {showFallback && (
          <span
            className={cn(
              'flex items-center justify-center',
              'w-full h-full',
              'font-sans font-medium text-white',
              fallbackBgColor
            )}
            aria-label={alt || fallback}
          >
            {fallbackIcon || initials || (
              // Default user icon
              <svg
                className="w-1/2 h-1/2"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            )}
          </span>
        )}

        {/* Status indicator */}
        {status && (
          <span
            className={cn(
              'absolute bottom-0 right-0',
              'rounded-full border-white',
              statusSizes[size],
              statusColors[status]
            )}
            aria-label={`Status: ${status}`}
          />
        )}
      </span>
    );
  }
);

Avatar.displayName = 'Avatar';

/**
 * AvatarGroup - Display multiple avatars in a stack
 */
export interface AvatarGroupProps {
  /** Avatars to display */
  children: ReactNode;
  /** Maximum number of avatars to show */
  max?: number;
  /** Size for all avatars */
  size?: keyof typeof avatarSizes;
  /** Additional CSS classes */
  className?: string;
}

const AvatarGroup = ({
  children,
  max = 4,
  size = 'md',
  className,
}: AvatarGroupProps) => {
  const avatars = Array.isArray(children) ? children : [children];
  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;

  return (
    <div
      className={cn(
        'flex items-center -space-x-2',
        className
      )}
    >
      {visibleAvatars.map((avatar, index) => (
        <span
          key={index}
          className="ring-2 ring-white rounded-full"
          style={{ zIndex: visibleAvatars.length - index }}
        >
          {avatar}
        </span>
      ))}

      {/* Remaining count badge */}
      {remainingCount > 0 && (
        <span
          className={cn(
            'inline-flex items-center justify-center',
            'rounded-full',
            'bg-neutral-200 text-neutral-600',
            'font-sans font-medium',
            'ring-2 ring-white',
            avatarSizes[size]
          )}
          style={{ zIndex: 0 }}
        >
          +{remainingCount}
        </span>
      )}
    </div>
  );
};

AvatarGroup.displayName = 'AvatarGroup';

/**
 * UserAvatar - Avatar with name and additional info
 */
export interface UserAvatarProps extends AvatarProps {
  /** User name */
  name: string;
  /** Subtitle (role, email, etc.) */
  subtitle?: string;
  /** Whether to show the avatar on the right */
  reverse?: boolean;
  /** Container class name */
  containerClassName?: string;
}

const UserAvatar = ({
  name,
  subtitle,
  reverse = false,
  containerClassName,
  size = 'md',
  ...avatarProps
}: UserAvatarProps) => {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-3',
        reverse && 'flex-row-reverse',
        containerClassName
      )}
    >
      <Avatar
        {...avatarProps}
        size={size}
        fallback={avatarProps.fallback || name}
        alt={avatarProps.alt || name}
      />
      <div className={cn('flex flex-col', reverse && 'items-end')}>
        <span className="font-sans font-medium text-neutral-900 text-sm leading-tight">
          {name}
        </span>
        {subtitle && (
          <span className="font-sans text-neutral-500 text-xs leading-tight">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};

UserAvatar.displayName = 'UserAvatar';

/**
 * CompanyAvatar - Avatar for company/brand logos
 */
export interface CompanyAvatarProps extends Omit<AvatarProps, 'fallback'> {
  /** Company name for fallback */
  name: string;
}

const CompanyAvatar = ({
  name,
  shape = 'rounded',
  ...props
}: CompanyAvatarProps) => {
  return (
    <Avatar
      {...props}
      shape={shape}
      fallback={name}
      alt={props.alt || name}
    />
  );
};

CompanyAvatar.displayName = 'CompanyAvatar';

export {
  Avatar,
  AvatarGroup,
  UserAvatar,
  CompanyAvatar,
  avatarSizes,
  avatarShapes,
  statusColors,
};
