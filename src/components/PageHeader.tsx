interface PageHeaderProps {
  title: string
  description?: string
  as?: 'h1' | 'h2'
}

export function PageHeader({ title, description, as: Heading = 'h1' }: PageHeaderProps) {
  return (
    <div>
      <Heading className="text-xl leading-[140%] font-bold text-gray-900">{title}</Heading>
      {description && <p className="mt-1 text-sm leading-[140%] font-medium text-[#6E7678]">{description}</p>}
    </div>
  )
}
