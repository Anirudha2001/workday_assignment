import { logger } from '../utils/logger';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  logger.debug('Background message received', message?.type);

  if (message?.type === 'PING') {
    sendResponse({ ok: true, message: 'Background worker ready' });
    return true;
  }

  if (message?.type === 'STATUS') {
    sendResponse({ ok: true, status: 'Service worker is active' });
    return true;
  }

  if (message?.type === 'AUTOFILL_START') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (typeof tabId === 'number') {
        chrome.tabs.sendMessage(tabId, { type: 'START_AUTOMATION', payload: message.payload }, () => {
          sendResponse({ ok: true });
        });
      }
    });
    return true;
  }

  sendResponse({ ok: true, status: 'Unhandled message' });
  return true;
});
