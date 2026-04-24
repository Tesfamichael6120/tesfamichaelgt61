import { Metadata } from "next";
import {
  Users,
  Briefcase,
  Globe,
  Target,
  Award,
  Heart,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "About Us | Ethiopia Remote Talent",
  description:
    "Learn about Ethiopia Remote Talent - connecting Ethiopian professionals with local and international opportunities.",
};

const stats = [
  { label: "Jobs Posted", value: "5,000+", icon: Briefcase },
  { label: "Active Users", value: "20,000+", icon: Users },
  { label: "Companies", value: "500+", icon: Globe },
  { label: "Successful Hires", value: "10,000+", icon: Award },
];

const values = [
  {
    title: "Empowering Talent",
    description:
      "We believe in the potential of Ethiopian professionals and provide them with opportunities to showcase their skills globally.",
    icon: Users,
  },
  {
    title: "Bridging Opportunities",
    description:
      "We connect local talent with both Ethiopian companies and international remote opportunities.",
    icon: Globe,
  },
  {
    title: "Quality First",
    description:
      "We maintain high standards for job listings and ensure both employers and job seekers have a great experience.",
    icon: Target,
  },
  {
    title: "Community Driven",
    description:
      "We are built by Ethiopians for Ethiopians, understanding the unique challenges and opportunities in our market.",
    icon: Heart,
  },
];

export default function AboutPage() {
  return (
    <div className="py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">About Ethiopia Remote Talent</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We are on a mission to connect Ethiopian talent with meaningful
            career opportunities, both locally and globally.
          </p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-6 text-center">
                <stat.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Story */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Our Story</h2>
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p className="text-muted-foreground leading-relaxed mb-4">
              Ethiopia Remote Talent was founded with a simple yet powerful
              vision: to bridge the gap between talented Ethiopian professionals
              and the opportunities they deserve. We recognized that while
              Ethiopia has a wealth of skilled individuals, many struggle to find
              quality job opportunities that match their potential.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Our platform serves as a bridge between job seekers and employers,
              whether they are local Ethiopian companies, international
              organizations operating in Ethiopia, or global companies looking to
              hire remote talent from Ethiopia.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We are committed to building a platform that is optimized for the
              Ethiopian context, understanding the challenges of slow internet
              connections and ensuring our platform is accessible and fast for
              all users across the country.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Our Values</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {values.map((value) => (
              <Card key={value.title}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <value.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">{value.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {value.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <div className="text-center bg-muted rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-2">Get in Touch</h2>
          <p className="text-muted-foreground mb-4">
            Have questions or feedback? We would love to hear from you.
          </p>
          <a
            href="mailto:contact@ethiopiaremotetalent.com"
            className="text-primary font-medium hover:underline"
          >
            contact@ethiopiaremotetalent.com
          </a>
        </div>
      </div>
    </div>
  );
}
