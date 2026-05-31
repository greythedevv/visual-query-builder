interface Props {
  code: string
  language: 'sql' | 'json'
}

const SQL_KEYWORDS = ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'IN', 'BETWEEN', 'LIKE', 'IS', 'NULL', 'AS']

function highlightSQL(code: string): string {
  let result = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  SQL_KEYWORDS.forEach(kw => {
    result = result.replace(
      new RegExp(`\\b(${kw})\\b`, 'g'),
      `<span class="text-violet-500 dark:text-violet-400 font-semibold">$1</span>`
    )
  })

  // String literals
  result = result.replace(
    /'([^']*)'/g,
    `<span class="text-emerald-600 dark:text-emerald-400">'$1'</span>`
  )

  // Numbers
  result = result.replace(
    /\b(\d+\.?\d*)\b/g,
    `<span class="text-amber-600 dark:text-amber-400">$1</span>`
  )

  return result
}

function highlightJSON(code: string): string {
  return code
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"([^"]+)":/g, `<span class="text-violet-500 dark:text-violet-400">"$1"</span>:`)
    .replace(/: "([^"]*)"/g, `: <span class="text-emerald-600 dark:text-emerald-400">"$1"</span>`)
    .replace(/: (\d+\.?\d*)/g, `: <span class="text-amber-600 dark:text-amber-400">$1</span>`)
    .replace(/: (true|false|null)/g, `: <span class="text-pink-500 dark:text-pink-400">$1</span>`)
}

export function SyntaxHighlight({ code, language }: Props) {
  const highlighted = language === 'sql' ? highlightSQL(code) : highlightJSON(code)

  return (
    <pre
      className="text-xs font-mono text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap break-words leading-relaxed"
      dangerouslySetInnerHTML={{ __html: highlighted }}
    />
  )
}