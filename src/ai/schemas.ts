export const resumeExtractionSchema = {
  type: 'object',
  properties: {
    name: {
      type: 'object',
      properties: {
        fullName: { type: 'string' },
        firstName: { type: 'string' },
        lastName: { type: 'string' }
      },
      required: ['fullName', 'firstName', 'lastName']
    },
    email: { type: 'string' },
    phone: { type: 'string' },
    location: { type: 'string' },
    experience: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          company: { type: 'string' },
          title: { type: 'string' },
          startDate: { type: 'string' },
          endDate: { type: 'string' },
          description: { type: 'string' }
        }
      }
    },
    education: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          institution: { type: 'string' },
          degree: { type: 'string' },
          fieldOfStudy: { type: 'string' },
          startDate: { type: 'string' },
          endDate: { type: 'string' }
        }
      }
    },
    skills: { type: 'array', items: { type: 'string' } },
    certifications: { type: 'array', items: { type: 'string' } },
    links: {
      type: 'object',
      properties: {
        linkedin: { type: 'string' },
        github: { type: 'string' }
      }
    }
  },
  required: ['name', 'email', 'phone', 'location', 'experience', 'education', 'skills', 'certifications', 'links']
};
