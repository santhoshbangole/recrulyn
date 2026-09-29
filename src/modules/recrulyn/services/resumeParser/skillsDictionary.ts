/**
 * skillsDictionary.ts
 * A large, categorized dictionary of technical + domain skills, exposed as
 * a single Map<alias, canonicalName> for O(1) alias lookup, plus a compiled
 * regex for fast single-pass extraction from resume text.
 */

const PROGRAMMING_LANGUAGES = [
  "JavaScript", "TypeScript", "Python", "Java", "C", "C++", "C#", "Go",
  "Rust", "Ruby", "PHP", "Swift", "Kotlin", "Objective-C", "Scala", "Perl",
  "R", "MATLAB", "Dart", "Lua", "Haskell", "Elixir", "Erlang", "Clojure",
  "F#", "Julia", "Groovy", "VB.NET", "Assembly", "COBOL", "Fortran",
  "Shell Scripting", "Bash", "PowerShell", "SQL", "PL/SQL", "T-SQL",
  "Solidity", "Verilog", "VHDL", "HTML5", "CSS3", "XML", "JSON",
];

const FRAMEWORKS_LIBRARIES = [
  "React", "Angular", "Vue.js", "Next.js", "Nuxt.js", "Svelte", "Ember.js",
  "Backbone.js", "jQuery", "Redux", "Redux Toolkit", "MobX", "Express.js",
  "Node.js", "NestJS", "Fastify", "Koa", "Django", "Flask", "FastAPI",
  "Spring", "Spring Boot", "Hibernate", "Laravel", "Symfony", "CodeIgniter",
  "Ruby on Rails", "ASP.NET", "ASP.NET Core", ".NET", ".NET Core", "Flutter",
  "React Native", "Ionic", "Xamarin", "SwiftUI", "Bootstrap", "Tailwind CSS",
  "Material UI", "Chakra UI", "Ant Design", "Sass", "LESS", "Webpack",
  "Vite", "Babel", "GraphQL", "Apollo", "RxJS", "D3.js", "Three.js",
  "Chart.js", "Socket.io", "gRPC", "Electron", "Gatsby", "Remix", "Astro",
  "Storybook", "Jetpack Compose", "REST API", "Microservices",
  "Serverless Architecture", "Object-Oriented Programming",
  "Data Structures and Algorithms",
];

const CLOUD = [
  "AWS", "Amazon Web Services", "Microsoft Azure", "Google Cloud Platform",
  "GCP", "EC2", "S3", "AWS Lambda", "RDS", "DynamoDB", "CloudFormation",
  "Azure Functions", "Azure DevOps", "Google App Engine", "Firebase",
  "Heroku", "DigitalOcean", "Vercel", "Netlify", "Cloudflare", "IBM Cloud",
  "Oracle Cloud", "OpenStack", "VMware", "Kubernetes", "Docker",
  "Docker Swarm", "Terraform", "Ansible", "Chef", "Puppet", "CloudFront",
  "Route 53", "IAM", "EKS", "ECS",
];

const DATABASES = [
  "MySQL", "PostgreSQL", "MongoDB", "SQLite", "Oracle Database",
  "Microsoft SQL Server", "Redis", "Cassandra", "MariaDB",
  "Firebase Realtime Database", "Firestore", "Elasticsearch", "Neo4j",
  "CouchDB", "InfluxDB", "Snowflake", "BigQuery", "Redshift", "Supabase",
  "PlanetScale", "CockroachDB", "Memcached", "RethinkDB", "ArangoDB",
  "TimescaleDB", "HBase", "Hive", "Presto", "ClickHouse", "Amazon Aurora",
];

const AI_ML = [
  "Machine Learning", "Deep Learning", "Artificial Intelligence",
  "Natural Language Processing", "NLP", "Computer Vision", "TensorFlow",
  "PyTorch", "Keras", "Scikit-learn", "OpenCV", "Pandas", "NumPy", "SciPy",
  "XGBoost", "LightGBM", "CatBoost", "Hugging Face", "Transformers",
  "LangChain", "LlamaIndex", "OpenAI API", "GPT", "BERT", "LSTM", "CNN",
  "RNN", "GAN", "Reinforcement Learning", "Neural Networks", "Data Mining",
  "Predictive Modeling", "Feature Engineering", "Model Deployment", "MLOps",
  "MLflow", "Kubeflow", "Apache Spark", "Spark MLlib", "Speech Recognition",
  "Recommendation Systems", "Time Series Analysis", "AutoML", "ONNX",
  "Vector Databases", "Pinecone",
];

const DEVOPS_TESTING = [
  "CI/CD", "Jenkins", "GitHub Actions", "GitLab CI", "CircleCI",
  "Travis CI", "Docker Compose", "Helm", "Prometheus", "Grafana",
  "ELK Stack", "Splunk", "Nagios", "New Relic", "Datadog", "Vagrant", "Git",
  "GitHub", "GitLab", "Bitbucket", "SVN", "Jira", "Confluence", "Selenium",
  "Cypress", "Playwright", "Jest", "Mocha", "Chai", "JUnit", "TestNG",
  "PyTest", "Postman", "SoapUI", "Cucumber", "Appium", "LoadRunner",
  "JMeter", "Test Automation", "Manual Testing",
];

const MOBILE = [
  "Android Development", "iOS Development", "Mobile UI/UX",
  "App Store Optimization", "Firebase Cloud Messaging", "Android Studio",
  "Xcode", "Cordova",
];

const CYBER_SECURITY = [
  "Network Security", "Penetration Testing", "Ethical Hacking",
  "Cryptography", "SIEM", "Vulnerability Assessment", "Malware Analysis",
  "Firewall Configuration", "IDS/IPS", "SOC", "Incident Response", "OWASP",
  "Burp Suite", "Metasploit", "Nmap", "Wireshark", "Kali Linux",
  "ISO 27001", "GDPR Compliance", "Threat Intelligence", "Zero Trust",
  "Endpoint Security", "Identity and Access Management", "SSL/TLS",
  "DevSecOps", "CISSP", "CEH", "Security Auditing", "Risk Assessment",
];

const DATA_SCIENCE = [
  "Data Analysis", "Data Visualization", "Tableau", "Power BI", "Excel",
  "Statistics", "A/B Testing", "Data Wrangling", "ETL", "Data Pipelines",
  "Apache Airflow", "Big Data", "Hadoop", "Data Warehousing",
];

const VLSI_EMBEDDED_ELECTRONICS = [
  "VLSI Design", "ASIC Design", "FPGA", "Embedded C", "Embedded Systems",
  "Microcontrollers", "Arduino", "Raspberry Pi", "PCB Design",
  "Circuit Design", "Analog Electronics", "Digital Electronics", "RTOS",
  "RTL Design", "SystemVerilog", "Cadence", "Synopsys", "Xilinx",
  "ModelSim", "Signal Processing", "IoT", "Internet of Things",
  "MATLAB Simulink", "PLC Programming", "SCADA", "ARM Architecture", "DSP",
  "Communication Protocols", "I2C", "SPI", "UART", "CAN Protocol",
  "Power Electronics",
];

const MECHANICAL = [
  "AutoCAD", "SolidWorks", "CATIA", "ANSYS", "CAD/CAM", "Thermodynamics",
  "Fluid Mechanics", "Machine Design", "Manufacturing Processes",
  "CNC Programming", "Finite Element Analysis", "HVAC Design", "Robotics",
  "Product Design", "GD&T", "Mechanical Design", "3D Printing",
  "Additive Manufacturing", "PLM", "NX CAD", "CREO", "Sheet Metal Design",
  "Automotive Engineering", "Six Sigma",
];

const CIVIL = [
  "AutoCAD Civil 3D", "Structural Analysis", "STAAD Pro", "Revit",
  "Construction Management", "Surveying", "Estimation and Costing",
  "Building Information Modeling", "BIM", "Geotechnical Engineering",
  "Transportation Engineering", "Environmental Engineering",
  "Project Scheduling", "Primavera", "Quantity Surveying",
  "Concrete Technology", "Highway Engineering", "Water Resources Engineering",
  "Urban Planning", "Site Supervision",
];

const DESIGN = [
  "UI/UX Design", "User Research", "Wireframing", "Prototyping", "Figma",
  "Adobe XD", "Sketch", "Adobe Photoshop", "Adobe Illustrator", "InDesign",
  "After Effects", "Premiere Pro", "Canva", "Interaction Design",
  "Visual Design", "Graphic Design", "Motion Graphics", "Design Thinking",
  "Usability Testing", "Information Architecture", "Typography", "Branding",
  "Blender", "3D Modeling",
];

const HR = [
  "Talent Acquisition", "Recruitment", "Employee Relations",
  "Performance Management", "HR Analytics", "Payroll Management",
  "Onboarding", "HRIS", "Compensation and Benefits", "Employee Engagement",
  "Training and Development", "Organizational Development",
  "Workforce Planning", "Applicant Tracking Systems", "Labor Law",
  "Succession Planning", "HR Policies", "Exit Interviews",
  "Diversity and Inclusion", "Employer Branding",
];

const FINANCE = [
  "Financial Analysis", "Financial Modeling", "Accounting", "Bookkeeping",
  "Auditing", "Taxation", "Budgeting", "Forecasting", "Investment Analysis",
  "Equity Research", "Risk Management", "Corporate Finance",
  "Financial Reporting", "GAAP", "IFRS", "SAP FICO", "Tally", "QuickBooks",
  "Cost Accounting", "Treasury Management", "Mergers and Acquisitions",
  "Valuation", "Portfolio Management", "Credit Analysis",
  "Financial Planning",
];

const MARKETING_BUSINESS = [
  "Digital Marketing", "SEO", "SEM", "Content Marketing",
  "Social Media Marketing", "Email Marketing", "Google Analytics",
  "Google Ads", "Facebook Ads", "Marketing Strategy", "Brand Management",
  "Market Research", "CRM", "Salesforce", "HubSpot", "Product Management",
  "Business Analysis", "Business Development", "Sales Strategy",
  "Lead Generation", "Copywriting", "Growth Hacking",
  "Affiliate Marketing", "Influencer Marketing", "Marketing Automation",
  "Public Relations", "Customer Relationship Management",
  "Agile Methodology", "Scrum", "Project Management", "PMP",
];

export const SKILL_CATEGORIES: Record<string, string[]> = {
  "Programming Languages": PROGRAMMING_LANGUAGES,
  "Frameworks & Libraries": FRAMEWORKS_LIBRARIES,
  Cloud: CLOUD,
  Databases: DATABASES,
  "AI / ML": AI_ML,
  "DevOps & Testing": DEVOPS_TESTING,
  Mobile: MOBILE,
  "Cyber Security": CYBER_SECURITY,
  "Data Science": DATA_SCIENCE,
  "VLSI / Embedded / Electronics": VLSI_EMBEDDED_ELECTRONICS,
  Mechanical: MECHANICAL,
  Civil: CIVIL,
  Design: DESIGN,
  HR: HR,
  Finance: FINANCE,
  "Marketing & Business": MARKETING_BUSINESS,
};

// Common abbreviations / alternate spellings -> canonical skill name.
const MANUAL_ALIASES: Record<string, string> = {
  js: "JavaScript",
  "node": "Node.js",
  nodejs: "Node.js",
  "node js": "Node.js",
  ts: "TypeScript",
  py: "Python",
  reactjs: "React",
  "react.js": "React",
  vuejs: "Vue.js",
  "vue": "Vue.js",
  expressjs: "Express.js",
  "express": "Express.js",
  postgres: "PostgreSQL",
  postgresql: "PostgreSQL",
  mongo: "MongoDB",
  k8s: "Kubernetes",
  tf: "TensorFlow",
  sklearn: "Scikit-learn",
  "scikit learn": "Scikit-learn",
  ml: "Machine Learning",
  ai: "Artificial Intelligence",
  dl: "Deep Learning",
  nlp: "Natural Language Processing",
  cv: "Computer Vision",
  ui: "UI/UX Design",
  ux: "UI/UX Design",
  "ui ux": "UI/UX Design",
  "ui/ux": "UI/UX Design",
  oop: "Object-Oriented Programming",
  dsa: "Data Structures and Algorithms",
  html: "HTML5",
  css: "CSS3",
  rest: "REST API",
  restful: "REST API",
  "restful api": "REST API",
  gcp: "Google Cloud Platform",
  aws: "AWS",
  "power bi": "Power BI",
  nextjs: "Next.js",
  "next js": "Next.js",
  nuxtjs: "Nuxt.js",
  "c sharp": "C#",
  golang: "Go",
  "objective c": "Objective-C",
  "asp net": "ASP.NET",
  dotnet: ".NET",
  "spring boot": "Spring Boot",
  gcp_iam: "IAM",
};

/** alias (lowercase) -> canonical skill name */
export const SKILL_ALIAS_MAP: Map<string, string> = (() => {
  const map = new Map<string, string>();

  for (const skills of Object.values(SKILL_CATEGORIES)) {
    for (const skill of skills) {
      map.set(skill.toLowerCase(), skill);
    }
  }

  for (const [alias, canonical] of Object.entries(MANUAL_ALIASES)) {
    map.set(alias.toLowerCase(), canonical);
  }

  return map;
})();

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Longest-alias-first so "spring boot" matches before the shorter "spring".
const SORTED_ALIASES = [...SKILL_ALIAS_MAP.keys()].sort(
  (a, b) => b.length - a.length
);

// Single compiled regex over the entire dictionary for a single-pass scan.
// Word boundaries are relaxed on symbol-heavy tokens like "C++", "C#",
// ".NET" since \b doesn't work cleanly around non-word characters.
const SKILL_REGEX = new RegExp(
  SORTED_ALIASES.map((alias) => {
    const escaped = escapeRegex(alias);
    const startsWithWordChar = /^[a-z0-9]/i.test(alias);
    const endsWithWordChar = /[a-z0-9]$/i.test(alias);
    const prefix = startsWithWordChar ? "\\b" : "";
    const suffix = endsWithWordChar ? "\\b" : "";
    return `${prefix}${escaped}${suffix}`;
  }).join("|"),
  "gi"
);

/**
 * Extracts every recognized skill from free text in a single regex pass,
 * normalizes each match to its canonical name via the alias map, and
 * returns a deduplicated, sorted list.
 */
export function extractSkillsFromText(text: string): string[] {
  if (!text) return [];

  const found = new Set<string>();
  const matches = text.match(SKILL_REGEX) || [];

  for (const match of matches) {
    const canonical = SKILL_ALIAS_MAP.get(match.toLowerCase());
    if (canonical) found.add(canonical);
  }

  return [...found].sort((a, b) => a.localeCompare(b));
}