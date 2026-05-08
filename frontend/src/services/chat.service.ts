import axios from 'axios';
import type { DestinationInfo } from '../App';

export interface ChatResponse {
  type: 'function_call' | 'booking_call' | 'text';
  data: DestinationInfo | any | string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const CACHE_KEY = 'journeycrafter_cache';

/**
 * Service to handle communication with the JourneyCrafter Backend (Gemini AI)
 */
export const chatService = {
  /**
   * Send a user message to the AI and receive a structured response
   */
  async sendMessage(thought: string): Promise<ChatResponse> {
    // Check cache first for efficiency
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
    if (cache[thought]) {
      console.log('Serving from cache:', thought);
      return cache[thought];
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/chat`, { thought });
      const result = response.data;

      // Cache the result
      cache[thought] = result;
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));

      return result;
    } catch (error) {
      console.error('Chat API Error:', error);
      throw new Error('I encountered an issue connecting to the travel engine. Please try again.');
    }
  },

  /**
   * (Placeholder for future) Log travel events or analytics
   */
  async logEvent(event: string, details: any) {
    console.log(`[Event: ${event}]`, details);
  }
};
