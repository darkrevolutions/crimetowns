async function uploadFile(file) {
    uploadStatus.style.color = 'black';
    uploadStatus.textContent = 'Uploading...';

    const formData = new FormData();
    formData.append('video', file);

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        if (response.ok) {
            uploadStatus.style.color = 'green';
            uploadStatus.textContent = 'Upload successful!';
            // You might want to do something with result.filename here
        } else {
            uploadStatus.style.color = 'red';
            uploadStatus.textContent = 'Upload failed: ' + (result.message || 'Unknown error');
        }
    } catch (error) {
        uploadStatus.style.color = 'red';
        uploadStatus.textContent = 'Upload error: ' + error.message;
        console.error('Upload error:', error);
    }
}