import { VertexAI, FunctionDeclaration, Type } from '@google-cloud/vertexai';

// Initialize Vertex AI
const project = 'antigravitypromptwars';
const location = 'us-central1';

const vertexAI = new VertexAI({ project, location });

// We use the Gemini 1.5 Pro model
const generativeModel = vertexAI.getGenerativeModel({
  model: 'gemini-1.5-pro-001',
  generationConfig: {
    temperature: 0.7,
  },
});

// Define the function call for updating the map
const updateMapFunctionDeclaration: FunctionDeclaration = {
  name: 'update_map',
  description: 'Update the map to fly to a specific global destination with cinematic 3D tiles based on the user thought.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      lat: {
        type: Type.NUMBER,
        description: 'Latitude of the destination',
      },
      lng: {
        type: Type.NUMBER,
        description: 'Longitude of the destination',
      },
      destination_name: {
        type: Type.STRING,
        description: 'The name of the destination',
      },
      rationale: {
        type: Type.STRING,
        description: 'A brief explanation of why this destination was chosen based on the user thought, forming a 3-day itinerary concept.',
      },
    },
    required: ['lat', 'lng', 'destination_name', 'rationale'],
  },
};

export const extractIntentAndPlan = async (userThought: string) => {
  try {
    const chat = generativeModel.startChat({
      tools: [
        {
          functionDeclarations: [updateMapFunctionDeclaration],
        },
      ],
    });

    const prompt = `You are a Travel Planning Experience Engine.
The user has provided a thought: "${userThought}".
Determine the best global destination that matches their thought.
You MUST use the 'update_map' function to provide the destination coordinates, name, and a 3-day itinerary rationale.`;

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
