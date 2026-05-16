import Link from 'next/link'

interface ButtonLinkProps {
  href: string
  children: React.ReactNode
  variant?: 'accent' | 'black' | 'white' | 'outline'
  className?: string
  target?: string
}

export function ButtonLink({
  href,
  children,
  variant = 'accent',
  className = '',
  target,
}: ButtonLinkProps) {
  const variantClass = {
    accent:  'ed-btn-accent',
    black:   'ed-btn-black',
    white:   'ed-btn-white',
    outline: 'ed-btn-outline',
  }[variant]

  return (
    <Link href={href} target={target} className={`ed-btn ${variantClass} ${className}`}>
      {children}
    </Link>
  )
}
