import { adminDb, hasAdminCredentials } from './firebaseAdmin.js';
import { CreditTransaction, UserProfile } from '../src/types/index.js';

interface ReservedRecord {
  amount: number;
  committed: boolean;
  refunded: boolean;
}

export class CreditService {
  private useFirestore: boolean = hasAdminCredentials;
  // Local ledger cache / fallback tracking
  private fallbackBalances: Map<string, number> = new Map();
  private fallbackTransactions: Map<string, CreditTransaction[]> = new Map();
  private activeReservations: Map<string, ReservedRecord> = new Map(); // generationId -> ReservedRecord

  /**
   * Get current balance for user
   */
  async getBalance(userId: string): Promise<number> {
    if (this.useFirestore) {
      try {
        const userDoc = await adminDb.collection('users').doc(userId).get();
        if (userDoc.exists) {
          const data = userDoc.data();
          return typeof data?.credits === 'number' ? data.credits : 100;
        }
      } catch (err: any) {
        this.useFirestore = false;
      }
    }
    return this.fallbackBalances.get(userId) ?? 100;
  }

  /**
   * Reserve credits atomically before generation starts.
   * Prevents negative balances and double-charging.
   */
  async reserveCredits(
    userId: string,
    amount: number,
    generationId?: string,
    description: string = 'AI Generation'
  ): Promise<{ transactionId: string; newBalance: number }> {
    const cost = Math.max(0, Math.floor(amount));

    // Prevent double charging the same generation
    if (generationId && this.activeReservations.has(generationId)) {
      const existing = this.activeReservations.get(generationId)!;
      if (!existing.refunded) {
        const currentBal = await this.getBalance(userId);
        return { transactionId: `res_${generationId}`, newBalance: currentBal };
      }
    }

    const txId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const now = new Date().toISOString();

    let newBalance = 100;

    if (this.useFirestore) {
      try {
        const userRef = adminDb.collection('users').doc(userId);
        const txRef = adminDb.collection('creditTransactions').doc(txId);

        await adminDb.runTransaction(async (t) => {
          const userDoc = await t.get(userRef);
          let currentCredits = 100;

          if (userDoc.exists) {
            const userData = userDoc.data();
            currentCredits = typeof userData?.credits === 'number' ? userData.credits : 100;
          } else {
            // Auto initialize if not existing
            t.set(userRef, {
              uid: userId,
              id: userId,
              email: '',
              displayName: 'Creator',
              plan: 'free',
              credits: 100,
              role: 'user',
              createdAt: now,
              updatedAt: now,
            });
            currentCredits = 100;
          }

          if (cost > 0 && currentCredits < cost) {
            throw new Error(`Insufficient credits. Required: ${cost}, Available: ${currentCredits}`);
          }

          newBalance = currentCredits - cost;
          t.update(userRef, {
            credits: newBalance,
            updatedAt: now,
          });

          const txRecord: CreditTransaction = {
            id: txId,
            userId,
            ownerId: userId,
            amount: -cost,
            type: cost === 0 ? 'grant' : 'deduct',
            description: cost === 0 ? `${description} (Free - 0 Credits)` : description,
            generationId,
            createdAt: now,
          };

          t.set(txRef, txRecord);
        });

        if (generationId) {
          this.activeReservations.set(generationId, {
            amount: cost,
            committed: false,
            refunded: false,
          });
        }

        this.fallbackBalances.set(userId, newBalance);
        return { transactionId: txId, newBalance };
      } catch (err: any) {
        if (err.message && err.message.includes('Insufficient credits')) {
          throw err;
        }
        this.useFirestore = false;
      }
    }

    // Fallback in-memory ledger
    let currentBal = this.fallbackBalances.get(userId) ?? 100;
    if (cost > 0 && currentBal < cost) {
      throw new Error(`Insufficient credits. Required: ${cost}, Available: ${currentBal}`);
    }

    newBalance = currentBal - cost;
    this.fallbackBalances.set(userId, newBalance);

    const txRecord: CreditTransaction = {
      id: txId,
      userId,
      ownerId: userId,
      amount: -cost,
      type: cost === 0 ? 'grant' : 'deduct',
      description: cost === 0 ? `${description} (Free - 0 Credits)` : description,
      generationId,
      createdAt: now,
    };

    const userTxs = this.fallbackTransactions.get(userId) || [];
    userTxs.unshift(txRecord);
    this.fallbackTransactions.set(userId, userTxs);

    if (generationId) {
      this.activeReservations.set(generationId, {
        amount: cost,
        committed: false,
        refunded: false,
      });
    }

    return { transactionId: txId, newBalance };
  }

  /**
   * Commit credits on successful generation
   */
  async commitCredits(userId: string, generationId: string): Promise<void> {
    if (!generationId) return;
    const record = this.activeReservations.get(generationId);
    if (record) {
      record.committed = true;
    }
  }

  /**
   * Refund credits if AI generation fails or is cancelled.
   * Prevents duplicate refunds.
   */
  async refundCredits(
    userId: string,
    generationId: string,
    reason: string = 'Generation failed'
  ): Promise<{ transactionId: string; newBalance: number } | null> {
    if (!generationId) return null;

    const record = this.activeReservations.get(generationId);
    // If not found or already refunded, do not refund again
    if (record && record.refunded) {
      return null;
    }

    const refundAmount = record ? record.amount : 0;
    if (refundAmount <= 0) {
      if (record) record.refunded = true;
      return null;
    }

    const txId = `ref_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const now = new Date().toISOString();
    let newBalance = 100;

    if (this.useFirestore) {
      try {
        const userRef = adminDb.collection('users').doc(userId);
        const txRef = adminDb.collection('creditTransactions').doc(txId);

        await adminDb.runTransaction(async (t) => {
          const userDoc = await t.get(userRef);
          let currentCredits = 100;
          if (userDoc.exists) {
            const data = userDoc.data();
            currentCredits = typeof data?.credits === 'number' ? data.credits : 100;
          }

          newBalance = currentCredits + refundAmount;
          t.update(userRef, {
            credits: newBalance,
            updatedAt: now,
          });

          const txRecord: CreditTransaction = {
            id: txId,
            userId,
            ownerId: userId,
            amount: refundAmount,
            type: 'refund',
            description: `Refund: ${reason}`,
            generationId,
            createdAt: now,
          };

          t.set(txRef, txRecord);
        });

        if (record) record.refunded = true;
        this.fallbackBalances.set(userId, newBalance);
        return { transactionId: txId, newBalance };
      } catch (err) {
        this.useFirestore = false;
      }
    }

    let currentBal = this.fallbackBalances.get(userId) ?? 100;
    newBalance = currentBal + refundAmount;
    this.fallbackBalances.set(userId, newBalance);

    const txRecord: CreditTransaction = {
      id: txId,
      userId,
      ownerId: userId,
      amount: refundAmount,
      type: 'refund',
      description: `Refund: ${reason}`,
      generationId,
      createdAt: now,
    };

    const userTxs = this.fallbackTransactions.get(userId) || [];
    userTxs.unshift(txRecord);
    this.fallbackTransactions.set(userId, userTxs);

    if (record) record.refunded = true;
    return { transactionId: txId, newBalance };
  }

  /**
   * Add bonus or plan upgrade credits
   */
  async addCredits(
    userId: string,
    amount: number,
    reason: string
  ): Promise<{ transactionId: string; newBalance: number }> {
    const grantAmount = Math.abs(amount);
    const txId = `grant_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const now = new Date().toISOString();
    let newBalance = 100;

    if (this.useFirestore) {
      try {
        const userRef = adminDb.collection('users').doc(userId);
        const txRef = adminDb.collection('creditTransactions').doc(txId);

        await adminDb.runTransaction(async (t) => {
          const userDoc = await t.get(userRef);
          let currentCredits = 100;
          if (userDoc.exists) {
            const data = userDoc.data();
            currentCredits = typeof data?.credits === 'number' ? data.credits : 100;
          }

          newBalance = currentCredits + grantAmount;
          t.update(userRef, {
            credits: newBalance,
            updatedAt: now,
          });

          const txRecord: CreditTransaction = {
            id: txId,
            userId,
            ownerId: userId,
            amount: grantAmount,
            type: 'grant',
            description: reason,
            createdAt: now,
          };

          t.set(txRef, txRecord);
        });

        this.fallbackBalances.set(userId, newBalance);
        return { transactionId: txId, newBalance };
      } catch (err) {
        this.useFirestore = false;
      }
    }

    let currentBal = this.fallbackBalances.get(userId) ?? 100;
    newBalance = currentBal + grantAmount;
    this.fallbackBalances.set(userId, newBalance);

    const txRecord: CreditTransaction = {
      id: txId,
      userId,
      ownerId: userId,
      amount: grantAmount,
      type: 'grant',
      description: reason,
      createdAt: now,
    };

    const userTxs = this.fallbackTransactions.get(userId) || [];
    userTxs.unshift(txRecord);
    this.fallbackTransactions.set(userId, userTxs);

    return { transactionId: txId, newBalance };
  }

  /**
   * Get immutable credit transaction ledger for a user
   */
  async getTransactions(userId: string): Promise<CreditTransaction[]> {
    if (this.useFirestore) {
      try {
        const snapshot = await adminDb
          .collection('creditTransactions')
          .where('userId', '==', userId)
          .orderBy('createdAt', 'desc')
          .limit(100)
          .get();

        if (!snapshot.empty) {
          return snapshot.docs.map((doc) => doc.data() as CreditTransaction);
        }
      } catch (err) {
        this.useFirestore = false;
      }
    }

    return this.fallbackTransactions.get(userId) || [
      {
        id: 'tx_welcome',
        userId,
        ownerId: userId,
        amount: 100,
        type: 'grant',
        description: 'Welcome Bonus: 100 Free Starter Credits',
        createdAt: new Date().toISOString(),
      }
    ];
  }
}

export const creditService = new CreditService();
