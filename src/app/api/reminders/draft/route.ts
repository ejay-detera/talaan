import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DraftReminderRequestSchema, ReminderDraftSchema } from "@/lib/schemas";
import { computeCustomerBalance } from "@/lib/ledger/math";
import { getModelClient } from "@/lib/model";
import { REMINDER_SYSTEM_PROMPT, REMINDER_TOOLS } from "@/lib/prompts/reminder";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 1. Authenticate store owner
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    // 2. Validate request body
    const rawBody = await request.json();
    const parseResult = DraftReminderRequestSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid reminder request payload",
            details: parseResult.error.flatten(),
          },
        },
        { status: 422 }
      );
    }

    const { customer_id, tone } = parseResult.data;

    // 3. Fetch customer under Postgres RLS
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("id, store_id, name")
      .eq("id", customer_id)
      .maybeSingle();

    if (customerError || !customer) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Customer not found" } },
        { status: 404 }
      );
    }

    // 4. Fetch confirmed ledger entries for customer
    const { data: entries, error: entriesError } = await supabase
      .from("entries")
      .select("item, amount, entry_type, confirmed_by_user")
      .eq("customer_id", customer_id)
      .eq("confirmed_by_user", true)
      .order("created_at", { ascending: true });

    if (entriesError) {
      return NextResponse.json(
        { error: { code: "SERVER_ERROR", message: "Failed to read customer ledger entries" } },
        { status: 500 }
      );
    }

    // 5. Deterministic balance computation
    const balanceInfo = computeCustomerBalance(
      (entries || []).map((e) => ({
        amount: Number(e.amount),
        entry_type: e.entry_type,
        confirmed_by_user: true,
      }))
    );

    // Guard: only draft reminders when customer has unpaid balance
    if (balanceInfo.balance <= 0) {
      return NextResponse.json(
        {
          error: {
            code: "NO_OUTSTANDING_BALANCE",
            message: `Customer ${customer.name} has no outstanding balance (₱${balanceInfo.balance.toFixed(2)}).`,
          },
        },
        { status: 422 }
      );
    }

    // 6. Assemble context for model (zero LLM arithmetic)
    const unpaidItems = (entries || [])
      .filter((e) => e.entry_type === "credit")
      .map((e) => `${e.item} (₱${Number(e.amount).toFixed(2)})`)
      .slice(-5) // cite most recent items
      .join(", ");

    const userPrompt = `Draft a ${tone} Taglish payment reminder for customer '${customer.name}'.
Outstanding balance: ₱${balanceInfo.balance.toFixed(2)}
Recent unpaid purchases: ${unpaidItems || "listahan sa tindahan"}
Target tone: ${tone === "friendly" ? "friendly (Malumanay / Polite & Friendly)" : "firm (Pormal / Direct & Respectful)"}`;

    // 7. Call model via unified client with resilient fallback
    let draftedMessage = "";
    let usedModel = "template-fallback";

    try {
      const { client, model } = getModelClient();
      usedModel = model;

      const response = await client.chat.completions.create({
        model,
        messages: [
          { role: "system", content: REMINDER_SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        tools: REMINDER_TOOLS,
        tool_choice: "auto",
        temperature: 0.3,
      });

      const choice = response.choices?.[0];
      const toolCall = choice?.message?.tool_calls?.[0];

      if (toolCall && toolCall.type === "function") {
        const rawArgs = JSON.parse(toolCall.function.arguments || "{}");
        const parsedDraft = ReminderDraftSchema.parse(rawArgs);
        draftedMessage = parsedDraft.message;
      } else if (choice?.message?.content?.trim()) {
        const textContent = choice.message.content.trim();
        const parsedDraft = ReminderDraftSchema.parse({
          message: textContent,
          tone,
        });
        draftedMessage = parsedDraft.message;
      }
    } catch (modelErr) {
      console.warn("[reminders/draft] Model inference unavailable, falling back to calibrated template:", modelErr);
      // Fallback to culturally calibrated template if model call or client init fails
      draftedMessage =
        tone === "friendly"
          ? `Magandang araw po ${customer.name}! Paalala lang po sa inyong listahan sa tindahan, bale ₱${balanceInfo.balance.toFixed(2)} po lahat. Maraming salamat po!`
          : `Magandang araw po ${customer.name}. Paalala ukol sa inyong natitirang balanse sa tindahan na nagkakahalaga ng ₱${balanceInfo.balance.toFixed(2)}. Paki-update o paki-ayos po sa lalong madaling panahon. Salamat po.`;
    }

    if (!draftedMessage) {
      draftedMessage = `Magandang araw po ${customer.name}! Paalala lang po sa inyong listahan sa tindahan, bale ₱${balanceInfo.balance.toFixed(2)} po lahat. Salamat po!`;
    }

    // 8. Save draft to reminders table
    const { data: reminderRow, error: insertError } = await supabase
      .from("reminders")
      .insert({
        store_id: customer.store_id,
        customer_id: customer.id,
        tone,
        message: draftedMessage,
        model: usedModel,
      })
      .select("id, created_at")
      .single();

    if (insertError) {
      console.error("[reminders/draft] insertError:", insertError);
      return NextResponse.json(
        { error: { code: "SERVER_ERROR", message: `Failed to persist reminder draft: ${insertError.message}` } },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        reminder: {
          id: reminderRow.id,
          customer_id: customer.id,
          customer_name: customer.name,
          balance: balanceInfo.balance,
          tone,
          message: draftedMessage,
          model: usedModel,
          created_at: reminderRow.created_at,
        },
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error("[reminders/draft] Unhandled exception:", err);
    const msg = err instanceof Error ? err.message : "Failed to draft reminder";
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: msg } },
      { status: 500 }
    );
  }
}

