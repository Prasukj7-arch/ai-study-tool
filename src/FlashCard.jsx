import { useState, useEffect } from 'react'

export default function FlashCard({ cards, dark }) {
    const [index, setIndex] = useState(0)
    const [flipped, setFlipped] = useState(false)

    useEffect(() => { setFlipped(false) }, [index])

    if (!cards || cards.length === 0) return null

    const card = cards[index]
    const D = dark

    return (
        <div className="flex flex-col items-center gap-5">
            {/* Counter */}
            <p className={`text-xs font-semibold tracking-widest uppercase ${D ? 'text-gray-500' : 'text-gray-400'}`}>
                Card {index + 1} of {cards.length}
            </p>

            {/* Flip card */}
            <div className="w-full cursor-pointer" style={{ perspective: '1000px' }} onClick={() => setFlipped(f => !f)}>
                <div style={{
                    transition: 'transform 0.5s',
                    transformStyle: 'preserve-3d',
                    transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    position: 'relative',
                    minHeight: '200px',
                }}>
                    {/* Front */}
                    <div
                        style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                        className={`absolute inset-0 rounded-2xl p-6 flex flex-col items-center justify-center border-2
              ${D ? 'bg-gray-900 border-gray-700' : 'bg-white border-blue-100'}`}
                    >
                        <span className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-3">Question</span>
                        <p className={`text-base font-semibold text-center leading-relaxed ${D ? 'text-gray-100' : 'text-gray-800'}`}>
                            {card.question}
                        </p>
                        <span className={`mt-5 text-xs ${D ? 'text-gray-600' : 'text-gray-400'}`}>Tap to reveal answer</span>
                    </div>

                    {/* Back */}
                    <div
                        style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                        className="absolute inset-0 bg-blue-600 rounded-2xl p-6 flex flex-col items-center justify-center"
                    >
                        <span className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-3">Answer</span>
                        <p className="text-base font-semibold text-white text-center leading-relaxed">{card.answer}</p>
                        <span className="mt-5 text-xs text-blue-300">Tap to flip back</span>
                    </div>
                </div>
            </div>

            {/* Navigation */}
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
                    {cards.map((_, i) => (
                        <button key={i} onClick={() => setIndex(i)}
                            className={`w-2 h-2 rounded-full transition-colors ${i === index ? 'bg-blue-500' : D ? 'bg-gray-700' : 'bg-gray-300'}`}
                        />
                    ))}
                </div>

                <button
                    onClick={() => setIndex(i => Math.min(cards.length - 1, i + 1))}
                    disabled={index === cards.length - 1}
                    className={`px-5 py-2 text-sm font-semibold rounded-xl border transition-colors disabled:opacity-30 disabled:cursor-not-allowed
            ${D ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                >
                    Next →
                </button>
            </div>
        </div>
    )
}
