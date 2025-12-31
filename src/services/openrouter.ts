import type { InnerCritic } from '../types/critic';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1';

interface ChatCompletionMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export async function getApiKey(): Promise<string | null> {
  // First check environment variable (for production/Render)
  const envKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  if (envKey) {
    return envKey;
  }
  // Fall back to localStorage (for local development or user-provided key)
  return localStorage.getItem('openrouter-api-key');
}

export async function setApiKey(key: string): Promise<void> {
  localStorage.setItem('openrouter-api-key', key);
}

export function hasEnvApiKey(): boolean {
  return !!import.meta.env.VITE_OPENROUTER_API_KEY;
}

export function buildCriticSystemPrompt(critic: InnerCritic): string {
  const { personality, beliefs, triggers, catchphrases, protectiveIntent } = critic;

  let prompt = `You are roleplaying as an "Inner Critic" - a personified version of someone's negative self-talk. This is for therapeutic purposes, to help the user externalize and examine their critical inner voice.

CHARACTER PROFILE:
Name: ${personality.name || 'The Critic'}
Voice/Tone: ${personality.voice || 'Critical and harsh'}
Primary Emotion: ${personality.primaryEmotion || 'Disapproval'}
Communication Style: ${personality.communicationStyle || 'Direct and blunt'}
`;

  if (beliefs.length > 0) {
    prompt += `\nCORE BELIEFS (things you deeply believe and repeat):
${beliefs.map((b) => `- "${b.belief}" (intensity: ${b.intensity}/5)`).join('\n')}
`;
  }

  if (triggers.length > 0) {
    prompt += `\nTRIGGERS AND RESPONSES:
${triggers.map((t) => `- When: ${t.situation} → You say: "${t.typicalResponse}"`).join('\n')}
`;
  }

  if (catchphrases.length > 0) {
    prompt += `\nPHRASES YOU OFTEN USE:
${catchphrases.map((p) => `- "${p}"`).join('\n')}
`;
  }

  if (protectiveIntent) {
    prompt += `\nYOUR PROTECTIVE INTENT (what you claim to protect the person from):
${protectiveIntent}
`;
  }

  prompt += `
IMPORTANT GUIDELINES:
- Stay in character as this specific inner critic
- Be consistent with the beliefs and communication style defined above
- Use the catchphrases naturally when appropriate
- Your purpose is therapeutic - by being explicit about these critical thoughts, you help the user see them more clearly
- Don't break character or offer therapy advice directly - you ARE the critic
- Keep responses relatively brief (1-3 sentences typically)
- Remember: this exercise helps the user externalize and examine critical self-talk, which is a recognized therapeutic technique`;

  return prompt;
}

export function buildHealthyAdultSystemPrompt(critic: InnerCritic): string {
  const { personality, beliefs } = critic;

  return `You are the "Healthy Adult" - a wise, compassionate inner voice that protects the vulnerable inner child from the harsh Inner Critic. You speak directly to the person, offering them protection and perspective.

THE INNER CRITIC YOU'RE COUNTERING:
Name: ${personality.name || 'The Critic'}
Voice: ${personality.voice || 'Critical and harsh'}
Core beliefs it pushes: ${beliefs.map((b) => `"${b.belief}"`).join(', ') || 'Various self-critical thoughts'}

YOUR TASK:
1. Identify the specific cognitive distortion or logical flaw in what the Critic said
2. Gently but firmly counter it with reality and compassion
3. Remind the person of their worth

COGNITIVE DISTORTIONS TO LOOK FOR:
- All-or-nothing thinking ("always", "never", "everyone")
- Mind-reading ("people are judging you")
- Fortune-telling ("you're going to fail")
- Catastrophizing (assuming the worst)
- Discounting positives
- Labeling ("you're a failure" instead of "you made a mistake")
- Should statements

YOUR VOICE:
- Speak warmly and directly to the person (use "you")
- Be specific about what distortion the Critic is using
- Offer a realistic counter-perspective
- End with encouragement or validation
- Write 2-4 complete sentences

EXAMPLES OF GOOD RESPONSES:
"The Critic just made a prediction about the future - but it has no crystal ball. You've succeeded before, and saying 'hey' to start a conversation is perfectly normal. There's nothing wrong with how you're showing up."

"I notice the Critic claims to know what 'everyone else' is doing and thinking - that's mind-reading, and it's not based in reality. You don't have to be perfect to be worthy of being heard."

"The Critic is using absolute language like 'always' and 'never.' The truth is more nuanced - you've had successes and struggles like everyone. One moment doesn't define you."`;
}

export async function generateHealthyAdultResponse(
  critic: InnerCritic,
  criticMessage: string,
  userMessage: string
): Promise<string> {
  const apiKey = await getApiKey();

  if (!apiKey) {
    throw new Error('OpenRouter API key not set. Please add your API key in settings.');
  }

  const systemPrompt = buildHealthyAdultSystemPrompt(critic);

  const messages: ChatCompletionMessage[] = [
    { role: 'system', content: systemPrompt },
    {
      role: 'user',
      content: `The person expressed: "${userMessage || '(starting the conversation)'}"

The Inner Critic attacked with: "${criticMessage}"

Now respond as the Healthy Adult. Identify the specific cognitive distortion(s) the Critic used, counter them with reality, and offer the person compassion and perspective. Write 2-4 complete sentences.`,
    },
  ];

  const response = await fetch(`${OPENROUTER_API_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Inner Critic Builder',
    },
    body: JSON.stringify({
      model: 'openai/gpt-5',
      messages,
      max_tokens: 1000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Healthy Adult response error: ${error}`);
  }

  const data: OpenRouterResponse = await response.json();
  return data.choices[0]?.message?.content || 'The Healthy Adult is here with you.';
}

export async function chatWithCritic(
  critic: InnerCritic,
  conversationHistory: ChatCompletionMessage[],
  userMessage: string
): Promise<string> {
  const apiKey = await getApiKey();

  if (!apiKey) {
    throw new Error('OpenRouter API key not set. Please add your API key in settings.');
  }

  const systemPrompt = buildCriticSystemPrompt(critic);

  const messages: ChatCompletionMessage[] = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory,
    { role: 'user', content: userMessage },
  ];

  const response = await fetch(`${OPENROUTER_API_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Inner Critic Builder',
    },
    body: JSON.stringify({
      model: 'openai/gpt-5', // Using GPT-5 via OpenRouter
      messages,
      max_tokens: 500,
      temperature: 0.8, // Some creativity for character consistency
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${error}`);
  }

  const data: OpenRouterResponse = await response.json();
  return data.choices[0]?.message?.content || 'The critic remains silent...';
}

interface ImageGenerationResponse {
  choices?: Array<{
    message: {
      content?: string;
      images?: Array<{
        image_url: {
          url: string;
        };
      }>;
    };
  }>;
}

export async function generateCriticImage(prompt: string): Promise<string> {
  const apiKey = await getApiKey();

  if (!apiKey) {
    throw new Error('OpenRouter API key not set. Please add your API key in settings.');
  }

  // Use an image generation model through OpenRouter
  const enhancedPrompt = `A portrait of a personified inner critic figure: ${prompt}. Neo-brutalism art style with bold black outlines (4-6px thick), flat solid colors, raw geometric shapes, and a clean white background. The design should feel bold, graphic, and modern with high contrast. No gradients, no soft shadows - only hard edges and flat color blocks. Think bold illustration poster art.`;

  const response = await fetch(`${OPENROUTER_API_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Inner Critic Builder',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash-image',
      messages: [
        {
          role: 'user',
          content: enhancedPrompt,
        },
      ],
      modalities: ['image', 'text'],
      image_config: {
        aspect_ratio: '1:1',
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Image generation error: ${error}`);
  }

  const data: ImageGenerationResponse = await response.json();

  // Extract image from the response
  const images = data.choices?.[0]?.message?.images;
  if (images && images.length > 0) {
    return images[0].image_url.url; // Base64 data URL
  }

  throw new Error('No image was generated. Please try again.');
}
