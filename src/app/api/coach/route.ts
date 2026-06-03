import { NextResponse, type NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { COACH_MODEL, buildSystemBlocks } from "@/lib/coach-prompt";
import { fallbackReply } from "@/lib/coach-fallback";

// GET — load the signed-in person's conversation history (RLS-scoped to them).
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ messages: [] }, { status: 401 });

  const { data } = await supabase
    .from("coach_messages")
    .select("id, role, content, created_at")
    .order("created_at", { ascending: true });

  return NextResponse.json({ messages: data ?? [], configured: !!process.env.ANTHROPIC_API_KEY });
}

// POST — send a message, get the Coach's reply. Persists both turns.
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const message: string = (body?.message ?? "").toString().trim();
  if (!message) return NextResponse.json({ error: "empty" }, { status: 400 });

  // Persist the user's message (RLS ensures user_id = themselves via the policy + explicit value).
  await supabase.from("coach_messages").insert({ user_id: user.id, role: "user", content: message });

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, language_pref")
    .eq("id", user.id)
    .single();

  // No API key → playbook fallback mode. The Coach still answers (from the
  // playbook), persists the turn, and keeps the same chat UX — just no live AI.
  if (!process.env.ANTHROPIC_API_KEY) {
    const reply = fallbackReply(message, profile?.language_pref ?? undefined);
    await supabase.from("coach_messages").insert({ user_id: user.id, role: "assistant", content: reply });
    return NextResponse.json({ reply, mode: "fallback" });
  }

  // Load recent history (bounded) for context.
  const { data: history } = await supabase
    .from("coach_messages")
    .select("role, content")
    .order("created_at", { ascending: true })
    .limit(40);

  const messages = (history ?? []).map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content as string,
  }));

  try {
    const client = new Anthropic();
    const response = await client.messages.create({
      model: COACH_MODEL,
      max_tokens: 1500,
      system: buildSystemBlocks({ name: profile?.name, languagePref: profile?.language_pref }),
      messages,
    });
    const reply = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();

    await supabase.from("coach_messages").insert({ user_id: user.id, role: "assistant", content: reply });
    return NextResponse.json({ reply, mode: "ai" });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error";
    return NextResponse.json({ error: "claude_error", detail: msg }, { status: 502 });
  }
}
