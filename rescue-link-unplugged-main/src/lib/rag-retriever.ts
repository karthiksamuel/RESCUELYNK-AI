import KnowledgeBase from '../data/knowledge-base.json';

export interface KnowledgeEntry {
    topic: string;
    keywords: string[];
    content: string;
}

const kb: KnowledgeEntry[] = KnowledgeBase;

export function retrieveKnowledge(query: string): KnowledgeEntry[] {
    const normalizedQuery = query.toLowerCase();

    // Basic token matching
    const matches = kb.map(entry => {
        let score = 0;
        for (const keyword of entry.keywords) {
            if (normalizedQuery.includes(keyword)) {
                // Longer keywords matching gives higher relevance score
                score += keyword.length;
            }
        }
        return { entry, score };
    })
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score);

    // Return the top 2 most relevant entries to inject into our LLM prompt
    return matches.slice(0, 2).map(m => m.entry);
}
