import { useState } from 'react'

export default function App() {
  const [file, setFile] = useState(null)
  const [fileName, setFileName] = useState(null)
  const [extractedText, setExtractedText] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function handleFileChange(e) {
    const selected = e.target.files[0]
    if (selected) {
      setFile(selected)
      setFileName(selected.name)
      setExtractedText(null)
      setError(null)
    }
  }

  async function handleGenerate() {
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    setLoading(true)
    setError(null)
    setExtractedText(null)

    try {
      const res = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      setExtractedText(data.text)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-semibold text-gray-800 tracking-tight">
            AI Study Tool
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Upload your notes and convert them into flashcards, quizzes and summaries instantly.
          </p>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-start pt-20 px-6">
        {/* Upload area */}
        <div className="w-full max-w-xl">
          <div className="border-2 border-dashed border-gray-300 rounded-xl bg-white p-10 flex flex-col items-center gap-4 hover:border-blue-400 transition-colors">
            <svg
              className="w-10 h-10 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>

            <p className="text-gray-500 text-sm">
              {fileName ? (
                <span className="text-blue-600 font-medium">{fileName}</span>
              ) : (
                'Upload a PDF or text file to get started'
              )}
            </p>

            <label className="cursor-pointer">
              <span className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors">
                Choose File
              </span>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.txt"
                onChange={handleFileChange}
              />
            </label>
          </div>

          <button
            disabled={!file || loading}
            onClick={handleGenerate}
            className="mt-5 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
          >
            {loading ? 'Processing...' : 'Generate Study Material'}
          </button>
        </div>

        {/* Results section */}
        <div className="w-full max-w-xl mt-8 mb-12">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
            Extracted Text Preview
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {!error && (
            <div className="bg-white border border-gray-200 rounded-xl min-h-48 p-5">
              {extractedText ? (
                <pre className="text-sm text-gray-700 whitespace-pre-wrap break-words font-sans">
                  {extractedText.length > 700
                    ? extractedText.slice(0, 700) + '...'
                    : extractedText}
                </pre>
              ) : (
                <div className="h-full flex items-center justify-center min-h-40">
                  <p className="text-gray-400 text-sm">
                    Upload your notes and click generate to see flashcards, quiz and summary.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
