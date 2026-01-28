import { useState, useEffect } from "react";
import { conversationAPI } from "@/lib/api";
import ChatInterface from "@/components/ChatInterface";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    // Create a new conversation on mount
    if (!conversationId && !isCreating) {
      createConversation();
    }
  }, []);

  const createConversation = async () => {
    try {
      setIsCreating(true);
      const result = await conversationAPI.create("新对话");
      setConversationId(result.id);
    } catch (error) {
      console.error('Failed to create conversation:', error);
    } finally {
      setIsCreating(false);
    }
  };

  if (!conversationId) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <ChatInterface conversationId={conversationId} />;
}
