import { logger } from '../utils/logger';

export type NavigationStep = 'login' | 'profile' | 'experience' | 'education' | 'questions' | 'review' | 'confirmation' | 'submitted';

export const detectNavigationStep = (): NavigationStep => {
  const text = document.body.innerText.toLowerCase();
  if (text.includes('sign in') || text.includes('log in')) return 'login';
  if (text.includes('review') && text.includes('submit')) return 'review';
  if (text.includes('confirmation')) return 'confirmation';
  if (text.includes('experience')) return 'experience';
  if (text.includes('education')) return 'education';
  if (text.includes('question')) return 'questions';
  if (text.includes('profile')) return 'profile';
  return 'profile';
};

export const waitForPageReady = async (timeoutMs = 8000): Promise<boolean> => {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (document.readyState === 'complete' && document.querySelector('body')) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  return false;
};

export const handleLoginGate = (): boolean => {
  const text = document.body.innerText.toLowerCase();
  if (text.includes('sign in') || text.includes('log in')) {
    logger.warn('Authentication required. Automation paused before login completion.');
    return true;
  }
  return false;
};
