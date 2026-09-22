import type { Ticket, TicketAgent, TicketRequester } from '../types'

/**
 * Mirrors the agents used by chat routing and user management — `groups`
 * duplicates `features/chat/data/mockChatData.ts`'s `agents` on purpose (see
 * `config/viewer.ts`'s note on the same tradeoff): tickets scoping needs it to
 * resolve `team` scope, and importing chat's feature data into tickets would
 * be a cross-feature reach-in with no barrel export to justify it.
 *
 * `role`/`channels` drive assignee eligibility (`utils/assigneeEligibility.ts`):
 * a CSR without the tickets channel cannot be assigned a ticket at all, and
 * neither can one whose `ticketAccess` is view-only. CSR Admin and up are
 * unaffected by either field — same rule as `channelCan`.
 */
export const ticketAgents: TicketAgent[] = [
  { id: 'jane-smith', name: 'Jane Smith', groups: ['Technical', 'Finance', 'Service', 'Product'], role: 'Owner' },
  { id: 'anisha-thapa', name: 'Anisha Thapa', groups: ['Finance'], role: 'CSR Admin' },
  { id: 'ravi-koirala', name: 'Ravi Koirala', groups: ['Technical'], role: 'CSR', channels: ['chat'] },
  { id: 'mira-lama', name: 'Mira Lama', groups: ['Service'], role: 'CSR', channels: ['chat', 'tickets'] },
  // Has the tickets channel but view-only access — ineligible for assignment,
  // the demo case for "can see the queue, can't work it".
  {
    id: 'tiana-koragaard',
    name: 'Tiana Koragaard',
    groups: ['Product'],
    role: 'CSR',
    channels: ['tickets'],
    ticketAccess: 'view',
  },
]

/** Whoever the prototype is acting as, for the "Assigned to me" mailbox. */
export const CURRENT_AGENT_ID = 'jane-smith'

function requester(name: string, email: string, avatarColor: string): TicketRequester {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
  return { name, email, initials, avatarColor }
}

const alex = requester('Alex Thompson', 'alex.thompson@example.com', 'bg-indigo-200 text-indigo-700')
const priya = requester('Priya Sharma', 'priya.sharma@example.com', 'bg-rose-200 text-rose-700')
const daniel = requester('Daniel Okafor', 'daniel.okafor@example.com', 'bg-emerald-200 text-emerald-700')
const grace = requester('Grace Lin', 'grace.lin@example.com', 'bg-sky-200 text-sky-700')
const marcus = requester('Marcus Webb', 'marcus.webb@example.com', 'bg-amber-200 text-amber-700')
const unknown = requester('Deals Bot', 'promo@cheap-deals.example', 'bg-gray-200 text-gray-700')

/**
 * A requester who never gave a name. Not the widget's own ticket form —
 * that one collects both a name and an email, on purpose (the chat itself
 * stays anonymous throughout; a ticket, being a named async request, is the
 * one point that actually needs identity — see `WidgetChatSimulator`). This
 * is the other real source of a nameless ticket: a raw email to support with
 * no signature. `name` and `initials` stay empty strings rather than a guess;
 * `requesterDisplayName` and `hasRequesterName` are how every view is meant
 * to read this, not by touching `.name`/`.initials` directly.
 */
function guestRequester(email: string): TicketRequester {
  return { name: '', email, initials: '', avatarColor: 'bg-gray-100 text-gray-400' }
}

const guest = guestRequester('sam0407@example.com')

/**
 * Seeded so every mailbox, status, priority and placement is reachable without
 * a backend: unassigned and assigned work, an overdue SLA breach, solved and
 * closed tickets, plus one each in archive, spam and trash.
 */
export const initialTickets: Ticket[] = [
  {
    id: 't-1042',
    reference: 'TKT-1042',
    subject: 'Card declined at checkout',
    description:
      'Customer reports a fresh card being declined repeatedly. Bank shows a temporary hold (soft decline, code 51).',
    requester: alex,
    priority: 'high',
    status: 'open',
    placement: 'inbox',
    channel: 'chat',
    categoryId: 'finance',
    assigneeId: 'jane-smith',
    tags: ['Billing', 'Pricing'],
    createdBy: 'Jane Smith',
    createdAt: '22-Dec-2025, 3:54 AM',
    updatedAt: '22-Dec-2025, 4:10 AM',
    dueOn: '23-Dec-2025',
    isOverdue: false,
    conversationId: '1',
    linkedChatSummary:
      "Customer: Hi, my card keeps getting declined at checkout even though it's a fresh card. Can you help?\nAnisha Thapa: I see the issue. Please make sure you're entering the card number without any spaces or dashes. Just the 16 digits.",
    unreadReplies: 1,
    messages: [
      {
        id: 'tm-1042-1',
        author: 'requester',
        authorName: 'Alex Thompson',
        body: 'My card keeps getting declined at checkout even though it is a brand new card. Can you look into it?',
        sentAt: '22-Dec-2025, 3:54 AM',
      },
      {
        id: 'tm-1042-2',
        author: 'system',
        authorName: 'System',
        body: 'Raised from chat with Alex Thompson · assigned to Jane Smith',
        sentAt: '22-Dec-2025, 3:54 AM',
      },
      {
        id: 'tm-1042-3',
        author: 'agent',
        authorName: 'Jane Smith',
        body: 'Bank returned a soft decline (code 51). Waiting on the hold to clear before we advise a retry.',
        sentAt: '22-Dec-2025, 3:58 AM',
        isInternal: true,
      },
      {
        id: 'tm-1042-4',
        author: 'agent',
        authorName: 'Jane Smith',
        body: 'Thanks for flagging this. Your bank has placed a temporary hold on the card, which usually clears within a few minutes. Could you try the payment again shortly?',
        sentAt: '22-Dec-2025, 4:10 AM',
      },
      {
        id: 'tm-1042-5',
        author: 'requester',
        authorName: 'Alex Thompson',
        body: 'Still failing. I have attached the error screen.',
        sentAt: '22-Dec-2025, 4:32 AM',
        attachmentName: 'checkout-error.png',
      },
    ],
  },
  {
    id: 't-1039',
    reference: 'TKT-1039',
    subject: 'Shipment stuck at origin depot',
    description: 'Order #ORD-88003 has had no carrier scan since the label was created on Dec 16.',
    requester: daniel,
    priority: 'urgent',
    status: 'pending',
    placement: 'inbox',
    channel: 'chat',
    categoryId: 'support',
    assigneeId: 'jane-smith',
    tags: ['Shipping', 'Escalated'],
    createdBy: 'Jane Smith',
    createdAt: '21-Dec-2025, 9:33 PM',
    updatedAt: '22-Dec-2025, 1:02 AM',
    dueOn: '22-Dec-2025',
    isOverdue: true,
    conversationId: '3',
    linkedChatSummary:
      'Customer: My order has not moved in four days. Tracking says "label created" and nothing since.\nMercury Bot: Sorry about the delay! Let me pull up the shipment for order #ORD-88003.',
    unreadReplies: 2,
    messages: [
      {
        id: 'tm-1039-1',
        author: 'requester',
        authorName: 'Daniel Okafor',
        body: 'My order has not moved in four days. Tracking still says label created.',
        sentAt: '21-Dec-2025, 9:33 PM',
      },
      {
        id: 'tm-1039-2',
        author: 'agent',
        authorName: 'Jane Smith',
        body: 'Carrier scan missing at the origin depot. Raised with logistics, waiting on a re-scan.',
        sentAt: '21-Dec-2025, 9:40 PM',
        isInternal: true,
      },
      {
        id: 'tm-1039-3',
        author: 'agent',
        authorName: 'Jane Smith',
        body: 'I have asked the carrier to re-scan the parcel and will update you as soon as it moves.',
        sentAt: '22-Dec-2025, 1:02 AM',
      },
      {
        id: 'tm-1039-4',
        author: 'requester',
        authorName: 'Daniel Okafor',
        body: 'It is still not moving. This is now a week late.',
        sentAt: '22-Dec-2025, 8:15 AM',
      },
    ],
  },
  {
    id: 't-1036',
    reference: 'TKT-1036',
    subject: 'Refund not received for returned jacket',
    description: 'Return received Dec 18 for order #ORD-88109. Refund has not settled to the original card.',
    requester: priya,
    priority: 'medium',
    status: 'open',
    placement: 'inbox',
    channel: 'chat',
    categoryId: 'finance',
    assigneeId: null,
    tags: ['Refund'],
    createdBy: 'Anisha Thapa',
    createdAt: '22-Dec-2025, 2:53 AM',
    updatedAt: '22-Dec-2025, 2:53 AM',
    dueOn: '24-Dec-2025',
    isOverdue: false,
    conversationId: '2',
    linkedChatSummary:
      'Customer: Hi! I returned a jacket two weeks ago and still have not seen the refund.\nMercury Bot: Thank you. I can see the return was received on Dec 18. Refunds settle to the original payment method within 5-7 business days.',
    unreadReplies: 0,
    messages: [
      {
        id: 'tm-1036-1',
        author: 'requester',
        authorName: 'Priya Sharma',
        body: 'I returned a jacket two weeks ago and still have not seen the refund.',
        sentAt: '22-Dec-2025, 2:53 AM',
      },
    ],
  },
  {
    id: 't-1044',
    reference: 'TKT-1044',
    subject: 'Bulk order pricing for 500+ units',
    description: 'Prospective customer asking about tiered pricing above 500 units.',
    requester: grace,
    priority: 'low',
    status: 'open',
    placement: 'inbox',
    channel: 'email',
    categoryId: 'finance',
    assigneeId: null,
    tags: ['Pricing'],
    createdBy: 'Email intake',
    createdAt: '22-Dec-2025, 7:20 AM',
    updatedAt: '22-Dec-2025, 7:20 AM',
    dueOn: '27-Dec-2025',
    isOverdue: false,
    unreadReplies: 1,
    messages: [
      {
        id: 'tm-1044-1',
        author: 'requester',
        authorName: 'Grace Lin',
        body: 'Hello, we are looking at an order of around 700 units. Do you offer volume pricing?',
        sentAt: '22-Dec-2025, 7:20 AM',
      },
    ],
  },
  {
    id: 't-1030',
    reference: 'TKT-1030',
    subject: 'Dashboard counter shows zero',
    description: 'Widget counter reads zero despite recent activity. Reproduced on staging.',
    requester: marcus,
    priority: 'high',
    status: 'on-hold',
    placement: 'inbox',
    channel: 'form',
    categoryId: 'technical',
    assigneeId: 'anisha-thapa',
    tags: ['Bug'],
    createdBy: 'Web form',
    createdAt: '19-Dec-2025, 11:04 AM',
    updatedAt: '21-Dec-2025, 4:12 PM',
    dueOn: '21-Dec-2025',
    isOverdue: true,
    unreadReplies: 0,
    messages: [
      {
        id: 'tm-1030-1',
        author: 'requester',
        authorName: 'Marcus Webb',
        body: 'The counter on my dashboard says zero but I have had plenty of activity this week.',
        sentAt: '19-Dec-2025, 11:04 AM',
      },
      {
        id: 'tm-1030-2',
        author: 'agent',
        authorName: 'Anisha Thapa',
        body: 'Reproduced on staging. Waiting on the platform team for a fix, so parking this on hold.',
        sentAt: '21-Dec-2025, 4:12 PM',
        isInternal: true,
      },
    ],
  },
  {
    id: 't-1021',
    reference: 'TKT-1021',
    subject: 'Invoice missing VAT number',
    description: 'Invoice issued without the company VAT number. Finance reissued it.',
    requester: alex,
    priority: 'low',
    status: 'solved',
    placement: 'inbox',
    channel: 'manual',
    categoryId: 'finance',
    assigneeId: 'anisha-thapa',
    tags: ['Billing'],
    createdBy: 'Ram Katwal',
    createdAt: '19-Dec-2025, 11:02 AM',
    updatedAt: '20-Dec-2025, 9:15 AM',
    dueOn: '22-Dec-2025',
    isOverdue: false,
    unreadReplies: 0,
    messages: [
      {
        id: 'tm-1021-1',
        author: 'requester',
        authorName: 'Alex Thompson',
        body: 'Our finance team needs the VAT number on the invoice for last month.',
        sentAt: '19-Dec-2025, 11:02 AM',
      },
      {
        id: 'tm-1021-2',
        author: 'agent',
        authorName: 'Anisha Thapa',
        body: 'Reissued with the VAT number included and emailed to your billing address.',
        sentAt: '20-Dec-2025, 9:15 AM',
      },
    ],
  },
  {
    id: 't-0998',
    reference: 'TKT-0998',
    subject: 'Carrier SLA review for Manchester depot',
    description: 'Third delayed shipment through the same depot this month. Logistics reviewed the carrier SLA.',
    requester: daniel,
    priority: 'medium',
    status: 'closed',
    placement: 'archive',
    channel: 'manual',
    categoryId: 'support',
    assigneeId: 'jane-smith',
    tags: ['Shipping'],
    createdBy: 'Jane Smith',
    createdAt: '08-Dec-2025, 4:31 PM',
    updatedAt: '10-Dec-2025, 10:00 AM',
    dueOn: '12-Dec-2025',
    isOverdue: false,
    unreadReplies: 0,
    messages: [
      {
        id: 'tm-0998-1',
        author: 'agent',
        authorName: 'Jane Smith',
        body: 'Raising a review of the Manchester depot after a third delay this month.',
        sentAt: '08-Dec-2025, 4:31 PM',
      },
      {
        id: 'tm-0998-2',
        author: 'agent',
        authorName: 'Jane Smith',
        body: 'Logistics have moved the route to a different carrier. Closing this out.',
        sentAt: '10-Dec-2025, 10:00 AM',
      },
    ],
  },
  {
    id: 't-1045',
    reference: 'TKT-1045',
    subject: 'CONGRATULATIONS you have won a free voucher!!!',
    description: 'Bulk promotional message caught by the spam filter.',
    requester: unknown,
    priority: 'low',
    status: 'open',
    placement: 'spam',
    channel: 'email',
    categoryId: 'support',
    assigneeId: null,
    tags: [],
    createdBy: 'Email intake',
    createdAt: '22-Dec-2025, 5:02 AM',
    updatedAt: '22-Dec-2025, 5:03 AM',
    dueOn: '25-Dec-2025',
    isOverdue: false,
    unreadReplies: 0,
    messages: [
      {
        id: 'tm-1045-1',
        author: 'requester',
        authorName: 'Deals Bot',
        body: 'Click here to claim your free voucher before it expires!!!',
        sentAt: '22-Dec-2025, 5:02 AM',
      },
    ],
  },
  {
    id: 't-1012',
    reference: 'TKT-1012',
    subject: 'Duplicate of TKT-1010',
    description: 'Requester submitted the same form twice within a minute.',
    requester: grace,
    priority: 'low',
    status: 'closed',
    placement: 'trash',
    channel: 'form',
    categoryId: 'support',
    assigneeId: null,
    tags: [],
    createdBy: 'Web form',
    createdAt: '17-Dec-2025, 2:11 PM',
    updatedAt: '17-Dec-2025, 2:40 PM',
    dueOn: '20-Dec-2025',
    isOverdue: false,
    trashedOn: '17-Dec-2025',
    unreadReplies: 0,
    messages: [
      {
        id: 'tm-1012-1',
        author: 'requester',
        authorName: 'Grace Lin',
        body: 'What is your return window?',
        sentAt: '17-Dec-2025, 2:11 PM',
      },
    ],
  },
  {
    id: 't-1046',
    reference: 'TKT-1046',
    subject: 'Refund request for order #4821',
    description: 'Came in as a plain email to support — no signature, so no name on file, just the reply-to address.',
    requester: guest,
    priority: 'medium',
    status: 'open',
    placement: 'inbox',
    channel: 'email',
    categoryId: 'finance',
    assigneeId: null,
    tags: ['Refund'],
    createdBy: 'Email intake',
    createdAt: '22-Dec-2025, 6:40 AM',
    updatedAt: '22-Dec-2025, 6:40 AM',
    dueOn: '24-Dec-2025',
    isOverdue: false,
    unreadReplies: 1,
    messages: [
      {
        id: 'tm-1046-1',
        author: 'requester',
        authorName: 'Guest',
        body: "I'd like a refund for order #4821 — it arrived damaged.",
        sentAt: '22-Dec-2025, 6:40 AM',
      },
    ],
  },
]
