import { useState, useEffect } from 'react'

export default function QuizCard({ questions, dark }) {
    const [index, setIndex] = useState(0)
    const [selected, setSelected] = useState(null)
    const [submitted, setSubmitted] = useState(false)
    const [flipped, setFlipped] = useState(false)

    const D = dark
    const q = questions?.[index]

    useEffect(() => {
        setSelected(null)
        setSubmitted(false)
        setFlipped(false)
    }, [index])

    if (!questions || questions.length === 0) return null

    function handleSubmit() {
        if (!selected) return
        setSubmitted(true)
        setTimeout(() => setFlipped(true), 300)
    }

    const isCorrect = selected && q.answer && selected.startsWith(q.answer)

    return (
        <div className="flex flex-col items-center gap-5">
            {/* Counter */}
            <p className={`text-xs font-semibold tracking-widest uppercase ${D ? 'text-gray-500' : 'text-gray-400'}`}>
                Question {index + 1} of {questions.length}
            </p>

            {/* Flip card — fixed height so front and back match */}
            <div className="w-full" style={{ perspective: '1000px' }}>
                <div style={{
                    transition: 'transform 0.55s',
                    transformStyle: 'preserve-3d',
                    transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    position: 'relative',
                    minHeight: '380px',
                }}>

                    {/* FRONT — Question + Options + Submit (all inside the card) */}
                    <div
                        style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                        className={`absolute inset-0 rounded-2xl p-5 flex flex-col border-2
              ${D ? 'bg-gray-900 border-gray-700' : 'bg-white border-blue-100'}`}
                    >
                        {/* Card header row: label + copy button */}
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">Question</span>
                            <button
                                onClick={() => {
                                    const text = `${q.question}\n${q.options?.join('\n')}\nAnswer: ${q.answer}`
                                    navigator.clipboard.writeText(text)
                                }}
                                title="Copy question"
                                className={`p-1.5 rounded-lg transition-colors ${D ? 'text-gray-500 hover:text-gray-300 hover:bg-gray-800' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </button>
                        </div>

                        <p className={`text-sm font-semibold leading-relaxed mb-4 ${D ? 'text-gray-100' : 'text-gray-800'}`}>
                            {q.question}
                        </p>

                        {/* Options */}
                        <ul className="flex flex-col gap-2 flex-1">
                            {q.options?.map((opt, j) => {
                                const isSelected = selected === opt
                                return (
                                    <li key={j}>
                                        <button
                                            disabled={submitted}
                                            onClick={() => setSelected(opt)}
                                            className={`w-full text-left text-sm px-4 py-2.5 rounded-xl border-2 transition-all duration-150 font-medium
                        ${isSelected
                                                    ? D
                                                        ? 'border-blue-500 bg-blue-900/40 text-blue-300'
                                                        : 'border-blue-500 bg-blue-50 text-blue-700'
                                                    : D
                                                        ? 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-500'
                                                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'
                                                } disabled:cursor-default`}
                                        >
                                            {opt}
                                        </button>
                                    </li>
                                )
                            })}
                        </ul>

                        {/* Submit — inside the card, below options */}
                        <button
                            onClick={handleSubmit}
                            disabled={!selected || submitted}
                            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Submit Answer
                        </button>
                    </div>

                    {/* BACK — Result */}
                    <div
                        style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                        className={`absolute inset-0 rounded-2xl p-5 flex flex-col items-center justify-center gap-4
              ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}
                    >
                        <div className="text-4xl">{isCorrect ? '🎉' : '❌'}</div>
                        <p className="text-white font-bold text-lg">{isCorrect ? 'Correct!' : 'Not quite!'}</p>
                        <div className="bg-white/20 rounded-xl px-4 py-3 w-full text-center">
                            <p className="text-xs text-white/70 uppercase tracking-widest font-semibold mb-1">Correct Answer</p>
                            <p className="text-white font-semibold text-sm">{q.options?.find(o => o.startsWith(q.answer))}</p>
                        </div>
                        {!isCorrect && (
                            <div className="bg-white/10 rounded-xl px-4 py-2 w-full text-center">
                                <p className="text-xs text-white/60 uppercase tracking-widest font-semibold mb-1">Your Answer</p>
                                <p className="text-white/80 text-sm">{selected}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Navigation — below the card, not overlapping */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setIndex(i => Math.max(0, i - 1))}
                    disabled={index === 0}
                    className={`px-5 py-2 text-sm font-semibold rounded-xl border transition-colors disabled:opacity-30 disabled:cursor-not-allowed
            ${D ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                >
                    ← Prev
                </button>

                <div className="flex gap-1.5">
                    {questions.map((_, i) => (
                        <button key={i} onClick={() => setIndex(i)}
                            className={`w-2 h-2 rounded-full transition-colors ${i === index ? 'bg-blue-500' : D ? 'bg-gray-700' : 'bg-gray-300'}`}
                        />
                    ))}
                </div>

                <button
                    onClick={() => setIndex(i => Math.min(questions.length - 1, i + 1))}
                    disabled={index === questions.length - 1}
                    className={`px-5 py-2 text-sm font-semibold rounded-xl border transition-colors disabled:opacity-30 disabled:cursor-not-allowed
            ${D ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                >
                    Next →
                </button>
            </div>
        </div>
    )
}
