import { Router } from 'express';
import { extractIntentAndPlan } from '../services/ai.service';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { thought } = req.body;

    if (!thought) {
      return res.status(400).json({ error: 'Thought is required' });
    }

    const result = await extractIntentAndPlan(thought);

    res.json(result);
  } catch (error) {
    console.error('Chat API Error:', error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  }
});

export default router;
