import { describe, it, expect, vi } from 'vitest';
import { extractIntentAndPlan } from './ai.service';

// Mock the Vertex AI SDK
vi.mock('@google-cloud/vertexai', () => {
  return {
    VertexAI: class {
      getGenerativeModel() {
        return {
          startChat: () => ({
            sendMessage: async () => ({
              response: {
                candidates: [
                  {
                    content: {
                      parts: [
                        {
                          functionCall: {
                            name: 'update_map',
                            args: {
                              lat: 48.8584,
                              lng: 2.2945,
                              destination_name: 'Eiffel Tower, Paris',
                              rationale: 'Day 1: Explore... Day 2: Eat... Day 3: Shop...',
                            },
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            }),
          }),
        };
      }
    },
    Type: {
      OBJECT: 'OBJECT',
      STRING: 'STRING',
      NUMBER: 'NUMBER',
    },
  };
});

describe('AI Service', () => {
  it('extracts intent and plan successfully via function calling', async () => {
    const result = await extractIntentAndPlan('I want to see the Eiffel Tower');
    
    expect(result.type).toBe('function_call');
    expect(result.data).toBeDefined();
    if (result.type === 'function_call') {
      const data = result.data as any;
      expect(data.lat).toBe(48.8584);
      expect(data.lng).toBe(2.2945);
      expect(data.destination_name).toBe('Eiffel Tower, Paris');
    }
  });
});
