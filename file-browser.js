// File Browser for Images and Videos (No Server Required)
class FileBrowser {
    constructor() {
        // EDIT THESE ARRAYS WITH YOUR FILE NAMES
        this.imageFiles = [
            "creer_three_tense.png",
            "dar_three_tense.png",
            "deber_three_tenses.png",
            "decir_three_tense.png"
            // Add more image filenames here as needed
        ];

        this.videoFiles = [
            // Add your video filenames here
            // "lecture1.mp4",
            // "tutorial2.mp4"
        ];

        this.currentTarget = null;
        this.populateDropdowns();
    }

    populateDropdowns() {
        const frontImageSelect = document.getElementById('frontImageFilename');
        const backImageSelect = document.getElementById('backImageFilename');
        
        if (frontImageSelect) {
            this.populateImageDropdown(frontImageSelect);
        }
        if (backImageSelect) {
            this.populateImageDropdown(backImageSelect);
        }

        const videoSelect = document.getElementById('videoFilename');
        if (videoSelect) {
            this.populateVideoDropdown(videoSelect);
        }
    }

    populateImageDropdown(selectElement) {
        while (selectElement.options.length > 1) {
            selectElement.remove(1);
        }

        this.imageFiles.forEach(filename => {
            const option = document.createElement('option');
            option.value = filename;
            option.textContent = filename;
            selectElement.appendChild(option);
        });
    }

    populateVideoDropdown(selectElement) {
        while (selectElement.options.length > 1) {
            selectElement.remove(1);
        }

        this.videoFiles.forEach(filename => {
            const option = document.createElement('option');
            option.value = filename;
            option.textContent = filename;
            selectElement.appendChild(option);
        });
    }

    showImageBrowser(target) {
        this.currentTarget = target;
        const modal = document.getElementById('fileBrowserModal');
        const title = document.getElementById('fileBrowserTitle');
        const content = document.getElementById('fileBrowserContent');

        if (!modal || !title || !content) return;

        title.textContent = 'Select Image';
        content.innerHTML = '';

        if (this.imageFiles.length === 0) {
            content.innerHTML = `
                <div style="padding: 20px; text-align: center; opacity: 0.7;">
                    <p>No images configured.</p>
                    <p style="font-size: 0.9rem; margin-top: 10px;">
                        Edit the <strong>imageFiles</strong> array in <strong>js/file-browser.js</strong>
                    </p>
                </div>
            `;
        } else {
            const grid = document.createElement('div');
            grid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; padding: 10px;';

            this.imageFiles.forEach(filename => {
                const item = document.createElement('div');
                item.style.cssText = 'cursor: pointer; padding: 10px; border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; text-align: center; transition: all 0.3s ease;';
                item.innerHTML = `
                    <img src="images/${filename}" style="max-width: 100%; height: 100px; object-fit: contain; border-radius: 4px; margin-bottom: 8px;" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22><text x=%2250%%22 y=%2250%%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23fff%22>No Preview</text></svg>'">
                    <div style="font-size: 0.8rem; word-break: break-all;">${filename}</div>
                `;
                item.onmouseover = () => item.style.background = 'rgba(255,255,255,0.1)';
                item.onmouseout = () => item.style.background = 'transparent';
                item.onclick = () => this.selectFile(filename);
                grid.appendChild(item);
            });

            content.appendChild(grid);
        }

        modal.style.display = 'block';
    }

    showVideoBrowser() {
        this.currentTarget = 'video';
        const modal = document.getElementById('fileBrowserModal');
        const title = document.getElementById('fileBrowserTitle');
        const content = document.getElementById('fileBrowserContent');

        if (!modal || !title || !content) return;

        title.textContent = 'Select Video';
        content.innerHTML = '';

        if (this.videoFiles.length === 0) {
            content.innerHTML = `
                <div style="padding: 20px; text-align: center; opacity: 0.7;">
                    <p>No videos configured.</p>
                    <p style="font-size: 0.9rem; margin-top: 10px;">
                        Edit the <strong>videoFiles</strong> array in <strong>js/file-browser.js</strong>
                    </p>
                </div>
            `;
        } else {
            const list = document.createElement('div');
            list.style.cssText = 'padding: 10px;';

            this.videoFiles.forEach(filename => {
                const item = document.createElement('div');
                item.style.cssText = 'cursor: pointer; padding: 15px; border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; margin-bottom: 10px; transition: all 0.3s ease;';
                item.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="font-size: 2rem;">🎥</div>
                        <div style="flex: 1;">
                            <div style="font-weight: 500;">${filename}</div>
                        </div>
                    </div>
                `;
                item.onmouseover = () => item.style.background = 'rgba(255,255,255,0.1)';
                item.onmouseout = () => item.style.background = 'transparent';
                item.onclick = () => this.selectFile(filename);
                list.appendChild(item);
            });

            content.appendChild(list);
        }

        modal.style.display = 'block';
    }

    selectFile(filename) {
        if (this.currentTarget === 'front') {
            const select = document.getElementById('frontImageFilename');
            if (select) select.value = filename;
        } else if (this.currentTarget === 'back') {
            const select = document.getElementById('backImageFilename');
            if (select) select.value = filename;
        } else if (this.currentTarget === 'video') {
            const select = document.getElementById('videoFilename');
            if (select) select.value = filename;
        }

        this.closeFileBrowser();
    }

    closeFileBrowser() {
        const modal = document.getElementById('fileBrowserModal');
        if (modal) modal.style.display = 'none';
        this.currentTarget = null;
    }
}

const fileBrowser = new FileBrowser();

function browseImages(target) {
    fileBrowser.showImageBrowser(target);
}

function browseVideos() {
    fileBrowser.showVideoBrowser();
}

document.addEventListener('DOMContentLoaded', function() {
    const flashcardModal = document.getElementById('flashcardModal');
    if (flashcardModal) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'style') {
                    const isVisible = flashcardModal.style.display === 'block';
                    if (isVisible) {
                        fileBrowser.populateDropdowns();
                    }
                }
            });
        });
        observer.observe(flashcardModal, { attributes: true });
    }

    const videoModal = document.getElementById('videoModal');
    if (videoModal) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'style') {
                    const isVisible = videoModal.style.display === 'block';
                    if (isVisible) {
                        fileBrowser.populateDropdowns();
                    }
                }
            });
        });
        observer.observe(videoModal, { attributes: true });
    }
});