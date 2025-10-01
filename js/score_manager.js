const STORAGE_KEY = 'superGeminiRunnerHighScores';
const MAX_SCORES = 50; // ランキングに保存する最大数

export class ScoreManager {
    constructor(game) {
        this.game = game;
    }

    async getScores() {
        try {
            const response = await fetch("https://ocherun.s3.ap-southeast-2.amazonaws.com/test.json");
            const scores = await response.json();

            // username が無いスコアは "guest" に補完
            const normalizedScores = scores.map(s => ({
                score: s.score,
                instrument: s.instrument,
                date: s.date,
                username: s.username || "guest"
            }));

            // スコア降順にソート
            const sortedScores = normalizedScores.sort((a, b) => b.score - a.score);

            // 上位MAX_SCORES件だけを返す
            return sortedScores.slice(0, MAX_SCORES);

        } catch (err) {
            console.error("Failed to fetch scores:", err);
            return [];
        }
    }

    async addScore(score, instrument) {
        const scores = await this.getScores();

        console.log('Current username in ScoreManager.addScore:', this.game.username);

        const newScore = {
            score: score,
            instrument: instrument,
            date: this.getFormattedDate(),
            username: this.game.username || "guest" // ← ゲスト補完
        };

        console.log('Created newScore object:', newScore);

        scores.push(newScore);

        // ソートして上位MAX_SCORES件に制限
        const topScores = scores.sort((a, b) => b.score - a.score).slice(0, MAX_SCORES);

        this.sendJson(JSON.stringify(topScores));
    }

    async sendJson(jsonData) {
        console.log('Attempting to send JSON data:', jsonData);

        try {
            const res = await fetch('https://xy4mb3of79.execute-api.ap-southeast-2.amazonaws.com/getSignedUrl?key=test.json');
            const { url } = await res.json();
            console.log('Received signed URL:', url);

            const putRes = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: jsonData
            });

            if (putRes.ok) {
                console.log('JSON data successfully sent to S3!');
            } else {
                console.error('Failed to send JSON data to S3:', putRes.status, putRes.statusText);
                const errorBody = await putRes.text();
                console.error('S3 PUT response body:', errorBody);
            }
        } catch (err) {
            console.error("Error while sending JSON to S3:", err);
        }
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
