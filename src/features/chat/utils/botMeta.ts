import type { BotHandoffReason } from '../types'

export const handoffReasonMeta: Record<BotHandoffReason, { label: string; description: string }> = {
  'low-confidence': { label: 'Low confidence', description: 'The AI is unsure of its answer.' },
  'explicit-request': { label: 'Customer asked', description: 'The customer asked for a person.' },
  'repeated-fallback': { label: 'Repeated fallback', description: 'The AI could not answer more than once.' },
  'negative-sentiment': { label: 'Negative sentiment', description: 'The customer sounds frustrated.' },
}

/** Below this, the AI's answer is treated as shaky. */
export const LOW_CONFIDENCE_THRESHOLD = 0.6

export function confidenceTone(confidence: number): { label: string; textColor: string; barColor: string } {
  if (confidence >= 0.85) return { label: 'High', textColor: 'text-emerald-600', barColor: 'bg-emerald-500' }
  if (confidence >= LOW_CONFIDENCE_THRESHOLD) return { label: 'Medium', textColor: 'text-amber-600', barColor: 'bg-amber-500' }
  return { label: 'Low', textColor: 'text-rose-600', barColor: 'bg-rose-500' }
}

export function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`
}
