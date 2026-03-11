import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export const useConversations = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!user) return;
    const { data } = await (supabase
      .from('conversations' as any)
      .select(
        '*, p1:profiles!participant_1(full_name, avatar_url, user_type), p2:profiles!participant_2(full_name, avatar_url, user_type)'
      ) as any)
      .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
      .order('last_message_at', { ascending: false });
    if (data) setConversations(data);
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetch();
    const channel = supabase
      .channel('conversations_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, fetch)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetch]);

  return { conversations, isLoading, refetch: fetch };
};

export const useMessages = (conversationId: string | null) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!conversationId) return;

    (supabase
      .from('messages' as any)
      .select('*, sender:profiles!sender_id(full_name, avatar_url)') as any)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .then(({ data }: any) => {
        if (data) setMessages(data);
        setIsLoading(false);
      });

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => setMessages((prev) => [...prev, payload.new as any])
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  return { messages, isLoading };
};

export const useSendMessage = () => {
  const { user } = useAuth();

  const send = async (conversationId: string, content: string) => {
    if (!user || !content.trim()) return;

    const { error } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: content.trim(),
    });

    if (!error) {
      await supabase
        .from('conversations')
        .update({
          last_message: content.trim(),
          last_message_at: new Date().toISOString(),
        })
        .eq('id', conversationId);
    }

    return error;
  };

  return send;
};

export const useOrCreateConversation = () => {
  const { user } = useAuth();

  const getOrCreate = async (otherUserId: string, projectId?: string) => {
    if (!user) return null;

    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .or(
        `and(participant_1.eq.${user.id},participant_2.eq.${otherUserId}),and(participant_1.eq.${otherUserId},participant_2.eq.${user.id})`
      )
      .single();

    if (existing) return existing.id;

    const { data: created } = await supabase
      .from('conversations')
      .insert({
        participant_1: user.id,
        participant_2: otherUserId,
        project_id: projectId || null,
      })
      .select('id')
      .single();

    return created?.id || null;
  };

  return getOrCreate;
};
