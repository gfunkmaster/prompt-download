export interface SavedPrompt {
    id: string;
    text: string;
    tags?: string[];
    createdAt: number;
}

const STORAGE_KEY = 'prompt_scanner_saved';

const generateTags = (text: string): string[] => {
    const tags: string[] = [];
    const lower = text.toLowerCase();

    if (lower.includes('--v') || lower.includes('--ar') || lower.includes('midjourney')) tags.push('Midjourney');
    if (lower.includes('chatgpt') || lower.includes('openai')) tags.push('ChatGPT');
    if (lower.includes('def ') || lower.includes('function') || lower.includes('console.log') || lower.includes('import ')) tags.push('Code');
    if (lower.includes('recipe') || lower.includes('ingredients')) tags.push('Recipe');
    if (tags.length === 0) tags.push('General');

    return tags;
};

export const savePrompt = (text: string): SavedPrompt => {
    const prompts = getPrompts();
    const newPrompt: SavedPrompt = {
        id: crypto.randomUUID(),
        text,
        tags: generateTags(text),
        createdAt: Date.now()
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify([newPrompt, ...prompts]));
    return newPrompt;
};

export const getPrompts = (): SavedPrompt[] => {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
};

export const removePrompt = (id: string): void => {
    const prompts = getPrompts();
    const updated = prompts.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};
