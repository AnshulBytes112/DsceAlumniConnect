import { type UserProfile } from '@/lib/api';

/**
 * Calculates the profile completion percentage based on provided user data.
 * @param user The user profile data
 * @returns A number between 0 and 100 representing completion percentage
 */
export const calculateProfileCompletion = (user: UserProfile | null): number => {
  if (!user) return 0;
  
  let score = 0;
  
  // Basic Info (40%)
  if (user.firstName) score += 10;
  if (user.lastName) score += 10;
  if (user.headline) score += 10;
  if (user.location && user.location.trim() !== '') score += 10;
  
  // Assets (20%)
  if (user.profilePicture) score += 10;
  if (user.resumeUrl) score += 10;
  
  // Details (40%)
  if (user.educations && user.educations.length > 0) score += 15;
  if (user.workExperiences && user.workExperiences.length > 0) score += 15;
  if (user.skills && user.skills.length > 0) score += 10;
  
  return Math.min(score, 100);
};
