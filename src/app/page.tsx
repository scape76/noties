import Link from "next/link";
import { Header } from "@/components/header";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PenLine, BookMarked, Share2, Sparkles } from "lucide-react";
import { auth } from "@/server/auth";

export default async function Home() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 py-24 md:py-32">
        <div className="text-center">
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-primary md:text-6xl">
            Capture Your Thoughts,
            <span className="mt-2 block text-primary/80">
              Unlock Your Potential
            </span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-muted-foreground">
            A beautiful and intuitive note-taking app that helps you organize
            your ideas, boost productivity, and collaborate seamlessly.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            {session ? (
              <Link
                href="/topics"
                className={buttonVariants({ variant: "secondary" })}
              >
                My topics
              </Link>
            ) : (
              <>
                <Button size="lg" className="text-lg">
                  Get Started Free
                </Button>
                <Button size="lg" variant="outline" className="text-lg">
                  Watch Demo
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/50 px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Everything you need for better note-taking
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<PenLine className="h-12 w-12" />}
              title="Effortless Writing"
              description="Rich text editor with markdown support and customizable shortcuts for faster note-taking."
            />
            <FeatureCard
              icon={<BookMarked className="h-12 w-12" />}
              title="Smart Organization"
              description="Nested notebooks, tags, and powerful search to keep your notes organized and accessible."
            />
            <FeatureCard
              icon={<Share2 className="h-12 w-12" />}
              title="Seamless Sharing"
              description="Collaborate with team members in real-time and share notes with customizable permissions."
            />
            <FeatureCard
              icon={<Sparkles className="h-12 w-12" />}
              title="AI-Powered Insights"
              description="Get smart suggestions and automatic categorization powered by advanced AI."
            />
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <Card>
            <CardContent className="pt-12">
              <div className="mb-4">
                <div className="flex justify-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="h-6 w-6 text-yellow-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <blockquote className="mb-8 text-2xl font-medium">
                "This app has completely transformed how I take and organize my
                notes. The AI features are incredible, and the interface is
                beautiful!"
              </blockquote>
              <footer className="text-sm text-muted-foreground">
                Sarah Chen, Product Designer
              </footer>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary px-4 py-16 text-primary-foreground">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-3xl font-bold">
            Start Taking Better Notes Today
          </h2>
          <p className="mb-8 text-xl text-primary-foreground/80">
            Join thousands of users who have already transformed their
            note-taking experience.
          </p>
          <Button size="lg" variant="secondary" className="text-lg">
            Try It Free →
          </Button>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="text-center">
      <CardHeader>
        <div className="mb-4 flex justify-center">{icon}</div>
        <CardTitle className="mb-2 text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}
