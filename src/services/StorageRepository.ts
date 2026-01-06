import AsyncStorage from '@react-native-async-storage/async-storage';
import type { BetRecord } from '../domain/types';
import type { RecordsRepository } from './RecordsRepository';

const STORAGE_KEY = 'bet_records';

export class StorageRepository implements RecordsRepository {
    async getAll(): Promise<BetRecord[]> {
        try {
            const json = await AsyncStorage.getItem(STORAGE_KEY);
            return json ? JSON.parse(json) : [];
        } catch (error) {
            console.error('Failed to load records', error);
            return [];
        }
    }

    async add(record: BetRecord): Promise<void> {
        const records = await this.getAll();
        records.push(record);
        await this.save(records);
    }

    async update(record: BetRecord): Promise<void> {
        const records = await this.getAll();
        const index = records.findIndex((r) => r.id === record.id);
        if (index !== -1) {
            records[index] = record;
            await this.save(records);
        }
    }

    async remove(id: string): Promise<void> {
        const records = await this.getAll();
        const newRecords = records.filter((r) => r.id !== id);
        await this.save(newRecords);
    }

    private async save(records: BetRecord[]): Promise<void> {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(records));
        } catch (error) {
            console.error('Failed to save records', error);
            throw error;
        }
    }
}

export const recordsRepository = new StorageRepository();
