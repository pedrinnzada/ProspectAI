export default function MetricCard({ label, value, sub, color, onClick, active }) {
  const interactive = typeof onClick === 'function'
  return (
    <div
      onClick={interactive ? onClick : undefined}
      role={interactive ? 'button' : undefined}
      className={`bg-white rounded-xl border p-4 transition select-none
        ${interactive ? `cursor-pointer ${active ? 'border-gray-900' : 'border-gray-200 hover:border-gray-300'}` : 'cursor-default border-gray-200'}`}
    >
      <div className="flex items-center gap-1.5 mb-1.5">
        {color && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />}
        <span className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">{label}</span>
      </div>
      <div className="text-2xl font-bold leading-none" style={color ? { color } : {}}>
        {value}
      </div>
      {sub && <div className="text-[10px] text-gray-400 mt-1">{sub}</div>}
    </div>
  )
}
