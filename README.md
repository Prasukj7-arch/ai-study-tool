# 🧠 AI Study Tool

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![OpenRouter](https://img.shields.io/badge/AI-OpenRouter-blue?style=for-the-badge)](https://openrouter.ai/)

An advanced AI-powered study companion that transforms your notes into interactive flashcards, quizzes, and summaries instantly. Built with a focus on active recall and premium user experience.

---

## ✨ Features

- **🚀 AI Generation**: Instantly convert PDF or Text notes into study material using Gemini 2.0 Pro via OpenRouter.
- **🗂️ Interactive Tabs**: Seamlessly switch between Flashcards, Quizzes, and Summaries.
- **🔄 3D Flip Flashcards**: Active recall focused cards with tap-to-reveal and tap-to-copy functionality.
- **🕹️ Gamified Quizzing**: Interactive option selection with immediate feedback flip-animation.
- **🎨 Modern Dark Mode**: Fully responsive UI with sleek dark mode and Inter typography.
- **💾 Export Results**: Download your study material as styled `.txt` files or copy specific sections to clipboard.

---

## 🛠️ Tech Stack

### Frontend
- **React 19** + **Vite**
- **Tailwind CSS** (v4) for styling
- **Lucide-like SVG Icons** for clean UI

### Backend
- **Node.js** + **Express**
- **Multer** for file handling
- **PDF-Parse** for document extraction
- **Axios** for AI integration

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- An OpenRouter API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Prasukj7-arch/ai-study-tool.git
   cd ai-study-tool
   ```

2. **Setup Backend**
   ```bash
   cd server
   npm install
   ```
   Create a `.env` file in the `server/` directory:
   ```env
   PORT=5000
   OPENROUTER_API_KEY=your_api_key_here
   ```

3. **Setup Frontend**
   ```bash
   cd ..
   npm install
   ```

### Running the App

1. **Start Backend Server**
   ```bash
   cd server
   npm start
   ```

2. **Start Frontend Dev Server**
   ```bash
   cd ..
   npm run dev
   ```

The app will be available at `http://localhost:5173`.

---

## 📸 Project Screen

*(Note: Real-time screenshots are available in the repository's `walkthrough.md` and project history.)*

---

## 👨‍💻 Author

**Prasuk Jain** - [GitHub](https://github.com/Prasukj7-arch)

---

## ⚖️ License
This project is for educational purposes as part of an AI development walkthrough.
