"use client"

import { useMemo, useState } from "react"
import { CheckCircle2, Loader2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { passingScoreFor, scorePercent, xpPerQuestion } from "@/lib/training/gamify"
import type { TrainingModule, TrainingQuizQuestion } from "@/lib/types"

type QuizScreenProps = {
  module: TrainingModule
  questions: TrainingQuizQuestion[]
  moduleIndex: number
  moduleCount: number
  questionCount: number
  saving?: boolean
  onComplete: (result: { score: number; correct: number; passed: boolean }) => Promise<void> | void
}

export function QuizScreen({
  module,
  questions,
  moduleIndex,
  moduleCount,
  questionCount,
  saving,
  onComplete,
}: QuizScreenProps) {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [answered, setAnswered] = useState(0)
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null)
  const [confirming, setConfirming] = useState(false)

  const question = questions[index]
  const requiredScore = passingScoreFor(module.quiz?.passingScore)
  const livePercent = scorePercent(correctCount, Math.max(answered, 1))
  const pointsEach = xpPerQuestion(module)
  const liveXp = correctCount * pointsEach
  const remaining = questions.length - answered
  const projected = scorePercent(correctCount, questions.length)

  const scoreboard = useMemo(
    () => [
      { label: "Score", value: `${correctCount}/${Math.max(answered, 0)}` },
      { label: "Live %", value: `${answered ? livePercent : 0}%` },
      { label: "Pass mark", value: `${requiredScore}%` },
      { label: "Quiz XP", value: `${liveXp}` },
    ],
    [answered, correctCount, livePercent, liveXp, requiredScore],
  )

  const confirmAnswer = async () => {
    if (selected == null || !question || confirming) return
    const isCorrect = selected === question.correctIndex
    const nextCorrect = correctCount + (isCorrect ? 1 : 0)
    const nextAnswered = answered + 1
    setFeedback(isCorrect ? "correct" : "wrong")
    setCorrectCount(nextCorrect)
    setAnswered(nextAnswered)
    setConfirming(true)

    window.setTimeout(async () => {
      const isLast = index >= questions.length - 1
      if (!isLast) {
        setIndex((current) => current + 1)
        setSelected(null)
        setFeedback(null)
        setConfirming(false)
        return
      }
      const score = scorePercent(nextCorrect, questions.length)
      await onComplete({
        score,
        correct: nextCorrect,
        passed: score >= requiredScore,
      })
      setConfirming(false)
    }, 550)
  }

  if (!question) {
    return <p className="text-white">This quiz has no questions yet.</p>
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-lg flex-col gap-4 px-4 py-5">
      <div className="rounded-md bg-white/15 p-3 text-white">
        <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-white/80">
          <span>
            Module {moduleIndex + 1} of {moduleCount}
          </span>
          <span>
            Question {index + 1} of {questions.length}
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full rounded-full bg-[#FDE68A]"
            style={{ width: `${Math.round(((index + (feedback ? 1 : 0)) / questions.length) * 100)}%` }}
          />
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2 text-center">
          {scoreboard.map((item) => (
            <div key={item.label} className="rounded-md bg-black/15 px-1 py-2">
              <p className="text-sm font-semibold sm:text-base">{item.value}</p>
              <p className="text-[10px] uppercase tracking-wide text-white/70">{item.label}</p>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-white/80">
          {remaining} left · projected {projected}% · {questionCount} questions in this program
        </p>
      </div>

      <div className="rounded-md bg-white p-4 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">{module.title}</p>
        <h2 className="mt-2 text-lg font-semibold text-neutral-900">{question.prompt}</h2>
        <div className="mt-4 space-y-2">
          {question.options.map((option, optionIndex) => {
            const active = selected === optionIndex
            const showMark = feedback && active
            return (
              <button
                key={optionIndex}
                type="button"
                disabled={confirming}
                onClick={() => setSelected(optionIndex)}
                className={`flex w-full items-center justify-between rounded-md border px-3 py-3 text-left text-sm ${
                  active ? "border-leo-primary bg-amber-50 text-neutral-900" : "border-neutral-200 bg-white text-neutral-800"
                }`}
              >
                <span>{option}</span>
                {showMark && feedback === "correct" ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : null}
                {showMark && feedback === "wrong" ? <XCircle className="h-4 w-4 text-red-600" /> : null}
              </button>
            )
          })}
        </div>
        <Button
          type="button"
          className="mt-4 w-full bg-leo-primary text-white"
          disabled={selected == null || confirming || saving}
          onClick={confirmAnswer}
        >
          {confirming || saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {index === questions.length - 1 ? "Confirm and finish" : "Confirm answer"}
        </Button>
      </div>
    </div>
  )
}
