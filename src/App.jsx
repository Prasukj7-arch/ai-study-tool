import { useState } from 'react'

export default function App() {
  const [fileName, setFileName] = useState(null)

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (file) setFileName(file.name)
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
                'Upload a PDF, image, or text file to get started'
              )}
            </p>

            <label className="cursor-pointer">
              <span className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors">
                Choose File
              </span>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.txt,.png,.jpg,.jpeg"
                onChange={handleFileChange}
              />
            </label>
          </div>

          <button
            disabled={!fileName}
            className="mt-5 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
          >
            Generate Study Material
          </button>
        </div>

        {/* Results section */}
        <div className="w-full max-w-xl mt-8">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
            Results
          </h2>
          <div className="bg-white border border-gray-200 rounded-xl min-h-48 flex items-center justify-center">
            <p className="text-gray-400 text-sm">
              Upload your notes and click generate to see flashcards, quiz and summary.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
