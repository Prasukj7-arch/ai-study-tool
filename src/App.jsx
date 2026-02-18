import { useState, useEffect } from 'react'
import FlashCard from './FlashCard'

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

export default function App() {
  const [file, setFile] = useState(null)
  const [fileName, setFileName] = useState(null)
  const [result, setResult] = useState(null)
  const [activeTab, setActiveTab] = useState('Flashcards')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)
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
      const uploadRes = await fetch('http://localhost:5000/upload', { method: 'POST', body: formData })
      const uploadData = await uploadRes.json()
      if (!uploadRes.ok) throw new Error(uploadData.error || 'Upload failed')

      const genRes = await fetch('http://localhost:5000/generate', {
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

  function handleCopy() {
    navigator.clipboard.writeText(formatAsText(result, activeTab)).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000)
    })
  }

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

      {/* Header */}
      <header className={`border-b ${D ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} shadow-sm sticky top-0 z-10`}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">🧠 AI Study Tool</h1>
            <p className={`text-xs sm:text-sm mt-0.5 ${D ? 'text-gray-400' : 'text-gray-500'}`}>
              Turn notes into flashcards, quizzes &amp; summaries instantly.
            </p>
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

          {/* Action buttons */}
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
          <div className="w-full max-w-2xl mt-5 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-2xl px-4 py-3">
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

            {/* Copy + Download */}
            <div className="flex justify-end gap-2 mb-3">
              <button onClick={handleCopy}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors
                  ${D ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                {copied ? '✅ Copied!' : '📋 Copy'}
              </button>
              <button onClick={handleDownload}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors
                  ${D ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                ⬇️ Download .txt
              </button>
            </div>

            {activeTab === 'Flashcards' && <FlashCard cards={result.flashcards} dark={D} />}

            {activeTab === 'Quiz' && (
              <div className="flex flex-col gap-4">
                {result.quiz?.map((q, i) => (
                  <div key={i} className={`rounded-2xl p-4 border ${D ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                    <p className="text-sm font-semibold mb-3">{i + 1}. {q.question}</p>
                    <ul className="flex flex-col gap-1.5">
                      {q.options?.map((opt, j) => (
                        <li key={j} className={`text-sm px-3 py-2 rounded-xl ${opt.startsWith(q.answer)
                            ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 font-semibold'
                            : D ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                          {opt}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'Summary' && (
              <div className={`rounded-2xl p-5 border ${D ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                <p className={`text-sm leading-relaxed ${D ? 'text-gray-300' : 'text-gray-700'}`}>{result.summary}</p>
              </div>
            )}
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
