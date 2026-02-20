
import { openDB, IDBPDatabase } from 'idb';
import * as jsondiffpatch from 'jsondiffpatch';
import { InspectionRecord, AuditHistoryEntry, UserSession } from '../types';

const DB_NAME = 'HotelGuardForensicDB';
const DB_VERSION = 1;
const STORE_RECORDS = 'records';
const STORE_HISTORY = 'history';
const STORE_SIGNATURES = 'signatures';

const differ = jsondiffpatch.create({
    objectHash: (obj: any) => obj.id || JSON.stringify(obj),
});

class ForensicService {
    private db: Promise<IDBPDatabase>;

    constructor() {
        this.db = openDB(DB_NAME, DB_VERSION, {
            upgrade(db) {
                if (!db.objectStoreNames.contains(STORE_RECORDS)) {
                    db.createObjectStore(STORE_RECORDS, { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains(STORE_HISTORY)) {
                    db.createObjectStore(STORE_HISTORY, { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains(STORE_SIGNATURES)) {
                    db.createObjectStore(STORE_SIGNATURES, { keyPath: 'id' });
                }
            },
        });
    }

    async getAllRecords(): Promise<InspectionRecord[]> {
        const db = await this.db;
        return db.getAll(STORE_RECORDS);
    }

    async saveRecord(record: InspectionRecord, user: UserSession, isNew: boolean): Promise<void> {
        const db = await this.db;
        const tx = db.transaction([STORE_RECORDS, STORE_HISTORY], 'readwrite');

        let diff = undefined;
        if (!isNew) {
            const oldRecord = await tx.objectStore(STORE_RECORDS).get(record.id);
            if (oldRecord) {
                diff = differ.diff(oldRecord, record);
            }
        }

        // Update main record
        await tx.objectStore(STORE_RECORDS).put(record);

        // Append to immutable history
        const historyEntry: AuditHistoryEntry = {
            id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            recordId: record.id,
            timestamp: new Date().toISOString(),
            userId: user.id,
            action: isNew ? 'create' : 'update',
            diff,
            snapshot: JSON.parse(JSON.stringify(record)), // Deep copy
        };
        await tx.objectStore(STORE_HISTORY).add(historyEntry);

        await tx.done;
    }

    async getHistory(recordId: string): Promise<AuditHistoryEntry[]> {
        const db = await this.db;
        const allHistory = await db.getAll(STORE_HISTORY);
        return allHistory
            .filter(h => h.recordId === recordId)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }

    async deleteRecord(id: string): Promise<void> {
        const db = await this.db;
        await db.delete(STORE_RECORDS, id);
        // Note: We keep history entries for audit purposes even if record is deleted
    }

    async saveSignature(signature: any): Promise<void> {
        const db = await this.db;
        await db.put(STORE_SIGNATURES, signature);
    }

    async clearAll(): Promise<void> {
        const db = await this.db;
        const tx = db.transaction([STORE_RECORDS, STORE_HISTORY, STORE_SIGNATURES], 'readwrite');
        await tx.objectStore(STORE_RECORDS).clear();
        await tx.objectStore(STORE_HISTORY).clear();
        await tx.objectStore(STORE_SIGNATURES).clear();
        await tx.done;
    }

    async getSignature(recordId: string): Promise<any> {
        const db = await this.db;
        const allSignatures = await db.getAll(STORE_SIGNATURES);
        return allSignatures.find(s => s.recordId === recordId);
    }
}

export const forensicService = new ForensicService();
