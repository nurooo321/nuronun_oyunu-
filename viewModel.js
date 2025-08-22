import { QuizModel } from './model.js';
import { QuizView } from './view.js';
import { saveScore } from './storage.js';

export class QuizViewModel {
    constructor(root) {
        this.model = new QuizModel();
        this.view = new QuizView(root);
        this.selectedIndex = null;
        this.timerId = null;
        this.timeLeft = 30;
        this.bindEvents();
        this.view.showStart();
    }

    bindEvents() {
        this.view.startBtn.addEventListener('click', () => this.start());
        this.view.options.addEventListener('click', (e) => {
            const btn = e.target.closest('.option');
            if (!btn || this.selectedIndex != null) return;
            // mark visually selected
            this.view.options.querySelectorAll('.option').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            this.selectedIndex = Number(btn.dataset.index);
            this.view.nextBtn.disabled = false;
        });
        this.view.nextBtn.addEventListener('click', () => this.submitAndContinue());
        this.view.playAgainBtn.addEventListener('click', () => {
            window.location.href = 'quiz.html';
        });
    }

    start() {
        const q = this.model.start();
        this.view.showQuiz();
        this.view.renderQuestion(q);
        const p = this.model.getProgress();
        this.view.setProgress(p.current, p.total);
        this.startTimer();
    }

    startTimer() {
        this.timeLeft = 30;
        this.view.setTimer(this.timeLeft);
        clearInterval(this.timerId);
        this.timerId = setInterval(() => {
            this.timeLeft -= 1;
            this.view.setTimer(this.timeLeft);
            if (this.timeLeft <= 0) {
                clearInterval(this.timerId);
                this.submitAndContinue(true);
            }
        }, 1000);
    }

    submitAndContinue(auto = false) {
        clearInterval(this.timerId);
        const current = this.model.getCurrent();
        const selected = auto ? null : this.selectedIndex;
        const result = this.model.answer(selected);
        this.view.highlight(current.c, selected);
        this.view.nextBtn.disabled = true;
        setTimeout(() => {
            if (result.done) {
                const p = this.model.getProgress();
                saveScore(this.model.score, p.total);
                this.view.showResult(this.model.score, p.total);
            } else {
                this.model.next();
                const q = this.model.getCurrent();
                this.view.renderQuestion(q);
                const p = this.model.getProgress();
                this.view.setProgress(p.current, p.total);
                this.selectedIndex = null;
                this.startTimer();
            }
        }, 800);
    }
}

export function initQuiz() {
    const root = document.querySelector('.quiz-app');
    if (root) new QuizViewModel(root);
}


