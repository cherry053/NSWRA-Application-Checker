/**
 * Every piece of copy on the site comes from this file, so the content can be
 * updated without touching a component. Sourced from Cherry Sebastian's resume
 * and LinkedIn profile.
 */

export const profile = {
  firstName: 'cherry',
  fullName: 'Cherry Sebastian',
  role: 'Software Engineer',
  tagline:
    'a final-year software engineering student building cloud, ai and full-stack systems that people actually use',
  email: 'cherrysebastian053@gmail.com',
  phone: '0497 599 094',
  linkedin: 'https://www.linkedin.com/in/cherry-sebastian-972bba292/',
  github: 'https://github.com/cherry053',
  location: 'Sydney, NSW, Australia',
  /**
   * Drop a headshot at portfolio/public/portrait.png (or .jpg and update this
   * path) and it renders in the hero. Until then the hero falls back to a
   * generated monogram card — see HeroSection.
   */
  portrait: 'portrait.png',
};

export const about = {
  heading: 'About me',
  body:
    "I'm a final-year Software Engineering (Honours) student at UTS, graduating in 2027 with a distinction average. I work across cloud infrastructure, AI/ML systems and full-stack development, and I care most about the part where engineering meets a real person — a council officer waiting on a grant, a user waiting on a verification. My goal is to grow into an engineer who ships secure, well-architected cloud systems and leads the teams that build them.",
};

export type Capability = {
  number: string;
  name: string;
  description: string;
};

export const capabilities: Capability[] = [
  {
    number: '01',
    name: 'Cloud Engineering',
    description:
      'Google Cloud and AWS — Vertex AI, Lambda, S3, Rekognition, IAM, encryption and network isolation. Designing services that stay secure and observable once they leave my machine.',
  },
  {
    number: '02',
    name: 'AI & ML Systems',
    description:
      'MLOps for generative AI, prompt engineering, and hands-on model evaluation. Training, labelling and stress-testing models, then wiring them into products as a dependable feature rather than a demo.',
  },
  {
    number: '03',
    name: 'Full-Stack Development',
    description:
      'Python, C++, SQL, React Native and Streamlit. Modular back-end architecture paired with front ends that make a complex process feel like a short form.',
  },
  {
    number: '04',
    name: 'Cyber Security',
    description:
      'Cloud security principles, threat assessment, phishing analysis, incident response and risk reporting — practised through Deloitte and Datacom job simulations and applied to production work.',
  },
  {
    number: '05',
    name: 'Technical Leadership',
    description:
      'Co-leading an intern team and running cross-functional university squads under Agile/SCRUM. Sprint planning, architecture diagrams, client showcases and the stakeholder conversations in between.',
  },
];

export type Experience = {
  number: string;
  role: string;
  company: string;
  period: string;
  points: string[];
};

export const experience: Experience[] = [
  {
    number: '01',
    role: 'Software Engineering Intern (Co-Lead)',
    company: 'Optik Consultancy — UTS Tech Lab',
    period: 'May 2026 — Present',
    points: [
      'Built the NSWRA Grant Application Quality Checker, a Streamlit compliance tool that parses grant application PDFs and raw text exports and validates them against EPAR/DRFA criteria.',
      'Reduced manual grant application review time by 50% for the NSW Reconstruction Authority, getting councils to grant approval faster.',
      'Architected a dual-source PDF + raw-text parsing system to work around mangled table extraction, including a landmark-driven damage table parser built on dataclasses and validation functions.',
      'Designed the modular core architecture and scaffolded the Streamlit front end with filter and search functionality.',
      'Produced client-facing deliverables — a Design Phase Retrospective Report, meeting minutes and formal recommendations — presented directly to NSWRA stakeholders.',
    ],
  },
  {
    number: '02',
    role: 'Data Analyst',
    company: 'Telus Digital',
    period: 'Oct 2025 — Jan 2026',
    points: [
      'Trained AI and machine-learning models by evaluating and labelling audio data to improve speech recognition accuracy and natural language understanding.',
      'Assessed model outputs for quality, correctness and relevance, feeding detailed evaluations back into model refinement.',
      'Identified patterns, inconsistencies and edge cases within audio datasets to support debugging and improve dataset reliability.',
    ],
  },
  {
    number: '03',
    role: 'Sales Associate',
    company: 'JB Hi-Fi',
    period: 'Oct 2023 — Present',
    points: [
      'Translated complex technical information into clear, practical solutions, lifting customer satisfaction ratings.',
      'Achieved a 77% warranty conversion rate by turning technical product knowledge into plain value for customers.',
      'Built day-to-day problem-solving and client communication skills across constant face-to-face interaction.',
    ],
  },
];

export type Education = {
  qualification: string;
  institution: string;
  period: string;
  detail: string;
};

export const education: Education[] = [
  {
    qualification: 'Bachelor of Engineering (Honours), Software Engineering',
    institution: 'University of Technology Sydney',
    period: 'Jan 2023 — May 2027',
    detail: 'Distinction average — GPA 6.05',
  },
  {
    qualification: 'NSW Higher School Certificate',
    institution: 'Broughton Anglican College',
    period: 'Jan 2017 — Dec 2022',
    detail: 'School Prefect — leadership and organisational responsibility',
  },
];

export type Project = {
  number: string;
  name: string;
  category: string;
  period: string;
  summary: string;
  highlights: string[];
  stack: string[];
  link?: string;
  linkLabel?: string;
};

export const projects: Project[] = [
  {
    number: '01',
    name: 'NSWRA Application Checker',
    category: 'Client — NSW Reconstruction Authority',
    period: '2026',
    summary:
      'A compliance tool that reads an EPAR grant application and tells a council exactly what is wrong with it before a reviewer ever opens the file.',
    highlights: [
      'Dual-source parsing: the SmartyGrants PDF export plus the damage table pasted as text, merged into one record without a single regular expression.',
      'Validation covers required fields, email/phone/date formats, NSW address and coordinate bounds, cost component sums, evidence file naming and cross-document reconciliation.',
      'Results group into the six form-navigation sections with pass / review / fail status icons, filters, ranked severity cards and a downloadable PDF report.',
      'Cut manual review time by 50% for the NSW Reconstruction Authority.',
    ],
    stack: ['Python', 'Streamlit', 'pdfplumber', 'Dataclasses', 'pytest'],
    link: 'https://github.com/cherry053/NSWRA-Application-Checker',
    linkLabel: 'View Repo',
  },
  {
    number: '02',
    name: 'RealSwipe',
    category: 'University — Team Lead / Business Analyst',
    period: 'Mar 2026 — May 2026',
    summary:
      'A verified social matching platform where every profile is a real, face-checked person — delivered across two sprints by a cross-functional team of six.',
    highlights: [
      'Led a team of 6 across two sprints as Team Lead and Business Analyst.',
      'Sprint 1 shipped AWS Rekognition-based face verification; Sprint 2 shipped an AI-powered match chatbot alongside an AI event-approval chatbot.',
      'Produced sprint documentation, Structurizr DSL architecture diagrams, a Mermaid ERD, meeting minutes and the final client showcase.',
    ],
    stack: ['AWS Rekognition', 'AWS Lambda', 'React Native', 'Structurizr', 'Agile/SCRUM'],
  },
  {
    number: '03',
    name: 'Speech Model Evaluation',
    category: 'Industry — Telus Digital',
    period: 'Oct 2025 — Jan 2026',
    summary:
      'Hands-on evaluation work on production speech recognition and natural language models, turning messy audio datasets into signal a training team can act on.',
    highlights: [
      'Labelled and evaluated audio data to improve speech recognition accuracy and natural language understanding.',
      'Scored model outputs for quality, correctness and relevance, with written feedback that fed directly into refinement cycles.',
      'Surfaced edge cases and dataset inconsistencies that were blocking reliable evaluation.',
    ],
    stack: ['ML Evaluation', 'Data Labelling', 'NLU', 'Speech Recognition'],
  },
];

export type Certification = {
  issuer: string;
  name: string;
  date: string;
  detail?: string;
};

export const certifications: Certification[] = [
  {
    issuer: 'Google Cloud',
    name: 'MLOps for Generative AI',
    date: '2025',
    detail: 'Operationalising generative models — pipelines, evaluation and deployment.',
  },
  {
    issuer: 'Google Cloud',
    name: 'Vertex AI',
    date: '2025',
    detail: 'Training, tuning and serving models on Google Cloud’s managed ML platform.',
  },
  {
    issuer: 'Google Cloud',
    name: 'AI Security',
    date: '2025',
    detail: 'Securing AI workloads — prompt safety, data protection and access control.',
  },
  {
    issuer: 'Google Cloud',
    name: 'Introduction to Security Principles in Cloud Computing',
    date: 'Aug 2025',
    detail: 'IAM, encryption, network isolation and the shared responsibility model.',
  },
  {
    issuer: 'Deloitte Australia (Forage)',
    name: 'Cyber Job Simulation',
    date: 'Sep 2025',
    detail: 'Simulated threat assessments, phishing analysis and incident response strategy.',
  },
  {
    issuer: 'Datacom Australia (Forage)',
    name: 'Cybersecurity Job Simulation',
    date: 'Nov 2025',
    detail: 'Investigated a simulated cyberattack, produced a findings report and a risk assessment.',
  },
];

export const skills: string[] = [
  'Python',
  'C++',
  'SQL',
  'React Native',
  'Streamlit',
  'Google Cloud',
  'Vertex AI',
  'MLOps',
  'AWS Lambda',
  'AWS S3',
  'AWS Rekognition',
  'IAM',
  'Encryption',
  'Network Isolation',
  'Prompt Engineering',
  'AI Security',
  'Agile / SCRUM',
  'Cyber Compliance',
  'Data Analysis',
  'Structurizr',
  'Mermaid ERD',
  'Microsoft 365',
  'Salesforce Console',
  'Git',
];

export const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Experience', href: '#experience' },
  { label: 'Projects', href: '#projects' },
  { label: 'Contact', href: '#contact' },
];
