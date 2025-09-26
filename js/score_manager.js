const STORAGE_KEY = 'superGeminiRunnerHighScores';
const MAX_SCORES = 5; // ランキングに保存する最大数

export class ScoreManager {
    constructor() {}

    async getScores() {
        const response = await fetch("https://ocherun.s3.ap-southeast-2.amazonaws.com/test.json");
        const scores = await response.json();
        // 念のためスコアで降順ソートして返す
        return scores.sort((a, b) => b.score - a.score);
    }

    async addScore(score, instrument) {
        const scores = await this.getScores();
        const newScore = {
            score: score,
            instrument: instrument,
            date: this.getFormattedDate(),
        };

        scores.push(newScore);
        scores.sort((a, b) => b.score - a.score);

        // 上位5件だけを残す
        const topScores = scores.slice(0, MAX_SCORES);

        this.sendJson(JSON.stringify(topScores));
    }

    async sendJson(jsonData) {
      // ① 署名付きURLを取得（Node.jsなどのAPIから）
      const res = await fetch('https://xy4mb3of79.execute-api.ap-southeast-2.amazonaws.com/getSignedUrl?key=test.json');
      const { url } = await res.json();

      // ② JSONをPUT送信
      const putRes = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: jsonData
      });

        if (putRes.ok) {
            alert('スコア送信成功！');
        } else {
            alert('スコア送信失敗: ' + putRes.status);
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
