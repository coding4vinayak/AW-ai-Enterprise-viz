import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Send, Sparkles, Bot, User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatWithAI } from "@/lib/api-hooks";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function AIChatPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your AI analytics assistant. I can help you analyze your data, create visualizations, and provide insights. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatMutation = useChatWithAI();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const result = await chatMutation.mutateAsync({
        messages: [...messages, userMessage].map((m) => ({
          role: m.role,
          content: m.content,
        })),
      });

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: result.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Chat error:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">AI Assistant</h3>
          <p className="text-xs text-muted-foreground">Ask questions about your data</p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              data-testid={`message-${message.role}`}
            >
              {message.role === "assistant" && (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              <Card
                className={`max-w-[80%] p-3 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </Card>
              {message.role === "user" && (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary shrink-0">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
            </div>
          ))}

          {chatMutation.isPending && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <Card className="bg-muted p-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your data..."
            className="min-h-[60px] max-h-[120px] resize-none"
            data-testid="input-chat-message"
            disabled={chatMutation.isPending}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || chatMutation.isPending}
            size="icon"
            className="h-[60px] w-[60px] shrink-0"
            data-testid="button-send-message"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Press Enter to send, Shift + Enter for new line
        </p>
      </div>
    </div>
  );
}
