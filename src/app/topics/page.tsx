import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, BookOpen } from "lucide-react";
import { TopicsClient } from "./topics-client";
import { api } from "@/trpc/server";
import { auth } from "@/server/auth";

export default async function TopicsPage() {
  const session = await auth();

  if (!session) redirect("/login");

  const rootTopics = await api.topics.getRootTopics();

  return (
    <div className="container mx-auto p-6">
      <TopicsClient initialTopics={rootTopics} />
      {rootTopics.length === 0 && (
        <Card className="border-dashed">
          <CardHeader className="text-center">
            <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-6 text-muted-foreground">
              Get started by creating your first topic. Topics help you organize
              your notes and keep your thoughts structured.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
