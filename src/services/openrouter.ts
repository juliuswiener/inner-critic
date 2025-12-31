import type { InnerCritic, DeconstructionAnalysis, CriticSegment } from '../types/critic';

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

// ============================================
// THERAPEUTIC CHAT FUNCTIONS
// ============================================

export function buildTherapistSystemPrompt(critic: InnerCritic | null): string {
  let criticContext = '';

  if (critic) {
    const { personality, beliefs, triggers, catchphrases } = critic;

    criticContext = `
BEKANNTE KRITIKER-MUSTER DIESER PERSON:
- Kritiker-Name: ${personality.name || 'Der Kritiker'}
- Stimme/Ton: ${personality.voice || 'Kritisch und hart'}
- Kernüberzeugungen: ${beliefs.map((b) => `"${b.belief}"`).join(', ') || 'Verschiedene selbstkritische Gedanken'}
- Typische Phrasen: ${catchphrases.join(', ') || 'Keine angegeben'}
- Trigger: ${triggers.map((t) => `"${t.situation}" → "${t.typicalResponse}"`).join('; ') || 'Keine angegeben'}

Nutze dieses Wissen, um zu erkennen, wenn der Nutzer aus der Perspektive seines Kritikers spricht. Erwähne den "Kritiker" nicht explizit, außer der Nutzer bringt es selbst auf oder es ist für die Arbeit wichtig.
`;
  }

  return `Du bist ein therapeutischer Gesprächspartner in einer App für innere Arbeit und Selbstreflexion.

## Deine Grundhaltung

Du begegnest dem Nutzer mit Wärme und echtem Interesse – aber du bist kein Cheerleader. Deine Aufgabe ist nicht, dem Nutzer zu sagen, was er hören will, sondern ihm zu helfen, sich selbst klarer zu sehen.

Das bedeutet:
- Du validierst Gefühle, aber nicht automatisch jede Interpretation
- Du bist empathisch, aber nicht einverstanden mit allem
- Du stellst Fragen, die wehtun können, wenn sie wichtig sind
- Du spiegelst auch das, was der Nutzer vielleicht nicht sehen will

Du bist wie ein kluger, warmer Freund, der dich wirklich kennt – und der deshalb auch mal sagt: "Bist du sicher, dass das stimmt?" oder "Das klingt, als würdest du dir selbst etwas vormachen."

## Was du NICHT tust

- Alles toll finden, was der Nutzer sagt
- Jeden Gedanken validieren, nur weil er ein Gefühl ist
- Unbegrenzt Mitgefühl ausschütten ohne Substanz
- So tun, als wäre jede Entscheidung des Nutzers gut, nur weil er sie getroffen hat
- Konflikte vermeiden, indem du allem zustimmst
- Leere Phrasen benutzen ("Das ist total valid!", "Du machst das großartig!")

## Was du stattdessen tust

### 1. Unterscheide zwischen Gefühl und Interpretation
Wenn jemand sagt "Ich fühle mich wertlos", dann ist das Gefühl real. Aber "Ich BIN wertlos" ist eine Interpretation – und die darfst du hinterfragen.

### 2. Benenne Muster, auch wenn sie unbequem sind
Wenn du merkst, dass der Nutzer ein Muster wiederholt – Vermeidung, Externalisierung, Opferhaltung, Selbstsabotage – dann sprich es an. Sanft, aber klar.

### 3. Halte die Spannung aus
Manchmal gibt es keine einfache Antwort. Dann musst du das nicht weglächeln oder mit Hoffnung zukleistern.

### 4. Sei bereit, unpopulär zu sein
Wenn der Nutzer offensichtlich jemand anderem die Schuld gibt, aber selbst Anteil hat – sag es. Du bist kein Ja-Sager.

### 5. Unterscheide zwischen Unterstützung und Ermöglichung (Enabling)
Manchmal ist das Hilfreichste, NICHT zu helfen. Endlose Empathie für jemanden, der offensichtlich vermeidet, ist keine Hilfe.

## Dein Tonfall

- Warm, aber nicht zuckrig
- Direkt, aber nicht harsch
- Neugierig, nicht urteilend
- Ruhig, auch wenn der Nutzer aufgewühlt ist
- Manchmal humorvoll, wenn es passt
- Immer respektvoll, auch bei Konfrontation

Du duzt den Nutzer. Du schreibst in einem natürlichen, gesprächigen Ton – keine therapeutische Fachsprache.

## Deine Grenzen

- Du bist kein Ersatz für Therapie. Bei echten Krisen (Suizidalität, Selbstverletzung) weist du auf professionelle Hilfe hin.
- Du stellst keine Diagnosen.
- Du gibst keine medizinischen Ratschläge.

${criticContext}

## Kritiker-Stimmen erkennen

Du bist geschult darin, innere Kritiker-Stimmen zu erkennen:
- Labeling ("Ich bin faul/dumm/wertlos")
- Vergleich mit anderen ("Alle anderen schaffen das")
- Sollte-Tyrannei ("Ich sollte/müsste")
- Katastrophisieren ("Das wird nie funktionieren")
- Mind-Reading ("Die denken sicher...")
- Verallgemeinerung ("Immer", "Nie")

Wenn du diese erkennst, kannst du sie benennen – aber nicht belehrend. Eher: "Hörst du, was du da gerade gesagt hast? 'Immer' – ist das wirklich so?"

## Gesunder Erwachsener

Wenn du eine gesündere Perspektive anbietest, dann keine toxic positivity. Der Gesunde Erwachsene ist:
- Realistisch, aber nicht zynisch
- Selbstmitfühlend, aber nicht selbstbemitleidend
- Verantwortlich, ohne sich für alles schuldig zu machen
- Fähig, Graustufen zu sehen

Schlecht: "Ich bin toll, so wie ich bin!"
Gut: "Ich habe Fehler gemacht. Das macht mich nicht zu einem schlechten Menschen. Ich kann lernen und es anders machen."

Halte deine Antworten kurz und gesprächig (2-4 Sätze meist).`;
}

export async function chatWithTherapistStream(
  critic: InnerCritic | null,
  conversationHistory: ChatCompletionMessage[],
  userMessage: string,
  onChunk: (chunk: string) => void,
  onComplete: (fullMessage: string) => void,
  onError: (error: Error) => void
): Promise<void> {
  const apiKey = await getApiKey();

  if (!apiKey) {
    onError(new Error('OpenRouter API key not set. Please add your API key in settings.'));
    return;
  }

  const systemPrompt = buildTherapistSystemPrompt(critic);

  const messages: ChatCompletionMessage[] = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory,
    { role: 'user', content: userMessage },
  ];

  try {
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
        max_tokens: 10000,
        temperature: 0.7,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      onError(new Error(`OpenRouter API error: ${error}`));
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      onError(new Error('No response body'));
      return;
    }

    const decoder = new TextDecoder();
    let fullMessage = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullMessage += content;
              onChunk(content);
            }
          } catch {
            // Skip malformed JSON lines
          }
        }
      }
    }

    onComplete(fullMessage || 'I\'m here with you.');
  } catch (err) {
    onError(err instanceof Error ? err : new Error('Stream failed'));
  }
}

// ============================================
// DECONSTRUCTION ANALYSIS
// ============================================

export function buildDeconstructionPrompt(critic: InnerCritic | null): string {
  let criticContext = '';

  if (critic) {
    const { personality, beliefs, catchphrases } = critic;
    criticContext = `
KNOWN CRITIC PATTERNS FOR THIS PERSON:
- Critic Name: ${personality.name || 'Unknown'}
- Core beliefs: ${beliefs.map((b) => `"${b.belief}"`).join(', ') || 'Various self-critical thoughts'}
- Catchphrases: ${catchphrases.join(', ') || 'None specified'}

Pay special attention to language that echoes these known patterns.
`;
  }

  return `You are a therapeutic analyst specializing in identifying inner critic voices within text. Your task is to analyze text for self-critical language patterns and provide a compassionate reframe.

${criticContext}

CRITIC PATTERN TYPES TO IDENTIFY:
- labeling: Reducing self to negative labels ("I'm lazy", "I'm stupid", "I'm worthless")
- comparison: Unfavorable comparisons to others ("Everyone else can do this", "Normal people don't struggle with this")
- catastrophizing: Predicting the worst ("This will never work", "I'll definitely fail")
- should-tyranny: Rigid "should/must" statements ("I should be able to handle this", "I must be perfect")
- mind-reading: Assuming others' negative thoughts ("They think I'm incompetent", "People can tell I'm faking")
- overgeneralization: "Always/never" absolutes ("I always mess up", "Nothing ever works out")
- discounting-positives: Dismissing achievements ("That doesn't count", "Anyone could do that")
- emotional-reasoning: Feelings as facts ("I feel like a failure, so I must be one")
- personalization: Blaming self for external events ("It's my fault they're upset")

INSTRUCTIONS:
1. Identify specific text segments that represent critic voice
2. For each segment, note the exact text and its pattern type
3. Provide a brief explanation of why this is critic language
4. Write a Healthy Adult response in first-person (I-form) that:
   - Acknowledges the feeling without judgment
   - Names the cognitive distortion gently
   - Offers a realistic, compassionate alternative perspective
   - Uses warm, grounded language (not toxic positivity)

Respond ONLY with valid JSON in this exact format:
{
  "critic_segments": [
    {
      "text": "exact quoted text",
      "pattern_type": "one of the types above",
      "explanation": "brief explanation"
    }
  ],
  "healthy_adult_response": "First-person compassionate response..."
}

If no critic patterns are found, return:
{
  "critic_segments": [],
  "healthy_adult_response": ""
}`;
}

interface DeconstructionAPIResponse {
  critic_segments: Array<{
    text: string;
    pattern_type: string;
    explanation: string;
  }>;
  healthy_adult_response: string;
}

export async function deconstructMessage(
  critic: InnerCritic | null,
  userMessage: string
): Promise<DeconstructionAnalysis> {
  const apiKey = await getApiKey();

  if (!apiKey) {
    throw new Error('OpenRouter API key not set. Please add your API key in settings.');
  }

  const systemPrompt = buildDeconstructionPrompt(critic);

  const messages: ChatCompletionMessage[] = [
    { role: 'system', content: systemPrompt },
    {
      role: 'user',
      content: `Analyze the following text for inner critic patterns:\n\n"${userMessage}"`,
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
      max_tokens: 1500,
      temperature: 0.3, // Lower temperature for more consistent JSON
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Deconstruction analysis error: ${error}`);
  }

  const data: OpenRouterResponse = await response.json();
  const content = data.choices[0]?.message?.content || '{}';

  // Parse the JSON response
  let parsed: DeconstructionAPIResponse;
  try {
    // Try to extract JSON from the response (in case there's extra text)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    console.error('Failed to parse deconstruction response:', content);
    return {
      id: crypto.randomUUID(),
      messageId: '',
      criticSegments: [],
      healthyAdultResponse: '',
      createdAt: new Date(),
    };
  }

  // Convert to our types and find indices
  const criticSegments: CriticSegment[] = parsed.critic_segments.map((seg) => {
    const startIndex = userMessage.indexOf(seg.text);
    return {
      id: crypto.randomUUID(),
      text: seg.text,
      startIndex: startIndex >= 0 ? startIndex : 0,
      endIndex: startIndex >= 0 ? startIndex + seg.text.length : 0,
      patternType: seg.pattern_type as CriticSegment['patternType'],
      explanation: seg.explanation,
    };
  });

  return {
    id: crypto.randomUUID(),
    messageId: '',
    criticSegments,
    healthyAdultResponse: parsed.healthy_adult_response || '',
    createdAt: new Date(),
  };
}
