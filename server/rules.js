/**
 * Centralized Rules & Configuration Module
 * Single source of truth for scoring weights, thresholds, verdict tiers, and role matrices.
 */

export const SCORE_WEIGHTS = {
  firstImpression: 0.25,
  repositoryHygiene: 0.20,
  substance: 0.25,
  activity: 0.20,
  range: 0.10,
};

export const REPOSITORY_SCORE_WEIGHTS = {
  purposeClarity: 0.15,
  documentation: 0.15,
  technicalEvidence: 0.20,
  activity: 0.15,
  completeness: 0.15,
  portfolioRelevance: 0.20,
};

export const CONSISTENCY_WEIGHTS = {
  namingConsistency: 0.20,
  descriptionConsistency: 0.15,
  documentationConsistency: 0.25,
  presentationConsistency: 0.20,
  technicalIdentity: 0.20,
};

export const VERDICT_TIERS = [
  { min: 90, max: 100, label: 'EXCEPTIONAL', description: 'Exceptional signal, strong presentation, ready for top-tier review.' },
  { min: 75, max: 89,  label: 'STRONG', description: 'Strong profile foundations. A few focused tweaks will elevate it to top-tier.' },
  { min: 60, max: 74,  label: 'DEVELOPING', description: 'Solid project seeds buried under uneven presentation and documentation gaps.' },
  { min: 40, max: 59,  label: 'MESSY / NEEDS WORK', description: 'High noise-to-signal ratio. Recruiter attention will be lost quickly.' },
  { min: 0,  max: 39,  label: 'BLANK / VERY WEAK SIGNAL', description: 'Sparse public signal. Urgent rescue required to demonstrate technical identity.' },
];

export const LIFECYCLE_THRESHOLDS = {
  activeDays: 90,        // Pushed within 90 days
  staleDays: 365,       // Pushed between 90 and 365 days
  abandonedDays: 365,   // Pushed over 365 days ago or archived
  experimentalMaxSizeKb: 50, // Tiny exploratory repos
};

export const IMPACT_WEIGHTS = {
  high: 3,
  medium: 2,
  low: 1,
};

export const EFFORT_WEIGHTS = {
  low: 1,
  medium: 2,
  high: 3,
};

/**
 * Career role signal matrices
 * Maps detected languages, topics, and architecture markers to target roles.
 */
export const ROLE_MATRICES = {
  'full-stack': {
    title: 'Full Stack Developer',
    weights: {
      frontend: 0.25,
      backend: 0.25,
      database: 0.15,
      projectDepth: 0.15,
      documentation: 0.10,
      deployment: 0.10,
    },
    techMarkers: {
      frontend: ['javascript', 'typescript', 'html', 'css', 'vue', 'svelte', 'react', 'nextjs', 'tailwind'],
      backend: ['nodejs', 'express', 'nest', 'python', 'fastapi', 'django', 'go', 'golang', 'java', 'ruby', 'php', 'c#', 'rust'],
      database: ['sql', 'postgres', 'postgresql', 'mysql', 'mongodb', 'redis', 'prisma', 'supabase', 'firebase'],
      deployment: ['docker', 'kubernetes', 'aws', 'gcp', 'cloud', 'vercel', 'nginx', 'terraform', 'ci', 'github-actions'],
    },
    keyStrengths: ['End-to-end client and server codebases', 'Clear REST or GraphQL interfaces', 'Production deployment markers'],
    missingGaps: ['Single-tier focus (only frontend or only scripts)', 'No clear persistent data or API layers'],
  },
  'backend': {
    title: 'Backend Developer',
    weights: {
      backendLanguages: 0.35,
      database: 0.25,
      architectureDepth: 0.20,
      testingAndCi: 0.10,
      documentation: 0.10,
    },
    techMarkers: {
      backendLanguages: ['go', 'golang', 'rust', 'python', 'java', 'c#', 'c++', 'c', 'nodejs', 'kotlin', 'scala', 'elixir'],
      database: ['sql', 'postgres', 'postgresql', 'mysql', 'redis', 'kafka', 'rabbitmq', 'mongodb'],
      architectureDepth: ['api', 'microservice', 'grpc', 'rest', 'auth', 'orm', 'service'],
      testingAndCi: ['test', 'jest', 'pytest', 'junit', 'docker', 'ci'],
    },
    keyStrengths: ['Strong systems or backend languages', 'Relational/caching database awareness', 'API and service architecture'],
    missingGaps: ['Limited evidence of API documentation', 'Lack of automated testing or database schema management'],
  },
  'frontend': {
    title: 'Frontend Developer',
    weights: {
      coreWeb: 0.30,
      modernFrameworks: 0.30,
      stylingAndUi: 0.20,
      documentationAndDemos: 0.20,
    },
    techMarkers: {
      coreWeb: ['javascript', 'typescript', 'html', 'css'],
      modernFrameworks: ['react', 'vue', 'svelte', 'nextjs', 'angular', 'astro'],
      stylingAndUi: ['tailwind', 'sass', 'scss', 'css3', 'styled-components'],
      documentationAndDemos: ['demo', 'storybook', 'ui', 'component', 'design'],
    },
    keyStrengths: ['Modern JavaScript/TypeScript ecosystem', 'Polished component UI design', 'Live preview or deploy links in READMEs'],
    missingGaps: ['No live demo links in repositories', 'Missing accessibility or responsive design evidence'],
  },
  'ai-ml': {
    title: 'AI / Machine Learning Engineer',
    weights: {
      mlLanguages: 0.35,
      dataAndModels: 0.30,
      projectBreadth: 0.20,
      documentation: 0.15,
    },
    techMarkers: {
      mlLanguages: ['python', 'r', 'julia', 'c++'],
      dataAndModels: ['jupyter', 'pytorch', 'tensorflow', 'scikit-learn', 'pandas', 'numpy', 'keras', 'opencv', 'transformers', 'llm', 'langchain', 'huggingface'],
      projectBreadth: ['model', 'deep-learning', 'dataset', 'nlp', 'cv', 'neural'],
      documentation: ['research', 'benchmark', 'paper', 'notebook'],
    },
    keyStrengths: ['Python and deep learning/data ecosystem', 'Jupyter notebooks with reproducible results', 'Model architecture/fine-tuning evidence'],
    missingGaps: ['Only tutorial forks without novel experimentation', 'Missing data pipeline documentation or model evaluation metrics'],
  },
  'devops': {
    title: 'DevOps / Cloud Engineer',
    weights: {
      infraAndCloud: 0.40,
      automationAndCi: 0.30,
      systemsLanguages: 0.20,
      documentation: 0.10,
    },
    techMarkers: {
      infraAndCloud: ['docker', 'kubernetes', 'terraform', 'ansible', 'helm', 'aws', 'gcp', 'azure', 'cloud'],
      automationAndCi: ['github-actions', 'gitlab-ci', 'jenkins', 'ci/cd', 'pipeline', 'workflow', 'bash', 'shell'],
      systemsLanguages: ['go', 'golang', 'python', 'rust', 'c'],
      documentation: ['architecture', 'runbook', 'infra'],
    },
    keyStrengths: ['Infrastructure as Code (Terraform/Docker/K8s)', 'Automated CI/CD pipeline definitions', 'Shell scripting & systems programming'],
    missingGaps: ['No public CI workflow files', 'Missing containerization or cloud deployment configurations'],
  },
  'software-engineer': {
    title: 'Generalist Software Engineer',
    weights: {
      languages: 0.30,
      codeSubstance: 0.25,
      hygiene: 0.25,
      consistency: 0.20,
    },
    techMarkers: {
      languages: ['python', 'javascript', 'typescript', 'java', 'c++', 'c', 'go', 'rust', 'c#'],
    },
    keyStrengths: ['Multi-language versatility', 'Well-structured project hierarchies', 'Consistent version control hygiene'],
    missingGaps: ['Stale or empty repositories cluttering the profile', 'Missing installation or build instructions'],
  },
};

/**
 * Returns verdict object based on score
 * @param {number} score
 * @returns {{ label: string, description: string }}
 */
export function getVerdict(score) {
  const rounded = Math.round(score);
  for (const tier of VERDICT_TIERS) {
    if (rounded >= tier.min && rounded <= tier.max) {
      return { label: tier.label, description: tier.description };
    }
  }
  return { label: 'DEVELOPING', description: 'Profile requires polish.' };
}
