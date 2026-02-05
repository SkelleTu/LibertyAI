import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { 
  type Conversation, 
  type Message, 
  type Settings,
  type CreateConversationRequest,
  type UpdateSettingsRequest
} from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

// ============================================
// CONVERSATIONS
// ============================================

export function useConversations() {
  return useQuery({
    queryKey: [api.conversations.list.path],
    queryFn: async () => {
      const res = await fetch(api.conversations.list.path);
      if (!res.ok) throw new Error("Failed to fetch conversations");
      return api.conversations.list.responses[200].parse(await res.json());
    },
  });
}

export function useConversation(id: number | null) {
  return useQuery({
    queryKey: [api.conversations.get.path, id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) throw new Error("ID required");
      const url = buildUrl(api.conversations.get.path, { id });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch conversation");
      return api.conversations.get.responses[200].parse(await res.json());
    },
    // Refresh frequently for chat updates if streaming isn't fully active
    refetchInterval: 5000, 
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateConversationRequest) => {
      const res = await fetch(api.conversations.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create conversation");
      return api.conversations.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.conversations.list.path] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start new chat",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.conversations.delete.path, { id });
      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete conversation");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.conversations.list.path] });
      toast({ title: "Deleted", description: "Conversation removed" });
    },
  });
}

// ============================================
// MESSAGES (With Streaming Support)
// ============================================

export function useSendMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, content }: { id: number; content: string }) => {
      const url = buildUrl(api.messages.create.path, { id });
      
      // Use standard fetch for SSE reading if backend supports it, 
      // but here we follow the standard request-response for simplicity first
      // The backend route returns the created message
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      
      if (!res.ok) throw new Error("Failed to send message");
      return api.messages.create.responses[201].parse(await res.json());
    },
    onMutate: async ({ id, content }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: [api.conversations.get.path, id] });
      const previousConversation = queryClient.getQueryData([api.conversations.get.path, id]);

      if (previousConversation) {
        queryClient.setQueryData([api.conversations.get.path, id], (old: any) => ({
          ...old,
          messages: [
            ...(old.messages || []),
            { 
              id: Date.now(), // temporary ID
              role: 'user', 
              content, 
              createdAt: new Date().toISOString() 
            }
          ]
        }));
      }

      return { previousConversation };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(
        [api.conversations.get.path, newTodo.id],
        context?.previousConversation
      );
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.conversations.get.path, variables.id] });
      queryClient.invalidateQueries({ queryKey: [api.conversations.list.path] });
    },
  });
}

// ============================================
// SETTINGS
// ============================================

export function useSettings() {
  return useQuery({
    queryKey: [api.settings.get.path],
    queryFn: async () => {
      const res = await fetch(api.settings.get.path);
      if (!res.ok) throw new Error("Failed to fetch settings");
      return api.settings.get.responses[200].parse(await res.json());
    },
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: UpdateSettingsRequest) => {
      const res = await fetch(api.settings.update.path, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update settings");
      return api.settings.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.settings.get.path] });
      toast({ title: "Updated", description: "System settings saved" });
    },
  });
}
