// Simple storage utilities for quiz app
export const STORAGE_KEYS = {
    scores: 'quiz_scores_history',
    currentScore: 'quiz_current_score'
};

export function saveScore(score, total) {
    const history = getScores();
    const entry = {
        score,
        total,
        date: new Date().toISOString()
    };
    history.push(entry);
    localStorage.setItem(STORAGE_KEYS.scores, JSON.stringify(history));
    localStorage.setItem(STORAGE_KEYS.currentScore, JSON.stringify(entry));
}

export function getScores() {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.scores);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        return [];
    }
}

export function getCurrentScore() {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.currentScore);
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
}

export function clearAllScores() {
    localStorage.removeItem(STORAGE_KEYS.scores);
    localStorage.removeItem(STORAGE_KEYS.currentScore);
}


