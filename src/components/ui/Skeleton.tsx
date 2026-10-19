interface SkeletonProps {
  className?: string
}

export default function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-line rounded-lg ${className}`}
      aria-hidden="true"
    />
  )
}