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

// Generate route
app.post('/generate', async (req, res) => {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
        return res.status(400).json({ error: 'No text provided.' });
    }

    const prompt = `You are a study assistant. Based on the following notes, generate:

1. FLASHCARDS (5–8 cards): Format each as Q: ... / A: ...
2. QUIZ QUESTIONS (3–5 questions): Multiple choice with 4 options, mark the correct answer.
3. SUMMARY: A concise 3–5 sentence summary of the key points.

Notes:
"""
${text.slice(0, 3000)}
"""

Respond in clearly labeled sections: FLASHCARDS, QUIZ, SUMMARY.`;

    try {
        const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                model: 'mistralai/mistral-7b-instruct',
                messages: [{ role: 'user', content: prompt }],
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'http://localhost:5173',
                    'X-Title': 'AI Study Tool',
                },
            }
        );

        const aiText = response.data.choices[0].message.content;
        console.log('\n--- AI Response ---');
        console.log(aiText.substring(0, 500));
        console.log('-------------------\n');

        res.json({ success: true, result: aiText });
    } catch (err) {
        console.error('Generate error:', err.response?.data || err.message);
        res.status(500).json({ error: err.response?.data?.error?.message || err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
