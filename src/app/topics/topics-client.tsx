"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EllipsisVerticalIcon } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoveTopicDialog } from "./_components/move-topic-dialog";

type TopicWithSubtopics = Topic & { subtopics: TopicWithSubtopics[] };

type TopicsClientProps = {
  initialTopics: TopicWithSubtopics[];
  initialBreadcrumbs?: Topic[];
  currentTopicId?: number;
};

export function TopicsClient({
  initialTopics,
  initialBreadcrumbs = [],
  currentTopicId,
}: TopicsClientProps) {
  const [selectedTopic, setSelectedTopic] = useState<TopicWithSubtopics | null>(
    currentTopicId
      ? initialTopics.find((t) => t.id === currentTopicId) || null
      : null,
  );
  const [breadcrumbs, setBreadcrumbs] = useState<Topic[]>(initialBreadcrumbs);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);

  const router = useRouter();
  const utils = api.useUtils();

  const deleteTopic = api.topics.delete.useMutation({
    onSuccess: async () => {
      toast.success("Topic deleted successfully");
      // If we're deleting the current topic, redirect to topics root
      if (currentTopicId) {
        router.push("/topics");
      }
      await utils.topics.getRootTopics.invalidate();
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleDelete = async (topicId: number) => {
    if (
      confirm(
        "Are you sure you want to delete this topic? All subtopics and notes will be deleted.",
      )
    ) {
      await deleteTopic.mutateAsync({ id: topicId });
    }
  };

  // Get the current topics to display
  const currentTopics = selectedTopic ? selectedTopic.subtopics : initialTopics;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/topics">Topics</BreadcrumbLink>
            </BreadcrumbItem>
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.id}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/topics/${crumb.id}`}>
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
        <div className="flex items-center gap-2">
          {currentTopicId && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <EllipsisVerticalIcon className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuItem
                  onClick={() => {
                    setIsEditOpen(true);
                  }}
                >
                  Edit Topic
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsMoveDialogOpen(true)}>
                  Move Topic
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => handleDelete(currentTopicId)}
                >
                  Delete Topic
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Button onClick={() => setIsCreateOpen(true)}>
            Create New Topic
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {currentTopics?.map((topic) => (
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

      {/* Create topic dialog */}
      <CreateTopicForm
        parentId={selectedTopic?.id}
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />

      {/* Edit topic dialog */}
      {selectedTopic && (
        <EditTopicForm
          topic={selectedTopic}
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
        />
      )}

      {/* Move topic dialog */}
      {currentTopicId && (
        <MoveTopicDialog
          open={isMoveDialogOpen}
          onOpenChange={setIsMoveDialogOpen}
          currentTopicId={currentTopicId}
        />
      )}
    </div>
  );
}
