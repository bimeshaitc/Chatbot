import type { SVGProps } from 'react'

export function WhatsappIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="12" cy="12" r="12" fill="#25D366" />
      <path
        fill="#fff"
        d="M12.01 5.5a6.49 6.49 0 0 0-5.55 9.84L5.5 18.5l3.27-.93a6.49 6.49 0 1 0 3.24-12.07Zm0 1.2a5.29 5.29 0 1 1 0 10.58 5.24 5.24 0 0 1-2.7-.74l-.19-.11-1.94.55.55-1.88-.13-.2a5.29 5.29 0 0 1 4.41-8.2Zm-2.4 2.72c-.14 0-.36.05-.55.27-.19.21-.72.7-.72 1.72 0 1.01.74 1.99.84 2.13.1.13 1.44 2.26 3.55 3.07 1.76.68 2.11.55 2.5.51.38-.04 1.22-.5 1.4-.98.17-.48.17-.9.12-.98-.05-.09-.19-.14-.38-.24-.19-.1-1.22-.6-1.41-.67-.19-.07-.32-.1-.46.1-.14.21-.53.67-.65.8-.12.14-.24.16-.44.06-.19-.1-.83-.31-1.58-.98-.58-.52-.98-1.16-1.09-1.36-.12-.19-.01-.3.09-.4.09-.09.19-.24.29-.36.1-.12.13-.21.19-.34.06-.14.03-.26-.02-.36-.05-.1-.44-1.09-.62-1.49-.15-.36-.32-.34-.46-.34l-.4-.03Z"
      />
    </svg>
  )
}

export function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="12" cy="12" r="12" fill="#1877F2" />
      <path
        fill="#fff"
        d="M13.4 20v-6.85h2.3l.34-2.67h-2.64v-1.7c0-.77.21-1.3 1.32-1.3h1.41V4.1c-.24-.03-1.08-.1-2.06-.1-2.04 0-3.44 1.24-3.44 3.53v1.97H8v2.67h2.33V20h3.07Z"
      />
    </svg>
  )
}

export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <defs>
        <linearGradient id="ig-gradient" x1="0" y1="24" x2="24" y2="0">
          <stop offset="0" stopColor="#FFDD55" />
          <stop offset="0.5" stopColor="#FF543E" />
          <stop offset="1" stopColor="#C837AB" />
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="7" fill="url(#ig-gradient)" />
      <rect x="6.5" y="6.5" width="11" height="11" rx="3.5" stroke="#fff" strokeWidth="1.4" />
      <circle cx="12" cy="12" r="3" stroke="#fff" strokeWidth="1.4" />
      <circle cx="16" cy="8" r="0.9" fill="#fff" />
    </svg>
  )
}
