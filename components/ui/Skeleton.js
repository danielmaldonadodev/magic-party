// components/ui/Skeleton.js
export default function Skeleton({ className = '' }) {
  return (
    <div className={`animate-pulse rounded-xl bg-gray-200/80 ${className}`} />
  )
}
