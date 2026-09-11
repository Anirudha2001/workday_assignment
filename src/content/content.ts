import { callAiService } from '../ai/aiService';
import { mapField } from '../mapper/fieldMapper';
import { detectWorkdayFields } from './fieldDetector';
import { fillResumeFields } from './filler';
import { createWorkdayObserver } from './mutationObserver';
import { handleLoginGate, detectNavigationStep, waitForPageReady } from './navigator';
import { logger } from '../utils/logger';
import type { ResumeData, WorkdayField } from '../types/resume';
import { validateFields } from '../validation/validator';

const processed = new Set<string>();
let lastAutomationStatus = '';

const sendToExtension = (type: string, payload?: unknown) => {
  chrome.runtime.sendMessage({ type, payload });
};

const runAutomation = async (resume: ResumeData) => {
  await waitForPageReady();

  if (handleLoginGate()) {
    sendToExtension('AUTOMATION_STATUS', { step: 'login', status: 'Authentication required. Please log in to continue.' });
    return;
  }

  const fields = detectWorkdayFields();
  if (!fields.length) {
    sendToExtension('AUTOMATION_STATUS', { step: 'detecting', status: 'No Workday fields detected yet.' });
    return;
  }

  sendToExtension('AUTOMATION_STATUS', { step: 'detecting', status: `Detected ${fields.length} fields.` });

  const mappedValues: Record<string, string> = {};
  let mappedCount = 0;

  for (const field of fields) {
    const cacheKey = `${field.label}-${field.type}`;
    if (processed.has(cacheKey)) continue;
    processed.add(cacheKey);

    const result = await mapField(field, resume, async (payload) => callAiService({
      ...payload,
      instructions: 'Return JSON with matchedField, value, confidence, and reason for mapping the resume data to this Workday field.'
    }));

    if (result.matchedField && result.value) {
      mappedValues[field.label] = result.value;
      mappedCount += 1;
      sendToExtension('FIELD_MAPPED', { field: field.label, value: result.value, confidence: result.confidence });
    } else if (result.requiresAttention) {
      sendToExtension('FIELD_REQUIRES_ATTENTION', { field: field.label, reason: result.reason });
    }
  }

  const filled = fillResumeFields(fields, resume, mappedValues);
  const validation = validateFields(fields);

  sendToExtension('AUTOMATION_STATUS', {
    step: detectNavigationStep(),
    status: `Mapped ${mappedCount} fields and filled ${filled}.`,
    fieldsDetected: fields.length,
    fieldsMapped: mappedCount,
    fieldsFilled: filled,
    fieldsRequiringAttention: validation.errors.length
  });

  if (!validation.valid) {
    sendToExtension('VALIDATION_RESULT', validation);
  }
};

const initialize = () => {
  if (!window.location.href.includes('myworkdayjobs')) {
    return;
  }

  logger.info('Workday content script initialized');
  createWorkdayObserver((fields) => {
    sendToExtension('FIELDS_DETECTED', fields.length);
    if (lastAutomationStatus !== 'running') {
      lastAutomationStatus = 'running';
    }
  });

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'START_AUTOMATION') {
      const resume = message.payload?.resume as ResumeData | undefined;
      if (!resume) {
        sendResponse({ ok: false, error: 'No resume data was provided.' });
        return false;
      }
      runAutomation(resume).catch((error) => {
        logger.error('Automation failed', error);
        sendToExtension('AUTOMATION_ERROR', {
          message: error instanceof Error ? error.message : 'Unknown automation error'
        });
      });
      sendResponse({ ok: true, message: 'Automation started.' });
      return true;
    }

    if (message.type === 'PING') {
      sendResponse({ ok: true });
      return true;
    }

    if (message.type === 'GET_PAGE_STATUS') {
      sendResponse({
        ok: true,
        step: detectNavigationStep(),
        isWorkday: true
      });
      return true;
    }

    return false;
  });
};

initialize();
