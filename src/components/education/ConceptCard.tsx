import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, Badge, Button } from '../common'
import type { Concept } from '../../types'
import { useStore } from '../../store'

interface ConceptCardProps {
  concept: Concept
  isExpanded?: boolean
  onToggleExpand?: () => void
}

export function ConceptCard({ concept, isExpanded = false, onToggleExpand }: ConceptCardProps) {
  const { learnConcept, hasLearnedConcept } = useStore()
  const isLearned = hasLearnedConcept(concept.id)

  const handleMarkLearned = () => {
    learnConcept(concept.id)
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex items-start gap-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isLearned ? 'bg-success-100' : 'bg-primary-100'
          }`}
        >
          {isLearned ? (
            <svg
              className="w-6 h-6 text-success-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6 text-primary-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-slate-900">{concept.name}</h3>
            <Badge variant="neutral" size="sm">
              {concept.category}
            </Badge>
            {isLearned && (
              <Badge variant="success" size="sm">
                Learned
              </Badge>
            )}
          </div>
          <p className="text-sm text-slate-600">{concept.description}</p>

          <button
            onClick={onToggleExpand}
            className="mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
          >
            {isExpanded ? 'Show less' : 'Learn more'}
            <motion.svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              animate={{ rotate: isExpanded ? 180 : 0 }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </motion.svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-slate-200 space-y-4">
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-2">
                  Detailed Explanation
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {concept.detailedExplanation}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-2">Examples</h4>
                <ul className="space-y-2">
                  {concept.examples.map((example, index) => (
                    <li
                      key={index}
                      className="text-sm text-slate-600 flex items-start gap-2"
                    >
                      <span className="text-primary-500 mt-1">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </span>
                      {example}
                    </li>
                  ))}
                </ul>
              </div>

              {concept.relatedConcepts.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2">
                    Related Concepts
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {concept.relatedConcepts.map((related) => (
                      <Badge key={related} variant="neutral" size="sm">
                        {related.replace('-', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {!isLearned && (
                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleMarkLearned}
                    leftIcon={
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    }
                  >
                    Mark as Learned
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}
