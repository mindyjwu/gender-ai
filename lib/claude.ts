import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'

const DEFAULT_MODEL = 'claude-sonnet-4-6'

export const AVAILABLE_MODELS = [
  { id: 'claude-haiku-4-5-20251001', label: 'Haiku 4.5', description: 'Fastest responses' },
  { id: 'claude-sonnet-4-6', label: 'Sonnet 4.6', description: 'Balanced speed & quality' },
  { id: 'claude-sonnet-4-5', label: 'Sonnet 4.5', description: 'High quality, slower' },
  { id: 'claude-opus-4-8', label: 'Opus 4.8', description: 'Most capable, slowest' },
] as const

function client() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
}

function resolveModel(modelId?: string) {
  if (modelId && AVAILABLE_MODELS.some(m => m.id === modelId)) return modelId
  return process.env.ANTHROPIC_MODEL ?? DEFAULT_MODEL
}

export async function callStructured<T>(
  prompt: string,
  system: string,
  schema: z.ZodType<T>,
  toolName = 'structured_output',
  modelId?: string,
): Promise<T> {
  const jsonSchema = z.toJSONSchema(schema) as Anthropic.Tool['input_schema']

  let lastError = ''
  for (let attempt = 0; attempt <= 2; attempt++) {
    const userContent =
      attempt === 0
        ? prompt
        : `${prompt}\n\nPrevious attempt failed validation: ${lastError}\nPlease correct and try again.`

    const response = await client().messages.create({
      model: resolveModel(modelId),
      max_tokens: 1024,
      system,
      messages: [{ role: 'user', content: userContent }],
      tools: [{ name: toolName, description: 'Return structured output.', input_schema: jsonSchema }],
      tool_choice: { type: 'tool', name: toolName },
    })

    const block = response.content.find(b => b.type === 'tool_use')
    if (!block || block.type !== 'tool_use') {
      lastError = 'No tool_use block returned'
      continue
    }

    const parsed = schema.safeParse(block.input)
    if (!parsed.success) {
      lastError = parsed.error.message
      continue
    }

    return parsed.data
  }

  throw new Error(`callStructured failed after 3 attempts: ${lastError}`)
}

export async function call(prompt: string, system?: string, modelId?: string): Promise<string> {
  const response = await client().messages.create({
    model: resolveModel(modelId),
    max_tokens: 2048,
    ...(system ? { system } : {}),
    messages: [{ role: 'user', content: prompt }],
  })

  const block = response.content[0]
  if (block.type !== 'text') throw new Error('Expected text block')
  return block.text
}
