import { detectWorkdayFields } from './fieldDetector';
import { logger } from '../utils/logger';

export const createWorkdayObserver = (onFieldsDetected: (fields: ReturnType<typeof detectWorkdayFields>) => void) => {
  const observer = new MutationObserver((mutations) => {
    const changed = mutations.some((mutation) => mutation.addedNodes.length > 0 || mutation.type === 'childList');
    if (!changed) return;

    const fields = detectWorkdayFields();
    if (fields.length > 0) {
      logger.debug('Detected fields via mutation observer', fields.length);
      onFieldsDetected(fields);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    characterData: true
  });

  return observer;
};
