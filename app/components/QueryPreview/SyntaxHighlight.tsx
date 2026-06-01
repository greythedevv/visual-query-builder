import { JSX } from "react"

interface Props {
  code: string
  language: 'sql' | 'json'
}

const SQL_KEYWORDS  = new Set(['SELECT','FROM','WHERE','AND','OR','NOT','IN','BETWEEN','LIKE','IS','NULL','AS','ORDER','BY','LIMIT','DISTINCT','CASE','WHEN','THEN','ELSE','END','GROUP','HAVING','JOIN','LEFT','RIGHT','INNER','OUTER','ON'])
const SQL_FUNCTIONS = new Set(['COUNT','SUM','AVG','MIN','MAX','COALESCE','NULLIF','CAST','CONVERT','UPPER','LOWER','TRIM','LENGTH','SUBSTR'])

type SQLToken =
  | { kind: 'keyword';  text: string }
  | { kind: 'function'; text: string }
  | { kind: 'string';   text: string }
  | { kind: 'number';   text: string }
  | { kind: 'operator'; text: string }
  | { kind: 'comment';  text: string }
  | { kind: 'plain';    text: string }
  | { kind: 'newline' }

type JSONToken =
  | { kind: 'key';     text: string }
  | { kind: 'string';  text: string }
  | { kind: 'number';  text: string }
  | { kind: 'boolean'; text: string }
  | { kind: 'null';    text: string }
  | { kind: 'punct';   text: string }
  | { kind: 'plain';   text: string }
  | { kind: 'newline' }

function tokenizeSQL(code: string): SQLToken[] {
  const tokens: SQLToken[] = []
  let i = 0
  while (i < code.length) {
    if (code[i] === '\n') { tokens.push({ kind: 'newline' }); i++; continue }

    if (code[i] === '-' && code[i + 1] === '-') {
      let j = i
      while (j < code.length && code[j] !== '\n') j++
      tokens.push({ kind: 'comment', text: code.slice(i, j) })
      i = j; continue
    }

    if (code[i] === "'") {
      let j = i + 1
      while (j < code.length) {
        if (code[j] === "'" && code[j + 1] === "'") { j += 2; continue }
        if (code[j] === "'") break
        j++
      } while (j < code.length && !(code[j] === "'" && code[j - 1] !== '\\')) j++
      tokens.push({ kind: 'string', text: code.slice(i, j + 1) })
      i = j + 1; continue
    }

    if (/[0-9]/.test(code[i])) {
      let j = i + 1
      while (j < code.length && /[0-9.]/.test(code[j])) j++
      tokens.push({ kind: 'number', text: code.slice(i, j) })
      i = j; continue
    }

    if (/[=!<>*(),]/.test(code[i])) {
      tokens.push({ kind: 'operator', text: code[i] }); i++; continue
    }

    if (/[a-zA-Z_$]/.test(code[i])) {
      let j = i + 1
      while (j < code.length && /[a-zA-Z0-9_$]/.test(code[j])) j++
      const word = code.slice(i, j)
      const upper = word.toUpperCase()
      if (SQL_KEYWORDS.has(upper))       tokens.push({ kind: 'keyword',  text: upper })
      else if (SQL_FUNCTIONS.has(upper)) tokens.push({ kind: 'function', text: upper })
      else                               tokens.push({ kind: 'plain',    text: word })
      i = j; continue
    }

    if (/[ \t]/.test(code[i])) {
      let j = i + 1
      while (j < code.length && /[ \t]/.test(code[j])) j++
      tokens.push({ kind: 'plain', text: code.slice(i, j) })
      i = j; continue
    }

    tokens.push({ kind: 'plain', text: code[i] }); i++
  }
  return tokens
}

function tokenizeJSON(code: string): JSONToken[] {
  const tokens: JSONToken[] = []
  let i = 0
  while (i < code.length) {
    if (code[i] === '"') {
      let j = i + 1
      while (j < code.length) {
        if (code[j] === '\\') { j += 2; continue }
        if (code[j] === '"') break
        j++
      }
      const raw = code.slice(i, j + 1)
      let k = j + 1
      while (k < code.length && /[ \t]/.test(code[k])) k++
      tokens.push({ kind: code[k] === ':' ? 'key' : 'string', text: raw })
      i = j + 1; continue
    }

    if (/[-0-9]/.test(code[i]) && (code[i] !== '-' || /[0-9]/.test(code[i + 1] ?? ''))) {
      let j = i + 1
      while (j < code.length && /[0-9.eE+\-]/.test(code[j])) j++
      tokens.push({ kind: 'number', text: code.slice(i, j) })
      i = j; continue
    }

    if (code.startsWith('true',  i)) { tokens.push({ kind: 'boolean', text: 'true'  }); i += 4; continue }
    if (code.startsWith('false', i)) { tokens.push({ kind: 'boolean', text: 'false' }); i += 5; continue }
    if (code.startsWith('null',  i)) { tokens.push({ kind: 'null',    text: 'null'  }); i += 4; continue }

    if (/[{}\[\]:,]/.test(code[i])) { tokens.push({ kind: 'punct', text: code[i] }); i++; continue }

    if (/[ \t]/.test(code[i])) {
      let j = i + 1
      while (j < code.length && /[ \t]/.test(code[j])) j++
      tokens.push({ kind: 'plain', text: code.slice(i, j) })
      i = j; continue
    }

    tokens.push({ kind: 'plain', text: code[i] }); i++
  }
  return tokens
}

// All classes must be complete literal strings — no dynamic construction
const SQL_CLS: Record<string, string> = {
  keyword:  'text-violet-400 font-semibold',
  function: 'text-sky-400 font-medium',
  string:   'text-emerald-400',
  number:   'text-amber-400',
  operator: 'text-pink-400',
  comment:  'text-zinc-600 italic',
  plain:    'text-zinc-300',
}

const JSON_CLS: Record<string, string> = {
  key:     'text-sky-300 font-medium',
  string:  'text-emerald-400',
  number:  'text-amber-400',
  boolean: 'text-violet-400 font-medium',
  null:    'text-zinc-500 italic',
  punct:   'text-zinc-500',
  plain:   'text-zinc-400',
}

function toLines(tokens: (SQLToken | JSONToken)[], clsMap: Record<string, string>) {
  const lines: JSX.Element[][] = [[]]
  tokens.forEach((tok, idx) => {
    if (tok.kind === 'newline') { lines.push([]); return }
    const cls = clsMap[tok.kind] ?? 'text-zinc-400'
    lines[lines.length - 1].push(<span key={idx} className={cls}>{tok.text}</span>)
  })
  return lines
}

export function SyntaxHighlight({ code, language }: Props) {
  const tokens = language === 'sql' ? tokenizeSQL(code) : tokenizeJSON(code)
  const clsMap = language === 'sql' ? SQL_CLS : JSON_CLS
  const lines  = toLines(tokens, clsMap)

  return (
    <div className="font-mono text-xs leading-6 select-text">
      <table className="border-collapse w-full">
        <tbody>
          {lines.map((lineTokens, i) => (
            <tr key={i} className="group hover:bg-white/[0.03] transition-colors">
              <td className="w-10 pr-4 pl-3 text-right text-[10px] leading-6 align-top select-none text-zinc-700 group-hover:text-zinc-500 border-r border-zinc-800 transition-colors shrink-0">
                {i + 1}
              </td>
              <td className="pl-4 pr-3 align-top whitespace-pre-wrap break-words">
                {lineTokens.length > 0 ? lineTokens : <span className="opacity-0">·</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}