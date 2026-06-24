import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'

const DEFAULT_MODEL = 'claude-sonnet-4-5'

function client() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
}

function model() {
  return process.env.ANTHROPIC_MODEL ?? DEFAULT_MODEL
}

export async function callStructured<T>(
  prompt: string,
  system: string,
  schema: z.ZodType<T>,
  toolName = 'structured_output',
): Promise<T> {
  const jsonSchema = z.toJSONSchema(schema) as Anthropic.Tool['input_schema']

  let lastError = ''
  for (let attempt = 0; attempt <= 2; attempt++) {
    const userContent =
      attempt === 0
        ? prompt
        : `${prompt}\n\nPrevious attempt failed validation: ${lastError}\nPlease correct and try again.`

    const response = await client().messages.create({
      model: model(),
      max_tokens: 4096,
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

export async function call(prompt: string, system?: string): Promise<string> {
  const response = await client().messages.create({
    model: model(),
    max_tokens: 2048,
    ...(system ? { system } : {}),
    messages: [{ role: 'user', content: prompt }],
  })

  const block = response.content[0]
  if (block.type !== 'text') throw new Error('Expected text block')
  return block.text
}
