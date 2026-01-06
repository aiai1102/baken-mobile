import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { IconX } from '../components/ui/icons';
import uuid from 'react-native-uuid';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import type { BetRecord } from '../src/domain/types';
import { recordsRepository } from '../src/services/StorageRepository';
import { getTodayString } from '../src/utils/format';

export default function EditRecordScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const id = params.id as string | undefined;

    const [date, setDate] = useState(getTodayString());
    const [spent, setSpent] = useState('');
    const [returned, setReturned] = useState('');
    const [memo, setMemo] = useState('');
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(!!id);

    useEffect(() => {
        if (id) {
            const loadRecord = async () => {
                const records = await recordsRepository.getAll();
                const record = records.find(r => r.id === id);
                if (record) {
                    setDate(record.date);
                    setSpent(String(record.spent));
                    setReturned(record.returned !== null ? String(record.returned) : '');
                    setMemo(record.memo || '');
                }
                setLoading(false);
            };
            loadRecord();
        }
    }, [id]);

    const handleSave = async () => {
        const spentNum = parseFloat(spent);
        if (!spent || isNaN(spentNum) || spentNum <= 0) {
            Alert.alert('エラー', '購入金額を正しく入力してください');
            return;
        }

        let returnedValue: number | null = null;
        if (returned.trim() !== '') {
            const returnedNum = parseFloat(returned);
            if (isNaN(returnedNum) || returnedNum < 0) {
                Alert.alert('エラー', '払い戻し金額を正しく入力してください（0以上の数値）');
                return;
            }
            returnedValue = returnedNum;
        }

        setSaving(true);
        try {
            const recordData: BetRecord = {
                id: id || (uuid.v4() as string),
                date,
                spent: spentNum,
                returned: returnedValue,
                memo: memo.trim() || undefined,
            };

            if (id) {
                await recordsRepository.update(recordData);
            } else {
                await recordsRepository.add(recordData);
            }

            router.back();
        } catch (error) {
            console.error('Failed to save record:', error);
            Alert.alert('エラー', '保存に失敗しました');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <View className="flex-1 bg-background" />;
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1 bg-background"
        >
            <ScrollView className="flex-1 p-6">
                <View className="flex-row justify-between items-center mb-8">
                    <Text className="text-2xl font-bold text-foreground">
                        {id ? 'レコード編集' : '新規レコード'}
                    </Text>
                    <Button variant="ghost" size="icon" onPress={() => router.back()}>
                        <IconX className="text-foreground" size={24} />
                    </Button>
                </View>

                <View className="gap-6 pb-10">
                    <View>
                        <Label className="mb-2 text-base font-medium">日付</Label>
                        <Input
                            value={date}
                            onChangeText={setDate}
                            placeholder="YYYY/MM/DD"
                            className="bg-card border-border h-12"
                        />
                    </View>

                    <View>
                        <Label className="mb-2 text-base font-medium">購入金額 *</Label>
                        <Input
                            keyboardType="numeric"
                            placeholder="10000"
                            value={spent}
                            onChangeText={setSpent}
                            className="bg-card border-border h-12"
                        />
                    </View>

                    <View>
                        <Label className="mb-2 text-base font-medium">払い戻し金額</Label>
                        <Input
                            keyboardType="numeric"
                            placeholder="未入力の場合は空欄、外れの場合は0"
                            value={returned}
                            onChangeText={setReturned}
                            className="bg-card border-border h-12"
                        />
                        <Text className="text-sm text-muted-foreground mt-2 leading-5">
                            • 空欄 = 未入力（後から入力可能）{'\n'}
                            • 0 = 外れ馬券{'\n'}
                            • 正の数 = 的中金額
                        </Text>
                    </View>

                    <View>
                        <Label className="mb-2 text-base font-medium">メモ（任意）</Label>
                        <Textarea
                            placeholder="レース名、馬名など"
                            value={memo}
                            onChangeText={setMemo}
                            numberOfLines={4}
                            className="bg-card border-border min-h-[100px]"
                        />
                    </View>

                    <View className="flex-row gap-4 pt-6">
                        <Button
                            variant="outline"
                            className="flex-1 h-12 border-border bg-card"
                            onPress={() => router.back()}
                        >
                            <Text className="text-foreground font-medium">キャンセル</Text>
                        </Button>
                        <Button
                            className="flex-1 h-12 bg-primary"
                            onPress={handleSave}
                            disabled={saving}
                        >
                            <Text className="text-primary-foreground font-bold">
                                {saving ? '保存中...' : '保存'}
                            </Text>
                        </Button>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
