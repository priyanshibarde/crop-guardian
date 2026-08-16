export type InferenceInput = { imagePath: string; mimeType: string }
export type InferenceResult = { status: 'unavailable'; reason: 'MODEL_NOT_CONFIGURED' }

/** Phase 4A deliberately does not infer or fabricate a diagnosis. */
export async function infer(_input: InferenceInput): Promise<InferenceResult> {
  return { status: 'unavailable', reason: 'MODEL_NOT_CONFIGURED' }
}
