import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { runAskAgent } from "@/lib/ask/agent";

export const maxDuration = 60;

const AskRequestSchema = z.object({
  question: z
    .string()
    .trim()
    .min(2, "Masyadong maikli ang tanong.")
    .max(300, "Masyadong mahaba ang tanong (hanggang 300 titik lamang)."),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();

    if (!authData?.user) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Kailangan mag-sign in upang makapagtanong sa talaan." } },
        { status: 401 }
      );
    }

    const rawBody = await request.json().catch(() => null);
    const parsed = AskRequestSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Hindi wasto ang format ng tanong.",
            details: parsed.error.flatten(),
          },
        },
        { status: 422 }
      );
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of runAskAgent({
            question: parsed.data.question,
            supabase,
            signal: request.signal,
          })) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
          }
        } catch (err: unknown) {
          const errMsg =
            err instanceof Error ? err.message : "Nagkaroon ng aberya sa pagsusuri ng tanong.";
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "error", error: errMsg })}\n\n`)
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
      },
    });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: errMsg } },
      { status: 500 }
    );
  }
}
