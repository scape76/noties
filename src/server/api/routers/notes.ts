import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { eq, and } from "drizzle-orm";
import { notes } from "@/server/db/schema";
import * as z from "zod";

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
});
