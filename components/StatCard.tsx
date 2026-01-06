import { View, Text } from 'react-native';
import { Card } from './ui/card';
import type { TotalStats } from '../src/domain/types';
import { formatCurrency, formatROI } from '../src/utils/format';
import { cn } from '../lib/utils';

interface StatCardProps {
    title: string;
    stats: TotalStats;
}

export function StatCard({ title, stats }: StatCardProps) {
    const isProfit = stats.returned > stats.spent;
    const roiColor = isProfit ? 'text-green-600' : 'text-red-600';

    return (
        <Card className="p-6 bg-card rounded-2xl border-0 shadow-md mb-4">
            <Text className="text-lg font-bold text-foreground mb-4">{title}</Text>

            <View className="gap-3">
                <View className="flex-row justify-between items-center">
                    <Text className="text-sm text-muted-foreground">総購入額</Text>
                    <Text className="text-xl font-bold text-foreground">
                        {formatCurrency(stats.spent)}
                    </Text>
                </View>

                <View className="h-[1px] bg-border/50" />

                <View className="flex-row justify-between items-center">
                    <Text className="text-sm text-muted-foreground">総払戻額</Text>
                    <Text className="text-xl font-bold text-foreground">
                        {formatCurrency(stats.returned)}
                    </Text>
                </View>

                <View className="h-[1px] bg-border/50" />

                <View className="flex-row justify-between items-center">
                    <Text className="text-sm font-medium text-foreground">回収率</Text>
                    <View className="flex-row items-baseline">
                        <Text className={cn("text-3xl font-black", roiColor)}>
                            {formatROI(stats.roi)}
                        </Text>
                    </View>
                </View>
            </View>
        </Card>
    );
}
