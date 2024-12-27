import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { eq, and } from "drizzle-orm";
import { notes } from "@/server/db/schema";
import * as z from "zod";
import { TRPCError } from "@trpc/server";

export const notesRouter = createTRPCRouter({
  // Get all notes for a topic
  getByTopicId: protectedProcedure
    .input(z.object({ topicId: z.number() }))
    .query(async ({ ctx, input }) => {
      const topicNotes = await db.query.notes.findMany({
        where: eq(notes.topicId, input.topicId),
        orderBy: (notes, { desc }) => [desc(notes.id)],
      });

      return topicNotes;
    }),
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const note = await db.query.notes.findFirst({
        where: (notes, { eq }) => eq(notes.id, input.id),
        with: {
          topic: true,
        },
      });

      if (!note) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Note not found",
        });
      }

      return note;
    }),
  // Add this to your existing notesRouter
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        body: z.any(),
        topicId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify topic exists and belongs to user
      const topic = await db.query.topics.findFirst({
        where: (topics, { eq, and }) =>
          and(
            eq(topics.id, input.topicId),
            eq(topics.userId, ctx.session.user.id),
          ),
      });

      if (!topic) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Topic not found",
        });
      }

      const [note] = await db
        .insert(notes)
        .values({
          name: input.name,
          body: input.body,
          topicId: input.topicId,
        })
        .returning();

      return note;
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1),
        body: z.any(),
        topicId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify note exists and belongs to user (through topic)
      const note = await db.query.notes.findFirst({
        where: (notes, { eq }) => eq(notes.id, input.id),
        with: {
          topic: true,
        },
      });

      if (!note || note.topic?.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Note not found",
        });
      }

      // Verify the new topic exists and belongs to the user
      const newTopic = await db.query.topics.findFirst({
        where: (topics, { eq, and }) =>
          and(
            eq(topics.id, input.topicId),
            eq(topics.userId, ctx.session.user.id),
          ),
      });

      if (!newTopic) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Topic not found",
        });
      }

      const [updatedNote] = await db
        .update(notes)
        .set({
          name: input.name,
          body: input.body,
          topicId: input.topicId,
          editedAt: new Date(),
        })
        .where(eq(notes.id, input.id))
        .returning();

      return updatedNote;
    }),
});
