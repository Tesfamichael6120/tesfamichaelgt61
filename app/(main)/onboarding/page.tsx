"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { User, Building2, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Role = "jobseeker" | "employer";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companyInfo, setCompanyInfo] = useState({
    companyName: "",
    companyDescription: "",
  });

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
  };

  const handleSubmit = async () => {
    if (!selectedRole) return;

    setIsSubmitting(true);
    try {
      const body: Record<string, string> = { role: selectedRole };

      if (selectedRole === "employer") {
        body.companyName = companyInfo.companyName;
        body.companyDescription = companyInfo.companyDescription;
      }

      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error("Failed to update profile");
      }

      toast.success("Profile updated successfully!");

      // Reload to get updated metadata
      window.location.href = selectedRole === "employer" ? "/employer" : "/dashboard";
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-12">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="mb-2 text-3xl font-bold">
          Welcome to Ethiopia Remote Talent
        </h1>
        <p className="mb-8 text-muted-foreground">
          Let&apos;s get you set up. Are you looking for a job or hiring talent?
        </p>

        {/* Role Selection */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          {/* Job Seeker Card */}
          <Card
            className={cn(
              "cursor-pointer transition-all hover:border-primary/50",
              selectedRole === "jobseeker" && "border-2 border-primary"
            )}
            onClick={() => handleRoleSelect("jobseeker")}
          >
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <User className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Job Seeker</h3>
              <p className="text-sm text-muted-foreground">
                I&apos;m looking for job opportunities
              </p>
            </CardContent>
          </Card>

          {/* Employer Card */}
          <Card
            className={cn(
              "cursor-pointer transition-all hover:border-primary/50",
              selectedRole === "employer" && "border-2 border-primary"
            )}
            onClick={() => handleRoleSelect("employer")}
          >
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/50">
                <Building2 className="h-8 w-8 text-secondary-foreground" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Employer</h3>
              <p className="text-sm text-muted-foreground">
                I want to hire Ethiopian talent
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Employer Additional Info */}
        {selectedRole === "employer" && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Company Information</CardTitle>
              <CardDescription>
                Tell us about your company
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  value={companyInfo.companyName}
                  onChange={(e) =>
                    setCompanyInfo((prev) => ({
                      ...prev,
                      companyName: e.target.value,
                    }))
                  }
                  placeholder="Your company name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyDescription">
                  Company Description (Optional)
                </Label>
                <Textarea
                  id="companyDescription"
                  value={companyInfo.companyDescription}
                  onChange={(e) =>
                    setCompanyInfo((prev) => ({
                      ...prev,
                      companyDescription: e.target.value,
                    }))
                  }
                  placeholder="Tell us about your company..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Continue Button */}
        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={
            !selectedRole ||
            isSubmitting ||
            (selectedRole === "employer" && !companyInfo.companyName)
          }
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Setting up...
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
