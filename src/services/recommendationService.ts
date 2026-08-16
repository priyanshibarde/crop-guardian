import type { RecommendationInput, RecommendationResult } from '../types/cropIntelligence'
import { getCropGuidance } from '../data/cropGuidance'

export function getRecommendations(input: RecommendationInput): RecommendationResult {
  const guidance = getCropGuidance(input.cropName)
  if (!guidance || !input.diagnosis || input.diagnosis.status !== 'completed') return { status: 'insufficient-information', recommendations: [], disclaimer: 'No treatment recommendation is generated without a completed, supported diagnosis.' }
  return { status: 'available', recommendations: [...guidance.monitoring.slice(0, 2), 'Use local agricultural or extension guidance before applying any treatment.'], disclaimer: 'These are general management reminders, not guaranteed treatment instructions.' }
}
