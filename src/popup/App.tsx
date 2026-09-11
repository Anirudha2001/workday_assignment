import { useMemo, useState, type ChangeEvent } from 'react';
import { parseResumeFile } from '../parser/resumeParser';
import type { ResumeData } from '../types/resume';

const initialResume: ResumeData = {
  name: { fullName: '', firstName: '', lastName: '' },
  email: '',
  phone: '',
  location: '',
  experience: [],
  education: [],
  skills: [],
  certifications: [],
  links: {}
};

export default function App() {
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('');
  const [status, setStatus] = useState('Idle');
  const [error, setError] = useState('');
  const [resume, setResume] = useState<ResumeData>(initialResume);
  const [autoStatus, setAutoStatus] = useState('Ready');
  const [step, setStep] = useState('idle');
  const [fieldsDetected, setFieldsDetected] = useState(0);
  const [fieldsMapped, setFieldsMapped] = useState(0);
  const [fieldsFilled, setFieldsFilled] = useState(0);
  const [attention, setAttention] = useState(0);

  const uploadResume = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setFileType(file.name.split('.').pop()?.toUpperCase() ?? '');
    setStatus('Parsing...');
    setError('');

    try {
      const result = await parseResumeFile(file);
      if (result.errors.length > 0) {
        setError(result.errors.join('; '));
      }
      setResume(result.data);
      setStatus('Completed');
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : 'Unable to parse the file.';
      setError(message);
      setStatus('Failed');
    }
  };

  const startAutomation = async () => {
    setStatus('Running automation');
    setAutoStatus('Starting');
    setStep('loading');

    if (!resume.name.fullName && !resume.email) {
      setError('Please parse a valid resume before starting automation.');
      return;
    }

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) {
        setAutoStatus('No active tab available');
        return;
      }

      chrome.tabs.sendMessage(tab.id, { type: 'START_AUTOMATION', payload: { resume } }, () => {
        setAutoStatus('Automation started');
        setStep('detecting');
      });
      chrome.runtime.sendMessage({ type: 'AUTOFILL_START', payload: { resume } });
    } catch (runtimeError) {
      setAutoStatus('Could not start automation');
      setError(runtimeError instanceof Error ? runtimeError.message : 'Unable to start automation');
    }
  };

  const resumeSummary = useMemo(
    () => [
      { label: 'Name', value: resume.name.fullName || `${resume.name.firstName} ${resume.name.lastName}`.trim() },
      { label: 'Email', value: resume.email },
      { label: 'Phone', value: resume.phone },
      { label: 'Location', value: resume.location },
      { label: 'LinkedIn', value: resume.links.linkedin || '' },
      { label: 'GitHub', value: resume.links.github || '' }
    ],
    [resume]
  );

  return (
    <div className="popup-shell">
      <h1>Workday AI Assistant</h1>
      <p className="subtitle">Selected target: NVIDIA Senior Software Architect – Deep Learning and HPC Communications (JR2016116)</p>

      <section className="card">
        <h2>Resume Upload</h2>
        <input type="file" accept=".pdf,.doc,.docx" onChange={uploadResume} />
        <div className="meta-row">
          <span>Selected file: {fileName || 'None'}</span>
          <span>Type: {fileType || 'N/A'}</span>
        </div>
        <div className="meta-row">
          <span>Status: {status}</span>
        </div>
        {error && <div className="error-box">{error}</div>}
      </section>

      <section className="card">
        <h2>Resume Data</h2>
        <div className="resume-grid">
          {resumeSummary.map((item) => (
            <div key={item.label} className="resume-item">
              <strong>{item.label}</strong>
              <span>{item.value || 'Not available'}</span>
            </div>
          ))}
        </div>
        <div className="section-block">
          <h3>Experience</h3>
          <ul>
            {resume.experience.length ? resume.experience.map((item, index) => <li key={`${item.company}-${index}`}>{item.title || item.company || 'Experience'} </li>) : <li>None</li>}
          </ul>
        </div>
        <div className="section-block">
          <h3>Education</h3>
          <ul>
            {resume.education.length ? resume.education.map((item, index) => <li key={`${item.institution}-${index}`}>{item.degree || item.institution || 'Education'}</li>) : <li>None</li>}
          </ul>
        </div>
        <div className="section-block">
          <h3>Skills</h3>
          <ul>
            {resume.skills.length ? resume.skills.map((item, idx) => <li key={`${item}-${idx}`}>{item}</li>) : <li>None</li>}
          </ul>
        </div>
      </section>

      <section className="card">
        <h2>Automation</h2>
        <button onClick={startAutomation}>Start Automation</button>
        <div className="stats-grid">
          <div><strong>Current step</strong><span>{step}</span></div>
          <div><strong>Status</strong><span>{autoStatus}</span></div>
          <div><strong>Detected</strong><span>{fieldsDetected}</span></div>
          <div><strong>Mapped</strong><span>{fieldsMapped}</span></div>
          <div><strong>Filled</strong><span>{fieldsFilled}</span></div>
          <div><strong>Attention</strong><span>{attention}</span></div>
        </div>
      </section>

      <section className="card review-card">
        <h2>Review</h2>
        <div className="pill">Final submission requires explicit confirmation.</div>
      </section>
    </div>
  );
}
