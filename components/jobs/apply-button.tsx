"use client";

import { useState } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";
import { toast } from "sonner";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ApplyButtonProps {
  jobId: string;
  jobTitle: string;
  disabled?: boolean;
  className?: string;
}

export function ApplyButton({
  jobId,
  jobTitle,
  disabled,
  className,
}: ApplyButtonProps) {
  const { isSignedIn, user } = useUser();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    resumeLink: "",
    coverLetter: "",
  });

  // Pre-fill form with user data when modal opens
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && user) {
      setFormData((prev) => ({
        ...prev,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        email: user.emailAddresses[0]?.emailAddress || "",
      }));
    }
    setOpen(newOpen);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId,
          ...formData,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit application");
      }

      toast.success("Application submitted successfully!", {
        description: "The employer will review your application soon.",
      });
      setOpen(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        resumeLink: "",
        coverLetter: "",
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isSignedIn) {
    return (
      <SignInButton mode="modal">
        <Button size="lg" className={cn("gap-2", className)} disabled={disabled}>
          <Send className="h-4 w-4" />
          Sign in to Apply
        </Button>
      </SignInButton>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="lg" className={cn("gap-2", className)} disabled={disabled}>
          <Send className="h-4 w-4" />
          Apply Now
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Apply for {jobTitle}</DialogTitle>
          <DialogDescription>
            Fill out the form below to submit your application. Make sure all
            information is accurate.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="+251 91 234 5678"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="resumeLink">Resume Link *</Label>
            <Input
              id="resumeLink"
              name="resumeLink"
              type="url"
              value={formData.resumeLink}
              onChange={handleChange}
              required
              placeholder="https://drive.google.com/your-resume"
            />
            <p className="text-xs text-muted-foreground">
              Provide a link to your resume (Google Drive, Dropbox, etc.)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverLetter">Cover Letter *</Label>
            <Textarea
              id="coverLetter"
              name="coverLetter"
              value={formData.coverLetter}
              onChange={handleChange}
              required
              rows={5}
              placeholder="Tell us why you're a great fit for this position..."
              minLength={50}
            />
            <p className="text-xs text-muted-foreground">
              Minimum 50 characters
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Application
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
