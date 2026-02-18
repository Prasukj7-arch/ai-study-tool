import { useState } from 'react'
import FlashCard from './FlashCard'

const TABS = ['Flashcards', 'Quiz', 'Summary']

// Format tab content as plain text for copy/download
function formatAsText(result, tab) {
  if (tab === 'Flashcards') {
    return result.flashcards?.map((c, i) =>
      `Q${i + 1}: ${c.question}\nA${i + 1}: ${c.answer}`
    ).join('\n\n') || ''
  }
  if (tab === 'Quiz') {
    return result.quiz?.map((q, i) =>
      `${i + 1}. ${q.question}\n${q.options?.join('\n')}\nAnswer: ${q.answer}`
    ).join('\n\n') || ''
  }
  if (tab === 'Summary') return result.summary || ''
  return ''
}

function Spinner() {
  return (
    <div className="flex flex-col items-center gap-3 py-10">
      <svg className="animate-spin w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
      <p className="text-sm text-gray-500">Generating flashcards and quiz…</p>
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

  function handleFileChange(e) {
    const selected = e.target.files[0]
    if (selected) {
      setFile(selected)
      setFileName(selected.name)
      setResult(null)
      setError(null)
    }
  }

  function handleReset() {
    setFile(null)
    setFileName(null)
    setResult(null)
    setError(null)
  }

  async function handleGenerate() {
    if (!file) return
    setLoading(true)
    setError(null)
    setResult(null)

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
      setResult(genData.result)
      setActiveTab('Flashcards')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleCopy() {
    const text = formatAsText(result, activeTab)
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleDownload() {
    const text = formatAsText(result, activeTab)
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${activeTab.toLowerCase()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-semibold text-gray-800 tracking-tight">🧠 AI Study Tool</h1>
          <p className="text-sm text-gray-500 mt-1">
            Upload your notes and convert them into flashcards, quizzes and summaries instantly.
          </p>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-start pt-16 px-6 pb-16">
        {/* Upload area */}
        <div className="w-full max-w-xl">
          <div className="border-2 border-dashed border-gray-300 rounded-xl bg-white p-10 flex flex-col items-center gap-4 hover:border-blue-400 transition-colors">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <p className="text-gray-500 text-sm">
              {fileName
                ? <span className="text-blue-600 font-medium">{fileName}</span>
                : 'Upload a PDF or text file to get started'}
            </p>
            <label className="cursor-pointer">
              <span className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors">
                Choose File
              </span>
              <input type="file" className="hidden" accept=".pdf,.txt" onChange={handleFileChange} />
            </label>
          </div>

          <div className="flex gap-3 mt-5">
            <button
              disabled={!file || loading}
              onClick={handleGenerate}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
            >
              Generate Study Material
            </button>
            {(result || error) && (
              <button
                onClick={handleReset}
                className="px-4 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ↺ New Upload
              </button>
            )}
          </div>
        </div>

        {/* Loading spinner */}
        {loading && (
          <div className="w-full max-w-xl mt-8 bg-white border border-gray-200 rounded-xl">
            <Spinner />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="w-full max-w-xl mt-6 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
            ⚠️ {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="w-full max-w-xl mt-8">
            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-4">
              {TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setCopied(false) }}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Copy + Download toolbar */}
            <div className="flex justify-end gap-2 mb-3">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {copied ? '✅ Copied!' : '📋 Copy'}
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ⬇️ Download .txt
              </button>
            </div>

            {/* Flashcards */}
            {activeTab === 'Flashcards' && <FlashCard cards={result.flashcards} />}

            {/* Quiz */}
            {activeTab === 'Quiz' && (
              <div className="flex flex-col gap-4">
                {result.quiz?.map((q, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 max-h-56 overflow-y-auto">
                    <p className="text-sm font-semibold text-gray-800 mb-2">{i + 1}. {q.question}</p>
                    <ul className="flex flex-col gap-1">
                      {q.options?.map((opt, j) => (
                        <li key={j} className={`text-sm px-3 py-1.5 rounded-lg ${opt.startsWith(q.answer) ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-600'
                          }`}>
                          {opt}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {/* Summary */}
            {activeTab === 'Summary' && (
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <p className="text-sm text-gray-700 leading-relaxed">{result.summary}</p>
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {!result && !error && !loading && (
          <div className="w-full max-w-xl mt-8">
            <div className="bg-white border border-gray-200 rounded-xl min-h-40 flex items-center justify-center">
              <p className="text-gray-400 text-sm">
                Upload your notes and click generate to see flashcards, quiz and summary.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-4">
        <p className="text-center text-xs text-gray-400">
          Built by{' '}
          <a href="https://github.com/Prasukj7-arch" target="_blank" rel="noopener noreferrer"
            className="text-blue-500 hover:underline">
            Prasuk Jain
          </a>
          {' '}· AI Study Tool
        </p>
      </footer>
    </div>
  )
}
