export class QuizModel {
    constructor() {
        this.questions = [
            { q: "Türkiye'nin başkenti neresidir?", a: ["İstanbul", "Ankara", "İzmir", "Bursa"], c: 1 },
            { q: "Dünya'nın uydusunun adı nedir?", a: ["Ay", "Mars", "Venüs", "Güneş"], c: 0 },
            { q: "En uzun nehir hangisidir?", a: ["Amazon", "Nil", "Fırat", "Ganj"], c: 1 },
            { q: "Atatürk'ün doğum yılı?", a: ["1881", "1893", "1878", "1905"], c: 0 },
            { q: "İtalya'nın başkenti?", a: ["Roma", "Milano", "Venedik", "Napoli"], c: 0 },
            { q: "Elementlerin simgelerini inceleyen bilim?", a: ["Fizik", "Kimya", "Biyoloji", "Astronomi"], c: 1 },
            { q: "İnsan vücudundaki en büyük organ?", a: ["Kalp", "Karaciğer", "Beyin", "Deri"], c: 3 },
            { q: "Dünya'nın en büyük okyanusu?", a: ["Hint", "Atlas", "Büyük Okyanus", "Arktik"], c: 2 },
            { q: "Türkiye'nin en yüksek dağı?", a: ["Ağrı Dağı", "Kaçkar", "Erciyes", "Uludağ"], c: 0 },
            { q: "Bir yıl kaç haftadır (yaklaşık)?", a: ["48", "50", "52", "54"], c: 2 }
        ];
        this.currentIndex = -1;
        this.score = 0;
    }

    start() {
        this.currentIndex = 0;
        this.score = 0;
        return this.getCurrent();
    }

    getCurrent() {
        if (this.currentIndex < 0 || this.currentIndex >= this.questions.length) return null;
        return this.questions[this.currentIndex];
    }

    answer(index) {
        const current = this.getCurrent();
        if (!current) return { correct: false, done: true };
        const correct = index === current.c;
        if (correct) this.score += 1;
        const isLast = this.currentIndex >= this.questions.length - 1;
        return { correct, done: isLast };
    }

    next() {
        if (this.currentIndex < this.questions.length - 1) {
            this.currentIndex += 1;
            return this.getCurrent();
        }
        return null;
    }

    getProgress() {
        return { current: this.currentIndex + 1, total: this.questions.length };
    }
}


