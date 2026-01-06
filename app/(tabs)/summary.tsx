import { useState, useCallback } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { StatCard } from '../../components/StatCard';
import type { BetRecord } from '../../src/domain/types';
import { calcTotals } from '../../src/domain/calculations';
import { filterByYear } from '../../src/domain/filters';
import { recordsRepository } from '../../src/services/StorageRepository';

export default function SummaryScreen() {
    const [records, setRecords] = useState<BetRecord[]>([]);
    const [loading, setLoading] = useState(true);

    const loadRecords = async () => {
        try {
            const allRecords = await recordsRepository.getAll();
            setRecords(allRecords);
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

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-background">
                <Text className="text-muted-foreground">読み込み中...</Text>
            </View>
        );
    }

    const currentYear = new Date().getFullYear();
    const allStats = calcTotals(records);
    const yearRecords = filterByYear(records, currentYear);
    const yearStats = calcTotals(yearRecords);

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
            <View className="px-6 py-4">
                <Text className="text-4xl font-bold text-foreground">集計</Text>
            </View>

            <ScrollView className="flex-1 px-4">
                <View className="pb-20">
                    {records.length === 0 ? (
                        <View className="items-center py-12">
                            <Text className="text-muted-foreground">まだ記録がありません</Text>
                        </View>
                    ) : (
                        <View className="gap-4">
                            <StatCard title="全期間" stats={allStats} />
                            <StatCard title={`${currentYear}年`} stats={yearStats} />

                            <View className="mt-6 p-4 bg-blue-50 rounded-lg">
                                <Text className="text-sm text-blue-900 font-bold mb-1">
                                    回収率の見方:
                                </Text>
                                <Text className="text-sm text-blue-900">
                                    100%以上: プラス収支{'\n'}
                                    100%未満: マイナス収支
                                </Text>
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
