export class QuizView {
    constructor(root) {
        this.root = root;
        this.startScreen = root.querySelector('.start-screen');
        this.quizScreen = root.querySelector('.quiz-screen');
        this.resultScreen = root.querySelector('.result-screen');
        this.qText = root.querySelector('.question');
        this.options = root.querySelector('.options');
        this.progress = root.querySelector('#progress');
        this.timer = root.querySelector('#time');
        this.finalScore = root.querySelector('#final-score');
        this.currentScore = root.querySelector('#current-score');
        this.nextBtn = root.querySelector('.next-btn');
        this.startBtn = root.querySelector('.start-btn');
        this.playAgainBtn = root.querySelector('.play-again-btn');
    }

    showStart() {
        this.startScreen.style.display = 'block';
        this.quizScreen.style.display = 'none';
        this.resultScreen.style.display = 'none';
    }

    showQuiz() {
        this.startScreen.style.display = 'none';
        this.quizScreen.style.display = 'block';
        this.resultScreen.style.display = 'none';
    }

    showResult(score, total) {
        this.finalScore.textContent = `${score}/${total}`;
        this.startScreen.style.display = 'none';
        this.quizScreen.style.display = 'none';
        this.resultScreen.style.display = 'block';
    }

    renderQuestion(question) {
        this.qText.textContent = question.q;
        this.options.innerHTML = '';
        question.a.forEach((text, idx) => {
            const btn = document.createElement('button');
            btn.className = 'option';
            btn.textContent = text;
            btn.dataset.index = idx;
            this.options.appendChild(btn);
        });
        this.nextBtn.disabled = true;
    }

    highlight(correctIndex, selectedIndex) {
        const buttons = this.options.querySelectorAll('.option');
        buttons.forEach((b, i) => {
            if (i === correctIndex) b.classList.add('correct');
            if (selectedIndex != null && i === selectedIndex && i !== correctIndex) b.classList.add('wrong');
        });
    }

    setProgress(current, total) {
        this.progress.textContent = `${current}/${total}`;
    }

    setTimer(seconds, warningAt = 10) {
        this.timer.textContent = seconds;
        const timerBox = this.root.querySelector('.timer');
        if (seconds <= warningAt) timerBox.classList.add('warning');
        else timerBox.classList.remove('warning');
    }
}


