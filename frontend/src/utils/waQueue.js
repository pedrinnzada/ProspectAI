const KEY = 'prospectai_wa_round_v1'
const MAX_IDS = 500

/** IDs já usados na rodada atual do piloto (últimos N), para não repetir o mesmo lead em sequência. */
export function loadRoundExcludedIds() {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    if (!Array.isArray(arr)) return []
    return arr.map(String).filter(Boolean).slice(-MAX_IDS)
  } catch {
    return []
  }
}

export function recordWaRoundId(id) {
  if (typeof localStorage === 'undefined' || !id) return
  const cur = loadRoundExcludedIds()
  const s = String(id)
  const next = [...cur.filter((x) => x !== s), s].slice(-MAX_IDS)
  localStorage.setItem(KEY, JSON.stringify(next))
}

export function clearWaRound() {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(KEY)
}
