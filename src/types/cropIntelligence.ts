import type { DiagnosisSummary } from '../types'

export type CropGuidance = { cropName: string; generalCare: string[]; watering: string[]; monitoring: string[]; prevention: string[]; growthStages: Record<string, string> }
export type RecommendationResult = { status: 'available' | 'insufficient-information'; recommendations: string[]; disclaimer: string }
export type CropReminder = { id: string; userCropId: string; title: string; dueAt: string; kind: 'monitoring' | 'follow-up' | 'care'; completed: boolean }
export type RecommendationInput = { cropName: string; cropStage?: string | null; diagnosis?: DiagnosisSummary | null }
