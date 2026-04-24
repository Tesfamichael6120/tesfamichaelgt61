import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI!;

const sampleJobs = [
  {
    title: "Senior Full Stack Developer",
    company: "TechEthiopia",
    companyLogo: null,
    location: "Addis Ababa, Ethiopia",
    workMode: "hybrid",
    type: "Full-time",
    salary: "80,000 - 120,000 ETB/month",
    requirements: [
      "5+ years of experience with React and Node.js",
      "Experience with MongoDB and PostgreSQL",
      "Strong problem-solving skills",
      "Excellent communication in English",
    ],
    description:
      "We are looking for an experienced Full Stack Developer to join our growing team. You will be responsible for building and maintaining web applications that serve thousands of users across Ethiopia.",
    category: "Engineering",
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    postedBy: "system",
    status: "active",
    createdAt: new Date(),
    applicationsCount: 0,
  },
  {
    title: "Product Designer",
    company: "Innovation Hub Africa",
    companyLogo: null,
    location: "Addis Ababa, Ethiopia",
    workMode: "remote",
    type: "Full-time",
    salary: "60,000 - 90,000 ETB/month",
    requirements: [
      "3+ years of product design experience",
      "Proficiency in Figma and Adobe Creative Suite",
      "Strong portfolio demonstrating UX/UI skills",
      "Experience with user research",
    ],
    description:
      "Join our design team to create beautiful and intuitive user experiences for African startups. You will work closely with product managers and engineers to bring ideas to life.",
    category: "Design",
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    postedBy: "system",
    status: "active",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    applicationsCount: 0,
  },
  {
    title: "Digital Marketing Specialist",
    company: "Ethiopian Airlines",
    companyLogo: null,
    location: "Addis Ababa, Ethiopia",
    workMode: "on-site",
    type: "Full-time",
    salary: "50,000 - 70,000 ETB/month",
    requirements: [
      "2+ years of digital marketing experience",
      "Experience with Google Ads and Facebook Ads",
      "Knowledge of SEO and content marketing",
      "Fluent in English and Amharic",
    ],
    description:
      "Ethiopian Airlines is seeking a Digital Marketing Specialist to help grow our online presence and drive customer engagement across digital channels.",
    category: "Marketing",
    deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    postedBy: "system",
    status: "active",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    applicationsCount: 0,
  },
  {
    title: "Backend Engineer (Python)",
    company: "Ride Ethiopia",
    companyLogo: null,
    location: "Remote - Ethiopia",
    workMode: "remote",
    type: "Full-time",
    salary: "70,000 - 100,000 ETB/month",
    requirements: [
      "4+ years of Python development",
      "Experience with Django or FastAPI",
      "Knowledge of microservices architecture",
      "Experience with AWS or GCP",
    ],
    description:
      "Build the backend infrastructure that powers our ride-sharing platform. Work with a talented team to scale our services to millions of users.",
    category: "Engineering",
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    postedBy: "system",
    status: "active",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    applicationsCount: 0,
  },
  {
    title: "Customer Success Manager",
    company: "Safaricom Ethiopia",
    companyLogo: null,
    location: "Addis Ababa, Ethiopia",
    workMode: "hybrid",
    type: "Full-time",
    salary: "55,000 - 75,000 ETB/month",
    requirements: [
      "3+ years in customer success or account management",
      "Strong relationship building skills",
      "Experience with CRM tools",
      "Excellent presentation skills",
    ],
    description:
      "Lead customer success initiatives and ensure our enterprise clients achieve their business goals using our telecom solutions.",
    category: "Customer Success",
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    postedBy: "system",
    status: "active",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    applicationsCount: 0,
  },
  {
    title: "Data Analyst Intern",
    company: "Awash Bank",
    companyLogo: null,
    location: "Addis Ababa, Ethiopia",
    workMode: "on-site",
    type: "Internship",
    salary: "15,000 - 20,000 ETB/month",
    requirements: [
      "Currently pursuing degree in Statistics, Mathematics, or related field",
      "Basic knowledge of SQL and Excel",
      "Familiarity with data visualization tools",
      "Eagerness to learn",
    ],
    description:
      "Join our data team as an intern and learn how data drives decision-making in one of Ethiopia's leading banks. This is a 6-month paid internship with potential for full-time conversion.",
    category: "Data",
    deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    postedBy: "system",
    status: "active",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    applicationsCount: 0,
  },
  {
    title: "Mobile App Developer (Flutter)",
    company: "Gebeya Inc",
    companyLogo: null,
    location: "Remote - Worldwide",
    workMode: "remote",
    type: "Contract",
    salary: "$2,000 - $4,000 USD/month",
    requirements: [
      "3+ years of Flutter development",
      "Published apps on App Store and Play Store",
      "Experience with REST APIs and state management",
      "Knowledge of CI/CD pipelines",
    ],
    description:
      "Join our pan-African tech talent marketplace as a contract mobile developer. Build features that connect African tech talent with global opportunities.",
    category: "Engineering",
    deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    postedBy: "system",
    status: "active",
    createdAt: new Date(),
    applicationsCount: 0,
  },
  {
    title: "HR Manager",
    company: "Heineken Ethiopia",
    companyLogo: null,
    location: "Addis Ababa, Ethiopia",
    workMode: "on-site",
    type: "Full-time",
    salary: "100,000 - 150,000 ETB/month",
    requirements: [
      "7+ years of HR experience",
      "Experience in manufacturing sector preferred",
      "Strong knowledge of Ethiopian labor law",
      "MBA or relevant advanced degree",
    ],
    description:
      "Lead HR operations for one of Ethiopia's largest beverage companies. Oversee recruitment, employee relations, and organizational development.",
    category: "Human Resources",
    deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
    postedBy: "system",
    status: "active",
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    applicationsCount: 0,
  },
];

async function seed() {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI is not set");
    process.exit(1);
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("ethiopia-remote-talent");

    // Create indexes
    console.log("Creating indexes...");

    await db.collection("jobs").createIndex({ title: "text", company: "text", description: "text" });
    await db.collection("jobs").createIndex({ status: 1 });
    await db.collection("jobs").createIndex({ category: 1 });
    await db.collection("jobs").createIndex({ workMode: 1 });
    await db.collection("jobs").createIndex({ type: 1 });
    await db.collection("jobs").createIndex({ postedBy: 1 });
    await db.collection("jobs").createIndex({ createdAt: -1 });

    await db.collection("users").createIndex({ clerkId: 1 }, { unique: true });
    await db.collection("users").createIndex({ role: 1 });
    await db.collection("users").createIndex({ email: 1 });

    await db.collection("applications").createIndex({ jobId: 1 });
    await db.collection("applications").createIndex({ applicantId: 1 });
    await db.collection("applications").createIndex({ status: 1 });

    await db.collection("savedJobs").createIndex({ userId: 1, jobId: 1 }, { unique: true });

    console.log("Indexes created");

    // Check if we already have jobs
    const existingJobs = await db.collection("jobs").countDocuments();
    if (existingJobs > 0) {
      console.log(`Database already has ${existingJobs} jobs. Skipping seed.`);
    } else {
      // Insert sample jobs
      const result = await db.collection("jobs").insertMany(sampleJobs);
      console.log(`Inserted ${result.insertedCount} sample jobs`);
    }

    console.log("Seed completed successfully");
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

seed();
