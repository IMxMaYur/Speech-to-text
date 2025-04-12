document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const uploadForm = document.getElementById('uploadForm');
    const videoFileInput = document.getElementById('videoFile');
    const uploadBtn = document.getElementById('uploadBtn');
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    const progressStatus = document.getElementById('progressStatus');
    const errorAlert = document.getElementById('errorAlert');
    const errorMessage = document.getElementById('errorMessage');
    const resultsContainer = document.getElementById('resultsContainer');
    const transcriptText = document.getElementById('transcriptText');
    const downloadBtn = document.getElementById('downloadBtn');

    // Function to show error message
    function showError(message) {
        errorMessage.textContent = message;
        errorAlert.classList.remove('d-none');
        progressContainer.classList.add('d-none');
        uploadBtn.disabled = false;
    }

    // Function to reset the UI
    function resetUI() {
        errorAlert.classList.add('d-none');
        progressContainer.classList.add('d-none');
        resultsContainer.classList.add('d-none');
        progressBar.style.width = '0%';
        progressBar.textContent = '0%';
        progressStatus.textContent = 'Uploading video...';
        transcriptText.value = '';
    }

    // Function to update progress
    function updateProgress(percent, statusText) {
        progressBar.style.width = `${percent}%`;
        progressBar.textContent = `${percent}%`;
        progressStatus.textContent = statusText;
    }

    // Handle form submission
    uploadForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate file input
        const videoFile = videoFileInput.files[0];
        if (!videoFile) {
            showError('Please select a video file');
            return;
        }

        // Check file size (limit to 100MB)
        const maxSize = 100 * 1024 * 1024; // 100MB in bytes
        if (videoFile.size > maxSize) {
            showError('File size exceeds limit (100MB). Please choose a smaller file.');
            return;
        }

        // Reset UI and show progress
        resetUI();
        progressContainer.classList.remove('d-none');
        uploadBtn.disabled = true;

        // Create FormData
        const formData = new FormData();
        formData.append('video', videoFile);

        // Simulate progress for better UX
        let progressInterval;
        const simulateProgress = () => {
            let progress = 0;
            progressInterval = setInterval(() => {
                if (progress < 90) {
                    progress += Math.random() * 5;
                    updateProgress(Math.round(progress), 
                        progress < 30 ? 'Uploading video...' : 
                        progress < 60 ? 'Extracting audio...' : 
                        'Transcribing speech...');
                }
            }, 500);
        };
        simulateProgress();

        // Send the request
        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            clearInterval(progressInterval);
            
            // Check if response is ok
            if (!response.ok) {
                // Try to parse the error response as JSON
                return response.text().then(text => {
                    try {
                        // Try to parse as JSON
                        const data = JSON.parse(text);
                        throw new Error(data.error || 'Error processing video');
                    } catch (e) {
                        // If it's not valid JSON, return the text or a default message
                        throw new Error(text || 'Error processing video');
                    }
                });
            }
            
            // Try to parse the success response
            return response.text().then(text => {
                try {
                    return JSON.parse(text);
                } catch (e) {
                    throw new Error('Invalid response format from server');
                }
            });
        })
        .then(data => {
            updateProgress(100, 'Transcription completed!');
            
            // Display the results
            setTimeout(() => {
                progressContainer.classList.add('d-none');
                resultsContainer.classList.remove('d-none');
                transcriptText.value = data.transcript || '';
                uploadBtn.disabled = false;
            }, 1000);
        })
        .catch(error => {
            clearInterval(progressInterval);
            showError(error.message || 'Error processing video');
        });
    });

    // Handle download button click
    downloadBtn.addEventListener('click', function() {
        if (!transcriptText.value.trim()) {
            showError('No transcript to download');
            return;
        }

        // Create a simple download directly using a Blob
        const text = transcriptText.value;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        
        // Create a link element and trigger download
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'transcript.txt';
        
        // Add to document, click, and cleanup
        document.body.appendChild(a);
        a.click();
        
        // Small timeout to ensure download starts before cleanup
        setTimeout(() => {
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }, 100);
    });

    // File input change event for better UX
    videoFileInput.addEventListener('change', function() {
        if (this.files.length > 0) {
            const fileName = this.files[0].name;
            this.nextElementSibling.textContent = `Selected: ${fileName}`;
        } else {
            this.nextElementSibling.textContent = 'Choose file';
        }
    });
});
