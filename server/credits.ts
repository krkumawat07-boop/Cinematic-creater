import { serverStorage } from './storage.js';
import { CreditTransaction } from '../src/types/index.js';

export class CreditService {
  /**
   * Validate that the user has sufficient credits and reserve them immediately.
   * Throws an error if credits are insufficient.
   */
  reserveCredits(userId: string, cost: number, description: string, generationId?: string): CreditTransaction {
    const user = serverStorage.getUser(userId);
    if (!user) {
      throw new Error('User account not found');
    }

    if (cost > 0 && user.credits < cost) {
      throw new Error(`Insufficient credits. Required: ${cost}, Available: ${user.credits}`);
    }

    // Server-side deduction (or zero record for free generations)
    return serverStorage.addTransaction(userId, {
      amount: -Math.abs(cost),
      type: cost === 0 ? 'grant' : 'deduct',
      description: cost === 0 ? `${description} (Free - 0 Credits)` : description,
      generationId
    });
  }

  /**
   * Refund credits if an AI generation job fails or is cancelled
   */
  refundCredits(userId: string, cost: number, reason: string, generationId?: string): CreditTransaction | null {
    if (cost <= 0) return null;
    return serverStorage.addTransaction(userId, {
      amount: Math.abs(cost),
      type: 'refund',
      description: `Refund: ${reason}`,
      generationId
    });
  }

  /**
   * Grant bonus or purchased credits to user
   */
  grantCredits(userId: string, amount: number, description: string): CreditTransaction {
    return serverStorage.addTransaction(userId, {
      amount: Math.abs(amount),
      type: 'grant',
      description
    });
  }

  getUserBalance(userId: string): number {
    const user = serverStorage.getUser(userId);
    return user ? user.credits : 0;
  }

  getLedger(userId: string): CreditTransaction[] {
    return serverStorage.getTransactions(userId);
  }
}

export const creditService = new CreditService();
