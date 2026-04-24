export const APP_NAME = "Ethiopia Remote Talent";
export const APP_DESCRIPTION =
  "Connect with top Ethiopian talent and remote opportunities. The leading job board for Ethiopian professionals.";
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://ethiopiaremotetalent.com";

export const ITEMS_PER_PAGE = 10;

export const ETHIOPIAN_CITIES = [
  "Addis Ababa",
  "Dire Dawa",
  "Mekelle",
  "Gondar",
  "Bahir Dar",
  "Hawassa",
  "Adama",
  "Jimma",
  "Dessie",
  "Harar",
  "Remote - Ethiopia",
  "Remote - Worldwide",
];

export const SALARY_RANGES = [
  { value: "0-25000", label: "Under 25,000 ETB" },
  { value: "25000-50000", label: "25,000 - 50,000 ETB" },
  { value: "50000-100000", label: "50,000 - 100,000 ETB" },
  { value: "100000-200000", label: "100,000 - 200,000 ETB" },
  { value: "200000+", label: "200,000+ ETB" },
  { value: "usd", label: "USD Salary" },
];

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/jobs", label: "Browse Jobs" },
  { href: "/companies", label: "Companies" },
];

export const FOOTER_LINKS = {
  jobSeekers: [
    { href: "/jobs", label: "Browse Jobs" },
    { href: "/companies", label: "Companies" },
    { href: "/dashboard", label: "My Applications" },
  ],
  employers: [
    { href: "/employer", label: "Employer Dashboard" },
    { href: "/employer/jobs/new", label: "Post a Job" },
    { href: "/employer/jobs", label: "Manage Jobs" },
  ],
  company: [
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
  ],
};

export const FEATURED_COMPANIES = [
  {
    name: "Ethiopian Airlines",
    logo: null,
    jobCount: 15,
  },
  {
    name: "Safaricom Ethiopia",
    logo: null,
    jobCount: 12,
  },
  {
    name: "Commercial Bank of Ethiopia",
    logo: null,
    jobCount: 8,
  },
  {
    name: "Heineken Ethiopia",
    logo: null,
    jobCount: 6,
  },
  {
    name: "Ethio Telecom",
    logo: null,
    jobCount: 10,
  },
];
