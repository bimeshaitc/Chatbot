import type { ArticleAuthor, ArticleCategory, InternalArticle, InternalDocument, InternalLink, ScrapedPage } from '../types'

const jamesKatwal: ArticleAuthor = {
  name: 'James Katwal',
  role: 'Admin',
  avatarColor: 'bg-amber-200 text-amber-800',
  initials: 'JK',
}

const janeSmith: ArticleAuthor = {
  name: 'Jane Smith',
  role: 'CSR Admin',
  avatarColor: 'bg-blue-200 text-blue-800',
  initials: 'JS',
}

const anishaThapa: ArticleAuthor = {
  name: 'Anisha Thapa',
  role: 'CSR Admin',
  avatarColor: 'bg-rose-200 text-rose-800',
  initials: 'AT',
}

export const articleCategories: ArticleCategory[] = [
  'Playbook',
  'Procedure',
  'Escalation',
  'Policy',
  'Onboarding',
]

// Group vocabulary now lives in `stores/useGroupsStore.ts`, shared with
// user-management and canned-responses.

/** Seeded so every review state and both review/knowledge visibility shapes are reachable. */
export const initialArticles: InternalArticle[] = [
  {
    id: 'art-1',
    title: 'Card decline triage',
    summary: 'Work out whether a decline is the bank, the card or us — before promising the customer anything.',
    body: 'Start with the decline code. 51 means insufficient funds or a temporary hold and usually clears itself; 05 is a hard decline the customer must resolve with their bank. Never tell a customer to re-enter their card more than twice: repeated attempts can trigger a fraud lock on their account. If the code is 05 and the customer is on an Enterprise plan, escalate to Finance rather than closing the chat.',
    category: 'Playbook',
    groups: ['Finance'],
    visibility: 'internal',
    reviewStatus: 'current',
    lastReviewedOn: '18-Dec-2025',
    owner: janeSmith,
    updatedOn: '18-Dec-2025',
    views: 412,
    isPinned: true,
  },
  {
    id: 'art-2',
    title: 'When to escalate to logistics',
    summary: 'Thresholds for handing a stuck shipment over, and what logistics needs from you first.',
    body: 'Escalate when a parcel has had no carrier scan for 72 hours, or 48 hours for an Enterprise customer. Include the order number, the last scan location and whether the customer has already been promised a date. Logistics will not accept an escalation without the last scan location, so check the tracking page before raising it.',
    category: 'Escalation',
    groups: ['Service', 'Product'],
    visibility: 'internal',
    reviewStatus: 'current',
    lastReviewedOn: '15-Dec-2025',
    owner: janeSmith,
    updatedOn: '16-Dec-2025',
    views: 268,
    isPinned: true,
  },
  {
    id: 'art-3',
    title: 'Refund authority limits',
    summary: 'How much you can refund without a second approver.',
    body: 'CSRs may refund up to $150 without approval. CSR Admins may go to $1,000. Anything above that needs an Admin, and anything above $5,000 needs the Owner plus a note on the ticket explaining the decision. Goodwill credits count towards the same limit as refunds.',
    category: 'Policy',
    groups: ['Finance'],
    visibility: 'internal',
    reviewStatus: 'due',
    lastReviewedOn: '02-Oct-2025',
    owner: jamesKatwal,
    updatedOn: '02-Oct-2025',
    views: 531,
    isPinned: false,
  },
  {
    id: 'art-4',
    title: 'Handling a chat the AI escalated',
    summary: 'What to read before you take over a conversation the bot flagged.',
    body: 'Open the AI Handling section in the details panel first. The matched intent and fallback count tell you whether the bot misunderstood the question or simply lacked the answer. If it misunderstood, the customer will usually have rephrased already — read up, do not ask them to repeat. If the bot lacked the answer, note the gap so it can be added to Chatbot Knowledge.',
    category: 'Playbook',
    groups: [],
    visibility: 'internal',
    reviewStatus: 'current',
    lastReviewedOn: '21-Dec-2025',
    owner: anishaThapa,
    updatedOn: '21-Dec-2025',
    views: 96,
    isPinned: false,
  },
  {
    id: 'art-5',
    title: 'Legacy VAT invoice process',
    summary: 'Superseded by the automated invoice flow — kept for orders placed before Aug 2025.',
    body: 'Applies only to orders placed before 01-Aug-2025, which were invoiced through the old finance system. Raise a ticket to Finance with the order number and the VAT number; they will reissue manually. Newer orders self-serve from the billing page and should never come through this route.',
    category: 'Procedure',
    groups: ['Finance'],
    visibility: 'internal',
    reviewStatus: 'stale',
    lastReviewedOn: '14-Mar-2025',
    owner: jamesKatwal,
    updatedOn: '14-Mar-2025',
    views: 47,
    isPinned: false,
  },
  {
    id: 'art-6',
    title: 'First week as a CSR',
    summary: 'Draft — the onboarding checklist for new agents.',
    body: 'Day one: shadow a supervised chat, read the two pinned playbooks, set your concurrent chat limit with your team lead. Day two onwards: take supervised chats before unsupervised ones. Still being written, so check with your lead before relying on it.',
    category: 'Onboarding',
    groups: [],
    visibility: 'internal',
    reviewStatus: 'draft',
    lastReviewedOn: 'Not yet reviewed',
    owner: anishaThapa,
    updatedOn: '22-Dec-2025',
    views: 8,
    isPinned: false,
  },
  {
    id: 'art-7',
    title: 'Standard shipping times by region',
    summary: 'Approved wording for how long delivery takes, by region — safe to share with customers and to feed the chatbot.',
    body: 'Domestic: 2-4 business days. Regional (same continent): 5-8 business days. International: 7-14 business days, plus customs clearance time we do not control. These are estimates, not guarantees — never promise a specific delivery date.',
    category: 'Procedure',
    groups: [],
    visibility: 'public',
    reviewStatus: 'current',
    lastReviewedOn: '20-Dec-2025',
    owner: janeSmith,
    updatedOn: '20-Dec-2025',
    views: 150,
    isPinned: false,
  },
]

export const initialDocuments: InternalDocument[] = [
  {
    id: 'idoc-1',
    name: 'Escalation matrix 2026.pdf',
    sizeLabel: '480 kb',
    category: 'Escalation',
    groups: [],
    visibility: 'internal',
    owner: jamesKatwal,
    addedOn: '12-Dec-2025',
  },
  {
    id: 'idoc-2',
    name: 'Fraud review checklist.docx',
    sizeLabel: '96 kb',
    category: 'Procedure',
    groups: ['Finance'],
    visibility: 'internal',
    owner: janeSmith,
    addedOn: '08-Dec-2025',
  },
  {
    id: 'idoc-3',
    name: 'Tone of voice guide.pdf',
    sizeLabel: '1.2 mb',
    category: 'Onboarding',
    groups: [],
    visibility: 'internal',
    owner: anishaThapa,
    addedOn: '28-Nov-2025',
  },
  {
    id: 'idoc-4',
    name: 'Shipping & returns policy.pdf',
    sizeLabel: '210 kb',
    category: 'Policy',
    groups: [],
    visibility: 'public',
    owner: jamesKatwal,
    addedOn: '19-Dec-2025',
  },
]

export const initialLinks: InternalLink[] = [
  {
    id: 'ilink-1',
    label: 'Carrier claims portal (internal login)',
    url: 'https://carrier-claims.internal.example.com',
    category: 'Escalation',
    groups: ['Service', 'Product'],
    visibility: 'internal',
    owner: jamesKatwal,
    addedOn: '10-Dec-2025',
  },
  {
    id: 'ilink-2',
    label: 'Finance approval workflow (Confluence)',
    url: 'https://wiki.example.com/finance/approval-workflow',
    category: 'Policy',
    groups: ['Finance'],
    visibility: 'internal',
    owner: janeSmith,
    addedOn: '05-Dec-2025',
  },
  {
    id: 'ilink-3',
    label: 'Public help center',
    url: 'https://help.example.com',
    category: 'Policy',
    groups: [],
    visibility: 'public',
    owner: janeSmith,
    addedOn: '15-Dec-2025',
  },
]

export function createDefaultOwner(): ArticleAuthor {
  return jamesKatwal
}

export const crawlDepthOptions: { value: string; label: string }[] = [
  { value: '1', label: '1 level deep' },
  { value: '2', label: '2 levels deep' },
  { value: '3', label: '3 levels deep' },
]

export const maxPagesOptions: { value: string; label: string }[] = [
  { value: '10', label: 'Up to 10 pages' },
  { value: '25', label: 'Up to 25 pages' },
  { value: '50', label: 'Up to 50 pages' },
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
  { path: '/careers', title: 'Careers' },
  { path: '/privacy-policy', title: 'Privacy policy' },
  { path: '/terms', title: 'Terms of service' },
]

/**
 * Simulates what scanning a site would turn up, for the Add website link
 * dialog's page picker. A deeper scan reaches further into the pool;
 * `maxPages` caps it further on top. Deterministic (no `Math.random`) so
 * re-scanning the same depth/cap always finds the same pages. Mirrors
 * `features/bot-training`'s own `scrapePagesFor` — this feature only ever
 * bookmarks a page for agents, never feeds it to the chatbot, so the two
 * stay independent rather than sharing one crawler.
 */
export function scrapePagesFor(crawlDepth: string, maxPages: number): ScrapedPage[] {
  const depthBudget = crawlDepth === '1' ? 4 : crawlDepth === '2' ? 8 : SCRAPE_PAGE_POOL.length
  const count = Math.max(1, Math.min(maxPages, depthBudget, SCRAPE_PAGE_POOL.length))
  return SCRAPE_PAGE_POOL.slice(0, count).map((page, index) => {
    const words = 120 + index * 45
    const detected = index % 3 === 0 ? 'a contact form' : index % 3 === 1 ? 'a pricing table' : 'no forms'
    return { ...page, preview: `~${words} words rendered · ${detected} detected.` }
  })
}
