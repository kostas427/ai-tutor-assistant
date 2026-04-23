import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HistoryScreen() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSession, setExpandedSession] = useState<number | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/history');
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (error) {
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    try {
      await fetch('http://localhost:3000/api/history', { method: 'DELETE' });
      setSessions([]);
      setExpandedSession(null);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const toggleSession = (id: number) => {
    setExpandedSession(prev => prev === id ? null : id);
  };

  const getFirstMessage = (session: any) => {
    const first = session.messages?.find((m: any) => m.role === 'user');
    if (!first) return 'Κενή συνομιλία';
    return first.message.length > 50 ? first.message.substring(0, 50) + '...' : first.message;
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📋 Ιστορικό Συνομιλιών</Text>
        <Text style={styles.subtitle}>Όλες οι προηγούμενες συνομιλίες σου</Text>
      </View>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchHistory}>
          <Text style={styles.buttonText}>🔄 Ανανέωση</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.clearButton} onPress={clearHistory}>
          <Text style={styles.buttonText}>🗑️ Καθαρισμός</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView style={styles.scrollView}>
          {sessions.length === 0 ? (
            <Text style={styles.emptyText}>Δεν υπάρχουν συνομιλίες ακόμα.</Text>
          ) : (
            sessions.map((session) => (
              <View key={session.id} style={styles.sessionContainer}>
                <TouchableOpacity style={styles.sessionHeader} onPress={() => toggleSession(session.id)}>
                  <View style={styles.sessionInfo}>
                    <Text style={styles.sessionTitle}>💬 {session.title || 'Συνομιλία #' + session.id}</Text>
                    <Text style={styles.sessionDate}>{new Date(session.created_at).toLocaleString('el-GR')}</Text>
                    <Text style={styles.sessionPreview}>{getFirstMessage(session)}</Text>
                  </View>
                  <Text style={styles.arrow}>{expandedSession === session.id ? '▲' : '▼'}</Text>
                </TouchableOpacity>
                {expandedSession === session.id && (
                  <View style={styles.messagesContainer}>
                    {session.messages?.map((msg: any) => (
                      <View key={msg.id} style={[styles.message, msg.role === 'user' ? styles.userMessage : styles.aiMessage]}>
                        <Text style={styles.roleLabel}>{msg.role === 'user' ? '👤 Εσύ' : '🤖 AI Tutor'}</Text>
                        <Text style={styles.messageText}>{msg.message}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F3FF' },
  header: { backgroundColor: '#4F46E5', padding: 20, paddingTop: 50, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 13, color: '#C7D2FE', marginTop: 4 },
  buttonRow: { flexDirection: 'row', padding: 12, gap: 8 },
  refreshButton: { flex: 1, backgroundColor: '#4F46E5', padding: 10, borderRadius: 10, alignItems: 'center' },
  clearButton: { flex: 1, backgroundColor: '#EF4444', padding: 10, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  scrollView: { flex: 1, padding: 12 },
  emptyText: { textAlign: 'center', color: '#6B7280', marginTop: 40, fontSize: 16 },
  sessionContainer: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 10, elevation: 2, overflow: 'hidden' },
  sessionHeader: { flexDirection: 'row', alignItems: 'center', padding: 14, justifyContent: 'space-between' },
  sessionInfo: { flex: 1 },
  sessionTitle: { fontSize: 15, fontWeight: 'bold', color: '#4F46E5' },
  sessionDate: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  sessionPreview: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  arrow: { fontSize: 14, color: '#4F46E5', marginLeft: 8 },
  messagesContainer: { padding: 12, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  message: { padding: 10, borderRadius: 10, marginBottom: 6 },
  userMessage: { backgroundColor: '#EEF2FF', borderLeftWidth: 3, borderLeftColor: '#4F46E5' },
  aiMessage: { backgroundColor: '#F9FAFB', borderLeftWidth: 3, borderLeftColor: '#10B981' },
  roleLabel: { fontSize: 11, fontWeight: 'bold', color: '#6B7280', marginBottom: 2 },
  messageText: { fontSize: 14, color: '#000000', lineHeight: 20 },
});