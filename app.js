// Main Application Logic and Routing
class LearningCompoundApp {
    constructor() {
        this.currentTopicId = null;
        this.currentModuleId = null;
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.handlePageLoad();
            this.setupEventListeners();
        });
    }

    handlePageLoad() {
        const pathname = window.location.pathname;
        const params = new URLSearchParams(window.location.search);

        if (pathname.includes('index.html') || pathname.endsWith('/')) {
            this.loadDashboard();
        } else if (pathname.includes('topic.html')) {
            const topicId = params.get('id');
            if (topicId) {
                this.loadTopicPage(topicId);
            } else {
                window.location.href = 'index.html';
            }
        } else if (pathname.includes('module.html')) {
            const moduleId = params.get('id');
            if (moduleId) {
                this.loadModulePage(moduleId);
            } else {
                window.location.href = 'index.html';
            }
        }
    }

    setupEventListeners() {
        window.addEventListener('click', (event) => {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                if (event.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                const openModal = document.querySelector('.modal[style*="block"]');
                if (openModal) {
                    openModal.style.display = 'none';
                }
            }
        });
    }

    loadDashboard() {
        this.renderTopics();
    }

    renderTopics(sortOrder = 'alphabetical') {
        const list = document.getElementById('topicsList');
        if (!list) return;

        list.innerHTML = '';
        let topics = storage.getAllTopics();

        switch(sortOrder) {
            case 'alphabetical':
                topics.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'newest':
                topics.sort((a, b) => new Date(b.created) - new Date(a.created));
                break;
            case 'oldest':
                topics.sort((a, b) => new Date(a.created) - new Date(b.created));
                break;
        }

        if (topics.length === 0) {
            list.innerHTML = `
                <li class="empty-state">
                    <h3>No topics yet</h3>
                    <p>Create your first topic to get started organizing your learning materials.</p>
                </li>
            `;
            return;
        }

        topics.forEach(topic => {
            const li = document.createElement('li');
            li.className = 'item';
            li.innerHTML = `
                <div class="item-content">
                    <h3>${this.escapeHtml(topic.name)}</h3>
                </div>
                <div class="item-actions">
                    <button class="btn" onclick="app.viewTopic('${topic.id}')">Open</button>
                    <button class="btn btn-danger" onclick="app.deleteTopic('${topic.id}')">Delete</button>
                </div>
            `;
            list.appendChild(li);
        });
    }

    getFlashcardCountForTopic(topicId) {
        const modules = storage.getModulesByTopic(topicId);
        let totalFlashcards = 0;
        modules.forEach(module => {
            totalFlashcards += storage.getFlashcardsByModule(module.id).length;
        });
        return totalFlashcards;
    }

    viewTopic(topicId) {
        window.location.href = `topic.html?id=${topicId}`;
    }

    deleteTopic(topicId) {
        const topic = storage.getTopic(topicId);
        if (!topic) return;

        const moduleCount = storage.getModulesByTopic(topicId).length;
        const flashcardCount = this.getFlashcardCountForTopic(topicId);
        
        let message = `Delete "${topic.name}"?`;
        if (moduleCount > 0 || flashcardCount > 0) {
            message += `\n\nThis will also delete:\n• ${moduleCount} module${moduleCount !== 1 ? 's' : ''}\n• ${flashcardCount} flashcard${flashcardCount !== 1 ? 's' : ''}`;
        }

        if (confirm(message)) {
            storage.deleteTopic(topicId);
            this.renderTopics();
        }
    }

    loadTopicPage(topicId) {
        const topic = storage.getTopic(topicId);
        if (!topic) {
            window.location.href = 'index.html';
            return;
        }

        this.currentTopicId = topicId;
        
        const titleEl = document.getElementById('topicDetailTitle');
        const nameEl = document.getElementById('currentTopicName');
        
        if (titleEl) titleEl.textContent = `${topic.name} - Modules`;
        if (nameEl) nameEl.textContent = topic.name;

        this.renderModules();
    }

    renderModules(sortOrder = 'alphabetical') {
        const list = document.getElementById('modulesList');
        if (!list) return;

        list.innerHTML = '';
        let modules = storage.getModulesByTopic(this.currentTopicId);

        switch(sortOrder) {
            case 'alphabetical':
                modules.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'newest':
                modules.sort((a, b) => new Date(b.created) - new Date(a.created));
                break;
            case 'oldest':
                modules.sort((a, b) => new Date(a.created) - new Date(b.created));
                break;
        }

        if (modules.length === 0) {
            list.innerHTML = `
                <li class="empty-state">
                    <h3>No modules yet</h3>
                    <p>Create your first module to start adding flashcards.</p>
                </li>
            `;
            return;
        }

        modules.forEach(module => {
            const li = document.createElement('li');
            li.className = 'item';
            li.innerHTML = `
                <div class="item-content">
                    <h3>${this.escapeHtml(module.name)}</h3>
                </div>
                <div class="item-actions">
                    <button class="btn btn-sm" onclick="app.viewModule('${module.id}')">Open</button>
                    <button class="btn btn-danger btn-sm" onclick="app.deleteModule('${module.id}')">Delete</button>
                </div>
            `;
            list.appendChild(li);
        });
    }

    viewModule(moduleId) {
        window.location.href = `module.html?id=${moduleId}`;
    }

    deleteModule(moduleId) {
        const module = storage.getModule(moduleId);
        if (!module) return;

        const flashcardCount = storage.getFlashcardsByModule(moduleId).length;
        
        let message = `Delete "${module.name}"?`;
        if (flashcardCount > 0) {
            message += `\n\nThis will also delete ${flashcardCount} flashcard${flashcardCount !== 1 ? 's' : ''}.`;
        }

        if (confirm(message)) {
            storage.deleteModule(moduleId);
            this.renderModules();
        }
    }

    loadModulePage(moduleId) {
        const module = storage.getModule(moduleId);
        if (!module) {
            window.location.href = 'index.html';
            return;
        }

        const topic = storage.getTopic(module.topicId);
        if (!topic) {
            window.location.href = 'index.html';
            return;
        }

        this.currentModuleId = moduleId;
        this.currentTopicId = module.topicId;
        
        const titleEl = document.getElementById('moduleDetailTitle');
        const nameEl = document.getElementById('currentModuleName');
        const topicEl = document.getElementById('breadcrumbTopic');
        
        if (titleEl) titleEl.textContent = `${module.name} - Flashcards`;
        if (nameEl) nameEl.textContent = module.name;
        if (topicEl) topicEl.textContent = topic.name;

        this.renderFlashcards();
        this.renderVideos();
        this.updateReviewButtons();
        this.loadModuleContent();
        
        this.switchTab('content');
    }

    switchTab(tabName) {
        const flashcardsTab = document.getElementById('flashcardsTab');
        const contentTab = document.getElementById('contentTab');
        const videosTab = document.getElementById('videosTab');
        const flashcardsSection = document.getElementById('flashcardsSection');
        const contentSection = document.getElementById('contentSection');
        const videosSection = document.getElementById('videosSection');

        // Remove all active classes
        flashcardsTab?.classList.remove('active');
        contentTab?.classList.remove('active');
        videosTab?.classList.remove('active');

        // Hide all sections
        if (flashcardsSection) flashcardsSection.style.display = 'none';
        if (contentSection) contentSection.style.display = 'none';
        if (videosSection) videosSection.style.display = 'none';

        // Show selected tab
        if (tabName === 'flashcards') {
            flashcardsTab?.classList.add('active');
            if (flashcardsSection) flashcardsSection.style.display = 'block';
        } else if (tabName === 'content') {
            contentTab?.classList.add('active');
            if (contentSection) contentSection.style.display = 'block';
        } else if (tabName === 'videos') {
            videosTab?.classList.add('active');
            if (videosSection) videosSection.style.display = 'block';
        }
    }

    loadModuleContent() {
        const module = storage.getModule(this.currentModuleId);
        const editor = document.getElementById('moduleContentEditor');
        
        if (editor && module) {
            editor.innerHTML = module.content || '';
        }
    }

    saveModuleContent() {
        const editor = document.getElementById('moduleContentEditor');
        if (editor && this.currentModuleId) {
            const content = editor.innerHTML;
            storage.updateModule(this.currentModuleId, { content: content });
        }
    }

    renderFlashcards() {
        const list = document.getElementById('flashcardsList');
        if (!list) return;

        list.innerHTML = '';
        const flashcards = storage.getFlashcardsByModule(this.currentModuleId);

        if (flashcards.length === 0) {
            list.innerHTML = `
                <li class="empty-state">
                    <h3>No flashcards yet</h3>
                    <p>Add flashcards manually or import them from a CSV file.</p>
                </li>
            `;
            return;
        }

        flashcards.forEach(flashcard => {
            const li = document.createElement('li');
            li.className = 'item';
            li.innerHTML = `
                <div class="item-content">
                    <h3>${this.truncateText(flashcard.front, 50)}</h3>
                    <p>${this.truncateText(flashcard.back, 80)}</p>
                </div>
                <div class="item-actions">
                    <button class="btn btn-secondary" onclick="app.editFlashcard('${flashcard.id}')">Edit</button>
                    <button class="btn btn-danger" onclick="app.deleteFlashcard('${flashcard.id}')">Delete</button>
                </div>
            `;
            list.appendChild(li);
        });
    }

    renderVideos() {
        const list = document.getElementById('videosList');
        if (!list) return;

        list.innerHTML = '';
        const videos = storage.getVideosByModule(this.currentModuleId);

        if (videos.length === 0) {
            list.innerHTML = `
                <li class="empty-state">
                    <h3>No videos yet</h3>
                    <p>Add videos from your videos/ folder to watch them here.</p>
                </li>
            `;
            return;
        }

        videos.forEach(video => {
            const li = document.createElement('li');
            li.className = 'item';
            li.innerHTML = `
                <div class="item-content">
                    <h3>${this.escapeHtml(video.title)}</h3>
                    <p>${this.escapeHtml(video.description || video.filename)}</p>
                    <video controls style="max-width: 100%; margin-top: 10px; border-radius: 6px;">
                        <source src="videos/${video.filename}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                </div>
                <div class="item-actions">
                    <button class="btn btn-secondary" onclick="app.editVideo('${video.id}')">Edit</button>
                    <button class="btn btn-danger" onclick="app.deleteVideo('${video.id}')">Delete</button>
                </div>
            `;
            list.appendChild(li);
        });
    }

    updateReviewButtons() {
        const flashcardCount = storage.getFlashcardsByModule(this.currentModuleId).length;
        const sequentialBtn = document.getElementById('reviewSequentialBtn');
        const randomBtn = document.getElementById('reviewRandomBtn');

        if (sequentialBtn) {
            sequentialBtn.style.display = flashcardCount > 0 ? 'inline-block' : 'none';
        }
        if (randomBtn) {
            randomBtn.style.display = flashcardCount > 0 ? 'inline-block' : 'none';
        }
    }

    editFlashcard(flashcardId) {
        const flashcard = storage.getFlashcard(flashcardId);
        if (!flashcard) return;

        const modal = document.getElementById('flashcardModal');
        const title = document.getElementById('flashcardModalTitle');
        const frontInput = document.getElementById('flashcardFront');
        const backInput = document.getElementById('flashcardBack');
        const frontFilenameInput = document.getElementById('frontImageFilename');
        const backFilenameInput = document.getElementById('backImageFilename');
        const form = document.getElementById('flashcardForm');

        if (title) title.textContent = 'Edit Flashcard';
        if (frontInput) frontInput.value = flashcard.front;
        if (backInput) backInput.value = flashcard.back;
        if (frontFilenameInput) frontFilenameInput.value = flashcard.frontImageFilename || '';
        if (backFilenameInput) backFilenameInput.value = flashcard.backImageFilename || '';

        if (form) {
            form.onsubmit = (event) => {
                event.preventDefault();
                this.updateFlashcard(flashcardId);
            };
        }

        if (modal) modal.style.display = 'block';
    }

    updateFlashcard(flashcardId) {
        const frontInput = document.getElementById('flashcardFront');
        const backInput = document.getElementById('flashcardBack');
        const frontFilenameInput = document.getElementById('frontImageFilename');
        const backFilenameInput = document.getElementById('backImageFilename');

        if (!frontInput || !backInput) return;

        const front = frontInput.value.trim();
        const back = backInput.value.trim();

        if (!front || !back) {
            alert('Please fill in both front and back text.');
            return;
        }

        const updates = { 
            front, 
            back,
            frontImageFilename: frontFilenameInput?.value.trim() || null,
            backImageFilename: backFilenameInput?.value.trim() || null
        };

        storage.updateFlashcard(flashcardId, updates);
        this.closeModal('flashcardModal');
        this.renderFlashcards();
    }

    deleteFlashcard(flashcardId) {
        const flashcard = storage.getFlashcard(flashcardId);
        if (!flashcard) return;

        if (confirm(`Delete this flashcard?\n\nFront: ${this.truncateText(flashcard.front, 50)}`)) {
            storage.deleteFlashcard(flashcardId);
            this.renderFlashcards();
            this.updateReviewButtons();
        }
    }

    editVideo(videoId) {
        const video = storage.getVideo(videoId);
        if (!video) return;

        const modal = document.getElementById('videoModal');
        const title = document.getElementById('videoModalTitle');
        const titleInput = document.getElementById('videoTitle');
        const filenameInput = document.getElementById('videoFilename');
        const descriptionInput = document.getElementById('videoDescription');
        const form = document.getElementById('videoForm');

        if (title) title.textContent = 'Edit Video';
        if (titleInput) titleInput.value = video.title;
        if (filenameInput) filenameInput.value = video.filename;
        if (descriptionInput) descriptionInput.value = video.description || '';

        if (form) {
            form.onsubmit = (event) => {
                event.preventDefault();
                this.updateVideo(videoId);
            };
        }

        if (modal) modal.style.display = 'block';
    }

    updateVideo(videoId) {
        const titleInput = document.getElementById('videoTitle');
        const filenameInput = document.getElementById('videoFilename');
        const descriptionInput = document.getElementById('videoDescription');

        if (!titleInput || !filenameInput) return;

        const title = titleInput.value.trim();
        const filename = filenameInput.value.trim();
        const description = descriptionInput?.value.trim() || '';

        if (!title || !filename) {
            alert('Please fill in both title and filename.');
            return;
        }

        storage.updateVideo(videoId, { title, filename, description });
        this.closeModal('videoModal');
        this.renderVideos();
    }

    deleteVideo(videoId) {
        const video = storage.getVideo(videoId);
        if (!video) return;

        if (confirm(`Delete "${video.title}"?`)) {
            storage.deleteVideo(videoId);
            this.renderVideos();
        }
    }

    goBackToTopic() {
        if (this.currentTopicId) {
            window.location.href = `topic.html?id=${this.currentTopicId}`;
        } else {
            window.location.href = 'index.html';
        }
    }

    goBackToModule() {
        if (this.currentModuleId) {
            window.location.href = `module.html?id=${this.currentModuleId}`;
        } else {
            this.goBackToTopic();
        }
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return this.escapeHtml(text);
        return this.escapeHtml(text.substring(0, maxLength)) + '...';
    }
}

const app = new LearningCompoundApp();

window.currentModuleId = null;
Object.defineProperty(window, 'currentModuleId', {
    get: () => app.currentModuleId,
    set: (value) => app.currentModuleId = value
});

// Global functions for HTML events
function showAddTopicModal() {
    const modal = document.getElementById('topicModal');
    const input = document.getElementById('topicName');
    
    if (input) input.value = '';
    if (modal) modal.style.display = 'block';
}

function addTopic(event) {
    event.preventDefault();
    const input = document.getElementById('topicName');
    
    if (!input) return;
    
    const name = input.value.trim();
    if (!name) {
        alert('Please enter a topic name.');
        return;
    }

    storage.addTopic(name);
    app.closeModal('topicModal');
    app.renderTopics();
}

function sortTopics(sortOrder) {
    app.renderTopics(sortOrder);
}

function showAddModuleModal() {
    const modal = document.getElementById('moduleModal');
    const input = document.getElementById('moduleName');
    
    if (input) input.value = '';
    if (modal) modal.style.display = 'block';
}

function addModule(event) {
    event.preventDefault();
    const input = document.getElementById('moduleName');
    
    if (!input) return;
    
    const name = input.value.trim();
    if (!name) {
        alert('Please enter a module name.');
        return;
    }

    if (!app.currentTopicId) {
        alert('Error: No topic selected.');
        return;
    }

    storage.addModule(name, app.currentTopicId);
    app.closeModal('moduleModal');
    app.renderModules();
}

function showAddFlashcardModal() {
    const modal = document.getElementById('flashcardModal');
    const title = document.getElementById('flashcardModalTitle');
    const form = document.getElementById('flashcardForm');
    const frontInput = document.getElementById('flashcardFront');
    const backInput = document.getElementById('flashcardBack');
    const frontFilenameInput = document.getElementById('frontImageFilename');
    const backFilenameInput = document.getElementById('backImageFilename');

    if (title) title.textContent = 'Add New Flashcard';
    if (frontInput) frontInput.value = '';
    if (backInput) backInput.value = '';
    if (frontFilenameInput) frontFilenameInput.value = '';
    if (backFilenameInput) backFilenameInput.value = '';

    if (form) {
        form.onsubmit = (event) => {
            event.preventDefault();
            addFlashcard();
        };
    }

    if (modal) modal.style.display = 'block';
}

function addFlashcard() {
    const frontInput = document.getElementById('flashcardFront');
    const backInput = document.getElementById('flashcardBack');
    const frontFilenameInput = document.getElementById('frontImageFilename');
    const backFilenameInput = document.getElementById('backImageFilename');

    if (!frontInput || !backInput) return;

    const front = frontInput.value.trim();
    const back = backInput.value.trim();

    if (!front || !back) {
        alert('Please fill in both front and back text.');
        return;
    }

    if (!app.currentModuleId) {
        alert('Error: No module selected.');
        return;
    }

    const frontImageFilename = frontFilenameInput?.value.trim() || null;
    const backImageFilename = backFilenameInput?.value.trim() || null;

    storage.addFlashcard(front, back, app.currentModuleId, frontImageFilename, backImageFilename);
    app.closeModal('flashcardModal');
    app.renderFlashcards();
    app.updateReviewButtons();
}

function showAddVideoModal() {
    const modal = document.getElementById('videoModal');
    const title = document.getElementById('videoModalTitle');
    const form = document.getElementById('videoForm');
    const titleInput = document.getElementById('videoTitle');
    const filenameInput = document.getElementById('videoFilename');
    const descriptionInput = document.getElementById('videoDescription');

    if (title) title.textContent = 'Add New Video';
    if (titleInput) titleInput.value = '';
    if (filenameInput) filenameInput.value = '';
    if (descriptionInput) descriptionInput.value = '';

    if (form) {
        form.onsubmit = (event) => {
            event.preventDefault();
            addVideo();
        };
    }

    if (modal) modal.style.display = 'block';
}

function addVideo() {
    const titleInput = document.getElementById('videoTitle');
    const filenameInput = document.getElementById('videoFilename');
    const descriptionInput = document.getElementById('videoDescription');

    if (!titleInput || !filenameInput) return;

    const title = titleInput.value.trim();
    const filename = filenameInput.value.trim();
    const description = descriptionInput?.value.trim() || '';

    if (!title || !filename) {
        alert('Please fill in both title and filename.');
        return;
    }

    if (!app.currentModuleId) {
        alert('Error: No module selected.');
        return;
    }

    storage.addVideo(title, filename, app.currentModuleId, description);
    app.closeModal('videoModal');
    app.renderVideos();
}

function showCSVImportModal() {
    const modal = document.getElementById('csvModal');
    const fileInput = document.getElementById('csvFile');
    const preview = document.getElementById('csvPreview');
    const importBtn = document.getElementById('importBtn');

    if (fileInput) fileInput.value = '';
    if (preview) preview.style.display = 'none';
    if (importBtn) importBtn.style.display = 'none';

    if (typeof csvImporter !== 'undefined') {
        csvImporter.csvData = null;
        csvImporter.clearImportUI();
    }

    if (modal) modal.style.display = 'block';
}

function closeModal(modalId) {
    app.closeModal(modalId);
}

function goBackToTopic() {
    app.goBackToTopic();
}

function goBackToModule() {
    app.goBackToModule();
}

function saveModuleContent() {
    app.saveModuleContent();
}

function switchTab(tabName) {
    app.switchTab(tabName);
}