export default function EmptyState({ icon = '🔍', title, subtitle }) {
  return (
    <div className="text-center py-16 text-gray-400">
      <div className="text-4xl mb-3 opacity-30">{icon}</div>
      <div className="text-[14px] font-semibold text-gray-500 mb-1">{title}</div>
      <div className="text-[12px]">{subtitle}</div>
    </div>
  )
}
