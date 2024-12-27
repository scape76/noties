import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Validation schemas
const createTopicSchema = z.object({
  name: z.string().min(1, "Name is required"),
  parentId: z.number().nullable(),
});

const editTopicSchema = z.object({
  name: z.string().min(1, "Name is required"),
  id: z.number(),
});

const moveTopicSchema = z.object({
  id: z.number(),
  parentId: z.number().nullable(),
});

type CreateTopicFormProps = {
  parentId?: number;
  onSuccess?: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateTopicForm({
  parentId,
  onSuccess,
  open,
  onOpenChange,
}: CreateTopicFormProps) {
  const router = useRouter();
  const form = useForm<z.infer<typeof createTopicSchema>>({
    resolver: zodResolver(createTopicSchema),
    defaultValues: {
      name: "",
      parentId: parentId || null,
    },
  });

  const utils = api.useUtils();

  const createTopic = api.topics.create.useMutation({
    onSuccess: () => {
      // router.refresh();
      location.reload();
      toast.success("Topic created successfully");
      form.reset();
      onSuccess?.();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  function onSubmit(data: z.infer<typeof createTopicSchema>) {
    createTopic.mutate(data);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Topic</DialogTitle>
          <DialogDescription>Enter a name for your new topic</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={createTopic.isPending}>
              Create Topic
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

type EditTopicFormProps = {
  topic: { id: number; name: string };
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditTopicForm({
  topic,
  open,
  onOpenChange,
}: EditTopicFormProps) {
  const router = useRouter();
  const form = useForm<z.infer<typeof editTopicSchema>>({
    resolver: zodResolver(editTopicSchema),
    defaultValues: {
      name: topic.name,
      id: topic.id,
    },
  });

  const editTopic = api.topics.update.useMutation({
    onSuccess: () => {
      toast.success("Topic updated successfully");
      onOpenChange(false);
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  function onSubmit(data: z.infer<typeof editTopicSchema>) {
    editTopic.mutate(data);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Topic</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={editTopic.isPending}>
              Save Changes
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

type MoveTopicFormProps = {
  topic: { id: number; name: string };
  availableParents: Array<{ id: number; name: string }>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function MoveTopicForm({
  topic,
  availableParents,
  open,
  onOpenChange,
}: MoveTopicFormProps) {
  const router = useRouter();
  const form = useForm<z.infer<typeof moveTopicSchema>>({
    resolver: zodResolver(moveTopicSchema),
    defaultValues: {
      id: topic.id,
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

  function onSubmit(data: z.infer<typeof moveTopicSchema>) {
    moveTopic.mutate(data);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move Topic</DialogTitle>
          <DialogDescription>Select a new parent topic</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="parentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent Topic</FormLabel>
                  <Select
                    onValueChange={(value) =>
                      field.onChange(value ? Number(value) : null)
                    }
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a parent topic" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Root Level</SelectItem>
                      {availableParents.map((parent) => (
                        <SelectItem
                          key={parent.id}
                          value={parent.id.toString()}
                        >
                          {parent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={moveTopic.isPending}>
              Move Topic
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
