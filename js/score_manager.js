const STORAGE_KEY = 'superGeminiRunnerHighScores';
const MAX_SCORES = 5; // ランキングに保存する最大数

export class ScoreManager {
    constructor() {}

    getScores() {
        const scoresJSON = localStorage.getItem(STORAGE_KEY);
        const scores = scoresJSON ? JSON.parse(scoresJSON) : [];
        // 念のためスコアで降順ソートして返す
        return scores.sort((a, b) => b.score - a.score);
    }

    addScore(score, instrument) {
        const scores = this.getScores();
        const newScore = {
            score: score,
            instrument: instrument,
            date: this.getFormattedDate(),
        };

        scores.push(newScore);
        scores.sort((a, b) => b.score - a.score);

        // 上位5件だけを残す
        const topScores = scores.slice(0, MAX_SCORES);

        localStorage.setItem(STORAGE_KEY, JSON.stringify(topScores));
    }

    getFormattedDate() {
        const now = new Date();
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        return `${year}/${month}/${day} ${hours}:${minutes}`;
    }
}
