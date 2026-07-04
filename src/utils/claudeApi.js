import { GoogleGenerativeAI } from '@google/generative-ai'

const NVC_SYSTEM_PROMPT = `あなたは温かく共感的なNVC（非暴力コミュニケーション）の実践者です。
新しい事業を立ち上げようとしている人が、複雑な感情を整理できるよう寄り添います。

NVCの4つのステップで対話を進めます：
1. 【観察】何が起きたか（評価や判断なしに事実として）
2. 【感情】それによってどんな気持ちが湧いているか
3. 【ニーズ】その感情の背後にある普遍的な欲求・必要としているもの
4. 【リクエスト】自分自身や状況に対して何を求めるか

大切なルール：
- 一度に一つだけ質問する
- ユーザーの言葉をそのまま使い、リフレクションしながら深める
- 評価・診断・解決策の提示はしない（感情とニーズの探索に集中する）
- ジャッジなく、ただ寄り添う
- 3〜5回のやりとりの後、会話が十分に深まったと感じたら「今日の気づきをまとめましょうか？」と提案する`

const EXTRACT_SYSTEM_PROMPT = `あなたはNVCの専門家です。
会話からNVC要素を抽出して、必ず以下のJSON形式のみで返してください（説明文・前置き不要）。

{
  "situation": "何が起きているかの簡潔な説明（10〜20文字）",
  "feelings": ["感情語1", "感情語2"],
  "needs": ["普遍的ニーズ1", "普遍的ニーズ2"],
  "insight": "会話を通じた主な気づき（1〜2文）"
}

感情語は純粋な感情（例：不安、悲しい、怖い、嬉しい、高揚、焦り）を使用。
ニーズは普遍的人間ニーズ（例：安心、つながり、自律性、承認、意味、貢献、成長、明確さ）を使用。`

function toGeminiHistory(messages) {
  return messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))
}

export async function sendMessageStream(messages, apiKey, onToken) {
  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: NVC_SYSTEM_PROMPT,
  })

  const history = toGeminiHistory(messages.slice(0, -1))
  const lastMessage = messages[messages.length - 1].content

  const chat = model.startChat({ history })
  const result = await chat.sendMessageStream(lastMessage)

  for await (const chunk of result.stream) {
    onToken(chunk.text())
  }
}

export async function extractNVC(messages, apiKey) {
  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: EXTRACT_SYSTEM_PROMPT,
  })

  const conversationText = messages
    .map(m => `${m.role === 'user' ? 'あなた' : 'NVCガイド'}: ${m.content}`)
    .join('\n')

  const result = await model.generateContent(
    `以下の会話からNVC要素を抽出してください：\n\n${conversationText}`
  )

  const text = result.response.text()
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('JSON抽出に失敗しました')
  return JSON.parse(jsonMatch[0])
}
