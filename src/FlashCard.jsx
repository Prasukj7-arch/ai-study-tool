import { useState, useEffect } from 'react'

export default function FlashCard({ cards }) {
    const [index, setIndex] = useState(0)
    const [flipped, setFlipped] = useState(false)

    // Reset flip when card changes
    useEffect(() => { setFlipped(false) }, [index])

    if (!cards || cards.length === 0) return null

    const card = cards[index]

    return (
        <div className="flex flex-col items-center gap-5">
            {/* Counter */}
            <p className="text-xs text-gray-400 font-medium tracking-wide uppercase">
                Card {index + 1} of {cards.length}
            </p>

            {/* Flip card */}
            <div
                className="w-full cursor-pointer"
                style={{ perspective: '1000px' }}
                onClick={() => setFlipped(f => !f)}
            >
                <div
                    style={{
                        transition: 'transform 0.5s',
                        transformStyle: 'preserve-3d',
                        transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                        position: 'relative',
                        minHeight: '180px',
                    }}
                >
                    {/* Front — Question */}
                    <div
                        style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                        className="absolute inset-0 bg-white border-2 border-blue-100 rounded-2xl p-6 flex flex-col items-center justify-center"
                    >
                        <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-3">Question</span>
                        <p className="text-base font-medium text-gray-800 text-center">{card.question}</p>
                        <span className="mt-4 text-xs text-gray-400">Click to reveal answer</span>
                    </div>

                    {/* Back — Answer */}
                    <div
                        style={{
                            backfaceVisibility: 'hidden',
                            WebkitBackfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)',
                        }}
                        className="absolute inset-0 bg-blue-600 rounded-2xl p-6 flex flex-col items-center justify-center"
                    >
                        <span className="text-xs font-semibold text-blue-200 uppercase tracking-widest mb-3">Answer</span>
                        <p className="text-base font-medium text-white text-center">{card.answer}</p>
                        <span className="mt-4 text-xs text-blue-300">Click to flip back</span>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setIndex(i => Math.max(0, i - 1))}
                    disabled={index === 0}
                    className="px-5 py-2 text-sm font-medium bg-white border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    ← Prev
                </button>

                {/* Dot indicators */}
                <div className="flex gap-1.5">
                    {cards.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setIndex(i)}
                            className={`w-2 h-2 rounded-full transition-colors ${i === index ? 'bg-blue-600' : 'bg-gray-300'
                                }`}
                        />
                    ))}
                </div>

                <button
                    onClick={() => setIndex(i => Math.min(cards.length - 1, i + 1))}
                    disabled={index === cards.length - 1}
                    className="px-5 py-2 text-sm font-medium bg-white border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    Next →
                </button>
            </div>
        </div>
    )
}
