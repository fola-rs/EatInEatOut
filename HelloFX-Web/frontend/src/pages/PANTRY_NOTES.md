# Pantry.js — Reference Notes

## What this component does
Fetches all pantry items from the backend and renders them in a table.

---

## Hooks used

### `useState(initialValue)`
Gives a component memory — a value that survives re-renders.  
Returns `[currentValue, setterFunction]`.

```js
const [count, setCount] = useState(0);
setCount(5); // re-renders with count = 5
```
Docs: https://react.dev/reference/react/useState

---

### `useEffect(() => { ... }, [deps])`
Runs code **after** the component renders.  
`[]` as deps = run **once on mount** (like "on page load").

```js
useEffect(() => {
  fetchData();
}, []);
```
Docs: https://react.dev/reference/react/useEffect

---

### `async/await + fetch()`
`fetch()` makes an HTTP request and returns a Promise.  
`await` pauses until it resolves.

```js
const res = await fetch("http://localhost:5000/api/pantry");
const data = await res.json(); // parse the JSON body
```
Docs: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API

---

## What the API returns
Each item from `GET /api/pantry` looks like:

```json
{
  "id": 1,
  "name": "eggs",
  "category": "dairy",
  "quantity": 6,
  "unit": "",
  "expires_at": null,
  "added_at": "2026-06-13 21:00:00"
}
```

---

## What the component renders
- `"Loading…"` while fetching
- Red error message if the fetch fails
- `"No items in your pantry yet."` if list is empty
- A `<table>` with columns: Name | Category | Quantity | Unit | Expires

---

## Blanks you need to fill (Pantry.js)

| Line | Blank | Hint |
|------|-------|------|
| `useState(___)` | initial items state | what type won't crash `.length`? |
| `fetch(\`${API}/___\`)` | endpoint path | check your backend routes |
| `setError(___)` | what to show | `err` has a `.message` property |
| `useEffect(() => { ___; }, [])` | what to call | the fetch function above |
| `key={item.___}` | unique row id | every item has one |
| `{item.___}` × 4 | name, category, quantity, unit | field names from JSON above |
| `{item.___ ?? "—"}` | optional expiry | field name from JSON above |
