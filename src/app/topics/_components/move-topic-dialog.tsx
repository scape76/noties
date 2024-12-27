"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AsyncSelect } from "@/components/async-select";
import { z } from "zod";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  parentId: z.number().nullable(),
});

type Topic = {
  id: number;
  name: string;
};

interface MoveTopicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTopicId: number;
}

export function MoveTopicDialog({
  open,
  onOpenChange,
  currentTopicId,
}: MoveTopicDialogProps) {
  const router = useRouter();
  const utils = api.useUtils();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      parentId: null,
    },
  });

  const moveTopic = api.topics.move.useMutation({
    onSuccess: () => {
      toast.success("Topic moved successfully");
      onOpenChange(false);
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const searchTopics = async (query?: string) => {
    const topics = await utils.topics.search.fetch({ query });
    return topics.filter((topic) => topic.id !== currentTopicId);
  };

  function onSubmit(data: z.infer<typeof formSchema>) {
    moveTopic.mutate({
      id: currentTopicId,
      parentId: data.parentId,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move Topic</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="parentId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>New Parent Topic</FormLabel>
                  <FormControl>
                    <AsyncSelect<Topic>
                      fetcher={searchTopics}
                      renderOption={(topic) => (
                        <div className="flex flex-col">
                          <span>{topic.name}</span>
                        </div>
                      )}
                      getOptionValue={(topic) => String(topic.id)}
                      getDisplayValue={(topic) => topic.name}
                      value={field.value?.toString() ?? ""}
                      onChange={(value) =>
                        field.onChange(value ? Number(value) : null)
                      }
                      label="Select parent topic"
                      placeholder="Root level (no parent)"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={moveTopic.isPending}>
                {moveTopic.isPending ? "Moving..." : "Move Topic"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
