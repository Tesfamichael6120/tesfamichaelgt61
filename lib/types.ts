import { ObjectId } from "mongodb";

export type UserRole = "jobseeker" | "employer" | "admin";

export type JobStatus = "active" | "closed";

export type WorkMode = "remote" | "hybrid" | "on-site";

export type ApplicationStatus =
  | "pending"
  | "reviewed"
  | "shortlisted"
  | "hired"
  | "rejected";

export interface User {
  _id: ObjectId;
  clerkId: string;
  email?: string;
  name?: string;
  role: UserRole;
  companyName?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Job {
  _id: ObjectId;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  workMode: WorkMode;
  type: string;
  salary?: string;
  requirements: string[];
  description: string;
  category: string;
  deadline: Date;
  postedBy: string;
  status: JobStatus;
  createdAt: Date;
  updatedAt?: Date;
  applicationsCount: number;
}

export interface Application {
  _id: ObjectId;
  jobId: ObjectId;
  applicantId: string;
  name: string;
  email: string;
  phone: string;
  resumeLink: string;
  coverLetter: string;
  status: ApplicationStatus;
  appliedAt: Date;
  updatedAt?: Date;
}

export interface SavedJob {
  _id: ObjectId;
  userId: string;
  jobId: ObjectId;
  savedAt: Date;
}

export interface JobWithStringId extends Omit<Job, "_id"> {
  _id: string;
}

export interface ApplicationWithStringId extends Omit<Application, "_id" | "jobId"> {
  _id: string;
  jobId: string;
}

export interface UserWithStringId extends Omit<User, "_id"> {
  _id: string;
}

export interface JobFilters {
  search?: string;
  location?: string;
  workMode?: WorkMode;
  type?: string;
  category?: string;
  salaryMin?: number;
  salaryMax?: number;
  sortBy?: "newest" | "oldest";
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  pages: number;
  currentPage: number;
}

export const JOB_CATEGORIES = [
  "Engineering",
  "Design",
  "Marketing",
  "Sales",
  "Customer Success",
  "Human Resources",
  "Finance",
  "Operations",
  "Data",
  "Product",
  "Legal",
  "Other",
] as const;

export const JOB_TYPES = [
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
  "Freelance",
] as const;

export const WORK_MODES = [
  { value: "remote" as const, label: "Remote" },
  { value: "hybrid" as const, label: "Hybrid" },
  { value: "on-site" as const, label: "On-site" },
] as const;

export const APPLICATION_STATUSES = [
  { value: "pending" as const, label: "Pending", color: "yellow" },
  { value: "reviewed" as const, label: "Reviewed", color: "blue" },
  { value: "shortlisted" as const, label: "Shortlisted", color: "green" },
  { value: "hired" as const, label: "Hired", color: "emerald" },
  { value: "rejected" as const, label: "Rejected", color: "red" },
] as const;
