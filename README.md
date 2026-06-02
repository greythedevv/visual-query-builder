# QueryForge — Visual Query Builder

A production-grade visual query builder built with Next.js, TypeScript, and Tailwind CSS. Users construct complex database queries through an intuitive graphical interface without writing raw query syntax.

**Live Demo:** [https://visual-query-builder-nine.vercel.app](https://visual-query-builder-nine.vercel.app)

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Recursive Rendering Strategy](#recursive-rendering-strategy)
- [State Management Design](#state-management-design)
- [Query Engine Design](#query-engine-design)
- [Performance Optimization](#performance-optimization)
- [Trade-offs](#trade-offs)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Testing](#testing)
- [Folder Structure](#folder-structure)

---

## Architecture Overview

QueryForge is built around a **recursive tree data model**. Every query is represented as a tree of nodes — either a `QueryRule` (a single condition) or a `QueryGroup` (a logical container of rules and/or other groups). This mirrors how real query engines represent compound filter expressions.

```text
QueryGroup (AND)
├── QueryRule  → status = 'active'
├── QueryRule  → age > 18
└── QueryGroup (OR)
    ├── QueryRule  → country = 'Nigeria'
    └── QueryRule  → purchases > 10
```

The application is split into four distinct layers:

| Layer | Responsibility |
|---|---|
| **UI Layer** | React components — renders the tree visually, handles user interaction |
| **State Layer** | Zustand store — owns and mutates the query tree immutably |
| **Engine Layer** | Pure functions — builds SQL/Mongo, executes queries, validates the tree |
| **Schema Layer** | Static config — defines fields, types, and valid operators per data source |

Each layer has no circular dependency. The engine layer is entirely pure (no React, no Zustand) — it takes a `QueryGroup` and returns a result. This makes it trivially testable and reusable.

---

## Recursive Rendering Strategy

The core UI challenge is rendering an arbitrarily deep nested tree of conditions. This is solved with a **mutually recursive component pair**:

- `ConditionGroup` renders a group and its children
- For each child, it renders either a `RuleRow` (leaf) or another `ConditionGroup` (branch)

```tsx
// ConditionGroup.tsx — simplified
{group.children.map(child =>
  child.type === 'rule'
    ? <RuleRow key={child.id} rule={child} />
    : <ConditionGroup key={child.id} group={child} depth={depth + 1} />
)}
```

**Depth tracking** is passed as a prop so each nesting level can receive a distinct left-border color (violet → sky → emerald → amber), giving the user a clear visual hierarchy at any depth.

**Stable keys** use `nanoid()`-generated IDs stored in the tree node itself, not array indices. This ensures React never tears down and remounts the wrong node during reorders.

**Collapse** is stored as a boolean on the `QueryGroup` node itself (`collapsed: boolean`), not as local component state. This means collapse state survives history loads and preset restores.

---

## State Management Design

State is managed with **Zustand** with the `persist` middleware.

### Why Zustand

- No boilerplate compared to Redux
- Direct mutation via `set()` without action creators
- Easy to derive computed values outside the store (SQL, Mongo, errors are `useMemo` in the hook layer, not stored)
- `persist` middleware gives localStorage persistence for free

### Store Shape

```ts
interface QueryState {
  schema:    Schema | null        // active data source
  rootGroup: QueryGroup           // the full recursive query tree
  history:   HistoryEntry[]       // last 20 executed queries
  presets:   PresetEntry[]        // user-saved named queries
}
```

Only `history` and `presets` are persisted to localStorage — not `schema` or `rootGroup`. This is intentional: the user starts fresh each session but keeps their saved work.

### Immutable Tree Updates

All tree mutations use recursive pure functions that return new objects at every level of the path to the modified node. No node is mutated in place:

```ts
function findAndUpdate(group, id, updater) {
  if (group.id === id) return updater(group)
  return {
    ...group,
    children: group.children.map(child => {
      if (child.id === id) return updater(child)
      if (child.type === 'group') return findAndUpdate(child, id, updater)
      return child
    }),
  }
}
```

This means React always sees new object references for any changed node and its ancestors, triggering correct re-renders without needing deep equality checks.

### Computed State Lives Outside the Store

SQL, Mongo output, and validation errors are **not stored** — they are derived on every render via `useMemo` in `useQueryBuilder`:

```ts
const sql    = useMemo(() => schema ? buildSQL(rootGroup, schema.id)  : '', [schema, rootGroup])
const mongo  = useMemo(() => schema ? buildMongo(rootGroup)            : '', [schema, rootGroup])
const errors = useMemo(() => schema ? validateTree(rootGroup, schema)  : [], [schema, rootGroup])
```

Keeping derived state out of the store avoids synchronization bugs and keeps the store minimal.

---

## Query Engine Design

The engine is four pure modules with no side effects:

### `builders.ts` — SQL and MongoDB generation

Traverses the tree recursively. Rules are converted to clause strings; groups are joined with their logic operator. Nested groups are wrapped in parentheses. All string values are escaped (single quotes doubled) to prevent SQL injection in the preview output.

```ts
// Escaping example
function escapeSQLString(value: string): string {
  return String(value).replace(/'/g, "''")
}
```

### `executor.ts` — In-memory query execution

Filters the mock dataset by evaluating each record against the query tree. Uses the same recursive traversal:

- `AND` groups use `Array.every()`
- `OR` groups use `Array.some()`
- Empty groups return `true` (pass-through)

### `validator.ts` — Tree validation

Runs before execution and on every render. Catches:
- Missing field or value
- Operators incompatible with field type (e.g. `contains` on a number)
- Empty groups
- Invalid `between` ranges (min > max)
- Empty `in_array` selections

Errors carry the `nodeId` of the offending node so the UI can highlight exactly the problematic rule or group.

### `importValidator.ts` — Import safety

Before any imported JSON is loaded into state, it is structurally validated with a recursive type guard. Malformed trees (wrong types, missing IDs, invalid logic values) are rejected with a clear error message rather than silently corrupting state.

---

## Performance Optimization

### Memoized Components

`RuleRow` and `ConditionGroup` are both wrapped in `React.memo`. Since Zustand updates return new references only along the path to the changed node, siblings that didn't change receive the same props and are skipped entirely.

### Stable Selector Pattern

Each component subscribes to only what it needs from the store:

```ts
const { schema, updateRule, removeNode } = useQueryStore()
```

Zustand's shallow equality check ensures a component only re-renders if its specific slice of state changed.

### Memoized Derived Values

SQL generation, Mongo generation, and validation all run through `useMemo` with `[schema, rootGroup]` as dependencies. They only recompute when the tree actually changes.

### useCallback on Actions

All action handlers passed as props (`execute`, `exportQuery`, `importQuery`) are wrapped in `useCallback` to maintain stable references across renders.

### DnD Kit — Minimal Drag Overhead

`@dnd-kit/core` uses the Pointer and Keyboard sensors with a 5px activation distance constraint. This prevents accidental drags during normal clicking and keeps the drag interaction snappy.

---

## Trade-offs

### Mock Execution vs Real Database

Query execution runs against in-memory JavaScript arrays. This gives instant feedback without a backend but means the SQL/Mongo output is for preview only — it is not sent to a real database. The architecture intentionally separates the engine from the data layer so a real adapter could be swapped in.

### LocalStorage Persistence

History and presets persist to `localStorage` via Zustand's `persist` middleware. This means data is device-specific and not synced across sessions or users. A production version would persist to a backend.

### Schema as Static Config

Schemas are defined as TypeScript constants. Adding a new data source requires a code change. A production version would fetch schemas from an API, but static config keeps the demo self-contained and fully typesafe.

### No Virtualization on Results

The results table paginates (10 rows per page) rather than virtualizing. With the current mock dataset sizes (15–25 rows) virtualization would add complexity with no measurable benefit.

### Hydration and Theme

The theme toggle uses a `mounted` guard to avoid a React hydration mismatch between server-rendered HTML (always dark) and client-rendered HTML (user's saved theme). The icon is withheld until after the first paint, then swapped in via `requestAnimationFrame`. This is the standard pattern for `next-themes`.

---

## Tech Stack

| Tool | Purpose |
|---|---|
| Next.js 15 (App Router) | Framework, SSR, routing |
| TypeScript | Full type safety across all layers |
| Tailwind CSS v4 | Utility-first styling, CSS variable theming |
| Zustand | Global state management |
| @dnd-kit/core + sortable | Drag-and-drop reordering |
| next-themes | Dark/light mode with SSR support |
| nanoid | Stable unique IDs for tree nodes |
| Vitest | Unit and integration testing |
| React Testing Library | Component interaction testing |

---

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Testing

Tests are organized alongside the code they test. Run the full suite with:

```bash
npm run test
```

### Coverage Areas

| Area | File | What's Tested |
|---|---|---|
| SQL Builder | `builders.test.ts` | All operators, nested groups, AND/OR logic, table name, escaping |
| Mongo Builder | `builders.test.ts` | All operators, `$and`/`$or` wrapping, `$regex` |
| Query Executor | `executor.test.ts` | All operators, AND/OR logic, nested groups, null handling |
| Validator | `validator.test.ts` | Missing fields, type mismatches, empty groups, recursive validation |
| Store | `queryStore.test.ts` | All actions, history cap, preset CRUD, moveNode, importTree |
| RuleRow | `RuleRow.test.tsx` | Field/operator/value rendering, all input types, updateRule calls, error state |
| ConditionGroup | `ConditionGroup.test.tsx` | Logic toggle, add rule/group, remove, collapse, empty state, root vs non-root |

---

## Folder Structure

```text
src/
└── app/
    ├── components/
    │   ├── QueryBuilder/
    │   │   ├── index.tsx          # DnD context + drag handler
    │   │   ├── ConditionGroup.tsx # Recursive group renderer
    │   │   ├── RuleRow.tsx        # Single rule (field/operator/value)
    │   │   ├── GroupHeader.tsx    # AND/OR toggle + add/remove actions
    │   │   └── SchemaSelector.tsx # Data source picker
    │   ├── QueryPreview.tsx       # SQL/Mongo/JSON tabs + syntax highlight
    │   ├── ResultsPanel.tsx       # Run button + results table
    │   ├── ResultsTable.tsx       # Sortable paginated table
    │   └── Sidebar/
    │       ├── QueryHistory.tsx   # Last 20 executed queries
    │       └── SavedPresets.tsx   # Named saved queries
    ├── hooks/
    │   ├── useQueryBuilder.ts     # SQL, Mongo, errors, execute, export, import
    │   └── useKeyboardShortcuts.ts
    ├── lib/
    │   ├── queryEngine/
    │   │   ├── types.ts           # QueryRule, QueryGroup, Schema, Operator
    │   │   ├── builders.ts        # buildSQL, buildMongo
    │   │   ├── executor.ts        # executeQuery
    │   │   ├── validator.ts       # validateTree
    │   │   └── importValidator.ts # validateImport
    │   ├── schema/
    │   │   ├── schemas.ts         # Users, Orders, Products schemas
    │   │   └── operators.ts       # OPERATORS_BY_TYPE, OPERATOR_LABELS
    │   └── mockData/
    │       ├── index.ts
    │       ├── users.ts
    │       ├── orders.ts
    │       └── products.ts
    ├── store/
    │   └── queryStore.ts          # Zustand store + persist
    ├── page.tsx                   # Root layout: nav + sidebar + panels
    └── globals.css                # CSS variables + Tailwind theme
```

---

## Git Workflow

This project follows a feature-branch workflow. All changes were developed on feature branches and merged into `main` via pull requests. Direct pushes to `main` were not used.

See the pull requests tab on GitHub for the full history.