"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  CreateTopicForm,
  EditTopicForm,
  MoveTopicForm,
} from "./_components/topic-forms";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import Link from "next/link";
import type { Topic } from "@/server/db/schema";
import React from "react";

type TopicsClientProps = {
  initialTopics: (Topic & { subtopics: Topic[] })[];
  initialBreadcrumbs?: Topic[];
  currentTopicId?: number;
};

export function TopicsClient({
  initialTopics,
  initialBreadcrumbs = [],
  currentTopicId,
}: TopicsClientProps) {
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(
    currentTopicId
      ? initialTopics.find((t) => t.id === currentTopicId) || null
      : null,
  );
  const [breadcrumbs, setBreadcrumbs] = useState<Topic[]>(initialBreadcrumbs);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isMoveOpen, setIsMoveOpen] = useState(false);

  const router = useRouter();

  const deleteTopic = api.topics.delete.useMutation({
    onSuccess: () => {
      toast.success("Topic deleted successfully");
      // If we're on a topic page and delete it, go back to root
      if (currentTopicId) {
        router.push("/topics");
      } else {
        router.refresh();
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleBreadcrumbClick = (topic: Topic, index: number) => {
    if (topic.id === 0) {
      // Clicking "Topics" breadcrumb
      router.push("/topics");
      return;
    }

    setBreadcrumbs((prev) => prev.slice(0, index + 1));
    setSelectedTopic(topic);
    router.push(`/topics/${topic.id}`);
  };

  const handleDelete = async (topicId: number) => {
    if (
      confirm(
        "Are you sure you want to delete this topic? All subtopics will also be deleted.",
      )
    ) {
      await deleteTopic.mutateAsync({ id: topicId });
    }
  };

  // Get the current topics to display
  const currentTopics = selectedTopic ? selectedTopic.subtopics : initialTopics;

  const availableParents = initialTopics.filter(
    (t) => t.id !== selectedTopic?.id,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/topics"
                onClick={() =>
                  handleBreadcrumbClick({ id: 0, name: "Topics" } as Topic, -1)
                }
              >
                Topics
              </BreadcrumbLink>
            </BreadcrumbItem>
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.id}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink
                    href={`/topics/${crumb.id}`}
                    onClick={() => handleBreadcrumbClick(crumb, index)}
                  >
                    {crumb.name}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {selectedTopic ? selectedTopic.name : "My Topics"}
        </h1>
        <Button onClick={() => setIsCreateOpen(true)}>Create New Topic</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {currentTopics.map((topic) => (
          <Card key={topic.id}>
            <CardHeader>
              <CardTitle>{topic.name}</CardTitle>
              <CardDescription>
                {topic.subtopics?.length || 0} subtopics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Link
                  className={buttonVariants({ variant: "outline" })}
                  href={`/topics/${topic.id}`}
                >
                  View
                </Link>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedTopic(topic);
                    setIsEditOpen(true);
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedTopic(topic);
                    setIsMoveOpen(true);
                  }}
                >
                  Move
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(topic.id)}
                  disabled={deleteTopic.isPending}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Forms */}
      <CreateTopicForm
        parentId={selectedTopic?.id}
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />

      {selectedTopic && (
        <>
          <EditTopicForm
            topic={selectedTopic}
            open={isEditOpen}
            onOpenChange={setIsEditOpen}
          />
          <MoveTopicForm
            topic={selectedTopic}
            availableParents={availableParents}
            open={isMoveOpen}
            onOpenChange={setIsMoveOpen}
          />
        </>
      )}
    </div>
  );
}
