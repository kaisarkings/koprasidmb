import React from 'react';
import defaultSantriAvatar from '../../assets/images/login_santri_avatar_1785105854262.jpg';

interface StudentAvatarProps {
  src?: string;
  name?: string;
  className?: string;
}

export const DEFAULT_MALE_ANIMATED_AVATAR = defaultSantriAvatar;

export const StudentAvatar: React.FC<StudentAvatarProps> = ({
  src,
  name = 'Santri',
  className = 'w-10 h-10 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700',
}) => {
  const isDefaultOrUnsplash =
    !src ||
    src.trim() === '' ||
    src.includes('unsplash.com') ||
    src.includes('avatar.png') ||
    src.includes('placeholder');

  const avatarSrc = isDefaultOrUnsplash ? DEFAULT_MALE_ANIMATED_AVATAR : src;

  return (
    <img
      src={avatarSrc}
      alt={name}
      className={className}
      onError={(e) => {
        // Fallback to default animated male character if custom URL/Base64 fails
        (e.target as HTMLImageElement).src = DEFAULT_MALE_ANIMATED_AVATAR;
      }}
    />
  );
};
