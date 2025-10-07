// localStorage Management (Text Data Only)
class Storage {
    constructor() {
        this.storageKey = 'learningCompoundData';
        this.data = this.loadData();
    }

    getDefaultData() {
        return {
            topics: [],
            modules: [],
            flashcards: [],
            videos: []
        };
    }

    loadData() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                return {
                    ...this.getDefaultData(),
                    ...parsed
                };
            }
        } catch (error) {
            console.error('Error loading data from localStorage:', error);
        }
        return this.getDefaultData();
    }

    saveData() {
        try {
            const dataString = JSON.stringify(this.data);
            localStorage.setItem(this.storageKey, dataString);
            return true;
        } catch (error) {
            console.error('Error saving data to localStorage:', error);
            return false;
        }
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Topic operations
    addTopic(name) {
        const topic = {
            id: this.generateId(),
            name: name.trim(),
            created: new Date().toISOString()
        };
        this.data.topics.push(topic);
        this.saveData();
        return topic;
    }

    getTopic(id) {
        return this.data.topics.find(t => t.id === id);
    }

    getAllTopics() {
        return this.data.topics;
    }

    updateTopic(id, updates) {
        const topic = this.getTopic(id);
        if (topic) {
            Object.assign(topic, updates, { updated: new Date().toISOString() });
            this.saveData();
            return topic;
        }
        return null;
    }

    deleteTopic(id) {
        const moduleIds = this.data.modules
            .filter(m => m.topicId === id)
            .map(m => m.id);
        
        moduleIds.forEach(moduleId => {
            this.data.flashcards = this.data.flashcards.filter(f => f.moduleId !== moduleId);
            if (this.data.videos) {
                this.data.videos = this.data.videos.filter(v => v.moduleId !== moduleId);
            }
        });

        this.data.modules = this.data.modules.filter(m => m.topicId !== id);
        this.data.topics = this.data.topics.filter(t => t.id !== id);
        this.saveData();
        return true;
    }

    // Module operations
    addModule(name, topicId) {
        const module = {
            id: this.generateId(),
            name: name.trim(),
            topicId: topicId,
            content: '',
            created: new Date().toISOString()
        };
        this.data.modules.push(module);
        this.saveData();
        return module;
    }

    getModule(id) {
        return this.data.modules.find(m => m.id === id);
    }

    getModulesByTopic(topicId) {
        return this.data.modules.filter(m => m.topicId === topicId);
    }

    updateModule(id, updates) {
        const module = this.getModule(id);
        if (module) {
            Object.assign(module, updates, { updated: new Date().toISOString() });
            this.saveData();
            return module;
        }
        return null;
    }

    deleteModule(id) {
        this.data.flashcards = this.data.flashcards.filter(f => f.moduleId !== id);
        if (this.data.videos) {
            this.data.videos = this.data.videos.filter(v => v.moduleId !== id);
        }
        this.data.modules = this.data.modules.filter(m => m.id !== id);
        this.saveData();
        return true;
    }

    // Flashcard operations (filenames only, no base64)
    addFlashcard(front, back, moduleId, frontImageFilename = null, backImageFilename = null) {
        const flashcard = {
            id: this.generateId(),
            front: front.trim(),
            back: back.trim(),
            moduleId: moduleId,
            frontImageFilename: frontImageFilename,
            backImageFilename: backImageFilename,
            created: new Date().toISOString()
        };
        
        this.data.flashcards.push(flashcard);
        this.saveData();
        return flashcard;
    }

    getFlashcard(id) {
        return this.data.flashcards.find(f => f.id === id);
    }

    getFlashcardsByModule(moduleId) {
        return this.data.flashcards.filter(f => f.moduleId === moduleId);
    }

    updateFlashcard(id, updates) {
        const flashcard = this.getFlashcard(id);
        if (flashcard) {
            Object.assign(flashcard, updates, { updated: new Date().toISOString() });
            this.saveData();
            return flashcard;
        }
        return null;
    }

    deleteFlashcard(id) {
        this.data.flashcards = this.data.flashcards.filter(f => f.id !== id);
        this.saveData();
        return true;
    }

    // Video operations
    addVideo(title, filename, moduleId, description = '') {
        if (!this.data.videos) {
            this.data.videos = [];
        }
        
        const video = {
            id: this.generateId(),
            title: title.trim(),
            filename: filename,
            description: description.trim(),
            moduleId: moduleId,
            created: new Date().toISOString()
        };
        
        this.data.videos.push(video);
        this.saveData();
        return video;
    }

    getVideosByModule(moduleId) {
        if (!this.data.videos) {
            this.data.videos = [];
        }
        return this.data.videos.filter(v => v.moduleId === moduleId);
    }

    getVideo(id) {
        if (!this.data.videos) {
            this.data.videos = [];
        }
        return this.data.videos.find(v => v.id === id);
    }

    updateVideo(id, updates) {
        const video = this.getVideo(id);
        if (video) {
            Object.assign(video, updates, { updated: new Date().toISOString() });
            this.saveData();
            return video;
        }
        return null;
    }

    deleteVideo(id) {
        if (this.data.videos) {
            this.data.videos = this.data.videos.filter(v => v.id !== id);
            this.saveData();
        }
        return true;
    }

    // Bulk operations
    addFlashcards(flashcards, moduleId) {
        const addedCards = [];
        flashcards.forEach(card => {
            const flashcard = {
                id: this.generateId(),
                front: card.front.trim(),
                back: card.back.trim(),
                moduleId: moduleId,
                frontImageFilename: null,
                backImageFilename: null,
                created: new Date().toISOString()
            };
            this.data.flashcards.push(flashcard);
            addedCards.push(flashcard);
        });
        this.saveData();
        return addedCards;
    }

    // Statistics
    getStats() {
        return {
            topics: this.data.topics.length,
            modules: this.data.modules.length,
            flashcards: this.data.flashcards.length,
            videos: this.data.videos ? this.data.videos.length : 0
        };
    }

    // Export/Import
    exportData() {
        return JSON.stringify(this.data, null, 2);
    }

    importData(jsonData) {
        try {
            const imported = JSON.parse(jsonData);
            if (imported.topics && imported.modules && imported.flashcards) {
                this.data = {
                    ...this.getDefaultData(),
                    ...imported,
                    videos: imported.videos || []
                };
                this.saveData();
                return true;
            }
        } catch (error) {
            console.error('Error importing data:', error);
        }
        return false;
    }

    clearAllData() {
        this.data = this.getDefaultData();
        this.saveData();
        return true;
    }
}

const storage = new Storage();

// Auto-load data from JSON file on GitHub Pages
document.addEventListener('DOMContentLoaded', async function() {
    try {
        const response = await fetch('data/learning-compound-data.json');
        if (response.ok) {
            const jsonData = await response.text();
            // Only import if localStorage is empty
            if (storage.getAllTopics().length === 0) {
                storage.importData(jsonData);
                console.log('Data automatically loaded from data/learning-compound-data.json');
            }
        }
    } catch (error) {
        // No data file found - this is normal for local development
        console.log('No data/learning-compound-data.json found. Working with localStorage only.');
    }
});