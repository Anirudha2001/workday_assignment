export const isWorkdayPage = (): boolean => {
  const url = window.location.href.toLowerCase();
  return url.includes('myworkdayjobs') || url.includes('wd5') || document.body?.innerText?.toLowerCase().includes('workday');
};

export const getTextContent = (element: Element | null): string => {
  if (!element) return '';
  return (element.textContent ?? '').replace(/\s+/g, ' ').trim();
};

export const getNearestLabelText = (element: HTMLElement): string => {
  const labels: string[] = [];

  const associatedLabel = element.closest('label');
  if (associatedLabel) labels.push(getTextContent(associatedLabel));

  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel) labels.push(ariaLabel);

  const ariaLabelledBy = element.getAttribute('aria-labelledby');
  if (ariaLabelledBy) {
    const ids = ariaLabelledBy.split(' ');
    ids.forEach((id) => {
      const target = document.getElementById(id);
      if (target) labels.push(getTextContent(target));
    });
  }

  const name = element.getAttribute('name');
  if (name) labels.push(name);

  const placeholder = (element as HTMLInputElement).placeholder;
  if (placeholder) labels.push(placeholder);

  const parentText = element.parentElement ? getTextContent(element.parentElement) : '';
  if (parentText) labels.push(parentText);

  return labels.join(' ');
};

export const collectOptionsFromField = (element: HTMLElement): string[] => {
  const values: string[] = [];
  const select = element as HTMLSelectElement;
  if (select && select.options) {
    Array.from(select.options).forEach((option) => {
      const text = option.textContent?.trim();
      if (text) values.push(text);
    });
  }

  const radioGroup = element.closest('[role="radiogroup"], .radiogroup');
  if (radioGroup) {
    radioGroup.querySelectorAll('input[type="radio"]').forEach((input) => {
      const label = input.closest('label')?.textContent?.trim() ?? input.getAttribute('aria-label') ?? '';
      if (label) values.push(label);
    });
  }

  return [...new Set(values)];
};
