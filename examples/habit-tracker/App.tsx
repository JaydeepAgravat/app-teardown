import { getDocumentAsync } from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import { shareAsync } from 'expo-sharing';
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { Alert, AppState, FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { parseBackup, serializeBackup } from './src/backup';
import { localDay } from './src/days';
import { type Habit, addHabit, deleteHabit, exportRows, loadHabits, migrate, renameHabit, replaceAll, setDone } from './src/store';

export default function App() {
  return (
    <SafeAreaProvider>
      <SQLiteProvider databaseName="habits.db" onInit={migrate}>
        <HabitList />
      </SQLiteProvider>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}

const forgivenNote = (count: number) => `${count} ${count === 1 ? 'miss' : 'misses'} forgiven`;

function HabitList() {
  const db = useSQLiteContext();
  const [habits, setHabits] = useState<Habit[] | null>(null);
  const [newName, setNewName] = useState('');
  const [renaming, setRenaming] = useState<{ id: string; name: string } | null>(null);

  // The screen always shows what the database holds: every change is written first, then read back.
  const reload = useCallback(async () => setHabits(await loadHabits(db, localDay())), [db]);

  const change = useCallback(
    async (write: () => Promise<void>) => {
      try {
        await write();
      } catch (error) {
        Alert.alert('That did not save', error instanceof Error ? error.message : String(error));
      }
      await reload();
    },
    [reload],
  );

  useEffect(() => {
    reload();
    // "Today" may have changed while the app was in the background.
    const subscription = AppState.addEventListener('change', (state) => state === 'active' && reload());
    return () => subscription.remove();
  }, [reload]);

  const add = () => {
    const name = newName.trim();
    if (!name) return;
    setNewName('');
    change(() => addHabit(db, name));
  };

  const openMenu = (habit: Habit) =>
    Alert.alert(habit.name, undefined, [
      { text: 'Rename', onPress: () => setRenaming({ id: habit.id, name: habit.name }) },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () =>
          Alert.alert(`Delete "${habit.name}"?`, 'Its history will be removed. This cannot be undone.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => change(() => deleteHabit(db, habit.id)) },
          ]),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);

  const saveRename = () => {
    if (!renaming) return;
    const { id, name } = renaming;
    setRenaming(null);
    if (name.trim()) change(() => renameHabit(db, id, name));
  };

  const exportBackup = async () => {
    try {
      const { habits: rows, completions } = await exportRows(db);
      const file = new File(Paths.cache, `habits-${localDay()}.json`);
      file.create({ overwrite: true });
      file.write(serializeBackup(rows, completions));
      await shareAsync(file.uri, { mimeType: 'application/json', dialogTitle: 'Export habits' });
    } catch (error) {
      Alert.alert('Export failed', error instanceof Error ? error.message : String(error));
    }
  };

  const importBackup = async () => {
    try {
      const picked = await getDocumentAsync({ type: ['application/json', 'text/plain', '*/*'], copyToCacheDirectory: true });
      if (picked.canceled) return;
      // The whole file is validated before anything is written.
      const backup = parseBackup(await new File(picked.assets[0].uri).text());
      Alert.alert(
        'Replace all habits?',
        `This file holds ${backup.habits.length} habits and ${backup.completions.length} done days. Everything now in the app will be replaced.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Replace', style: 'destructive', onPress: () => change(() => replaceAll(db, backup)) },
        ],
      );
    } catch (error) {
      Alert.alert('Import failed', error instanceof Error ? error.message : String(error));
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title} accessibilityRole="header">
          Habits
        </Text>
        <Pressable onPress={importBackup} accessibilityRole="button" hitSlop={8}>
          <Text style={styles.link}>Import</Text>
        </Pressable>
        <Pressable onPress={exportBackup} accessibilityRole="button" hitSlop={8}>
          <Text style={styles.link}>Export</Text>
        </Pressable>
      </View>

      <View style={styles.addRow}>
        <TextInput
          style={styles.input}
          value={newName}
          onChangeText={setNewName}
          onSubmitEditing={add}
          placeholder="New habit"
          placeholderTextColor="#6B7280"
          returnKeyType="done"
          maxLength={60}
          accessibilityLabel="New habit name"
        />
        <Pressable style={[styles.addButton, !newName.trim() && styles.disabled]} onPress={add} disabled={!newName.trim()} accessibilityRole="button">
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
      </View>

      <FlatList
        data={habits ?? []}
        keyExtractor={(habit) => habit.id}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={habits ? <Text style={styles.empty}>No habits yet. Add one above, then tap it each day you do it.</Text> : null}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.row, item.doneToday && styles.rowDone]}
            onPress={() => change(() => setDone(db, item.id, localDay(), !item.doneToday))}
            onLongPress={() => openMenu(item)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: item.doneToday }}
            accessibilityLabel={`${item.name}, streak ${item.streak} ${item.streak === 1 ? 'day' : 'days'}${item.forgiven > 0 ? `, ${forgivenNote(item.forgiven)}` : ''}`}
            accessibilityHint="Tap to mark done for today. Long press to rename or delete."
          >
            <View style={[styles.check, item.doneToday && styles.checkDone]}>{item.doneToday && <Text style={styles.checkMark}>✓</Text>}</View>
            <Text style={styles.name}>{item.name}</Text>
            <View style={styles.streakBox}>
              <Text style={styles.streak}>
                {item.streak} {item.streak === 1 ? 'day' : 'days'}
              </Text>
              {item.forgiven > 0 && <Text style={styles.forgiven}>{forgivenNote(item.forgiven)}</Text>}
            </View>
          </Pressable>
        )}
      />

      <Modal visible={renaming !== null} transparent animationType="fade" onRequestClose={() => setRenaming(null)}>
        <View style={styles.backdrop}>
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>Rename habit</Text>
            <TextInput
              style={styles.input}
              value={renaming?.name ?? ''}
              onChangeText={(name) => setRenaming((current) => current && { ...current, name })}
              onSubmitEditing={saveRename}
              autoFocus
              maxLength={60}
              accessibilityLabel="Habit name"
            />
            <View style={styles.dialogButtons}>
              <Pressable onPress={() => setRenaming(null)} accessibilityRole="button" hitSlop={8}>
                <Text style={styles.link}>Cancel</Text>
              </Pressable>
              <Pressable onPress={saveRename} accessibilityRole="button" hitSlop={8}>
                <Text style={[styles.link, styles.bold]}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 20, paddingHorizontal: 20, paddingVertical: 12 },
  title: { flex: 1, fontSize: 28, fontWeight: '700', color: '#111827' },
  link: { fontSize: 16, color: '#2563EB' },
  bold: { fontWeight: '700' },
  addRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingBottom: 8 },
  input: { flex: 1, minHeight: 48, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10, paddingHorizontal: 12, fontSize: 16, color: '#111827', backgroundColor: '#FFFFFF' },
  addButton: { minHeight: 48, justifyContent: 'center', paddingHorizontal: 18, borderRadius: 10, backgroundColor: '#2563EB' },
  addButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  disabled: { opacity: 0.4 },
  list: { padding: 16, gap: 10 },
  empty: { textAlign: 'center', color: '#6B7280', fontSize: 16, marginTop: 48, paddingHorizontal: 24 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 60, padding: 14, borderRadius: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB' },
  rowDone: { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' },
  check: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: '#9CA3AF', alignItems: 'center', justifyContent: 'center' },
  checkDone: { backgroundColor: '#059669', borderColor: '#059669' },
  checkMark: { color: '#FFFFFF', fontWeight: '700' },
  name: { flex: 1, fontSize: 17, color: '#111827' },
  streakBox: { alignItems: 'flex-end' },
  streak: { fontSize: 15, color: '#374151', fontVariant: ['tabular-nums'] },
  forgiven: { fontSize: 12, color: '#6B7280' },
  backdrop: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: 'rgba(0,0,0,0.4)' },
  dialog: { gap: 16, padding: 20, borderRadius: 14, backgroundColor: '#FFFFFF' },
  dialogTitle: { fontSize: 18, fontWeight: '600', color: '#111827' },
  dialogButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 24 },
});
