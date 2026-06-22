import { cn } from '@/utils/cn.js'

/** Card surface used everywhere. */
export default function Card({ as: Tag = 'div', className, padded = true, children, ...rest }) {
  return (
    <Tag
      className={cn('card', padded && 'p-5', className)}
      {...rest}
    >
      {children}
    </Tag>
  )
}
