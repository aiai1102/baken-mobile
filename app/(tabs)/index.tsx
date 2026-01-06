import { useState, useCallback } from 'react';
import { View, Text, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { IconPlus } from '../../components/ui/icons';
import { Button } from '../../components/ui/button';
import { RecordCard } from '../../components/RecordCard';
import type { BetRecord } from '../../src/domain/types';
import { sortByDateDesc } from '../../src/domain/filters';
import { recordsRepository } from '../../src/services/StorageRepository';

export default function HomeScreen() {
    const router = useRouter();
    const [records, setRecords] = useState<BetRecord[]>([]);
    const [loading, setLoading] = useState(true);

    const loadRecords = async () => {
        try {
            const allRecords = await recordsRepository.getAll();
            setRecords(sortByDateDesc(allRecords));
        } catch (error) {
            console.error('Failed to load records:', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadRecords();
        }, [])
    );

    const handleDelete = async (id: string) => {
        Alert.alert(
            '削除確認',
            'このレコードを削除しますか?',
            [
                { text: 'キャンセル', style: 'cancel' },
                {
                    text: '削除',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await recordsRepository.remove(id);
                            await loadRecords();
                        } catch (error) {
                            console.error('Failed to delete record:', error);
                            Alert.alert('エラー', '削除に失敗しました');
                        }
                    },
                },
            ]
        );
    };

    const handleEdit = (record: BetRecord | null) => {
        router.push({
            pathname: '/edit-record',
            params: record ? { id: record.id } : undefined,
        });
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-background">
                <Text className="text-muted-foreground">読み込み中...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
            <View className="flex-1">
                <View className="px-6 py-4 flex-row justify-between items-center bg-background z-10">
                    <Text className="text-4xl font-bold text-foreground">馬券記録</Text>
                    <Button
                        size="icon"
                        className="rounded-full h-10 w-10 bg-primary shadow-sm"
                        onPress={() => handleEdit(null)}
                    >
                        <IconPlus className="text-primary-foreground" size={24} />
                    </Button>
                </View>

                {records.length === 0 ? (
                    <View className="flex-1 items-center justify-center p-4">
                        <Text className="text-muted-foreground mb-4">まだ記録がありません</Text>
                        <Text className="text-sm text-muted-foreground">
                            右上の + ボタンから追加してください
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={records}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <View className="px-4 pb-3">
                                <RecordCard
                                    record={item}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            </View>
                        )}
                        contentContainerStyle={{ paddingBottom: 80 }}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}
