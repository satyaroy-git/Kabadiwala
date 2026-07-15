import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { colors, spacing, typography } from '@kabadiwala/ui';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';

interface ChatMessage {
  id: string;
  booking_id: string;
  sender_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export function ChatScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { bookingId } = route.params;
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadMessages();
    const unsubscribe = subscribeToMessages();
    return () => { unsubscribe(); };
  }, []);

  async function loadMessages() {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(data);
    }
  }

  function subscribeToMessages() {
    const channel = supabase
      .channel(`chat:${bookingId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `booking_id=eq.${bookingId}`,
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new as ChatMessage]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }

  async function handleSend() {
    if (!newMessage.trim() || !user) return;

    setSending(true);
    const { error } = await supabase
      .from('chat_messages')
      .insert({
        booking_id: bookingId,
        sender_id: user.id,
        message: newMessage.trim(),
      });

    if (!error) {
      setNewMessage('');
    }
    setSending(false);
  }

  function renderMessage({ item }: { item: ChatMessage }) {
    const isMe = item.sender_id === user?.id;
    return (
      <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.theirMessage]}>
        <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.theirMessageText]}>
          {item.message}
        </Text>
        <Text style={[styles.messageTime, isMe ? styles.myTimeText : styles.theirTimeText]}>
          {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat</Text>
        <View style={{ width: 50 }} />
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        ListEmptyComponent={
          <View style={styles.emptyChat}>
            <Text style={styles.emptyChatEmoji}>💬</Text>
            <Text style={styles.emptyChatText}>No messages yet</Text>
            <Text style={styles.emptyChatSubtext}>Send a message to coordinate your pickup</Text>
          </View>
        }
      />

      {/* Input */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.textInput}
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!newMessage.trim() || sending) && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!newMessage.trim() || sending}
        >
          <Text style={styles.sendBtnText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingTop: spacing['5xl'], paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.neutral[200] },
  backBtn: { ...typography.label, color: colors.primary[500] },
  headerTitle: { ...typography.h4, color: colors.text.primary },
  messageList: { padding: spacing.lg, flexGrow: 1 },
  messageBubble: { maxWidth: '75%', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 16, marginBottom: spacing.sm },
  myMessage: { alignSelf: 'flex-end', backgroundColor: colors.primary[500], borderBottomRightRadius: 4 },
  theirMessage: { alignSelf: 'flex-start', backgroundColor: colors.neutral[100], borderBottomLeftRadius: 4 },
  messageText: { ...typography.body, lineHeight: 20 },
  myMessageText: { color: colors.white },
  theirMessageText: { color: colors.text.primary },
  messageTime: { ...typography.caption, marginTop: 4 },
  myTimeText: { color: 'rgba(255,255,255,0.7)', textAlign: 'right' },
  theirTimeText: { color: colors.text.tertiary },
  emptyChat: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  emptyChatEmoji: { fontSize: 48, marginBottom: spacing.md },
  emptyChatText: { ...typography.h4, color: colors.text.primary },
  emptyChatSubtext: { ...typography.body, color: colors.text.secondary, marginTop: spacing.xs },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: spacing.md, paddingVertical: spacing.md, borderTopWidth: 1, borderTopColor: colors.neutral[200], gap: spacing.sm },
  textInput: { flex: 1, borderWidth: 1, borderColor: colors.neutral[300], borderRadius: 20, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, maxHeight: 100, fontSize: 15, color: colors.text.primary, backgroundColor: colors.neutral[50] },
  sendBtn: { backgroundColor: colors.primary[500], paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: 20, height: 38, justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.5 },
  sendBtnText: { ...typography.label, color: colors.white },
});
