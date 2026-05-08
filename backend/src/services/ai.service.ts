import { VertexAI, FunctionDeclaration, FunctionDeclarationSchemaType } from '@google-cloud/vertexai';

// Initialize Vertex AI
const project = 'antigravitypromptwars';
const location = 'us-central1';

const vertexAI = new VertexAI({ project, location });

// We use the Gemini 1.5 Pro model
const generativeModel = vertexAI.getGenerativeModel({
  model: 'gemini-2.5-flash-lite',
  generationConfig: {
    temperature: 0.7,
  },
});

// Define the function call for updating the map
const updateMapFunctionDeclaration: FunctionDeclaration = {
  name: 'update_map',
  description: 'Update the map to fly to a specific global destination with cinematic 3D tiles based on the user thought.',
  parameters: {
    type: FunctionDeclarationSchemaType.OBJECT,
    properties: {
      lat: {
        type: FunctionDeclarationSchemaType.NUMBER,
        description: 'Latitude of the destination',
      },
      lng: {
        type: FunctionDeclarationSchemaType.NUMBER,
        description: 'Longitude of the destination',
      },
      destination_name: {
        type: FunctionDeclarationSchemaType.STRING,
        description: 'The name of the destination',
      },
      rationale: {
        type: FunctionDeclarationSchemaType.STRING,
        description: 'A detailed 3-day itinerary formatted in Markdown with headers and bullet points. You MUST include specific names of places to visit and restaurants to eat at for each of the 3 days.',
      },
      famous_places: {
        type: FunctionDeclarationSchemaType.ARRAY,
        items: {
          type: FunctionDeclarationSchemaType.STRING,
        },
        description: 'A list of 3-5 iconic landmarks or famous places in this destination.',
      },
      budget: {
        type: FunctionDeclarationSchemaType.OBJECT,
        properties: {
          currency: { type: FunctionDeclarationSchemaType.STRING, description: 'USD, EUR, etc.' },
          total: { type: FunctionDeclarationSchemaType.NUMBER },
          breakdown: {
            type: FunctionDeclarationSchemaType.ARRAY,
            items: {
              type: FunctionDeclarationSchemaType.OBJECT,
              properties: {
                category: { type: FunctionDeclarationSchemaType.STRING },
                amount: { type: FunctionDeclarationSchemaType.NUMBER },
              },
              required: ['category', 'amount'],
            },
          },
          notes: { type: FunctionDeclarationSchemaType.STRING },
        },
        required: ['currency', 'total', 'breakdown', 'notes'],
      },
    },
    required: ['lat', 'lng', 'destination_name', 'rationale', 'famous_places', 'budget'],
  },
};

// Define the function call for booking tickets
const bookTicketsFunctionDeclaration: FunctionDeclaration = {
  name: 'book_tickets',
  description: 'Triggered when the user explicitly asks for help booking tickets or making a reservation.',
  parameters: {
    type: FunctionDeclarationSchemaType.OBJECT,
    properties: {
      destination: {
        type: FunctionDeclarationSchemaType.STRING,
        description: 'The destination the user wants to book for.',
      },
    },
    required: ['destination'],
  },
};

export const extractIntentAndPlan = async (userThought: string) => {
  try {
    const chat = generativeModel.startChat({
      tools: [
        {
          functionDeclarations: [
            updateMapFunctionDeclaration, 
            bookTicketsFunctionDeclaration,
          ],
        },
      ],
    });

    const prompt = `You are a Travel Planning Experience Engine.
The user has provided a thought: "${userThought}".
Determine the best global destination that matches their thought.
ALWAYS call the 'update_map' function if a destination is identified. 
For 'update_map', you MUST provide:
1. Coordinates (lat, lng)
2. Destination name
3. A detailed 3-Day itinerary in Markdown 'rationale'. You MUST use '### Day 1', '### Day 2', and '### Day 3' as headers. Include specific landmarks and restaurants for each day.
4. A list of 3-5 'famous_places' (iconic landmarks)
5. A comprehensive 'budget' breakdown for the 3rd-day trip.
IMPORTANT: Do not skip the day-by-day headers.`;

    const result = await chat.sendMessage(prompt);
    const response = result.response;

    const functionCalls = response.candidates?.[0]?.content?.parts?.filter(
      (part) => part.functionCall
    );

    if (functionCalls && functionCalls.length > 0) {
      const functionCall = functionCalls[0].functionCall;
      if (functionCall?.name === 'update_map') {
        return {
          type: 'function_call',
          data: functionCall.args,
        };
      }
      if (functionCall?.name === 'book_tickets') {
        return {
          type: 'booking_call',
          data: functionCall.args,
        };
      }
    }

    // Fallback if no function call was made
    const textPart = response.candidates?.[0]?.content?.parts?.find((part) => part.text);
    return {
      type: 'text',
      data: textPart?.text || 'I could not determine a suitable destination.',
    };
  } catch (error) {
    console.error('Error calling Vertex AI:', error);
    throw error;
  }
};
