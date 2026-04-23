import { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const API_URL = 'http://localhost:3000';

export default function HomeScreen() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: string, text: string}[]>([
    { role: 'assistant', text: '👋 Γεια! Είμαι ο AI Tutor σου για την Πληροφορική. Ρώτησέ με ό,τι θέλεις — προγραμματισμό, αλγόριθμους, βάσεις δεδομένων, οτιδήποτε!' }
  ]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);

  useEffect(() => {
    const createSession = async () => {
      try {
        const response = await fetch(`${API_URL}/api/session`, { method: 'POST' });
        const data = await response.json();
        setSessionId(data.sessionId);
      } catch (error) {
        console.error('Error creating session:', error);
      }
    };
    createSession();
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || !sessionId) return;
    
    const currentInput = input;
    const userMessage = { role: 'user', text: currentInput };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const result = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentInput, sessionId }),
      });
      const data = await result.json();
      const response = data.reply || data.error || 'Δεν ήρθε απάντηση';
      setMessages(prev => [...prev, { role: 'assistant', text: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Κάτι πήγε στραβά. Δοκίμασε ξανά.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.header}>
        <Text style={styles.title}>📚 CS Tutor AI</Text>
        <Text style={styles.subtitle}>Βοηθός Πληροφορικής</Text>
      </View>
      <ScrollView style={styles.chatContainer} contentContainerStyle={{ paddingBottom: 16 }}>
        {messages.map((msg, index) => (
          <View key={index} style={[styles.message, msg.role === 'user' ? styles.userMessage : styles.aiMessage]}>
            <Text style={styles.roleLabel}>{msg.role === 'user' ? '👤 Εσύ' : '🤖 AI Tutor'}</Text>
            <Text style={styles.messageText}>{msg.text}</Text>
          </View>
        ))}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#4F46E5" />
            <Text style={styles.loadingText}>Σκέφτομαι...</Text>
          </View>
        )}
      </ScrollView>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ρώτησέ με για πληροφορική..."
          multiline
          maxLength={500}
        />
        <TouchableOpacity style={styles.button} onPress={sendMessage} disabled={loading}>
          <Text style={styles.buttonText}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F3FF' },
  header: { backgroundColor: '#4F46E5', padding: 20, paddingTop: 50, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 14, color: '#C7D2FE', marginTop: 4 },
  chatContainer: { flex: 1, padding: 16 },
  message: { padding: 12, borderRadius: 16, marginBottom: 12, maxWidth: '85%', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  userMessage: { backgroundColor: '#C7CBD1', alignSelf: 'flex-end' },
  aiMessage: { backgroundColor: '#fff', alignSelf: 'flex-start' },
  roleLabel: { fontSize: 11, fontWeight: 'bold', color: '#000000', marginBottom: 4 },
  messageText: { fontSize: 15, color: '#000000', lineHeight: 22 },
  loadingContainer: { flexDirection: 'row', alignItems: 'center', padding: 8 },
  loadingText: { marginLeft: 8, color: '#6B7280', fontSize: 14 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  input: { flex: 1, backgroundColor: '#F9FAFB', borderRadius: 20, padding: 12, fontSize: 15, marginRight: 8, maxHeight: 100, borderWidth: 1, borderColor: '#E5E7EB' },
  button: { backgroundColor: '#4F46E5', borderRadius: 20, width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18 },
});