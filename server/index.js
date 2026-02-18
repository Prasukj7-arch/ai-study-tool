require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Multer storage config — save to /uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + file.originalname;
        cb(null, unique);
    },
});

const fileFilter = (req, file, cb) => {
    const allowed = ['application/pdf', 'text/plain'];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only PDF and text files are supported.'), false);
    }
};

const upload = multer({ storage, fileFilter });

// Health check
app.get('/', (req, res) => {
    res.json({ message: 'AI Study Tool backend is running!' });
});

// Upload route
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded.' });
        }

        const filePath = req.file.path;
        const mimeType = req.file.mimetype;
        let extractedText = '';

        if (mimeType === 'application/pdf') {
            const dataBuffer = fs.readFileSync(filePath);
            const pdfData = await pdfParse(dataBuffer);
            extractedText = pdfData.text;
        } else if (mimeType === 'text/plain') {
            extractedText = fs.readFileSync(filePath, 'utf-8');
        }

        // Clean up whitespace
        extractedText = extractedText.replace(/\s+/g, ' ').trim();

        console.log('\n--- Extracted Text ---');
        console.log(extractedText.substring(0, 500), '...');
        console.log('----------------------\n');

        // Clean up uploaded file after extraction
        fs.unlinkSync(filePath);

        res.json({ success: true, text: extractedText });
    } catch (err) {
        console.error('Upload error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
