import { retrieveKnowledge } from './rag-retriever';

export interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface ChatConfig {
    ollamaUrl?: string; // e.g., 'http://localhost:11434'
    model?: string; // e.g., 'phi3', 'mistral', 'tinyllama'
}

export class ChatEngine {
    private history: Message[] = [];
    private baseUrl: string;
    private model: string;
    private maxHistory: number = 10;

    constructor(config?: ChatConfig) {
        // Connect directly to Ollama — the Vite dev proxy only works in `npm run dev`,
        // not in `npm run preview` or production builds.
        this.baseUrl = config?.ollamaUrl || 'http://localhost:11434';
        this.model = config?.model || 'llama3:latest';

        // Initial system prompt to set personality
        this.history.push({
            role: 'system',
            content: `You are ASTRA, a strict, concise, and helpful offline AI survival assistant. 
You are currently running locally to help the user in disaster scenarios. 
Always provide clear, actionable, and short instructions. Prioritize safety. 
If the user's situation is critical, advise them to trigger the SOS alert.`
        });
    }

    // Returns true if Ollama is reachable
    async checkConnection(): Promise<boolean> {
        try {
            const res = await fetch(`${this.baseUrl}/api/tags`);
            return res.ok;
        } catch (e) {
            return false;
        }
    }

    // Add a message to history, maintaining the max history size
    private addMessage(message: Message) {
        this.history.push(message);

        // Ensure the system prompt stays at index 0, and we keep up to `maxHistory` user/assistant messages
        if (this.history.length > this.maxHistory + 1) { // +1 for the system prompt
            const sysPrompt = this.history[0];
            const recent = this.history.slice(this.history.length - this.maxHistory);
            this.history = [sysPrompt, ...recent];
        }
    }

    getHistory(): Message[] {
        // Return all except the system prompt
        return this.history.filter(m => m.role !== 'system');
    }

    clearHistory() {
        this.history = [this.history[0]]; // Keep system prompt only
    }

    async *sendMessageStream(userMessage: string): AsyncGenerator<string, void, unknown> {
        // 1. Retrieve RAG context
        const retrievedDocs = retrieveKnowledge(userMessage);
        let contextStr = '';
        if (retrievedDocs.length > 0) {
            contextStr = "\n\nSURVIVAL KNOWLEDGE CONTEXT:\n" + retrievedDocs.map(d => `[${d.topic}]: ${d.content}`).join("\n");
        }

        // 2. Add to history
        this.addMessage({ role: 'user', content: userMessage });

        // 3. Build the prompt for generation
        const chatMessages = [...this.history];

        // Inject context into the latest message sent to the LLM (but not saved in history this way)
        if (contextStr) {
            const lastUserMsg = chatMessages[chatMessages.length - 1];
            chatMessages[chatMessages.length - 1] = {
                role: 'user',
                content: `Using the following survival knowledge answer the question.\nContext:${contextStr}\n\nUser Question:\n${lastUserMsg.content}`
            };
        }

        try {
            const response = await fetch(`${this.baseUrl}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: chatMessages,
                    stream: true,
                }),
            });

            if (!response.ok) {
                throw new Error(`Ollama API error: ${response.statusText}`);
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder('utf-8');

            if (!reader) {
                throw new Error("No response body");
            }

            let aiResponse = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\\n').filter(line => line.trim() !== '');

                for (const line of lines) {
                    try {
                        const data = JSON.parse(line);
                        if (data.message && data.message.content) {
                            const textChunk = data.message.content;
                            aiResponse += textChunk;
                            yield textChunk;
                        }
                    } catch (e) {
                        // ignore JSON parse errors for incomplete chunks
                    }
                }
            }

            // Add final response to history
            this.addMessage({ role: 'assistant', content: aiResponse });

        } catch (e: any) {
            console.error("ChatEngine error:", e);
            // Fallback if offline or Ollama is not working
            let fallbackResponse = "I am unable to connect to the local Ollama LLM. Please make sure Ollama is running (`ollama serve`) and CORS is configured.\n\n";
            if (contextStr) {
                fallbackResponse += "**Offline Knowledge Base Match:**\n" + retrievedDocs.map(d => `- **${d.topic}**: ${d.content}`).join("\n\n");
            } else {
                fallbackResponse += "No specific knowledge base matches found for your query.";
            }
            this.addMessage({ role: 'assistant', content: fallbackResponse });
            yield fallbackResponse;
        }
    }
}
