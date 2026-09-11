import { logger } from '../utils/logger';
import type { Education, Experience, ResumeData, ResumeParseResult } from '../types/resume';

const normalizeWhitespace = (value: string): string => value.replace(/\s+/g, ' ').trim();

const normalizeResumeText = (value: string): string =>
  value
    .replace(/\s*n\s+/gi, '\n')
    .replace(/\|/g, ' | ')
    .replace(/\s{2,}/g, ' ')
    .trim();

const firstNonEmpty = (...values: Array<string | undefined>): string => {
  for (const value of values) {
    const cleaned = normalizeWhitespace(value ?? '');
    if (cleaned) return cleaned;
  }
  return '';
};

const parseName = (text: string): ResumeData['name'] => {
  const lines = normalizeResumeText(text)
    .split(/\r?\n+/)
    .map((line) => normalizeWhitespace(line))
    .filter(Boolean)
    .slice(0, 25);

  const nameLine = lines.find((line) => {
    if (/@|\+?\d[\d\s().-]{7,}\d/.test(line)) return false;
    if (/summary|skills|education|experience|projects|additional|location|languages/i.test(line)) return false;
    const words = line.split(/\s+/).filter(Boolean);
    return words.length >= 2 && words.length <= 6 && !/^[A-Z0-9&/()|.-]+$/.test(line);
  }) ?? lines[0] ?? '';

  const beforeContact = nameLine
    .split(/\s*\|\s*/)[0]
    .replace(/\s*(?:\+?\d[\d\s().-]{7,}\d|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}).*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();

  let candidate = beforeContact || nameLine || '';
  const tokens = candidate.split(/\s+/).filter(Boolean);
  const nameTokens: string[] = [];

  for (const token of tokens) {
    if (/(Consultant|Buyer|Manager|Engineer|Developer|Analyst|Lead|Specialist|Professional|Procurement|Summary|SAP|MM|P2P|Purchase-to-Pay|IT|Technology|Operations|Coordinator)/i.test(token)) {
      break;
    }
    nameTokens.push(token);
  }

  candidate = nameTokens.length >= 2 ? nameTokens.join(' ') : candidate;
  const parts = candidate.split(/\s+/).filter(Boolean).slice(0, 4);
  const firstName = parts[0] ?? '';
  const lastName = parts.slice(1).join(' ') || '';

  return {
    fullName: candidate,
    firstName,
    lastName
  };
};

const parseEmail = (text: string): string => {
  const match = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match ? match[0] : '';
};

const parsePhone = (text: string): string => {
  const match = text.match(/(?:\+?\d[\d\s().-]{7,}\d)/);
  return match ? match[0].replace(/\s+/g, ' ').trim() : '';
};

const parseLocation = (text: string): string => {
  const patterns = [
    /(?:City|State|Country|Location)\s*[:\-]?\s*([A-Za-z.,\- ]{3,})/i,
    /([A-Z][A-Za-z.-]+(?:,\s*[A-Z][A-Za-z.-]+)?(?:\s+[A-Z][A-Za-z.-]+)?(?:\s+[A-Z][A-Za-z.-]+)?)/
  ];
  const m = text.match(patterns[0]);
  if (m && m[1]) return normalizeWhitespace(m[1]);
  return '';
};

const parseExperience = (text: string): Experience[] => {
  const normalized = normalizeResumeText(text);
  const lines = normalized.split(/\r?\n+/).map((line) => normalizeWhitespace(line)).filter(Boolean);

  const sectionStartIndex = lines.findIndex((line) => /work experience/i.test(line));
  if (sectionStartIndex >= 0) {
    const sectionLines = lines.slice(sectionStartIndex + 1, sectionStartIndex + 15);
    return sectionLines
      .filter((line) => !/work experience|projects|education|skills|summary|additional/i.test(line))
      .slice(0, 3)
      .map((line) => ({ title: line }));
  }

  const matches = Array.from(normalized.matchAll(/([A-Z][A-Za-z\-&]+(?:\s+[A-Z][A-Za-z\-&]+)*)\s*\|\s*([^\n]+)?/g));
  const result: Experience[] = matches
    .map((match) => ({
      company: match[1]?.trim(),
      title: match[2]?.trim()
    }))
    .filter((exp) => exp.company || exp.title);

  return result.slice(0, 5);
};

const parseEducation = (text: string): Education[] => {
  const normalized = normalizeResumeText(text);
  const lines = normalized.split(/\r?\n+/).map((line) => normalizeWhitespace(line)).filter(Boolean);
  const education: Education[] = [];

  const degreePriority = [
    'Bachelor', 'B.E', 'B.Tech', 'Bachelor of Technology', 'Bachelor of Engineering',
    'Master', 'MBA', 'MS', 'M.Sc', 'MSc', 'PhD', 'Diploma', 'Associate', 'HSC', 'SSC', 'XIIth', 'Xth'
  ];

  const pickDegree = (candidate: string): string => {
    const matches = Array.from(candidate.matchAll(/(Bachelor(?: of Technology| of Engineering)?|B\.E|B\.Tech|BTech|Master(?: of Science| of Engineering| of Business Administration)?|MBA|MS|M\.S|MSc|M\.Sc|PhD|Ph\.D|Diploma|Associates?|Degree|HSC|SSC|XIIth|Xth)/gi));
    if (!matches.length) return '';

    return matches
      .map((match) => match[0].trim())
      .sort((a, b) => {
        const aIndex = degreePriority.findIndex((token) => a.toLowerCase().startsWith(token.toLowerCase()));
        const bIndex = degreePriority.findIndex((token) => b.toLowerCase().startsWith(token.toLowerCase()));
        return (aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex) - (bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex);
      })[0];
  };

  const educationLineIndexes = lines
    .map((line, index) => ({ line, index }))
    .filter(({ line }) => /education/i.test(line));

  for (const { index } of educationLineIndexes) {
    for (let j = index + 1; j < Math.min(lines.length, index + 12); j += 1) {
      const candidate = lines[j].replace(/^[\-•\*\s]+/, '');
      if (!candidate || /work experience|projects|additional|skills|summary|objective/i.test(candidate)) break;

      const degreeMatch = pickDegree(candidate);
      const institutionMatch = candidate.match(/([A-Z][A-Za-z0-9&.'\- ]+(?:University|College|Institute|School|Academy))/i);

      if (degreeMatch || institutionMatch) {
        education.push({
          degree: degreeMatch,
          institution: institutionMatch ? institutionMatch[0].trim() : ''
        });
      }
    }
  }

  if (!education.length) {
    for (const line of lines) {
      const candidate = line.replace(/^[\-•\*\s]+/, '');
      const degreeMatch = pickDegree(candidate);
      const institutionMatch = candidate.match(/([A-Z][A-Za-z0-9&.'\- ]+(?:University|College|Institute|School|Academy))/i);
      if (degreeMatch || institutionMatch) {
        education.push({
          degree: degreeMatch,
          institution: institutionMatch ? institutionMatch[0].trim() : ''
        });
      }
    }
  }

  return education
    .filter((item) => item.degree || item.institution)
    .sort((a, b) => {
      const aScore = degreePriority.findIndex((token) => a.degree?.toLowerCase().startsWith(token.toLowerCase()));
      const bScore = degreePriority.findIndex((token) => b.degree?.toLowerCase().startsWith(token.toLowerCase()));
      return (aScore === -1 ? Number.MAX_SAFE_INTEGER : aScore) - (bScore === -1 ? Number.MAX_SAFE_INTEGER : bScore);
    })
    .slice(0, 5);
};

const parseSkills = (text: string): string[] => {
  const skillText = text.match(/Skills?[:\n][\s\S]{0,1000}/i)?.[0] ?? text;
  const lines = skillText
    .split(/[,;\n]/)
    .map((item) => normalizeWhitespace(item))
    .filter((item) => item.length > 2 && !/[A-Z]{3,}s?:/.test(item));
  return [...new Set(lines)].slice(0, 25);
};

const parseCertifications = (text: string): string[] => {
  const matches = text.matchAll(/([A-Z][A-Za-z0-9\- ]+\s*(?:Certification|Certified|License|AWS|Azure|PMP|CISSP|Scrum))/gi);
  return [...new Set(Array.from(matches, (m) => normalizeWhitespace(m[0])))]
    .filter((item) => item.length > 3)
    .slice(0, 10);
};

const parseLinks = (text: string) => {
  const linkedin = text.match(/https?:\/\/www\.linkedin\.com\/in\/[A-Za-z0-9\-_./?&=%]+/i)?.[0] ?? '';
  const github = text.match(/https?:\/\/github\.com\/[A-Za-z0-9\-_./?&=%]+/i)?.[0] ?? '';
  return { linkedin: linkedin || undefined, github: github || undefined };
};

export const parseResumeText = (text: string): ResumeParseResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  const cleaned = normalizeWhitespace(text);
  const data: ResumeData = {
    name: parseName(cleaned),
    email: parseEmail(cleaned),
    phone: parsePhone(cleaned),
    location: parseLocation(cleaned),
    experience: parseExperience(cleaned),
    education: parseEducation(cleaned),
    skills: parseSkills(cleaned),
    certifications: parseCertifications(cleaned),
    links: parseLinks(cleaned)
  };

  if (!data.name.fullName) warnings.push('Name could not be confidently extracted.');
  if (!data.email) warnings.push('Email could not be extracted.');
  if (!data.phone) warnings.push('Phone number could not be extracted.');
  if (!data.skills.length) warnings.push('No skills were extracted.');

  logger.info('Resume parsed successfully with warnings', warnings.length);
  return { data, errors, warnings, rawText: cleaned };
};

export const parseResumeFile = async (file: File): Promise<ResumeParseResult> => {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (!file) {
    throw new Error('No file selected.');
  }

  if (extension === 'pdf') {
    const { parsePdfText } = await import('./pdfParser');
    const result = await parsePdfText(file);
    return result;
  }

  if (extension === 'docx' || extension === 'doc') {
    const { parseDocxText } = await import('./docxParser');
    const result = await parseDocxText(file);
    return result;
  }

  throw new Error('Unsupported file type. Please upload a PDF or DOCX resume.');
};
