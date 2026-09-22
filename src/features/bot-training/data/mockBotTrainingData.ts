import type { FaqCategory, ScrapedPage, SourceAuthor, SourceDocument, SourceFaq, SourceUrl } from '../types'

const jamesKatwal: SourceAuthor = {
  name: 'James Katwal',
  role: 'Admin',
  avatarColor: 'bg-amber-200 text-amber-800',
  initials: 'JK',
}

const ramKatwal: SourceAuthor = {
  name: 'Ram Katwal',
  role: 'Admin',
  avatarColor: 'bg-blue-200 text-blue-800',
  initials: 'RK',
}

/** Seeded so every training status and the disabled case are all reachable. */
export const initialDocuments: SourceDocument[] = [
  {
    id: 'doc-1',
    name: 'Product catalogue 2026.pdf',
    sizeLabel: '4.2 mb',
    status: 'indexed',
    audience: 'public',
    isEnabled: true,
    chunks: 184,
    answersServed: 312,
    lastTrainedOn: '20-Dec-2025',
    author: jamesKatwal,
    addedOn: '25-Jan-2025',
  },
  {
    id: 'doc-2',
    name: 'Returns and refunds policy.pdf',
    sizeLabel: '820 kb',
    status: 'indexed',
    audience: 'public',
    isEnabled: true,
    chunks: 46,
    answersServed: 508,
    lastTrainedOn: '20-Dec-2025',
    author: jamesKatwal,
    addedOn: '25-Jan-2025',
  },
  {
    id: 'doc-3',
    name: 'Shipping rates by region.xlsx',
    sizeLabel: '1.1 mb',
    status: 'indexing',
    audience: 'public',
    isEnabled: true,
    chunks: 0,
    answersServed: 0,
    lastTrainedOn: 'In progress',
    author: jamesKatwal,
    addedOn: '21-Dec-2025',
  },
  {
    id: 'doc-4',
    name: 'Enterprise pricing tiers.pdf',
    sizeLabel: '640 kb',
    status: 'indexed',
    audience: 'signed-in',
    isEnabled: false,
    chunks: 38,
    answersServed: 27,
    lastTrainedOn: '12-Dec-2025',
    author: ramKatwal,
    addedOn: '10-Dec-2025',
  },
  {
    id: 'doc-5',
    name: 'Warranty terms (scanned).pdf',
    sizeLabel: '12.6 mb',
    status: 'failed',
    audience: 'public',
    isEnabled: true,
    chunks: 0,
    answersServed: 0,
    lastTrainedOn: 'Never',
    failureReason: 'No selectable text found. The file looks like a scan, so it needs OCR first.',
    author: ramKatwal,
    addedOn: '19-Dec-2025',
  },
  {
    id: 'doc-6',
    name: 'Accessibility statement.docx',
    sizeLabel: '210 kb',
    status: 'queued',
    audience: 'public',
    isEnabled: true,
    chunks: 0,
    answersServed: 0,
    lastTrainedOn: 'Never',
    author: jamesKatwal,
    addedOn: '22-Dec-2025',
  },
]

export const initialWebsiteUrls: SourceUrl[] = [
  {
    id: 'url-1',
    label: 'Help centre',
    url: 'https://help.mercury.app/',
    sizeLabel: '3.4 mb',
    status: 'indexed',
    audience: 'public',
    isEnabled: true,
    chunks: 421,
    answersServed: 1240,
    crawlDepth: '3',
    lastTrainedOn: '20-Dec-2025',
    author: jamesKatwal,
    addedOn: '25-Jan-2025',
  },
  {
    id: 'url-2',
    label: 'Pricing page',
    url: 'https://mercury.app/pricing',
    sizeLabel: '180 kb',
    status: 'indexed',
    audience: 'public',
    isEnabled: true,
    chunks: 22,
    answersServed: 396,
    crawlDepth: '1',
    lastTrainedOn: '20-Dec-2025',
    author: jamesKatwal,
    addedOn: '25-Jan-2025',
  },
  {
    id: 'url-3',
    label: 'Release notes',
    url: 'https://mercury.app/changelog',
    sizeLabel: '640 kb',
    status: 'queued',
    audience: 'public',
    isEnabled: true,
    chunks: 0,
    answersServed: 0,
    crawlDepth: '2',
    lastTrainedOn: 'Never',
    author: ramKatwal,
    addedOn: '22-Dec-2025',
  },
  {
    id: 'url-4',
    label: 'Partner portal',
    url: 'https://partners.mercury.app/',
    sizeLabel: '910 kb',
    status: 'failed',
    audience: 'signed-in',
    isEnabled: true,
    chunks: 0,
    answersServed: 0,
    crawlDepth: '2',
    lastTrainedOn: 'Never',
    failureReason: 'Crawler received 401 Unauthorized. The page needs a sign-in the crawler does not have.',
    author: ramKatwal,
    addedOn: '18-Dec-2025',
  },
]

export const initialFaqs: SourceFaq[] = [
  {
    id: 'faq-1',
    category: 'Technical',
    question: 'How do I check my current balance?',
    answer:
      'You can see your balance instantly by logging into the "Accounts" tab or asking me "What\'s my balance?" if you\'ve enabled secure chat banking.',
    isEnabled: true,
    answersServed: 214,
    author: ramKatwal,
    addedOn: '02-Jan-2026',
  },
  {
    id: 'faq-2',
    category: 'Technical',
    question: "I see a transaction I don't recognize. How do I dispute it?",
    answer:
      'You can flag any transaction within 60 days. Select the transaction in your history and click "Dispute." Our fraud team will review it within 5-7 days.',
    isEnabled: true,
    answersServed: 91,
    author: ramKatwal,
    addedOn: '02-Jan-2026',
  },
  {
    id: 'faq-3',
    category: 'Billing',
    question: 'How long does the loan approval process take?',
    answer:
      'Most digital applications are reviewed within 24 hours. Once approved, funds are typically deposited in 1-3 business days.',
    isEnabled: false,
    answersServed: 12,
    author: ramKatwal,
    addedOn: '02-Jan-2026',
  },
  // ---- Tagged with the intents the support chat feature matches, so the
  // composer's "From knowledge base" list can surface the one the bot would
  // already have used for the conversation on screen. ----
  {
    id: 'faq-4',
    category: 'Billing',
    question: 'My card was declined at checkout. What do I do?',
    answer:
      "I'm sorry for the trouble. Please make sure the card number is entered without spaces or dashes. If it still fails, your bank may have placed a temporary hold that clears in a few minutes.",
    isEnabled: true,
    answersServed: 268,
    author: jamesKatwal,
    addedOn: '05-Jan-2026',
    matchedIntents: ['billing.card_declined'],
  },
  {
    id: 'faq-5',
    category: 'Product',
    question: 'When will my refund show up?',
    answer:
      'Once we receive a return, refunds settle back to the original payment method within 5-7 business days. I will keep an eye on this one and follow up if it slips.',
    isEnabled: true,
    answersServed: 176,
    author: jamesKatwal,
    addedOn: '05-Jan-2026',
    matchedIntents: ['orders.refund_status'],
  },
  {
    id: 'faq-6',
    category: 'Product',
    question: 'Why has my order not shipped yet?',
    answer:
      'Sorry about the delay. I can see the parcel has not been scanned by the carrier yet — I have asked them to re-scan it and will update you as soon as it moves.',
    isEnabled: true,
    answersServed: 143,
    author: jamesKatwal,
    addedOn: '05-Jan-2026',
    matchedIntents: ['orders.shipping_delay'],
  },
  {
    id: 'faq-7',
    category: 'General',
    question: "What's your return policy?",
    answer: 'Returns are free within 30 days of delivery. Would you like a return label?',
    isEnabled: true,
    answersServed: 401,
    author: jamesKatwal,
    addedOn: '05-Jan-2026',
    matchedIntents: ['faq.return_policy'],
  },
  {
    id: 'faq-8',
    category: 'General',
    question: 'What are your store hours?',
    answer: "We're open 9am to 7pm on weekdays and 10am to 4pm on Saturdays.",
    isEnabled: true,
    answersServed: 89,
    author: jamesKatwal,
    addedOn: '05-Jan-2026',
    matchedIntents: ['faq.store_hours'],
  },
  {
    id: 'faq-9',
    category: 'Billing',
    question: 'Can I get a copy of a past invoice?',
    answer: "I've emailed a copy of the invoice to the address on your account.",
    isEnabled: true,
    answersServed: 122,
    author: jamesKatwal,
    addedOn: '05-Jan-2026',
    matchedIntents: ['billing.invoice_copy'],
  },
  {
    id: 'faq-10',
    category: 'Product',
    question: 'My order arrived damaged. What are my options?',
    answer:
      "I'm sorry about that — a damaged item qualifies for a free replacement or a full refund, whichever you'd prefer.",
    isEnabled: true,
    answersServed: 97,
    author: jamesKatwal,
    addedOn: '05-Jan-2026',
    matchedIntents: ['orders.damaged_item'],
  },
  {
    id: 'faq-11',
    category: 'Technical',
    question: 'Are you seeing issues with the checkout API right now?',
    answer:
      "I can check current system status for you. If there's an active incident, our status page will have the latest, and I can loop in an engineer if it's still failing.",
    isEnabled: true,
    answersServed: 34,
    author: ramKatwal,
    addedOn: '05-Jan-2026',
    matchedIntents: ['technical.api_timeout'],
  },
]

export const faqCategories: FaqCategory[] = ['Product', 'Technical', 'Billing', 'General']

export const crawlDepthOptions: { value: string; label: string }[] = [
  { value: '1', label: '1 level deep' },
  { value: '2', label: '2 levels deep' },
  { value: '3', label: '3 levels deep' },
]

export const maxPagesOptions: { value: string; label: string }[] = [
  { value: '10', label: 'Up to 10 pages' },
  { value: '25', label: 'Up to 25 pages' },
  { value: '50', label: 'Up to 50 pages' },
  { value: '100', label: 'Up to 100 pages' },
]

/** The pages a scan can discover, most-linked-from-homepage first. */
const SCRAPE_PAGE_POOL: { path: string; title: string }[] = [
  { path: '/', title: 'Home' },
  { path: '/pricing', title: 'Pricing' },
  { path: '/about', title: 'About us' },
  { path: '/faq', title: 'Frequently asked questions' },
  { path: '/contact', title: 'Contact us' },
  { path: '/blog', title: 'Blog' },
  { path: '/support', title: 'Support' },
  { path: '/docs', title: 'Documentation' },
  { path: '/blog/getting-started', title: 'Getting started' },
  { path: '/docs/api', title: 'API reference' },
  { path: '/blog/whats-new', title: "What's new" },
  { path: '/changelog', title: 'Changelog' },
  { path: '/careers', title: 'Careers' },
  { path: '/privacy-policy', title: 'Privacy policy' },
  { path: '/terms', title: 'Terms of service' },
]

/**
 * Simulates what crawling a site would turn up, for the Add URL dialog's
 * page picker. A deeper crawl reaches further into the pool; `maxPages` caps
 * it further on top. Deterministic (no `Math.random`) so re-scanning the
 * same depth/cap always finds the same pages, which reads as a real crawl
 * rather than a slot machine.
 */
export function scrapePagesFor(crawlDepth: string, maxPages: number): ScrapedPage[] {
  const depthBudget = crawlDepth === '1' ? 4 : crawlDepth === '2' ? 9 : SCRAPE_PAGE_POOL.length
  const count = Math.max(1, Math.min(maxPages, depthBudget, SCRAPE_PAGE_POOL.length))
  return SCRAPE_PAGE_POOL.slice(0, count).map((page, index) => {
    const words = 120 + index * 45
    const detected = index % 3 === 0 ? 'a contact form' : index % 3 === 1 ? 'a pricing table' : 'no forms'
    return { ...page, preview: `~${words} words rendered · ${detected} detected.` }
  })
}

export function createDefaultAuthor(): SourceAuthor {
  return jamesKatwal
}

export function createFaqAuthor(): SourceAuthor {
  return ramKatwal
}
