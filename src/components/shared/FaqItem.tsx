import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface FaqItemProps {
  question: string
  answer: string
}

export function FaqItem({ question, answer }: FaqItemProps) {
  const [open, setOpen] = useState(false)
  const panelId = `faq-${question.replace(/\s+/g, '-').toLowerCase().slice(0, 30)}`

  return (
    <div className="bg-surface-container-low border border-outline-variant rounded-md overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={panelId}
        className="w-full flex items-center justify-between p-6 text-left min-h-[44px] cursor-pointer hover:bg-surface-container/30 transition-colors"
      >
        <span className="font-semibold text-sm pr-4">{question}</span>
        <ChevronDown
          size={16}
          strokeWidth={1.5}
          className={`shrink-0 text-on-surface-variant transition-transform duration-[150ms] ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div id={panelId} className="px-6 pb-6">
          <p className="text-on-surface-variant text-sm leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  )
}
