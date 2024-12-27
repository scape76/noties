import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { db } from "@/server/db";
import { eq, isNull, and } from "drizzle-orm";
import { topics } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";
import { revalidatePath } from "next/cache";

// Input validation schemas
const createTopicSchema = z.object({
  name: z.string().min(1, "Name is required"),
  parentId: z.number().nullable(),
});

const updateTopicSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Name is required"),
});

const moveTopicSchema = z.object({
  id: z.number(),
  parentId: z.number().nullable(),
});

const deleteTopicSchema = z.object({
  id: z.number(),
});

const getTopicByIdSchema = z.object({
  id: z.number(),
});

export const topicsRouter = createTRPCRouter({
  getRootTopics: protectedProcedure.query(async ({ ctx }) => {
    const rootTopics = await db.query.topics.findMany({
      where: (topics, { eq, and, isNull }) =>
        and(eq(topics.userId, ctx.session.user.id), isNull(topics.parentId)),
      with: {
        subtopics: {
          with: {
            subtopics: true,
          },
        },
      },
    });
    return rootTopics;
  }),

  getById: protectedProcedure
    .input(getTopicByIdSchema)
    .query(async ({ ctx, input }) => {
      const topic = await db.query.topics.findFirst({
        where: (topics, { eq, and }) =>
          and(eq(topics.id, input.id), eq(topics.userId, ctx.session.user.id)),
        with: {
          subtopics: {
            with: {
              subtopics: true,
            },
          },
        },
      });

      if (!topic) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Topic not found",
        });
      }

      return topic;
    }),

  getBreadcrumbTrail: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const breadcrumbs = [];
      let currentId = input.id;

      while (currentId) {
        const topic = await db.query.topics.findFirst({
          where: (topics, { eq, and }) =>
            and(
              eq(topics.id, currentId),
              eq(topics.userId, ctx.session.user.id),
            ),
        });

        if (!topic) break;

        breadcrumbs.unshift(topic);
        currentId = topic.parentId || 0;
      }

      return breadcrumbs;
    }),
  // Create a new topic
  create: protectedProcedure
    .input(createTopicSchema)
    .mutation(async ({ ctx, input }) => {
      // If parentId is provided, verify it exists and belongs to the user
      if (input.parentId) {
        const parentTopic = await db.query.topics.findFirst({
          where: (topics, { eq, and }) =>
            and(
              eq(topics.id, input.parentId!),
              eq(topics.userId, ctx.session.user.id),
            ),
        });

        if (!parentTopic) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Parent topic not found",
          });
        }
      }

      const [newTopic] = await db
        .insert(topics)
        .values({
          name: input.name,
          parentId: input.parentId,
          userId: ctx.session.user.id,
        })
        .returning();

      revalidatePath(`/topics/${input.parentId}`);

      return newTopic;
    }),

  // Update a topic's name
  update: protectedProcedure
    .input(updateTopicSchema)
    .mutation(async ({ ctx, input }) => {
      const topic = await db.query.topics.findFirst({
        where: (topics, { eq, and }) =>
          and(eq(topics.id, input.id), eq(topics.userId, ctx.session.user.id)),
      });

      if (!topic) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Topic not found",
        });
      }

      const [updatedTopic] = await db
        .update(topics)
        .set({ name: input.name })
        .where(
          and(eq(topics.id, input.id), eq(topics.userId, ctx.session.user.id)),
        )
        .returning();

      revalidatePath(`/topics/${input.id}`);

      return updatedTopic;
    }),

  // Move a topic to a new parent
  move: protectedProcedure
    .input(moveTopicSchema)
    .mutation(async ({ ctx, input }) => {
      const topic = await db.query.topics.findFirst({
        where: (topics, { eq, and }) =>
          and(eq(topics.id, input.id), eq(topics.userId, ctx.session.user.id)),
      });

      if (!topic) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Topic not found",
        });
      }

      // If moving to a new parent, verify the parent exists and belongs to the user
      if (input.parentId) {
        const parentTopic = await db.query.topics.findFirst({
          where: (topics, { eq, and }) =>
            and(
              eq(topics.id, input.parentId!),
              eq(topics.userId, ctx.session.user.id),
            ),
        });

        if (!parentTopic) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Parent topic not found",
          });
        }

        // Prevent circular references
        if (input.parentId === input.id) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "A topic cannot be its own parent",
          });
        }
      }

      const [movedTopic] = await db
        .update(topics)
        .set({ parentId: input.parentId })
        .where(
          and(eq(topics.id, input.id), eq(topics.userId, ctx.session.user.id)),
        )
        .returning();

      return movedTopic;
    }),

  // Delete a topic and all its subtopics
  delete: protectedProcedure
    .input(deleteTopicSchema)
    .mutation(async ({ ctx, input }) => {
      const topic = await db.query.topics.findFirst({
        where: (topics, { eq, and }) =>
          and(eq(topics.id, input.id), eq(topics.userId, ctx.session.user.id)),
        with: {
          subtopics: true,
        },
      });

      if (!topic) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Topic not found",
        });
      }

      await db.delete(topics).where(eq(topics.id, input.id));

      return { success: true };
    }),

  search: protectedProcedure
    .input(
      z.object({
        query: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // let filters = eq(topics.userId, ctx.session.user.id);

      // if (input.query) {
      //   filters = and(filters, like(topics.name, `%${input.query}%`));
      // }

      const topics = await db.query.topics.findMany({
        where: (topics, { and, eq, like }) =>
          and(
            eq(topics.userId, ctx.session.user.id),
            input.query ? like(topics.name, `%${input.query}%`) : undefined,
          ),
        limit: 10,
      });

      return topics;
    }),
  // Get subtopics of a specific topic
  getSubtopics: protectedProcedure
    .input(getTopicByIdSchema)
    .query(async ({ ctx, input }) => {
      const subtopics = await db.query.topics.findMany({
        where: (topics, { eq, and }) =>
          and(
            eq(topics.parentId, input.id),
            eq(topics.userId, ctx.session.user.id),
          ),
        with: {
          subtopics: true,
        },
      });

      return subtopics;
    }),
});
