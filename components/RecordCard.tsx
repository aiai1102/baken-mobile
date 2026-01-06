import { View, Text, Pressable } from 'react-native';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { IconTrash2 } from './ui/icons';
import type { BetRecord } from '../src/domain/types';
import { formatCurrency, formatDate } from '../src/utils/format';
import { cn } from '../lib/utils';

interface RecordCardProps {
    record: BetRecord;
    onEdit: (record: BetRecord) => void;
    onDelete: (id: string) => void;
}

export function RecordCard({ record, onEdit, onDelete }: RecordCardProps) {
    const isUnreturned = record.returned === null;
    const profit = isUnreturned ? 0 : (record.returned ?? 0) - record.spent;
    const isProfit = profit > 0;

    return (
        <Pressable onPress={() => onEdit(record)}>
            <Card className="p-5 bg-card rounded-2xl border-0 shadow-md mb-3">
                <View className="flex-row justify-between items-center mb-4">
                    <View className="flex-row items-center bg-muted/50 px-3 py-1 rounded-full">
                        <Text className="text-xs font-medium text-muted-foreground">
                            {formatDate(record.date)}
                        </Text>
                    </View>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 -mr-2"
                        onPress={(e) => {
                            e.stopPropagation();
                            onDelete(record.id);
                        }}
                    >
                        <IconTrash2 className="text-muted-foreground opacity-50" size={18} />
                    </Button>
                </View>

                <View className="gap-3">
                    <View className="flex-row justify-between items-center">
                        <Text className="text-sm text-muted-foreground">購入</Text>
                        <Text className="text-lg font-bold text-foreground">
                            {formatCurrency(record.spent)}
                        </Text>
                    </View>

                    <View className="h-[1px] bg-border/50" />

                    <View className="flex-row justify-between items-center">
                        <Text className="text-sm text-muted-foreground">払戻</Text>
                        {isUnreturned ? (
                            <Text className="text-base font-medium text-muted-foreground">未入力</Text>
                        ) : (
                            <Text className="text-lg font-bold text-foreground">
                                {formatCurrency(record.returned ?? 0)}
                            </Text>
                        )}
                    </View>

                    {!isUnreturned && (
                        <>
                            <View className="h-[1px] bg-border/50" />
                            <View className="flex-row justify-between items-center">
                                <Text className="text-sm font-medium text-muted-foreground">損益</Text>
                                <View className={cn(
                                    "px-3 py-1 rounded-lg",
                                    isProfit ? "bg-green-100" : "bg-red-100"
                                )}>
                                    <Text
                                        className={cn(
                                            "text-base font-bold",
                                            isProfit ? 'text-green-700' : 'text-red-700'
                                        )}
                                    >
                                        {isProfit ? '+' : ''}{formatCurrency(profit)}
                                    </Text>
                                </View>
                            </View>
                        </>
                    )}
                </View>

                {record.memo && (
                    <View className="mt-4 pt-3 border-t border-border/50">
                        <Text className="text-sm text-muted-foreground leading-5">
                            {record.memo}
                        </Text>
                    </View>
                )}
            </Card>
        </Pressable>
    );
}
