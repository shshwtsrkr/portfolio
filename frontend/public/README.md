# Public Assets

This folder contains static files that are served directly by the application.

## Resume File

### Current Status
A placeholder `resume.pdf` file is currently in place.

### How to Replace with Your Resume

1. **Replace the file:**
   - Delete the existing `resume.pdf`
   - Add your actual resume PDF with the filename `resume.pdf`

   ```bash
   # From the frontend directory
   rm public/resume.pdf
   cp /path/to/your/resume.pdf public/resume.pdf
   ```

2. **Rename your resume (optional):**
   - The default download name is set to "Resume.pdf"
   - To change it, edit `/src/pages/Home.jsx` line 193:
   ```jsx
   download="YourName_Resume.pdf"  // Change this to your preferred filename
   ```

3. **Verify:**
   - The resume will be accessible at: `http://localhost:5174/resume.pdf` (in development)
   - Or: `http://your-domain.com/resume.pdf` (in production)

### File Requirements

- **Format:** PDF recommended (most compatible)
- **File Size:** Keep under 2MB for faster downloads
- **Filename:** Must be named `resume.pdf` (or update the path in Home.jsx)

### Testing

Test the download button:
```bash
# Check if file is accessible
curl -I http://localhost:5174/resume.pdf

# Download the file
curl -o test-download.pdf http://localhost:5174/resume.pdf
```

---

## Adding More Static Files

You can add other static files to this folder:

- **Images:** `logo.png`, `favicon.ico`, etc.
- **Documents:** Additional PDFs, certificates, etc.
- **Fonts:** Custom font files

All files in this folder will be served from the root path.

Example:
- File: `public/my-image.png`
- URL: `http://localhost:5174/my-image.png`
