import { useState, useEffect } from 'react'
import FlashCard from './FlashCard'
import QuizCard from './QuizCard'

const TABS = ['Flashcards', 'Quiz', 'Summary']

function formatAsText(result, tab) {
  if (tab === 'Flashcards')
    return result.flashcards?.map((c, i) => `Q${i + 1}: ${c.question}\nA${i + 1}: ${c.answer}`).join('\n\n') || ''
  if (tab === 'Quiz')
    return result.quiz?.map((q, i) => `${i + 1}. ${q.question}\n${q.options?.join('\n')}\nAnswer: ${q.answer}`).join('\n\n') || ''
  if (tab === 'Summary') return result.summary || ''
  return ''
}

function Spinner({ dark }) {
  return (
    <div className="flex flex-col items-center gap-3 py-12">
      <svg className="animate-spin w-9 h-9 text-blue-500" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
      <p className={`text-sm font-medium ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
        Generating flashcards and quiz…
      </p>
    </div>
  )
}

// Task 5 — Toast notification
function Toast({ show }) {
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
      <div className="bg-gray-900 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2">
        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
        Copied to clipboard
      </div>
    </div>
  )
}

// Task 4 — Shared action button style
function ActionBtn({ onClick, children, green, dark }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl border transition-all duration-200 active:scale-95
        ${green
          ? 'bg-green-500 border-green-500 text-white hover:bg-green-600'
          : dark
            ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
        }`}
    >
      {children}
    </button>
  )
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function App() {
  const [file, setFile] = useState(null)
  const [fileName, setFileName] = useState(null)
  const [result, setResult] = useState(null)
  const [activeTab, setActiveTab] = useState('Flashcards')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)   // Task 2 — green copy state
  const [toast, setToast] = useState(false)      // Task 5 — toast
  const [dark, setDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  function handleFileChange(e) {
    const selected = e.target.files[0]
    if (selected) { setFile(selected); setFileName(selected.name); setResult(null); setError(null) }
  }

  function handleReset() { setFile(null); setFileName(null); setResult(null); setError(null) }

  async function handleGenerate() {
    if (!file) return
    setLoading(true); setError(null); setResult(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const uploadRes = await fetch(`${API_BASE_URL}/upload`, { method: 'POST', body: formData })
      const uploadData = await uploadRes.json()
      if (!uploadRes.ok) throw new Error(uploadData.error || 'Upload failed')

      const genRes = await fetch(`${API_BASE_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: uploadData.text }),
      })
      const genData = await genRes.json()
      if (!genRes.ok) throw new Error(genData.error || 'Generation failed')
      setResult(genData.result); setActiveTab('Flashcards')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Task 2 — green copy + Task 5 — toast
  function triggerCopy(text) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setToast(true)
      setTimeout(() => { setCopied(false); setToast(false) }, 2000)
    })
  }

  function handleCopy() { triggerCopy(formatAsText(result, activeTab)) }

  function handleDownload() {
    const blob = new Blob([formatAsText(result, activeTab)], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `${activeTab.toLowerCase()}.txt`; a.click()
    URL.revokeObjectURL(url)
  }

  const D = dark

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${D ? 'bg-gray-950 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>

      {/* Task 5 — Toast */}
      <Toast show={toast} />

      {/* Header */}
      <header className={`border-b ${D ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} shadow-sm sticky top-0 z-10`}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">AI Study Tool</h1>
            <span className={`text-xs sm:text-sm font-medium ${D ? 'text-gray-400' : 'text-gray-500'}`}>
              (Turn notes into flashcards, quizzes &amp; summaries instantly)
            </span>
          </div>
          <button
            onClick={() => setDark(d => !d)}
            className={`p-2 rounded-xl text-lg transition-colors ${D ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}
            title="Toggle dark mode"
          >
            {D ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center px-4 sm:px-6 pt-10 pb-16">

        {/* Upload card */}
        <div className="w-full max-w-2xl">
          <div className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 flex flex-col items-center gap-4 transition-colors
            ${D ? 'border-gray-700 bg-gray-900 hover:border-blue-500' : 'border-gray-300 bg-white hover:border-blue-400'}`}>
            <svg className={`w-10 h-10 ${D ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <p className={`text-sm text-center ${D ? 'text-gray-400' : 'text-gray-500'}`}>
              {fileName
                ? <span className="text-blue-500 font-semibold">{fileName}</span>
                : 'Upload a PDF or .txt file to get started'}
            </p>
            <label className="cursor-pointer">
              <span className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors shadow-sm">
                Choose File
              </span>
              <input type="file" className="hidden" accept=".pdf,.txt" onChange={handleFileChange} />
            </label>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              disabled={!file || loading}
              onClick={handleGenerate}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Generate Study Material
            </button>
            {(result || error) && (
              <button
                onClick={handleReset}
                className={`px-4 py-3 text-sm font-medium rounded-xl border transition-colors
                  ${D ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}
              >
                ↺ Reset
              </button>
            )}
          </div>
        </div>

        {/* Spinner */}
        {loading && (
          <div className={`w-full max-w-2xl mt-6 rounded-2xl border ${D ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
            <Spinner dark={D} />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className={`w-full max-w-2xl mt-5 border text-sm rounded-2xl px-4 py-3 ${D ? 'bg-red-950 border-red-800 text-red-400' : 'bg-red-50 border-red-200 text-red-600'}`}>
            ⚠️ {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="w-full max-w-2xl mt-6">
            {/* Tabs */}
            <div className={`flex gap-1 p-1 rounded-2xl mb-4 ${D ? 'bg-gray-800' : 'bg-gray-100'}`}>
              {TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setCopied(false) }}
                  className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-colors ${activeTab === tab
                    ? D ? 'bg-gray-700 text-blue-400 shadow' : 'bg-white text-blue-600 shadow-sm'
                    : D ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>



            {/* Task 3 — FlashCard with card-level copy */}
            {activeTab === 'Flashcards' && <FlashCard cards={result.flashcards} dark={D} onCopy={triggerCopy} />}

            {activeTab === 'Quiz' && <QuizCard questions={result.quiz} dark={D} />}


            {activeTab === 'Summary' && (
              <div className={`rounded-2xl p-5 border ${D ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                {/* Copy icon in top-right of card */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">Summary</span>
                  <button
                    onClick={handleCopy}
                    title="Copy summary"
                    className={`p-1.5 rounded-lg transition-colors ${copied ? 'text-green-500' : D ? 'text-gray-500 hover:text-gray-300 hover:bg-gray-800' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                  >
                    {copied
                      ? <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    }
                  </button>
                </div>
                <p className={`text-sm leading-relaxed ${D ? 'text-gray-300' : 'text-gray-700'}`}>{result.summary}</p>
              </div>
            )}

            {/* Download — full width at bottom */}
            <button
              onClick={handleDownload}
              className={`mt-4 w-full inline-flex items-center justify-center gap-2 text-sm font-semibold px-4 py-3 rounded-xl border transition-all duration-200 active:scale-95
                ${D ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download {activeTab} as .txt
            </button>
          </div>
        )}

        {/* Empty state */}
        {!result && !error && !loading && (
          <div className="w-full max-w-2xl mt-6">
            <div className={`rounded-2xl border min-h-40 flex items-center justify-center ${D ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <p className={`text-sm ${D ? 'text-gray-600' : 'text-gray-400'}`}>
                Upload your notes and click generate to see flashcards, quiz and summary.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className={`border-t py-4 ${D ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
        <p className={`text-center text-xs ${D ? 'text-gray-600' : 'text-gray-400'}`}>
          Built by{' '}
          <a href="https://github.com/Prasukj7-arch" target="_blank" rel="noopener noreferrer"
            className="text-blue-500 hover:underline">Prasuk Jain</a>
          {' '}· AI Study Tool
        </p>
      </footer>
    </div>
  )
}
