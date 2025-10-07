// CSV Import Functionality
class CSVImporter {
    constructor() {
        this.csvData = null;
        this.previewLimit = 5;
    }

    // Handle CSV file upload
    handleCSVUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.name.toLowerCase().endsWith('.csv')) {
            this.showError('Please select a CSV file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                this.parseCSV(e.target.result);
            } catch (error) {
                this.showError('Error reading CSV file: ' + error.message);
            }
        };
        reader.onerror = () => {
            this.showError('Error reading file.');
        };
        reader.readAsText(file);
    }

    // Parse CSV content
    parseCSV(csvContent) {
        const lines = csvContent.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);

        if (lines.length < 2) {
            this.showError('CSV must have at least a header row and one data row.');
            return;
        }

        // Parse header
        const headers = this.parseCSVLine(lines[0]);
        if (!this.validateHeaders(headers)) {
            return;
        }

        // Parse data rows
        const flashcards = [];
        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i]);
            if (values.length >= 2 && values[0].trim() && values[1].trim()) {
                flashcards.push({
                    front: values[0].trim(),
                    back: values[1].trim()
                });
            }
        }

        if (flashcards.length === 0) {
            this.showError('No valid flashcard data found in CSV.');
            return;
        }

        this.csvData = flashcards;
        this.showPreview();
    }

    // Parse a single CSV line handling quoted values
    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        let i = 0;

        while (i < line.length) {
            const char = line[i];
            
            if (char === '"') {
                if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
                    // Escaped quote
                    current += '"';
                    i += 2;
                } else {
                    // Toggle quote state
                    inQuotes = !inQuotes;
                    i++;
                }
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
                i++;
            } else {
                current += char;
                i++;
            }
        }
        
        result.push(current);
        return result.map(val => val.trim());
    }

    // Validate CSV headers
    validateHeaders(headers) {
        if (headers.length < 2) {
            this.showError('CSV must have at least two columns.');
            return false;
        }

        const firstCol = headers[0].toLowerCase();
        const secondCol = headers[1].toLowerCase();

        if (firstCol !== 'front' || secondCol !== 'back') {
            this.showError('CSV must have "front" and "back" as the first two column headers.');
            return false;
        }

        return true;
    }

    // Show CSV preview
    showPreview() {
        const preview = document.getElementById('csvPreview');
        const previewContent = document.getElementById('csvPreviewContent');
        const importBtn = document.getElementById('importBtn');

        if (!preview || !previewContent || !importBtn) return;

        const previewCount = Math.min(this.csvData.length, this.previewLimit);
        
        let html = `<p><strong>${this.csvData.length}</strong> flashcard${this.csvData.length !== 1 ? 's' : ''} found. Preview of first ${previewCount}:</p>`;
        
        for (let i = 0; i < previewCount; i++) {
            const card = this.csvData[i];
            html += `
                <div class="csv-preview-card">
                    <div class="preview-front"><strong>Front:</strong> ${this.escapeHtml(card.front)}</div>
                    <div class="preview-back"><strong>Back:</strong> ${this.escapeHtml(card.back)}</div>
                </div>
            `;
        }

        if (this.csvData.length > this.previewLimit) {
            html += `<p><em>... and ${this.csvData.length - this.previewLimit} more cards</em></p>`;
        }

        previewContent.innerHTML = html;
        preview.style.display = 'block';
        importBtn.style.display = 'inline-block';
    }

    // Import CSV data
    importCSV(moduleId) {
        if (!this.csvData || this.csvData.length === 0) {
            this.showError('No data to import.');
            return false;
        }

        try {
            const importedCards = storage.addFlashcards(this.csvData, moduleId);
            
            // Clear the import state
            this.csvData = null;
            this.clearImportUI();
            
            // Show success message
            this.showSuccess(`Successfully imported ${importedCards.length} flashcard${importedCards.length !== 1 ? 's' : ''}!`);
            
            return true;
        } catch (error) {
            this.showError('Error importing flashcards: ' + error.message);
            return false;
        }
    }

    // Clear import UI
    clearImportUI() {
        const csvFile = document.getElementById('csvFile');
        const preview = document.getElementById('csvPreview');
        const importBtn = document.getElementById('importBtn');

        if (csvFile) csvFile.value = '';
        if (preview) preview.style.display = 'none';
        if (importBtn) importBtn.style.display = 'none';
    }

    // Show error message
    showError(message) {
        alert('CSV Import Error: ' + message);
    }

    // Show success message
    showSuccess(message) {
        alert(message);
    }

    // Escape HTML for safe display
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Generate sample CSV
    generateSampleCSV() {
        const sample = [
            ['front', 'back'],
            ['What is the capital of France?', 'Paris'],
            ['What is 2 + 2?', '4'],
            ['Who wrote "Romeo and Juliet"?', 'William Shakespeare']
        ];

        return sample.map(row => 
            row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')
        ).join('\n');
    }

    // Download sample CSV
    downloadSample() {
        const csv = this.generateSampleCSV();
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'flashcard_sample.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        window.URL.revokeObjectURL(url);
    }
}

// Global CSV importer instance
const csvImporter = new CSVImporter();

// Global functions for HTML events
function handleCSVUpload(event) {
    csvImporter.handleCSVUpload(event);
}

function importCSV() {
    const currentModuleId = app?.currentModuleId || window.currentModuleId;
    if (csvImporter.importCSV(currentModuleId)) {
        closeModal('csvModal');
        if (typeof renderFlashcards === 'function') {
            renderFlashcards();
        }
        if (typeof updateStats === 'function') {
            updateStats();
        }
    }
}

function downloadSampleCSV() {
    csvImporter.downloadSample();
}