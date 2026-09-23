import type { ReportDefinition, ReportGroup } from '../types'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const WEEKS = ['W44', 'W45', 'W46', 'W47', 'W48', 'W49', 'W50', 'W51']

export const reportGroupOrder: ReportGroup[] = [
  'Overview',
  'Chats',
  'AI Bot',
  'Tickets',
  'Agents',
  'Knowledge',
  'Export',
]

/**
 * Mercury's report catalogue.
 *
 * Modelled on the reports a support desk actually needs rather than copied
 * wholesale: LiveChat's Ecommerce group (achieved goals, tracked sales) is left
 * out because Mercury tracks no commerce, and an AI Bot group is added because
 * Mercury's bot handles chats on its own — containment, handoff reasons and
 * knowledge gaps are the numbers that decide whether it is working.
 */
export const reportDefinitions: ReportDefinition[] = [
  // ---------------------------------------------------------------- Overview
  {
    id: 'dashboard',
    group: 'Overview',
    title: 'Dashboard',
    description: 'The whole desk at a glance for the selected period.',
    stats: [
      { label: 'Total chats', value: '1,284', delta: '+12%', tone: 'good', hint: 'vs previous period' },
      { label: 'Handled by AI alone', value: '61%', delta: '+4pp', tone: 'good', hint: 'containment rate' },
      { label: 'Median first response', value: '1m 48s', delta: '-22s', tone: 'good', hint: 'human replies only' },
      { label: 'Open tickets', value: '38', delta: '+6', tone: 'warning', hint: '9 past their SLA' },
      { label: 'Chat satisfaction', value: '4.4 / 5', delta: '+0.1', tone: 'good', hint: '412 ratings' },
      { label: 'SLA compliance', value: '87%', delta: '-3pp', tone: 'warning', hint: 'target is 90%' },
    ],
    blocks: [
      {
        kind: 'line',
        title: 'Chat volume',
        caption: 'Conversations started each day, split by who answered them.',
        labels: DAYS,
        series: [
          { key: 'ai', label: 'Answered by AI', values: [112, 128, 134, 121, 141, 78, 64] },
          { key: 'agent', label: 'Answered by an agent', values: [64, 71, 68, 82, 79, 38, 29] },
        ],
      },
      {
        kind: 'bar',
        title: 'Tickets by status',
        caption: 'Where the current backlog sits.',
        labels: ['Finance', 'Support', 'Technical'],
        stacked: true,
        ordered: true,
        series: [
          { key: 'open', label: 'Open', values: [14, 11, 6] },
          { key: 'pending', label: 'Pending', values: [8, 9, 4] },
          { key: 'solved', label: 'Solved', values: [22, 26, 12] },
        ],
      },
    ],
  },

  // ------------------------------------------------------------------- Chats
  {
    id: 'chat-volume',
    group: 'Chats',
    title: 'Chat volume',
    description: 'How many conversations arrive, and through which channel.',
    stats: [
      { label: 'Total chats', value: '1,284', delta: '+12%', tone: 'good' },
      { label: 'Busiest day', value: 'Friday', hint: '220 chats' },
      { label: 'Quietest day', value: 'Sunday', hint: '93 chats' },
    ],
    blocks: [
      {
        kind: 'line',
        title: 'Chats per day',
        labels: DAYS,
        series: [{ key: 'chats', label: 'Chats started', values: [176, 199, 202, 203, 220, 116, 93] }],
      },
      {
        kind: 'bar',
        title: 'Chats by channel',
        caption: 'Which surfaces customers actually reach you on.',
        labels: WEEKS,
        series: [
          { key: 'whatsapp', label: 'WhatsApp', values: [88, 94, 101, 96, 112, 118, 124, 131] },
          { key: 'instagram', label: 'Instagram', values: [42, 47, 44, 52, 55, 58, 61, 64] },
          { key: 'facebook', label: 'Facebook', values: [31, 28, 33, 30, 34, 32, 36, 38] },
        ],
      },
    ],
  },
  {
    id: 'response-times',
    group: 'Chats',
    title: 'Response & resolution times',
    description: 'How long customers wait, and how long a chat takes to finish.',
    stats: [
      { label: 'Median first response', value: '1m 48s', delta: '-22s', tone: 'good' },
      { label: 'Median resolution', value: '11m 20s', delta: '+1m', tone: 'warning' },
      { label: 'Longest wait', value: '14m 02s', tone: 'critical', hint: 'Friday, 4:10 PM' },
    ],
    blocks: [
      {
        kind: 'line',
        title: 'Minutes to respond and resolve',
        caption: 'Both series are minutes, so they share one axis.',
        unit: 'm',
        labels: DAYS,
        series: [
          { key: 'first', label: 'First response', values: [2.4, 2.1, 1.9, 2.0, 3.1, 1.4, 1.2] },
          { key: 'resolution', label: 'Full resolution', values: [10.2, 11.4, 11.0, 12.1, 14.0, 8.2, 7.4] },
        ],
      },
    ],
  },
  {
    id: 'missed-chats',
    group: 'Chats',
    title: 'Missed & abandoned',
    description: 'Chats nobody answered, and customers who gave up queueing.',
    stats: [
      { label: 'Missed chats', value: '46', delta: '+9', tone: 'critical', hint: '3.6% of all chats' },
      { label: 'Queue abandonment', value: '7.2%', delta: '+1.1pp', tone: 'warning' },
      { label: 'Median queue wait', value: '52s', delta: '+11s', tone: 'warning' },
    ],
    blocks: [
      {
        kind: 'bar',
        title: 'Missed and abandoned per day',
        labels: DAYS,
        series: [
          { key: 'missed', label: 'Missed', values: [4, 6, 5, 7, 14, 6, 4] },
          { key: 'abandoned', label: 'Abandoned in queue', values: [7, 9, 8, 11, 21, 9, 6] },
        ],
      },
      {
        kind: 'hbar',
        title: 'When chats get missed',
        caption: 'Missed chats by hour of day — staffing gaps show up here.',
        rows: [
          { label: '16:00 – 18:00', value: 18 },
          { label: '12:00 – 14:00', value: 11 },
          { label: '09:00 – 11:00', value: 7 },
          { label: '20:00 – 22:00', value: 6 },
          { label: '00:00 – 02:00', value: 4 },
        ],
      },
    ],
  },
  {
    id: 'chat-satisfaction',
    group: 'Chats',
    title: 'Chat satisfaction',
    description: 'What customers thought after the conversation ended.',
    stats: [
      { label: 'Average rating', value: '4.4 / 5', delta: '+0.1', tone: 'good' },
      { label: 'Ratings collected', value: '412', hint: '32% of finished chats' },
      { label: 'Negative ratings', value: '28', delta: '-5', tone: 'good' },
    ],
    blocks: [
      {
        kind: 'bar',
        title: 'Rating distribution',
        labels: ['1 star', '2 stars', '3 stars', '4 stars', '5 stars'],
        series: [{ key: 'ratings', label: 'Ratings', values: [11, 17, 46, 138, 200] }],
      },
      {
        kind: 'line',
        title: 'Average rating over time',
        labels: WEEKS,
        series: [{ key: 'csat', label: 'Average rating', values: [4.1, 4.2, 4.2, 4.3, 4.1, 4.3, 4.4, 4.4] }],
      },
    ],
  },
  {
    id: 'tags-usage',
    group: 'Chats',
    title: 'Tags usage',
    minScope: 'team',
    description: 'Which tags agents apply, and what that says about demand.',
    blocks: [
      {
        kind: 'hbar',
        title: 'Most used tags',
        rows: [
          { label: 'Billing', value: 214 },
          { label: 'Shipping', value: 186 },
          { label: 'Refund', value: 142 },
          { label: 'Pricing', value: 98 },
          { label: 'Products', value: 76 },
          { label: 'Bug', value: 41 },
          { label: 'Escalated', value: 33 },
        ],
      },
    ],
  },
  {
    id: 'chat-availability',
    group: 'Chats',
    title: 'Availability & coverage',
    minScope: 'team',
    description: 'How much of the week had someone accepting chats.',
    stats: [
      { label: 'Coverage', value: '92%', delta: '+2pp', tone: 'good', hint: 'of business hours' },
      { label: 'Uncovered hours', value: '13h', delta: '-3h', tone: 'good' },
    ],
    blocks: [
      {
        kind: 'bar',
        title: 'Hours with an agent accepting chats',
        unit: 'h',
        labels: DAYS,
        series: [
          { key: 'covered', label: 'Covered', values: [12, 12, 11, 12, 10, 6, 4] },
          { key: 'uncovered', label: 'Uncovered', values: [0, 0, 1, 0, 2, 4, 6] },
        ],
      },
    ],
  },

  // ------------------------------------------------------------------ AI Bot
  {
    id: 'ai-containment',
    group: 'AI Bot',
    title: 'AI containment',
    minScope: 'team',
    description: 'Share of chats the AI finished without a human stepping in.',
    stats: [
      { label: 'Containment rate', value: '61%', delta: '+4pp', tone: 'good', hint: '784 of 1,284 chats' },
      { label: 'Handed to a human', value: '39%', delta: '-4pp', tone: 'good' },
      { label: 'Median AI reply', value: '4s', delta: '-1s', tone: 'good' },
    ],
    blocks: [
      {
        kind: 'line',
        title: 'Containment over time',
        caption: 'Percentage of chats closed by the AI alone.',
        unit: '%',
        labels: WEEKS,
        series: [{ key: 'containment', label: 'Contained by AI', values: [48, 51, 53, 55, 54, 58, 60, 61] }],
      },
      {
        kind: 'bar',
        title: 'Chats by who finished them',
        labels: WEEKS,
        stacked: true,
        ordered: true,
        series: [
          { key: 'ai', label: 'AI alone', values: [62, 71, 78, 84, 82, 96, 104, 112] },
          { key: 'supervised', label: 'AI with a supervisor', values: [21, 24, 22, 26, 28, 24, 26, 28] },
          { key: 'agent', label: 'Taken over by an agent', values: [48, 45, 47, 42, 42, 40, 38, 36] },
        ],
      },
    ],
  },
  {
    id: 'ai-handoffs',
    group: 'AI Bot',
    title: 'Handoff reasons',
    minScope: 'team',
    description: 'Why the AI asked for a person — the fastest route to fixing it.',
    stats: [
      { label: 'Total handoffs', value: '500', delta: '-38', tone: 'good' },
      { label: 'Most common reason', value: 'Low confidence', hint: '41% of handoffs' },
    ],
    blocks: [
      {
        kind: 'hbar',
        title: 'Handoffs by reason',
        rows: [
          { label: 'Low confidence', value: 205 },
          { label: 'Repeated fallback', value: 132 },
          { label: 'Customer asked for a person', value: 106 },
          { label: 'Negative sentiment', value: 57 },
        ],
      },
      {
        kind: 'line',
        title: 'Handoffs per week',
        labels: WEEKS,
        series: [{ key: 'handoffs', label: 'Handoffs', values: [78, 74, 71, 68, 70, 64, 58, 50] }],
      },
    ],
  },
  {
    id: 'ai-knowledge-gaps',
    group: 'AI Bot',
    title: 'Knowledge gaps',
    minScope: 'team',
    description: 'Questions the AI could not answer. Each row is a candidate for Chatbot Knowledge.',
    stats: [
      { label: 'Unanswered questions', value: '148', delta: '-24', tone: 'good' },
      { label: 'Distinct topics', value: '19', hint: 'after grouping similar wording' },
    ],
    blocks: [
      {
        kind: 'table',
        title: 'Top unanswered questions',
        caption: 'Sorted by how often customers asked.',
        columns: ['Question', 'Asked', 'Handoffs', 'Suggested source'],
        rows: [
          ['Do you ship to PO boxes?', 34, 31, 'Shipping rates by region'],
          ['How do I change the VAT number on an invoice?', 27, 24, 'New article needed'],
          ['What is the warranty on refurbished units?', 21, 19, 'Warranty terms (failed to index)'],
          ['Can I split payment across two cards?', 18, 16, 'New article needed'],
          ['Do you price match?', 14, 11, 'Pricing page'],
          ['How long do refunds take to appear?', 12, 6, 'Returns and refunds policy'],
        ],
      },
    ],
  },
  {
    id: 'ai-confidence',
    group: 'AI Bot',
    title: 'Answer confidence',
    minScope: 'team',
    description: 'How sure the AI was about the answers it gave.',
    stats: [
      { label: 'Median confidence', value: '78%', delta: '+3pp', tone: 'good' },
      { label: 'Below the 60% floor', value: '14%', delta: '-2pp', tone: 'warning', hint: 'these get flagged' },
    ],
    blocks: [
      {
        kind: 'bar',
        title: 'Confidence distribution',
        caption: 'Buckets are ordered, so they use a single-hue ramp.',
        labels: ['0–20%', '20–40%', '40–60%', '60–80%', '80–100%'],
        series: [{ key: 'answers', label: 'Answers', values: [24, 61, 96, 342, 761] }],
      },
    ],
  },

  // ----------------------------------------------------------------- Tickets
  {
    id: 'ticket-volume',
    group: 'Tickets',
    title: 'Ticket volume & backlog',
    description: 'What comes in, what gets closed, and what is piling up.',
    stats: [
      { label: 'Created', value: '164', delta: '+18', tone: 'neutral' },
      { label: 'Solved', value: '141', delta: '+22', tone: 'good' },
      { label: 'Open backlog', value: '38', delta: '+6', tone: 'warning' },
    ],
    blocks: [
      {
        kind: 'line',
        title: 'Created vs solved',
        caption: 'When the created line sits above solved, the backlog grows.',
        labels: WEEKS,
        series: [
          { key: 'created', label: 'Created', values: [18, 21, 19, 24, 22, 20, 19, 21] },
          { key: 'solved', label: 'Solved', values: [14, 19, 20, 18, 21, 19, 15, 15] },
        ],
      },
    ],
  },
  {
    id: 'ticket-sla',
    group: 'Tickets',
    title: 'SLA compliance',
    description: 'Whether tickets are being answered and resolved in time.',
    stats: [
      { label: 'SLA compliance', value: '87%', delta: '-3pp', tone: 'warning', hint: 'target is 90%' },
      { label: 'Breached', value: '9', delta: '+4', tone: 'critical' },
      { label: 'Median time to close', value: '1d 6h', delta: '+3h', tone: 'warning' },
    ],
    blocks: [
      {
        kind: 'bar',
        title: 'Within SLA vs breached',
        labels: WEEKS,
        stacked: true,
        ordered: true,
        series: [
          { key: 'within', label: 'Within SLA', values: [16, 19, 18, 21, 19, 18, 16, 18] },
          { key: 'breached', label: 'Breached', values: [2, 2, 1, 3, 3, 2, 3, 3] },
        ],
      },
      {
        kind: 'hbar',
        title: 'Breaches by category',
        rows: [
          { label: 'Technical', value: 11 },
          { label: 'Finance', value: 5 },
          { label: 'Support', value: 3 },
        ],
      },
    ],
  },
  {
    id: 'ticket-priority',
    group: 'Tickets',
    title: 'Tickets by priority',
    description: 'Whether urgent work is actually being treated as urgent.',
    blocks: [
      {
        kind: 'bar',
        title: 'Open tickets by priority',
        caption: 'Priority is an ordered scale, so it uses the single-hue ramp.',
        labels: ['Urgent', 'High', 'Medium', 'Low'],
        series: [{ key: 'open', label: 'Open tickets', values: [4, 11, 16, 7] }],
      },
      {
        kind: 'line',
        title: 'Median hours to first reply, by priority',
        unit: 'h',
        labels: WEEKS,
        series: [
          { key: 'urgent', label: 'Urgent', values: [1.1, 0.9, 1.2, 0.8, 1.4, 1.0, 0.9, 0.8] },
          { key: 'high', label: 'High', values: [3.2, 3.6, 3.1, 4.0, 4.4, 3.4, 3.2, 3.0] },
          { key: 'medium', label: 'Medium', values: [8.1, 9.2, 8.4, 10.1, 11.0, 9.4, 8.8, 8.2] },
        ],
      },
    ],
  },

  // ------------------------------------------------------------------ Agents
  {
    id: 'agent-performance',
    group: 'Agents',
    title: 'Agent performance',
    minScope: 'team',
    description: 'Volume, speed and satisfaction per agent.',
    blocks: [
      {
        kind: 'table',
        title: 'Per-agent totals',
        columns: ['Agent', 'Chats', 'Tickets solved', 'Median first reply', 'Satisfaction'],
        rows: [
          ['Jane Smith', 268, 61, '1m 32s', '4.6 / 5'],
          ['Anisha Thapa', 241, 48, '1m 58s', '4.4 / 5'],
          ['Aspen George', 154, 22, '2m 24s', '4.2 / 5'],
          ['Angel Curtis', 96, 10, '3m 06s', '4.0 / 5'],
        ],
      },
      {
        kind: 'bar',
        title: 'Chats handled',
        labels: ['Jane Smith', 'Anisha Thapa', 'Aspen George', 'Angel Curtis'],
        series: [{ key: 'chats', label: 'Chats handled', values: [268, 241, 154, 96] }],
      },
    ],
  },
  {
    id: 'agent-workload',
    group: 'Agents',
    title: 'Workload & capacity',
    minScope: 'team',
    description: 'Concurrent chat limits against what agents actually carried.',
    stats: [
      { label: 'Average utilisation', value: '68%', delta: '+7pp', tone: 'warning' },
      { label: 'At capacity', value: '1 agent', tone: 'critical', hint: 'Nolan Donin, 5 of 5' },
    ],
    blocks: [
      {
        kind: 'bar',
        title: 'Peak concurrent chats vs limit',
        caption: 'Both series are chat counts, so one axis serves both.',
        labels: ['Jane Smith', 'Nolan Donin', 'Mia Anderson', 'Aspen George', 'Angel Curtis'],
        series: [
          { key: 'peak', label: 'Peak concurrent', values: [4, 5, 3, 3, 1] },
          { key: 'limit', label: 'Configured limit', values: [4, 5, 4, 3, 3] },
        ],
      },
    ],
  },
  {
    id: 'agent-activity',
    group: 'Agents',
    title: 'Activity & availability',
    minScope: 'team',
    description: 'Time spent accepting chats, and time logged out.',
    blocks: [
      {
        kind: 'bar',
        title: 'Hours by availability state',
        unit: 'h',
        labels: ['Jane Smith', 'Anisha Thapa', 'Aspen George', 'Angel Curtis'],
        stacked: true,
        ordered: true,
        series: [
          { key: 'accepting', label: 'Accepting chats', values: [34, 31, 28, 12] },
          { key: 'notAccepting', label: 'Not accepting', values: [4, 6, 5, 3] },
          { key: 'offline', label: 'Offline', values: [2, 3, 7, 25] },
        ],
      },
    ],
  },
  {
    id: 'staffing',
    group: 'Agents',
    title: 'Staffing forecast',
    minScope: 'team',
    description: 'Expected demand next week against the agents currently rostered.',
    stats: [
      { label: 'Forecast peak', value: '32 chats/h', hint: 'Friday, 16:00' },
      { label: 'Shortfall', value: '2 agents', tone: 'warning', hint: 'Friday afternoon' },
    ],
    blocks: [
      {
        kind: 'line',
        title: 'Forecast demand vs rostered capacity',
        caption: 'Both series are chats per hour, so they share one axis.',
        labels: DAYS,
        series: [
          { key: 'forecast', label: 'Forecast demand', values: [22, 24, 25, 26, 32, 14, 11] },
          { key: 'capacity', label: 'Rostered capacity', values: [24, 24, 24, 24, 24, 16, 12] },
        ],
      },
    ],
  },

  // --------------------------------------------------------------- Knowledge
  {
    id: 'knowledge-usage',
    group: 'Knowledge',
    title: 'Internal article usage',
    minScope: 'team',
    description: 'Which playbooks agents actually open, and which are going stale.',
    stats: [
      { label: 'Articles', value: '6' },
      { label: 'Need review', value: '2', tone: 'warning', hint: '1 out of date, 1 review due' },
    ],
    blocks: [
      {
        kind: 'table',
        title: 'Articles by views',
        columns: ['Article', 'Views', 'Review state', 'Owner'],
        rows: [
          ['Refund authority limits', 531, 'Review due', 'James Katwal'],
          ['Card decline triage', 412, 'Up to date', 'Jane Smith'],
          ['When to escalate to logistics', 268, 'Up to date', 'Jane Smith'],
          ['Handling a chat the AI escalated', 96, 'Up to date', 'Anisha Thapa'],
          ['Legacy VAT invoice process', 47, 'Out of date', 'James Katwal'],
          ['First week as a CSR', 8, 'Draft', 'Anisha Thapa'],
        ],
      },
    ],
  },
  {
    id: 'knowledge-coverage',
    group: 'Knowledge',
    title: 'Chatbot source coverage',
    minScope: 'team',
    description: 'Which trained sources are actually answering customers.',
    stats: [
      { label: 'Live sources', value: '6', hint: 'of 10 total' },
      { label: 'Failed to train', value: '2', tone: 'critical', hint: 'answering nothing' },
    ],
    blocks: [
      {
        kind: 'hbar',
        title: 'Answers served per source',
        rows: [
          { label: 'Help centre (crawl)', value: 1240 },
          { label: 'Returns and refunds policy', value: 508 },
          { label: 'Pricing page', value: 396 },
          { label: 'Product catalogue 2026', value: 312 },
          { label: 'Article: balance check', value: 214 },
          { label: 'Article: disputes', value: 91 },
        ],
      },
    ],
  },

  // ------------------------------------------------------------------ Export
  {
    id: 'generate-report',
    group: 'Export',
    title: 'Generate report',
    description: 'Export any of the above as CSV or a PDF summary for the selected period.',
    isTool: true,
  },
  {
    id: 'scheduled-reports',
    group: 'Export',
    title: 'Scheduled reports',
    description: 'Have a report emailed to a group on a recurring schedule.',
    isTool: true,
    blocks: [
      {
        kind: 'table',
        title: 'Existing schedules',
        columns: ['Report', 'Frequency', 'Recipients', 'Next run'],
        rows: [
          ['Dashboard', 'Every Monday, 08:00', 'Leadership', '29-Dec-2025'],
          ['SLA compliance', 'Daily, 18:00', 'Support leads', '23-Dec-2025'],
          ['Knowledge gaps', 'Every Friday, 16:00', 'Content team', '26-Dec-2025'],
        ],
      },
    ],
  },
]
