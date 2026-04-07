import { useEffect, useState } from 'react'

export default function Toast({ message }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    setVisible(true)
    const t = setTimeout(() => setVisible(false), 2200)
    return () => clearTimeout(t)
  }, [message])

  if (!visible) return null

  return (
    <div
      className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-[12px] font-medium
        px-4 py-2.5 rounded-xl shadow-xl animate-bounce-in"
      style={{ animation: 'slideIn .2s ease' }}
    >
      {message}
      <style>{`@keyframes slideIn { from { opacity:0; transform:translateY(-8px) } to { opacity:1; transform:translateY(0) } }`}</style>
    </div>
  )
}
