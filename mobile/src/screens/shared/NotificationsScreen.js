import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { notificationApi } from '../../api/notificationApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import { COLORS, RADIUS } from '../../constants/colors';
import { timeAgo } from '../../utils/helpers';

const TYPE_ICONS = {
  DONATION_NEW: { name: 'leaf', color: COLORS.success },
  DONATION_ACCEPTED: { name: 'checkmark-circle', color: COLORS.info },
  PICKUP_OTP: { name: 'shield-checkmark', color: COLORS.warning },
  DELIVERED: { name: 'checkmark-done-circle', color: COLORS.success },
  EXPIRY_ALERT: { name: 'alert-circle', color: COLORS.danger },
  PROFILE_UPDATED: { name: 'person-circle', color: COLORS.info },
  SYSTEM: { name: 'information-circle', color: COLORS.textMuted },
};

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await notificationApi.getAll();
      setNotifications(res?.data?.notifications || []);
      setUnread(res?.data?.unreadCount || 0);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);
  const onRefresh = () => { setRefreshing(true); fetchNotifications(); };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      fetchNotifications();
    } catch {}
  };

  const handleDelete = (id) => {
    Alert.alert('Delete?', 'Remove this notification?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await notificationApi.delete(id);
            setNotifications((prev) => prev.filter((n) => n._id !== id));
          } catch {}
        }
      },
    ]);
  };

  const handleRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => n._id === id ? { ...n, isRead: true } : n)
      );
      setUnread((u) => Math.max(0, u - 1));
    } catch {}
  };

  if (loading) return <LoadingSpinner message="Loading notifications..." />;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Notifications</Text>
          {unread > 0 && <Text style={styles.unreadText}>{unread} unread</Text>}
        </View>
        {unread > 0 && (
          <TouchableOpacity style={styles.markAllBtn} onPress={handleMarkAllRead}>
            <Ionicons name="checkmark-done" size={14} color={COLORS.primary} />
            <Text style={styles.markAllText}>Mark All Read</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(n) => n._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        renderItem={({ item }) => {
          const typeConfig = TYPE_ICONS[item.type] || TYPE_ICONS.SYSTEM;
          return (
            <TouchableOpacity
              style={[styles.notifCard, !item.isRead && styles.notifUnread]}
              onPress={() => handleRead(item._id)}
              onLongPress={() => handleDelete(item._id)}
            >
              <View style={[styles.notifIconBox, { backgroundColor: typeConfig.color + '20' }]}>
                <Ionicons name={typeConfig.name} size={20} color={typeConfig.color} />
              </View>
              <View style={styles.notifBody}>
                <Text style={styles.notifTitle}>{item.title}</Text>
                <Text style={styles.notifMessage} numberOfLines={2}>{item.message}</Text>
                <Text style={styles.notifTime}>{timeAgo(item.createdAt)}</Text>
              </View>
              {!item.isRead && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={52} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 14 },
  title: { color: COLORS.text, fontSize: 20, fontWeight: '800' },
  unreadText: { color: COLORS.primary, fontSize: 11, fontWeight: '600' },
  markAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(34,197,94,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.full },
  markAllText: { color: COLORS.primary, fontSize: 12, fontWeight: '600' },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  notifCard: { flexDirection: 'row', backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: 14, marginBottom: 8, gap: 12, borderWidth: 1, borderColor: COLORS.cardBorder, alignItems: 'center' },
  notifUnread: { borderColor: 'rgba(34,197,94,0.3)', backgroundColor: 'rgba(19,27,46,0.9)' },
  notifIconBox: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  notifBody: { flex: 1, gap: 2 },
  notifTitle: { color: COLORS.text, fontSize: 13, fontWeight: '700' },
  notifMessage: { color: COLORS.textMuted, fontSize: 12, lineHeight: 16 },
  notifTime: { color: COLORS.textMuted, fontSize: 10 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary },
  empty: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyText: { color: COLORS.textMuted, fontSize: 14 },
});
