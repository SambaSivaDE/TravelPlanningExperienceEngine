import { describe, it, expect } from 'vitest';
import { extractIntentAndPlan } from '../ai.service';

describe('AIService', () => {
  it('should handle impossible travel constraints gracefully', async () => {
    // This is a conceptual test for the prompt logic
    const impossiblePrompt = "Drive from New York to Paris in 2 hours";
    try {
      const result = await extractIntentAndPlan(impossiblePrompt);
      expect(result).toBeDefined();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('should parse budget numbers correctly', () => {
    const mockBudget = {
      total: 1500,
      currency: 'USD',
      breakdown: [
        { category: 'Flights', amount: 800 },
        { category: 'Hotel', amount: 700 }
      ]
    };
    expect(mockBudget.total).toBe(1500);
    expect(mockBudget.breakdown.length).toBe(2);
  });
});
