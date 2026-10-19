interface SkeletonProps {
  className?: string
}

export default function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-cool-steel-200 rounded-lg ${className}`}
      aria-hidden="true"
    />
  )
}