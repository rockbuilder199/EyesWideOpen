// Flashcard Management and Review System
class FlashcardManager {
    constructor() {
        this.reviewCards = [];
        this.currentCardIndex = 0;
        this.isCardFlipped = false;
        this.reviewMode = 'sequential';
        this.currentModuleId = null;
        this.reviewStartTime = null;
    }

    startReview(moduleId, mode = 'sequential') {
        this.currentModuleId = moduleId;
        this.reviewMode = mode;
        this.reviewCards = storage.getFlashcardsByModule(moduleId);
        
        if (this.reviewCards.length === 0) {
            alert('No flashcards to review!');
            return false;
        }

        if (mode === 'random') {
            this.reviewCards = this.shuffleArray([...this.reviewCards]);
        }

        this.currentCardIndex = 0;
        this.isCardFlipped = false;
        this.reviewStartTime = new Date();
        
        const params = new URLSearchParams({
            moduleId: moduleId,
            mode: mode
        });
        
        window.location.href = `review.html?${params.toString()}`;
        return true;
    }

    loadReviewFromURL() {
        const params = new URLSearchParams(window.location.search);
        const moduleId = params.get('moduleId');
        const mode = params.get('mode') || 'sequential';

        if (!moduleId) {
            window.location.href = 'index.html';
            return;
        }

        const module = storage.getModule(moduleId);
        if (!module) {
            window.location.href = 'index.html';
            return;
        }

        this.currentModuleId = moduleId;
        this.reviewMode = mode;
        this.reviewCards = storage.getFlashcardsByModule(moduleId);

        if (this.reviewCards.length === 0) {
            alert('No flashcards found in this module!');
            window.location.href = `module.html?id=${moduleId}`;
            return;
        }

        if (mode === 'random') {
            this.reviewCards = this.shuffleArray([...this.reviewCards]);
        }

        this.currentCardIndex = 0;
        this.isCardFlipped = false;
        this.reviewStartTime = new Date();

        const topic = storage.getTopic(module.topicId);
        this.updateReviewBreadcrumb(topic, module);
        this.showReviewCard();
    }

    updateReviewBreadcrumb(topic, module) {
        const topicLink = document.getElementById('reviewBreadcrumbTopic');
        const moduleLink = document.getElementById('reviewBreadcrumbModule');
        
        if (topicLink && topic) {
            topicLink.textContent = topic.name;
            topicLink.onclick = () => {
                window.location.href = `topic.html?id=${topic.id}`;
            };
        }
        
        if (moduleLink && module) {
            moduleLink.textContent = module.name;
            moduleLink.onclick = () => {
                window.location.href = `module.html?id=${module.id}`;
            };
        }
    }

    showReviewCard() {
        if (this.reviewCards.length === 0) return;

        const card = this.reviewCards[this.currentCardIndex];
        const cardElement = document.getElementById('reviewCard');
        const contentElement = document.getElementById('reviewCardContent');
        const imageElement = document.getElementById('reviewCardImage');
        const progressElement = document.getElementById('reviewProgress');
        const modeElement = document.getElementById('reviewMode');

        if (!cardElement || !contentElement) return;

        if (progressElement) {
            progressElement.textContent = `Card ${this.currentCardIndex + 1} of ${this.reviewCards.length}`;
        }
        
        if (modeElement) {
            modeElement.textContent = `${this.reviewMode.charAt(0).toUpperCase() + this.reviewMode.slice(1)} Mode`;
        }

        // Show front or back of card
        if (this.isCardFlipped) {
            contentElement.textContent = card.back;
            cardElement.classList.add('flipped');
            
            if (imageElement) {
                if (card.backImageFilename) {
                    imageElement.innerHTML = `<img src="images/${card.backImageFilename}" class="flashcard-image" alt="Back image">`;
                } else {
                    imageElement.innerHTML = '';
                }
            }
        } else {
            contentElement.textContent = card.front;
            cardElement.classList.remove('flipped');
            
            if (imageElement) {
                if (card.frontImageFilename) {
                    imageElement.innerHTML = `<img src="images/${card.frontImageFilename}" class="flashcard-image" alt="Front image">`;
                } else {
                    imageElement.innerHTML = '';
                }
            }
        }

        cardElement.classList.add('animating');
        setTimeout(() => {
            cardElement.classList.remove('animating');
        }, 300);
    }

    flipCard() {
        if (this.reviewCards.length === 0) return;
        
        this.isCardFlipped = !this.isCardFlipped;
        this.showReviewCard();
    }

    nextCard() {
        if (this.reviewCards.length === 0) return;
        
        if (this.currentCardIndex < this.reviewCards.length - 1) {
            this.currentCardIndex++;
            this.isCardFlipped = false;
            this.showReviewCard();
        } else {
            this.completeReview();
        }
    }

    previousCard() {
        if (this.reviewCards.length === 0 || this.currentCardIndex === 0) return;
        
        this.currentCardIndex--;
        this.isCardFlipped = false;
        this.showReviewCard();
    }

    completeReview() {
        const endTime = new Date();
        const duration = Math.round((endTime - this.reviewStartTime) / 1000 / 60);
        
        alert(`Review completed!\n\nCards reviewed: ${this.reviewCards.length}\nTime spent: ${duration} minute${duration !== 1 ? 's' : ''}`);
        
        if (this.currentModuleId) {
            window.location.href = `module.html?id=${this.currentModuleId}`;
        } else {
            window.location.href = 'index.html';
        }
    }

    endReview() {
        if (confirm('End review session?')) {
            if (this.currentModuleId) {
                window.location.href = `module.html?id=${this.currentModuleId}`;
            } else {
                window.location.href = 'index.html';
            }
        }
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}

const flashcardManager = new FlashcardManager();

// Global functions for HTML events
function startReview(mode) {
    const currentModuleId = app?.currentModuleId || window.currentModuleId;
    if (currentModuleId) {
        flashcardManager.startReview(currentModuleId, mode);
    }
}

function flipCard() {
    flashcardManager.flipCard();
}

function nextCard() {
    flashcardManager.nextCard();
}

function previousCard() {
    flashcardManager.previousCard();
}

function endReview() {
    flashcardManager.endReview();
}

// Initialize review page if we're on it
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('review.html')) {
        flashcardManager.loadReviewFromURL();
        
        document.addEventListener('keydown', function(event) {
            switch(event.key) {
                case ' ':
                case 'Enter':
                    event.preventDefault();
                    flipCard();
                    break;
                case 'ArrowRight':
                    event.preventDefault();
                    nextCard();
                    break;
                case 'ArrowLeft':
                    event.preventDefault();
                    previousCard();
                    break;
                case 'Escape':
                    event.preventDefault();
                    endReview();
                    break;
            }
        });
    }
});