"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { findBestFaqMatch, SUGGESTED_QUESTIONS } from "@/lib/chatbot";
import { submitChatHandoffAction, type ChatHandoffFormState } from "@/components/chat/actions";

type Message = { role: "user" | "bot"; text: string };

const GREETING: Message = {
  role: "bot",
  text: "Hi! I'm the Nyoomba assistant. Ask me anything, or tap a question below.",
};

const NO_MATCH_TEXT =
  "I don't have a good answer for that yet. Want to talk to a member of our team?";

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const [showHandoff, setShowHandoff] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const [state, formAction, pending] = useActionState<ChatHandoffFormState, FormData>(
    submitChatHandoffAction,
    undefined
  );

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, showHandoff]);

  function ask(question: string) {
    const q = question.trim();
    if (!q) return;
    const match = findBestFaqMatch(q);
    setMessages((prev) => [
      ...prev,
      { role: "user", text: q },
      { role: "bot", text: match ? match.answer : NO_MATCH_TEXT },
    ]);
    setInput("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    ask(input);
  }

  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")?.text ?? "";

  return (
    <div className="fixed bottom-20 right-4 z-40 flex flex-col items-end gap-3">
      {open && (
        <div className="flex max-h-[32rem] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
          <div className="flex items-center justify-between border-b border-border bg-primary px-4 py-3 text-primary-foreground">
            <p className="text-sm font-semibold">Nyoomba Assistant</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="text-primary-foreground/80 hover:text-primary-foreground"
            >
              <X className="size-4" />
            </button>
          </div>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "user"
                    ? "ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-sm text-primary-foreground"
                    : "mr-auto max-w-[85%] rounded-2xl rounded-bl-sm bg-secondary px-3 py-2 text-sm text-secondary-foreground"
                }
              >
                {m.text}
              </div>
            ))}

            {messages.length <= 1 && !showHandoff && (
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_QUESTIONS.map((f) => (
                  <button
                    key={f.question}
                    type="button"
                    onClick={() => ask(f.question)}
                    className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    {f.question}
                  </button>
                ))}
              </div>
            )}

            {showHandoff &&
              (state?.success ? (
                <p className="rounded-2xl bg-secondary px-3 py-2 text-sm text-secondary-foreground">
                  Thanks — our team will get back to you shortly.
                </p>
              ) : (
                <form action={formAction} className="space-y-2 rounded-2xl border border-border bg-background p-3">
                  <input
                    type="text"
                    name="company"
                    tabIndex={-1}
                    autoComplete="off"
                    className="absolute h-0 w-0 opacity-0"
                    aria-hidden="true"
                  />
                  <input type="hidden" name="transcript" value={JSON.stringify(messages.slice(-10))} />
                  <div className="space-y-1">
                    <Label htmlFor="chat-name" className="text-xs">
                      Name
                    </Label>
                    <Input id="chat-name" name="name" required className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="chat-contact" className="text-xs">
                      Phone or email
                    </Label>
                    <Input id="chat-contact" name="contact" required className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="chat-message" className="text-xs">
                      What do you need help with?
                    </Label>
                    <Textarea
                      id="chat-message"
                      name="message"
                      rows={2}
                      defaultValue={lastUserMessage}
                      required
                      className="text-sm"
                    />
                  </div>
                  {state?.error && (
                    <p className="text-xs text-destructive" role="alert">
                      {state.error}
                    </p>
                  )}
                  <Button type="submit" size="sm" className="w-full" disabled={pending}>
                    {pending ? "Sending…" : "Send to our team"}
                  </Button>
                </form>
              ))}
          </div>

          <div className="border-t border-border p-3">
            {!showHandoff && (
              <>
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a question…"
                    aria-label="Type a question"
                    className="h-9 text-sm"
                  />
                  <Button type="submit" size="icon" className="size-9 shrink-0" aria-label="Send">
                    <Send className="size-4" />
                  </Button>
                </form>
                <button
                  type="button"
                  onClick={() => setShowHandoff(true)}
                  className="mt-2 text-xs font-medium text-primary hover:underline"
                >
                  Talk to a human
                </button>
              </>
            )}
            <div className="mt-2 flex items-center gap-1 text-[0.65rem] text-muted-foreground">
              <span>Bot powered by</span>
              <Image
                src="/nilltech-logo.jpg"
                alt="NillTech Solutions"
                width={12}
                height={12}
                className="rounded-sm"
              />
              <span>NillTech</span>
            </div>
          </div>
        </div>
      )}

      <Button
        type="button"
        size="icon"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Open chat"}
        className="size-14 rounded-full shadow-lg"
      >
        {open ? <X className="size-5" /> : <MessageCircle className="size-6" />}
      </Button>
    </div>
  );
}
