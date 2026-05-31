interface Props {
  code: string
  language: 'sql' | 'json'
}

const SQL_KEYWORDS = ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'IN', 'BETWEEN', 'LIKE', 'IS', 'NULL', 'AS']

function highlightSQL(code: string): string {
  // Split by lines and highlight each token carefully
  const lines = code.split('\n')

  return lines.map(line => {
    // Escape HTML first
    let safe = line
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

    // Highlight string literals first (before anything else)
    safe = safe.replace(
      /'([^']*)'/g,
      `\x00STRING\x00$1\x00ENDSTRING\x00`
    )

    // Highlight keywords
    SQL_KEYWORDS.forEach(kw => {
      safe = safe.replace(
        new RegExp(`\\b(${kw})\\b`, 'g'),
        `\x00KW\x00$1\x00ENDKW\x00`
      )
    })

    // Highlight standalone numbers (not inside words)
    safe = safe.replace(
      /\b(\d+\.?\d*)\b/g,
      `\x00NUM\x00$1\x00ENDNUM\x00`
    )

    // Now replace placeholders with actual HTML
    safe = safe
      .replace(/\x00STRING\x00(.*?)\x00ENDSTRING\x00/g,
        `<span style="color:#34d399">'$1'</span>`)
      .replace(/\x00KW\x00(.*?)\x00ENDKW\x00/g,
        `<span style="color:#a78bfa;font-weight:600">$1</span>`)
      .replace(/\x00NUM\x00(.*?)\x00ENDNUM\x00/g,
        `<span style="color:#fbbf24">$1</span>`)

    return safe
  }).join('\n')
}

function highlightJSON(code: string): string {
  const lines = code.split('\n')

  return lines.map(line => {
    let safe = line
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

    // Key: "something":
    safe = safe.replace(
      /^(\s*)"([^"]+)"(:)/,
      `$1<span style="color:#a78bfa">"$2"</span>$3`
    )

    // String value: "something"
    safe = safe.replace(
      /: "([^"]*)"/,
      `: <span style="color:#34d399">"$1"</span>`
    )

    // Number value
    safe = safe.replace(
      /: (\d+\.?\d*)$/,
      `: <span style="color:#fbbf24">$1</span>`
    )

    // Boolean / null value
    safe = safe.replace(
      /: (true|false|null)$/,
      `: <span style="color:#f472b6">$1</span>`
    )

    return safe
  }).join('\n')
}

export function SyntaxHighlight({ code, language }: Props) {
  const highlighted = language === 'sql' ? highlightSQL(code) : highlightJSON(code)

  return (
    <pre
      className="text-xs font-mono whitespace-pre-wrap break-words leading-relaxed"
      style={{ color: '#a1a1aa' }}
      dangerouslySetInnerHTML={{ __html: highlighted }}
    />
  )
}