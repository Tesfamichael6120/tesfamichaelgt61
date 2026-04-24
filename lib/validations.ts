import { z } from "zod";

// User roles
export const UserRole = z.enum(["jobseeker", "employer", "admin"]);
export type UserRole = z.infer<typeof UserRole>;

// Work modes
export const WorkMode = z.enum(["remote", "hybrid", "on-site"]);
export type WorkMode = z.infer<typeof WorkMode>;

// Job types
export const JobType = z.enum([
  "full-time",
  "part-time",
  "contract",
  "internship",
  "freelance",
]);
export type JobType = z.infer<typeof JobType>;

// Application status
export const ApplicationStatus = z.enum([
  "pending",
  "reviewed",
  "shortlisted",
  "hired",
  "rejected",
]);
export type ApplicationStatus = z.infer<typeof ApplicationStatus>;

// Job status
export const JobStatus = z.enum(["active", "closed"]);
export type JobStatus = z.infer<typeof JobStatus>;

// User schema
export const UserSchema = z.object({
  clerkId: z.string().min(1),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: UserRole.default("jobseeker"),
  companyName: z.string().optional(),
  companyLogo: z.string().url().optional(),
  companyDescription: z.string().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});
export type User = z.infer<typeof UserSchema>;

// Job schema
export const JobSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  company: z.string().min(1, "Company name is required").max(100),
  companyLogo: z.string().url().optional().or(z.literal("")),
  location: z.string().min(1, "Location is required").max(100),
  workMode: WorkMode,
  type: JobType,
  salary: z.string().min(1, "Salary information is required").max(100),
  requirements: z.array(z.string()).min(1, "At least one requirement is needed"),
  description: z.string().min(50, "Description must be at least 50 characters").max(10000),
  category: z.string().min(1, "Category is required"),
  deadline: z.coerce.date(),
  postedBy: z.string().min(1),
  status: JobStatus.default("active"),
  applicationsCount: z.number().default(0),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});
export type Job = z.infer<typeof JobSchema>;

// Job form schema (for client-side validation)
export const JobFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  company: z.string().min(1, "Company name is required").max(100),
  companyLogo: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  location: z.string().min(1, "Location is required").max(100),
  workMode: WorkMode,
  type: JobType,
  salary: z.string().min(1, "Salary information is required").max(100),
  requirements: z.string().min(1, "At least one requirement is needed"),
  description: z.string().min(50, "Description must be at least 50 characters").max(10000),
  category: z.string().min(1, "Category is required"),
  deadline: z.string().min(1, "Deadline is required"),
});
export type JobFormData = z.infer<typeof JobFormSchema>;

// Application schema
export const ApplicationSchema = z.object({
  jobId: z.string().min(1),
  applicantId: z.string().min(1),
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits").max(20),
  resumeLink: z.string().url("Must be a valid URL"),
  coverLetter: z.string().min(50, "Cover letter must be at least 50 characters").max(5000),
  status: ApplicationStatus.default("pending"),
  appliedAt: z.date().default(() => new Date()),
});
export type Application = z.infer<typeof ApplicationSchema>;

// Application form schema (for client-side validation)
export const ApplicationFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits").max(20),
  resumeLink: z.string().url("Must be a valid URL to your resume"),
  coverLetter: z.string().min(50, "Cover letter must be at least 50 characters").max(5000),
});
export type ApplicationFormData = z.infer<typeof ApplicationFormSchema>;

// Job categories
export const JOB_CATEGORIES = [
  "Software Development",
  "Design & Creative",
  "Marketing",
  "Sales",
  "Customer Support",
  "Data Science",
  "Project Management",
  "Finance & Accounting",
  "Human Resources",
  "Writing & Content",
  "Education & Training",
  "Engineering",
  "Healthcare",
  "Legal",
  "Administrative",
  "Other",
] as const;

// Ethiopian cities/locations
export const LOCATIONS = [
  "Addis Ababa",
  "Dire Dawa",
  "Mekelle",
  "Gondar",
  "Hawassa",
  "Bahir Dar",
  "Adama",
  "Jimma",
  "Dessie",
  "Remote - Ethiopia",
  "Remote - Worldwide",
  "Hybrid",
] as const;

// Sanitize HTML to prevent XSS
export function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/on\w+='[^']*'/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/data:/gi, "");
}
