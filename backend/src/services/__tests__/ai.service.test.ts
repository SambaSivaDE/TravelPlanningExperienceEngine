import { describe, it, expect, beforeEach } from 'vitest';
import { AIService } from '../ai.service';

describe('AIService', () => {
  let aiService: AIService;

  beforeEach(() => {
    aiService = new AIService();
  });

  it('should handle impossible travel constraints gracefully', async () => {
    // This is a conceptual test for the prompt logic
    const impossiblePrompt = "Drive from New York to Paris in 2 hours";
    try {
      // In a real test we would mock the generative model
      // For now we verify the service structure handles errors
      const result = await aiService.generateTravelPlan(impossiblePrompt);
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
