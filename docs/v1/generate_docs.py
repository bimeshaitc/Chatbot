# -*- coding: utf-8 -*-
"""
Generates the Mercury v1 PM deliverables:
  - Mercury_V1_Feature_Listing.docx / .xlsx
  - Mercury_V1_User_Stories_Frontend.docx
  - Mercury_V1_User_Stories_Backend.docx
  - Mercury_V1_User_Stories_AI_Engineer.docx

Run: python generate_docs.py   (from this folder)
Source data is intentionally hardcoded here (not imported) so the docs are a
frozen snapshot of the v1 scope at the time this was generated.
"""
import os
from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = HERE

BRAND = RGBColor(0x1B, 0x5E, 0x20)
BRAND_HEX = "1B5E20"
LIGHT_HEX = "EAF2FD"

# ---------------------------------------------------------------------------
# FEATURE LISTING DATA
# ---------------------------------------------------------------------------
# Columns: id, module, name, description, capabilities(list), ai, roles, priority, status, permissions
FEATURES = [
    ("FEAT-001", "Dashboard", "Workspace Overview Dashboard",
     "Landing page giving any signed-in user a snapshot of workspace activity.",
     ["Stat cards with plain-language definitions", "Conversations trend chart (received vs resolved)",
      "Tickets-by-category breakdown", "Recent conversations list", "Top agents leaderboard (volume, AHT, CSAT)"],
     "No", "Owner, Admin, CSR Admin, CSR", "Must Have", "Implemented (prototype data)", "None (ungated)"),

    ("FEAT-002", "User Management", "Team Member Management",
     "Admins manage who has access to the workspace and what they can do.",
     ["Invite user", "Change role / access", "Set concurrent chat capacity", "Assign groups",
      "Create / remove workspace groups", "Suspend / reactivate member", "Remove member",
      "Resend / revoke invite", "Filter by status/role"],
     "No", "CSR Admin (view/capacity/groups), Admin (+invite/role/suspend/remove), Owner (+seats)",
     "Must Have", "Implemented (prototype data)",
     "people.view, people.invite, people.changeRole, people.setCapacity, people.manageGroups, people.suspend, people.remove"),

    ("FEAT-003", "User Management", "Seat & Plan Allocation",
     "Seats are allocated to the workspace externally; the workspace fills/frees them and can request more.",
     ["View seat usage vs total", "Request additional seats / plan change", "View pending change request status"],
     "No", "Owner (request), Admin+ (view)", "Should Have", "Implemented (prototype data)", "people.seats.request, workspace.billing.view"),

    ("FEAT-004", "Roles & Permissions", "Role Permission Matrix",
     "Read-only matrix of every permission against every role, generated live from the permission config so it can never drift from what is actually enforced.",
     ["Filter by category", "Search by label/description/id", "Toggle 'only show differing rows'"],
     "No", "Owner, Admin, CSR Admin (view only)", "Should Have", "Implemented", "workspace.roles.view"),

    ("FEAT-005", "Chat", "Live Chat Inbox",
     "Unified live-chat workspace with four inboxes instead of a sidebar submenu: My chats, AI Bot, Team chats, Archive.",
     ["My / AI Bot / Team / Archive inboxes with secondary filter chips",
      "AI inbox filters: handoff, unattended, supervised, low-confidence",
      "Customer profile & notes panel", "Unread / tag indicators"],
     "Yes (bot queue surfaced as its own inbox)", "CSR (own), CSR Admin (+team), Admin (+all)",
     "Must Have", "Implemented (prototype data)", "chats.view.own/.team/.all, bot.queue.view"),

    ("FEAT-006", "Chat", "AI Bot Handling & Handoff",
     "Conversations flow through bot -> supervised -> agent handling states, with confidence scoring and an explicit handoff reason once a human is needed.",
     ["Bot confidence score + matched intent shown to supervisor", "Fallback counter",
      "Handoff reasons: low-confidence, explicit-request, repeated-fallback, negative-sentiment",
      "Take over from bot / supervise / hand back to AI", "Bot can resolve & close a chat with zero human touch"],
     "Yes (core)", "CSR and up (takeOver permission)", "Must Have", "Implemented (prototype data)", "chats.takeOver, bot.queue.view"),

    ("FEAT-007", "Chat", "Chat Actions",
     "The actions an agent takes on a live conversation.",
     ["Reply / internal note (composer mode toggle)", "Change status (active/waiting/resolved/abandoned/closed)",
      "Transfer to another agent", "Ban customer (locks composer, thread stays readable)", "Tag conversation"],
     "No", "CSR (reply/status/transfer), CSR Admin (+ban)", "Must Have", "Implemented (prototype data)",
     "chats.reply, chats.changeStatus, chats.transfer, chats.banCustomer"),

    ("FEAT-008", "Chat", "Raise Ticket from Chat",
     "Escalate a live chat into a ticket, capturing a one-time snapshot of the conversation.",
     ["Create ticket from within the chat panel", "Captures chat summary snapshot (not live-linked)",
      "Collects customer email if not already known (name intentionally not required in chat)"],
     "No", "CSR and up (tickets.create)", "Must Have", "Implemented (prototype data)", "tickets.create"),

    ("FEAT-009", "Chat", "Agent-Assist: Ask Knowledge & Suggested Reply",
     "In-chat panel that searches Internal Knowledge and suggests trained FAQs relevant to the conversation's matched bot intent.",
     ["Ask Knowledge search panel", "Suggested-reply dialog ranking FAQs by matched intent",
      "Editable draft only (never auto-sent)"],
     "Yes (ranking/search, deterministic in this prototype)", "CSR and up", "Should Have",
     "Implemented (prototype data)", "chats.reply, knowledge.internal.view"),

    ("FEAT-010", "Tickets", "Ticket Inbox & Lifecycle Management",
     "The canonical ticket store for the app; tickets raised from chat land in the same store as tickets created manually.",
     ["Create ticket (manual or from chat)", "Reply (public) / internal note",
      "Set status: open, pending, on-hold, solved, closed", "Set priority: low, medium, high, urgent",
      "Add tags", "Mark thread read"],
     "No", "CSR (own), CSR Admin (+team), Admin (+all)", "Must Have", "Implemented (prototype data)",
     "tickets.view.own/.team/.all, tickets.create, tickets.reply, tickets.setStatus"),

    ("FEAT-011", "Tickets", "Ticket Assignment & Routing",
     "Assign or reassign a ticket to an eligible agent.",
     ["Assign / reassign / unassign", "Eligibility check (agent's channel access + ticket access level)"],
     "No", "CSR Admin and up", "Must Have", "Implemented (prototype data)", "tickets.assign"),

    ("FEAT-012", "Tickets", "Ticket Placement & Trash Management",
     "Placement (inbox/archive/spam/trash) is modeled separately from status, so a ticket can be finished and still filed.",
     ["Move between inbox / archive / spam / trash", "Restore from trash",
      "Permanently delete (trash only, irreversible)", "30-day trash auto-purge countdown", "Bulk move / bulk patch"],
     "No", "CSR Admin (file), Admin (+permanent delete)", "Should Have", "Implemented (prototype data)",
     "tickets.file, tickets.delete"),

    ("FEAT-013", "Visitors", "Visitor Tracking",
     "Read-only analytics on website visitors, identified or anonymous.",
     ["Visitor list", "Visitor detail: location, device, browser, referrer, first/last seen, visit count",
      "Linked conversations / tickets for that visitor"],
     "No", "CSR Admin and up", "Could Have", "Implemented (prototype data, read-only)", "workspace.visitors.view"),

    ("FEAT-014", "Category", "Category Management",
     "Shared taxonomy used to categorize tickets and conversations.",
     ["Add category (records added-by / added-on)", "List / view categories"],
     "No", "Admin, Owner", "Should Have", "Implemented (prototype data)", "workspace.categories.manage"),

    ("FEAT-015", "Tags", "Shared Tag Library",
     "One canonical tag list (name + color) used by both Chat and Tickets, replacing separate per-feature tag lists.",
     ["Add tag (name + color from fixed palette)", "List tags"],
     "No", "Admin, Owner", "Should Have", "Implemented (prototype data)", "workspace.tags.manage"),

    ("FEAT-016", "Canned Responses", "Canned Response Library",
     "Manageable library of canned replies the chat composer reads from live.",
     ["Add canned response (title, body, /shortcut, visibility, groups)", "Shared vs. private visibility",
      "Group-scoped visibility for shared responses", "Use via composer shortcut"],
     "No", "CSR (use), CSR Admin and up (manage)", "Should Have", "Implemented (prototype data)",
     "chats.cannedResponses.manage"),

    ("FEAT-017", "Internal Knowledge", "Internal Knowledge Base",
     "Staff-only knowledge base (playbooks, procedures, policy docs) agents read while handling chats. Never fed to the bot or reachable by customers.",
     ["Articles tab: create/edit, category, groups, pin, review status (current/due/stale/draft)",
      "Documents tab: upload/add internal document", "Links tab: add internal reference link"],
     "No", "CSR (view), CSR Admin and up (manage)", "Must Have", "Implemented (prototype data)",
     "knowledge.internal.view, knowledge.internal.manage"),

    ("FEAT-018", "Internal Knowledge", "Knowledge Search & Reply Draft",
     "Deterministic keyword search over internal knowledge, surfaced through the 'Ask Knowledge' panel; turns a match into an editable reply draft.",
     ["Weighted term scoring (title/summary/category/body)", "Pinned-article boost, stale/draft penalty",
      "Weak-match threshold to avoid false confidence", "Draft flags internal-only language as 'needs rewrite'"],
     "Yes (deterministic scoring, explicitly not an LLM in this prototype)", "CSR and up",
     "Should Have", "Implemented (prototype logic)", "knowledge.internal.view"),

    ("FEAT-019", "Chatbot Knowledge", "Bot Training Sources",
     "The AI bot's actual training data: documents and crawled URLs it indexes and answers from.",
     ["Add source document", "Add source URL with crawl depth", "Enable / disable a source ('use for answers')",
      "Retrain a source", "Delete a source", "Training status: indexed/indexing/queued/failed + failure reason",
      "Public vs. signed-in audience setting"],
     "Yes (core)", "CSR (view), Admin (manage), Admin (retrain)", "Must Have", "Implemented (prototype data)",
     "knowledge.bot.view, knowledge.bot.manage, knowledge.bot.retrain"),

    ("FEAT-020", "Chatbot Knowledge", "Bot FAQ Management",
     "Structured FAQs the bot can answer from directly, each tagged with the intents it matches.",
     ["Add / edit FAQ (category, question, answer)", "Tag FAQ with matched bot intents",
      "Feeds Chat's suggested-reply ranking"],
     "Yes (core)", "Admin and up", "Must Have", "Implemented (prototype data)", "knowledge.bot.manage"),

    ("FEAT-021", "Chatbot Knowledge", "Training Telemetry",
     "Per-source indexing and usage telemetry.",
     ["Chunks indexed per source", "Answers served per source", "Last trained on timestamp"],
     "Yes", "CSR (view) and up", "Should Have", "Implemented (prototype data)", "knowledge.bot.view"),

    ("FEAT-022", "Campaigns", "Proactive Campaign Management",
     "Outbound/proactive messaging campaigns with basic performance stats.",
     ["Create campaign (title, category, message)", "Status lifecycle: draft, scheduled, active, inactive",
      "Stats: views, clicks, CTR, conversions, audience"],
     "No", "Admin, Owner", "Could Have", "Implemented (prototype data)", "workspace.campaigns.manage"),

    ("FEAT-023", "Reports", "Reporting Dashboards",
     "Analytics dashboards grouped by area, built from report definitions with stat tiles and charts.",
     ["Groups: Overview, Chats, AI Bot, Tickets, Agents, Knowledge, Export",
      "Charts: line, bar, horizontal bar, table", "Own/team/all scoped data visibility"],
     "Yes (AI Bot report group)", "CSR (own data), CSR Admin (+team), Admin (+all)", "Must Have",
     "Implemented (prototype data)", "reports.view.own/.team/.all"),

    ("FEAT-024", "Reports", "Report Export & Scheduling",
     "Actions on top of a report, gated independently of how much data the viewer can see.",
     ["Export report (CSV/PDF)", "Schedule a recurring report"],
     "No", "CSR Admin (export), Admin (+schedule)", "Should Have", "Implemented (prototype UI)",
     "reports.export, reports.schedule"),

    ("FEAT-025", "Bot Setting", "Widget Appearance & Content Configuration",
     "Visual and messaging configuration for the customer-facing chat widget.",
     ["Primary / secondary color", "Launcher icon (preset or custom)", "Widget position (left/right)",
      "Company name, header text, greeting message, away message, logo"],
     "No", "CSR Admin (view), Admin (edit)", "Must Have", "Implemented (prototype data)",
     "bot.settings.view, bot.settings.edit"),

    ("FEAT-026", "Bot Setting", "Widget Visibility & Availability",
     "Rules for when and how the widget icon appears, and what happens when no agent is available.",
     ["Visibility: always / hide-until-active / always-hidden", "Always-available toggle",
      "Preview-only agents-online/away simulation"],
     "No", "Admin (edit)", "Should Have", "Implemented (prototype data)", "bot.settings.edit"),

    ("FEAT-027", "Bot Setting", "Pre-Chat & Post-Chat Forms",
     "Optional data-collection forms at the start and end of a widget chat.",
     ["Pre-chat form: ask-name / ask-email toggles", "Post-chat survey enable toggle"],
     "No", "Admin (edit)", "Should Have", "Implemented (prototype data)", "bot.settings.edit"),

    ("FEAT-028", "Bot Setting", "AI Widget Conversational Flow",
     "The rule-based flow simulating the bot's conversation with a visitor: attempt to answer, check if it helped, retry once, then escalate.",
     ["Topic-matched canned attempts (password/login, billing/refund, shipping/order)",
      "Trigger precedence: high-risk safety > explicit agent request > privacy/DSAR request > backend-action request",
      "Backend-action requests (refund, cancel order, change billing) skip escalation menu and go straight to a ticket",
      "Availability-aware human handoff (bot itself has no hours)"],
     "Yes (core)", "Admin (configures), all customers (uses via widget)", "Must Have",
     "Implemented (prototype/simulated, deterministic — not an LLM)", "bot.settings.view"),

    ("FEAT-029", "Bot Setting", "Install Code & Live Preview",
     "Embeddable install snippet and an interactive live preview of the configured widget, including the simulator.",
     ["View/copy install code", "Live preview panel", "Interactive widget chat simulator"],
     "Yes (preview uses the same simulator as FEAT-028)", "Admin (install code)", "Should Have",
     "Implemented (prototype)", "bot.installCode.view"),

    ("FEAT-030", "Activities Log", "Workspace Activity Log & Notifications",
     "Workspace-wide audit trail and a notifications panel for the signed-in user.",
     ["Activity feed: actor, action, target, note, timestamp", "Filter feed",
      "Notifications panel with read/unread state"],
     "No", "CSR Admin and up (log), all (own notifications)", "Should Have", "Implemented (prototype data)",
     "workspace.activityLog.view"),

    ("FEAT-031", "Auth", "Authentication & Session",
     "Sign-in and session handling. NOTE: flagged to PM — this snapshot has the auth store/token model but no visible login screen; row describes intended v1 behavior for a real backend to implement.",
     ["Login with credentials", "Session persistence", "Token refresh", "Protected-route redirect when signed out",
      "Logout"],
     "No", "All roles", "Must Have", "Partially implemented (store only — confirm with PM before backend build)", "None (pre-auth)"),
]

FEATURE_COLUMNS = ["ID", "Module", "Feature Name", "Description", "Key Capabilities",
                    "AI / Bot Involvement", "User Roles", "Priority", "Status", "Governing Permission(s)"]

# ---------------------------------------------------------------------------
# USER STORY DATA
# ---------------------------------------------------------------------------
# Each story: id, title, as_a, i_want, so_that, acceptance(list), edge_cases(list)

def story(id_, title, as_a, i_want, so_that, acceptance, edge_cases):
    return {"id": id_, "title": title, "as_a": as_a, "i_want": i_want, "so_that": so_that,
            "acceptance": acceptance, "edge_cases": edge_cases}


FRONTEND_STORIES = [
    story("FE-01", "Sign in and session handling", "user of any role",
          "sign in with my credentials and stay signed in across page reloads",
          "I don't have to re-authenticate constantly while still being signed out when my session truly ends",
          ["Login form validates required fields before submit",
           "Successful login redirects to the last-intended page (or Dashboard)",
           "Session persists across a page refresh",
           "Any route other than login redirects to login when signed out"],
          ["Submitting with empty fields shows inline errors, not a network call",
           "An expired/invalid token on load silently redirects to login rather than rendering a broken page",
           "Rapid double-submit of the login form does not fire two requests",
           "Browser back button after logout does not restore a cached authenticated page"]),

    story("FE-02", "Dashboard overview widgets", "signed-in user",
          "see a snapshot of workspace activity as soon as I land",
          "I know what needs attention without navigating anywhere",
          ["Stat cards render with a definition available on hover/tap",
           "Trend chart and category breakdown render from live data",
           "Top agents leaderboard sorts by chats handled"],
          ["Zero-data state (new workspace) shows an empty/placeholder state, not a broken chart",
           "A stat card's info icon works on touch devices, not just hover",
           "Numbers update without a full page reload if the underlying data changes"]),

    story("FE-03", "Team member list & filters", "Admin or CSR Admin",
          "browse and filter the team member list",
          "I can find the person I need to manage quickly",
          ["Filter by status (active/invited/suspended) and by role",
           "List shows role, groups, capacity, and current active-chat count"],
          ["Filtering to zero results shows an explicit empty state, not a blank table",
           "A member with an outstanding invite shows 'Invited' status and a resend/revoke action, not an edit form",
           "List remains usable with 0 members and with 500+ members (pagination or virtualization)"]),

    story("FE-04", "Invite / edit user dialog", "Admin",
          "invite a new team member or edit an existing one's role, capacity and groups in one dialog",
          "I don't need separate flows for onboarding vs. adjusting access",
          ["Role picker only offers roles the current viewer is allowed to assign",
           "Channel-access control (chat/tickets/both) only appears when role is CSR",
           "Capacity control disabled/read-only for a viewer without people.setCapacity"],
          ["Changing a CSR's role away from CSR clears/ignores the now-irrelevant channel setting",
           "Attempting to invite past the seat allocation limit blocks submit with a clear reason",
           "Editing the workspace's only Owner disables role change with an explanit reason (not silently)",
           "Lowering someone's capacity below their current active-chat count warns but does not forcibly reassign chats"]),

    story("FE-22", "Manage groups dialog", "Admin or CSR Admin",
          "add and remove the workspace's groups from a dedicated dialog",
          "I can keep the group vocabulary current without asking engineering to edit code",
          ["Entry point is visible only to a viewer holding people.manageGroups",
           "Adding a group makes it immediately available in every group picker (invite, edit user, canned responses, knowledge base)",
           "Attempting to remove a group in use shows how many records use it and disables the action until they're reassigned"],
          ["Duplicate group name (case-insensitive) is rejected with an inline error, not silently accepted",
           "Empty or whitespace-only name is rejected",
           "Renaming is not offered in this dialog — see BE-24's note on why"]),

    story("FE-05", "Role permission matrix viewer", "Owner, Admin, or CSR Admin",
          "see exactly what each role can and cannot do in one table",
          "I can explain access decisions and spot gaps without reading code",
          ["Table is generated from the same permission config the app enforces (no hand-maintained duplicate)",
           "Search filters by label, description, or permission id",
           "'Only show differing rows' toggle hides rows where every role agrees"],
          ["A permission split into own/team/all scope tiers renders all tiers clearly, not just a yes/no",
           "Search with no matches shows an empty state with a way to clear the filter"]),

    story("FE-06", "Chat inbox rail", "CSR and up",
          "switch between My chats, AI Bot, Team chats, and Archive with clear counts",
          "I always know where my attention is needed",
          ["Each inbox shows an unread/attention count where relevant",
           "AI Bot inbox exposes handoff/unattended/supervised/low-confidence filter chips",
           "Selecting a conversation opens it without losing my place in the list"],
          ["A CSR restricted to tickets-only (no chat channel) does not see the Chat nav item at all",
           "Switching inboxes while a chat is open does not lose an unsent draft reply",
           "An inbox with zero conversations shows a helpful empty state per inbox (not one generic message)"]),

    story("FE-07", "Chat conversation view & composer", "CSR and up",
          "read the full conversation and reply or leave an internal note from one composer",
          "I don't context-switch between viewing and responding",
          ["Composer has an explicit reply-vs-note mode toggle with distinct visual treatment",
           "Sending a reply appends it to the thread optimistically",
           "Internal notes are visually distinguished from customer-facing messages"],
          ["Composer is disabled (not just visually) when the customer is banned",
           "An anonymous visitor renders a stable placeholder name, never blank or 'null'",
           "Long messages wrap/scroll without breaking the layout",
           "Switching conversations mid-type prompts before discarding an unsent draft"]),

    story("FE-08", "Chat actions: transfer, takeover, ban, tag", "CSR and up (per-permission)",
          "take a bot-handled chat, transfer to a teammate, ban an abusive customer, or tag a conversation",
          "I can manage a conversation's lifecycle without leaving the chat view",
          ["Transfer target list excludes the current holder",
           "Take-over action is available whenever handling is 'bot' or 'supervised'",
           "Ban action requires confirmation and immediately locks the composer"],
          ["Action buttons the viewer lacks permission for are hidden, not just disabled with no explanation",
           "Transferring to an agent at their capacity limit warns before confirming",
           "Banning does not hide chat history — it must remain readable for audit purposes"]),

    story("FE-09", "Raise ticket from chat", "CSR and up",
          "escalate the chat I'm in into a ticket without retyping everything",
          "the ticket has full context from the moment it's needed",
          ["Dialog pre-fills a chat summary snapshot the agent can edit before submitting",
           "Prompts for customer email only if not already known",
           "Does not require a customer name"],
          ["Submitting without an email (when unknown) blocks with a clear validation message",
           "The captured summary snapshot never includes internal-only notes or system messages",
           "Creating the ticket does not close or alter the original chat"]),

    story("FE-10", "Agent-assist: Ask Knowledge / suggested reply", "CSR and up",
          "search internal knowledge or see a suggested reply while in a chat",
          "I can answer accurately without leaving the conversation",
          ["Suggested FAQ is the one matching the conversation's bot intent, shown first",
           "Search results below the weak-match threshold say so explicitly rather than showing low-quality matches",
           "Any suggested draft is inserted into the composer as editable text, never auto-sent"],
          ["A result flagged 'needs rewrite' (internal-only language) shows a visible warning before insertion",
           "A stale/draft source is visually marked so the agent doesn't quote it with false confidence",
           "No results found state suggests raising a ticket instead of leaving the agent stuck"]),

    story("FE-11", "Ticket list & detail view", "CSR and up",
          "browse tickets in my scope and open one to see the full thread",
          "I can work my queue efficiently",
          ["List reflects own/team/all scope based on my role",
           "Detail view shows requester, priority, status, tags, assignee, and full message thread",
           "A ticket originating from chat shows its linked chat summary"],
          ["Requester with no name on file displays a clear 'Guest' fallback, never blank",
           "Unassigned tickets only appear once my scope reaches team (not at 'own' scope)",
           "Opening a ticket marks it read without requiring a separate action"]),

    story("FE-12", "Ticket actions: status, priority, assign, placement", "CSR and up (per-permission)",
          "change a ticket's status/priority, assign it, or file it to archive/spam/trash",
          "I can manage the ticket lifecycle end to end",
          ["Sending a public reply automatically moves status from open to pending",
           "Assign list only offers agents eligible for tickets (channel + access level)",
           "Trash items show a days-remaining-until-purge indicator"],
          ["Permanent delete is only reachable from Trash and requires explicit confirmation",
           "Bulk actions on a mixed-permission selection only apply to items the viewer can actually act on",
           "Restoring from trash does not guess/reset status — it returns exactly as it was"]),

    story("FE-13", "Visitor tracking list & detail", "CSR Admin and up",
          "look up a visitor's history before deciding who should handle them",
          "I can make an informed routing/handling decision",
          ["List shows identified and anonymous visitors with clear differentiation",
           "Detail view links to that visitor's conversations and tickets"],
          ["Read-only: no edit affordances are shown anywhere on this page",
           "A visitor matched to a conversation/ticket by name/email only (not a stable ID) is labeled as such, not presented as guaranteed-accurate"]),

    story("FE-14", "Category & tag management", "Admin, Owner",
          "add categories and tags used across chat and tickets",
          "the team works from one consistent taxonomy",
          ["Add-category records who added it and when",
           "Tag picker offers a fixed, consistent color palette"],
          ["Duplicate tag/category names are prevented or clearly flagged",
           "Deleting a tag/category in use (once delete exists) warns about affected items rather than silently orphaning them"]),

    story("FE-15", "Canned response library & composer shortcut", "CSR (use), CSR Admin+ (manage)",
          "manage a shared canned-response library and use it via shortcut in the composer",
          "the team replies faster and consistently",
          ["Manage screen supports shared vs. private visibility and group scoping",
           "Composer shortcut search matches on /shortcut and title"],
          ["A private response is invisible to anyone but its owner, including in search",
           "A shared response scoped to a group I'm not in does not appear in my composer"]),

    story("FE-16", "Internal knowledge base management", "CSR (view), CSR Admin+ (manage)",
          "create and organize articles, documents, and links for staff use",
          "the team has a reliable internal reference separate from what the bot can see",
          ["Three tabs: Articles, Documents, Links, each with its own add flow",
           "Article editor includes category, groups, pin, and review status"],
          ["Pinned articles surface first in any listing",
           "A stale/draft-status article is visually flagged wherever it appears",
           "Group-restricted content never appears to a viewer outside those groups"]),

    story("FE-17", "Chatbot knowledge management", "CSR (view), Admin (manage/retrain)",
          "manage the documents, URLs, and FAQs the bot trains from",
          "the bot's answers stay accurate and current",
          ["Source list shows status (indexed/indexing/queued/failed) with failure reason when failed",
           "Enable/disable toggle clearly explains it stops the bot answering from that source without deleting it",
           "FAQ editor supports tagging matched intents"],
          ["Retrain and manage are separate actions/permissions — a viewer with only one sees only that one",
           "A failed source shows the failure reason prominently, not buried in a tooltip",
           "Disabling a source used heavily (high answers-served) still requires the same confirmation as any other"]),

    story("FE-18", "Campaign management", "Admin, Owner",
          "create and monitor proactive outreach campaigns",
          "I can run and evaluate campaigns without a separate tool",
          ["Campaign card shows status and key stats (views, clicks, CTR, conversions)",
           "Status lifecycle is clearly visualized (draft -> scheduled -> active -> inactive)"],
          ["A draft campaign with no audience configured is blocked from being scheduled",
           "Stats show a sensible zero-state for a campaign that hasn't started yet"]),

    story("FE-19", "Reports dashboards", "CSR (own data) and up",
          "view charts and stat tiles grouped by area (Overview, Chats, AI Bot, Tickets, Agents, Knowledge)",
          "I can understand performance at the right level of detail for my role",
          ["Data respects own/team/all scope automatically based on role",
           "Charts render line, bar, horizontal-bar and table types consistently"],
          ["A CSR sees only their own numbers even if a chart type is normally a comparison view",
           "Export and Schedule actions are visible only to viewers with those specific permissions, independent of data scope"]),

    story("FE-20", "Bot setting configuration & live preview", "CSR Admin (view), Admin (edit)",
          "configure the widget's appearance, availability, and forms with a live preview beside the form",
          "I can see exactly what customers will experience before saving",
          ["Every tab (Appearance, Content, Behavior/Availability, Forms) updates the live preview instantly",
           "Read-only viewer sees the same tabs with inputs disabled, not hidden"],
          ["Preview's simulated agent-online/away state is clearly labeled as preview-only, not real presence",
           "Notification sound failing to play (autoplay-blocked) never surfaces an error to the admin"]),

    story("FE-21", "Activities log & notifications", "CSR Admin+ (log), all (own notifications)",
          "see a workspace audit trail and my own notifications",
          "I can track what happened and stay on top of items needing me",
          ["Activity feed is filterable and shows actor/action/target/timestamp",
           "Notifications panel distinguishes read vs. unread"],
          ["An empty activity feed (new workspace) shows a clear empty state",
           "Marking a notification read does not require leaving the panel"]),
]

BACKEND_STORIES = [
    story("BE-01", "Authentication & session — Mercury 360 handoff", "Mercury (a Mercury 360 workspace tenant)",
          "to delegate credential authentication to Mercury 360 and integrate with the session it issues",
          "users sign in once against Mercury 360's identity system and Mercury never stores or validates credentials itself",
          ["Unauthenticated access to any route redirects to Mercury 360's hosted login (OAuth2 Authorization Code + PKCE) with client_id, redirect_uri, state, code_challenge",
           "Mercury 360 redirects back to GET /auth/callback?code=...&state=...; Mercury validates state, exchanges the code for tokens server-side, and sets its own httpOnly, Secure, SameSite=Lax session cookie",
           "GET /session/me returns the signed-in user's identity, role, and workspace membership for the frontend to hydrate its auth store",
           "Session is silently refreshed against Mercury 360 before expiry or on a 401, with concurrent refresh attempts deduplicated into a single in-flight call",
           "POST /auth/logout clears Mercury's local session and calls Mercury 360's session-revocation endpoint"],
          ["A failed or cancelled Mercury 360 login redirects back with one generic 'sign-in wasn't completed' state — no distinction leaked between wrong password, unknown user, or cancellation",
           "A state mismatch or a replayed/expired authorization code on /auth/callback fails closed: no session is created, user is sent back to Mercury 360 login",
           "If Mercury 360 revokes or expires the underlying token — including a mid-session account suspension — the next request Mercury makes on the user's behalf is rejected, and Mercury drops its own session immediately rather than trusting its cookie",
           "Mercury 360 being unreachable during callback or refresh fails closed to the login redirect with a distinct 'identity service unavailable' message — never proceeds with a stale or empty session"]),

    story("BE-02", "RBAC: role catalog, defaults & scope enforcement service", "every other backend service",
          "a single, shared way to check role permissions, resolve own/team/all scope, and read each role's default grants",
          "access rules and default values are enforced and served consistently everywhere instead of being reimplemented per endpoint",
          ["Every mutating endpoint checks the caller's permission before acting, not just the UI",
           "Scope resolution (own/team/all) is computed server-side from the caller's role and group membership",
           "CSR channel restriction (chat vs. tickets access) is enforced at the API layer, not only in the UI",
           "Exactly four fixed roles are recognized — Owner, Admin, CSR Admin, CSR — each an additive superset of the role below it (CSR Admin ⊇ CSR, Admin ⊇ CSR Admin, Owner ⊇ Admin); no custom roles in this phase",
           "GET /roles returns all four roles with their resolved permission lists, so the frontend's Roles & Permissions matrix renders from the API instead of a bundled constant",
           "New users default to role CSR on invite unless the inviter — who must hold people.changeRole — explicitly grants a role they are themselves entitled to hold",
           "Two per-agent attributes exist only for role=CSR: channels ('chat'/'tickets', default both) and ticketAccess ('view'/'edit', default 'edit') — CSR Admin and above ignore both and always get full access"],
          ["A request for data outside the caller's resolved scope returns 403, not a silently filtered empty list, to make the boundary visible in logs",
           "Role changes take effect on the next request without requiring the user to log out",
           "A permission check failure never leaks whether the resource exists (403 vs 404 chosen consistently)",
           "A workspace can never be left with zero Owners — demoting or removing the last Owner is rejected server-side",
           "Widening a role's default bundle takes effect for every existing holder on their next request — permissions resolve live, never snapshotted at invite time",
           "A CSR with ticketAccess='view' keeps tickets.view.* but loses create/reply/setStatus/assign/file/delete, and is excluded from ticket-assignee eligibility entirely",
           "Owner's seat-request/billing-view grants are reserved in this model but have no backend behind them yet — see BE-19 (deferred)"]),

    story("BE-03", "File & document storage service", "knowledge-base, user-management, bot-settings frontends",
          "a shared upload/storage endpoint for KB documents, logos, and custom launcher icons",
          "file uploads across features behave consistently and securely",
          ["Uploads are validated by type/size before accepting",
           "Stored files are served via authenticated/signed URLs where the content is not meant to be public"],
          ["A widget logo or launcher icon (customer-facing) is served publicly; an internal KB document is not — the service must distinguish these",
           "Oversized or disallowed file types are rejected with a clear error before any storage write"]),

    story("BE-04", "Activity log & notification service", "activities-log frontend / all frontends",
          "workspace actions to be recorded to an audit log and relevant ones pushed as notifications",
          "there's a reliable audit trail and users are alerted to things needing them",
          ["Every permission-gated mutation writes an activity log entry (actor, action, target, timestamp)",
           "Notification creation is scoped to the relevant recipient(s) only"],
          ["Log writes are append-only — no update/delete endpoint should exist for audit integrity",
           "A burst of related actions (e.g. bulk ticket move) logs as a summarized entry, not hundreds of near-duplicate rows"]),

    story("BE-05", "Category & tag taxonomy service", "Chatbot platform",
          "a shared category and tag system for Chat and Tickets",
          "both features use the same consistent taxonomy",
          ["The system maintains one shared list of categories and one shared list of tags",
           "Chat and Ticket records reference categories and tags by their unique IDs",
           "Tag colors can use arbitrary color values",
           "Categories and tags are managed at the workspace/tenant level",
           "Changes to a category or tag are reflected across all Chat and Ticket records that reference it",
           "Categories and tags can be disabled without removing their existing references",
           "Disabled categories and tags cannot be assigned to new Chats or Tickets"],
          ["Rename/recolor: updating a category or tag updates it everywhere it is referenced without creating duplicates",
           "Disable in use: a category or tag that is already assigned to Chats or Tickets can be disabled; existing records continue to display the disabled category/tag",
           "Disabled category/tag: it cannot be assigned to new Chats or Tickets but remains available on existing records",
           "Re-enable: a disabled category or tag can be enabled again and become available for new assignments",
           "Invalid reference: Chat or Ticket records cannot reference a category or tag that does not exist or belongs to another workspace",
           "Cross-workspace access: a category or tag from another workspace cannot be assigned to a Chat or Ticket"]),

    story("BE-06", "Team member management API", "Admin-role client",
          "endpoints to invite, edit, suspend, and remove team members",
          "workspace membership can be managed from the UI",
          ["POST /members/invite creates a pending invite against an existing platform account only",
           "PATCH /members/:id updates role/capacity/groups/channels within the caller's own permission ceiling",
           "POST /members/:id/suspend and /remove are distinct operations with different reversibility"],
          ["Inviting an email with no existing platform account returns a specific, actionable error (not a generic failure)",
           "Removing a member frees their seat but never deletes their underlying platform account",
           "An Admin cannot grant a role above their own (server-enforced, not just hidden in UI)",
           "The last remaining Owner cannot be demoted or removed by anyone, including another Owner, without a transfer step"]),

    story("BE-24", "Group management API", "Admin-role client",
          "endpoints to create and delete workspace groups",
          "the routing/visibility vocabulary can be managed without engineering involvement",
          ["POST /groups creates a new group scoped to the workspace",
           "DELETE /groups/:id removes a group only when no member, canned response, knowledge base entry, or shift still references it",
           "Group names are unique within a workspace, case-insensitively"],
          ["Deleting a group still referenced by any record returns a specific, actionable error naming how many records are affected",
           "Creating a group with a name that already exists (case-insensitively) is rejected, not silently deduplicated",
           "Renaming a group is out of scope for this story — cascading the rename across every feature that stores the group name is separate work"]),

    story("BE-07", "Chat conversation service & real-time messaging", "chat frontend",
          "conversations and messages to be persisted and delivered in real time",
          "agents see new messages without polling and nothing is lost on reconnect",
          ["Messages persist with author, timestamp, and internal/customer-facing flag",
           "New-message delivery uses a push channel (websocket/SSE) with reconnect/backfill support",
           "Conversation status transitions (active/waiting/resolved/abandoned/closed) are recorded with who/when"],
          ["A message sent while the recipient is briefly disconnected is delivered on reconnect, not dropped",
           "Two agents replying to the same conversation within the same second both appear in correct order",
           "An anonymous visitor's identity (once captured) updates the conversation without creating a duplicate record",
           "Abandoned (customer left) vs. closed (agent ended it) are recorded as distinct terminal states for accurate reporting"]),

    story("BE-08", "Chat routing & assignment engine", "chat frontend / bot engine",
          "conversations to route to the right pool or agent based on scope, channel access, and group",
          "no conversation is invisible to everyone or visible to the wrong people",
          ["Unassigned bot-pool conversations are visible at every scope tier (own/team/all) to anyone with bot.queue.view",
           "Transfer target list is computed server-side from eligible agents (channel access + capacity), not just filtered client-side",
           "assignedAgentId and handling state are updated atomically together"],
          ["A CSR restricted to tickets-only channel gets zero chat-routing eligibility, enforced server-side",
           "Transferring to an agent at full capacity is rejected or requires explicit override, not silently queued",
           "assignedAgentId and handling can never disagree (e.g. assigned to null while handling='agent') — enforced by a single write path"]),

    story("BE-09", "Ticket service", "tickets frontend",
          "CRUD and lifecycle operations on tickets, independent of placement",
          "ticket status accurately reflects work state regardless of where it's filed",
          ["Ticket has independent status and placement fields",
           "A public reply auto-transitions open -> pending server-side, not just in the UI",
           "Trash items auto-purge after 30 days via a scheduled job"],
          ["Permanent delete is irreversible and requires the item to currently be in trash placement",
           "The 30-day purge job is idempotent and safe to run more than once without double-deleting",
           "A ticket's requester can be nameless (email-only) by design — this is not invalid data"]),

    story("BE-10", "Ticket assignment & routing engine incl. eligibility", "tickets frontend",
          "server-side validation of who is eligible to receive a ticket assignment",
          "tickets are never assigned to someone who can't actually work them",
          ["Assignment checks the target's channel access (tickets) and ticket-access level (view vs edit)",
           "Unassigned tickets only surface at team scope and above, matching that assignment starts at CSR Admin"],
          ["Assigning to a since-suspended or removed member is rejected with a clear error, not a silent no-op",
           "Bulk-assign partially fails gracefully (reports which items succeeded/failed) rather than all-or-nothing opaque failure"]),

    story("BE-11", "Chat-to-ticket escalation API", "chat frontend",
          "an endpoint that creates a ticket from a conversation and snapshots the relevant history",
          "the ticket has context without being permanently coupled to the live chat",
          ["Snapshot captures visible messages only — excludes internal notes and system messages",
           "Snapshot is captured once at creation time and never updates from the original chat afterward"],
          ["Creating a ticket does not modify or close the source conversation",
           "Missing customer email blocks ticket creation server-side (not just a UI validation) since a ticket needs a reply channel",
           "Extremely long conversation history is truncated/summarized rather than stored unbounded"]),

    story("BE-12", "Visitor tracking & identity resolution service", "visitors frontend",
          "visitor sessions to be tracked and (best-effort) linked to conversations/tickets",
          "the team can see a visitor's history before engaging",
          ["Visitor record captures location, device, browser, referrer, first/last seen, visit count",
           "Linking to conversations/tickets is attempted via name/email match"],
          ["No stable cross-feature person ID exists in this scope — linking is best-effort and must be labeled as such to the client, not presented as guaranteed",
           "An anonymous visitor who later identifies themselves mid-session is reconciled, not duplicated",
           "This service is read/track-only in v1 — no destructive visitor-editing endpoints should be built"]),

    story("BE-13", "Canned response library service", "chat frontend",
          "a canned-response store with per-item visibility rules",
          "agents only see responses relevant and permitted to them",
          ["Private responses are visible only to their owner",
           "Shared responses with no group restriction are visible workspace-wide",
           "Shared responses scoped to specific groups are visible only to overlapping-group members"],
          ["Visibility filtering happens server-side (search/list endpoints), not just hidden client-side",
           "A shortcut collision (two responses with the same /shortcut visible to the same agent) is prevented or resolved deterministically"]),

    story("BE-14", "Internal knowledge base service", "knowledge-base frontend",
          "storage and retrieval for staff-only articles, documents, and links with review-status metadata",
          "the team has governed, current internal reference content",
          ["Articles carry category, groups, pin flag, and review status (current/due/stale/draft)",
           "Content respects group-based visibility server-side"],
          ["Stale/draft content is still retrievable (for editing) but must be flagged in any read response used for search/suggestion",
           "A document/link add validates the source is accessible/well-formed before saving"]),

    story("BE-15", "Chatbot training data ingestion pipeline", "bot-training frontend / AI engine",
          "an ingestion pipeline for training documents and URLs that produces indexed, retrievable chunks",
          "the bot has an accurate, current knowledge base to answer from",
          ["Uploading a document or adding a URL enqueues an indexing job (status: queued -> indexing -> indexed/failed)",
           "A failed job records a specific, actionable failure reason",
           "Disabling a source stops it from being used for answers without deleting its indexed data",
           "Retrain re-runs ingestion for an existing source and updates lastTrainedOn"],
          ["A source that fails repeatedly surfaces this clearly rather than silently retrying forever",
           "Re-indexing an updated URL/document does not leave orphaned old chunks being served",
           "Crawl depth is bounded/configurable to avoid runaway crawling on 'add URL'"]),

    story("BE-16", "Widget/bot settings configuration service", "bot-settings frontend / widget runtime",
          "persisted widget configuration that both the admin UI and the live customer-facing widget read",
          "changes an admin makes actually take effect on the real widget",
          ["Settings persist per-workspace (appearance, content, availability, forms)",
           "Widget runtime reads the same settings object the admin UI edits, no duplicate config path"],
          ["Publishing a settings change does not require redeploying the widget snippet",
           "Invalid settings (e.g. malformed color) are rejected server-side, not just in the form"]),

    story("BE-17", "Campaign service & stats aggregation", "campaigns frontend",
          "campaign CRUD plus aggregated performance stats",
          "campaign performance can be reported on accurately",
          ["Campaign stores lifecycle status and target audience definition",
           "Stats (views/clicks/CTR/conversions) are computed from underlying event data, not hand-entered"],
          ["A campaign with zero audience configured cannot be scheduled/activated server-side",
           "Stats aggregation is idempotent against duplicate event delivery"]),

    story("BE-18", "Reporting & analytics aggregation service", "reports frontend",
          "pre-aggregated report data respecting the caller's own/team/all scope",
          "reports load quickly and never leak data outside the caller's permitted scope",
          ["Each report definition's data query is scoped server-side by the caller's resolved scope, mirroring chats/tickets",
           "Export and schedule are separate authorization checks from data-read access"],
          ["A CSR's 'own' scoped report never includes any other agent's identifying data, even in aggregate rounding edge cases",
           "Scheduled report delivery failures (e.g. bad destination) are retried with backoff and eventually surfaced, not silently dropped"]),

    story("BE-20", "Public widget bootstrap & visitor session", "embedded website widget (unauthenticated visitor)",
          "to start a session against my workspace's Mercury backend using the site's install code, without requiring a login",
          "any visitor to the website can start chatting without creating an account",
          ["POST /widget/session (public, no auth) takes a site key from the install snippet plus the visitor's page URL, validates the site key belongs to an active workspace, and issues a short-lived, workspace-scoped visitor token",
           "The visitor token is the only credential the widget ever holds; it can read/write only its own conversation, nothing else",
           "The same call returns the widget settings needed to render (colors, greeting, position, pre-chat form config), sourced from the widget/bot settings service, so the widget never hardcodes or guesses them",
           "A returning visitor (existing local session in their browser) reconnects to their still-open conversation instead of starting a new one"],
          ["An invalid or unknown site key returns one generic failure and the widget renders nothing — it never confirms or denies which workspaces exist",
           "A site key valid for workspace A, embedded on a domain not in that workspace's allowed-domain list, is rejected — a copied snippet can't be used to pull someone else's widget onto an unrelated site",
           "Visitor-session creation is rate-limited per IP and per site key, since this is a public, unauthenticated endpoint",
           "A visitor token expiring mid-visit triggers a silent re-bootstrap, never a visible error"]),

    story("BE-21", "Visitor-side real-time messaging channel", "embedded website widget",
          "to send and receive chat messages in real time using my visitor session",
          "a visitor's message reaches an agent (or the bot) immediately, and replies appear immediately in the widget — the same experience the admin side gets",
          ["The widget opens the same real-time push channel used on the agent side, scoped to only its own conversation via the visitor token",
           "Every message the widget sends is the same conversation record an agent sees in the admin Chat inbox — one shared store, never a separate visitor-side copy synced later",
           "The bot answers first automatically through the same conversational engine used everywhere else, with no special-casing for 'this came from the widget'",
           "File/image attachments from the visitor go through the shared file storage service with a public-write, private-read policy"],
          ["Closing the browser tab mid-conversation doesn't lose it — it's still there and resumable if the visitor returns",
           "A message sent while the widget is briefly disconnected is queued client-side and delivered on reconnect, not silently dropped",
           "A visitor messaging a workspace with no agents ever online and no bot configured still gets a clear 'we'll get back to you' state, never a channel that just looks broken"]),

    story("BE-22", "Visitor-initiated ticket creation (no chat required)", "embedded website widget / standalone contact form",
          "an endpoint to submit a ticket directly, without a live chat having happened first",
          "a visitor who'd rather not chat can still reach the team",
          ["POST /widget/tickets takes subject, description, and the visitor's name/email, using the visitor session from BE-20, and creates a ticket through the same ticket service used everywhere else — channel recorded as 'widget-form', distinct from 'chat' or 'manual'",
           "The ticket appears in the admin Tickets inbox immediately, exactly like any other, with the visitor's email as the reply channel",
           "A confirmation with a reference number is returned to the visitor (and optionally emailed) so they can follow up on it later"],
          ["A missing or invalid email is rejected before the ticket is created — a ticket support can't reply to isn't useful",
           "The same visitor session submitting many tickets in a short window is rate-limited, same protection as any public unauthenticated form",
           "Submitting from a page outside the workspace's allowed-domain list is rejected, same rule as BE-20"]),

    story("BE-23", "\"Talk to a human\" request & handover flow (visitor side)", "embedded website widget",
          "a way to explicitly ask for a human agent, and to know clearly what's happening while that request is in flight",
          "the handoff from bot to human — or bot to ticket, when nobody's available — is never ambiguous from the visitor's side",
          ["POST /widget/conversations/:id/request-human, using the visitor session, triggers the same handoff decision as the agent-side routing engine — the visitor requests 'a person', never a specific agent",
           "When an agent is available, the conversation is queued/assigned and the widget receives 'connecting' then 'connected' over the same real-time channel, with the agent's name once connected",
           "When no agent is available, the widget is told to collect the visitor's email instead, and that request becomes a ticket through BE-22 rather than sitting in a dead queue — one consistent 'we'll follow up by email' outcome whether the visitor asked directly or the bot exhausted its attempts",
           "The bot's existing handoff triggers (explicit request, repeated fallback, a safety/high-risk signal, a request needing a real backend action) all resolve through this one endpoint and state machine, not four different code paths"],
          ["A visitor whose request is still queued when they close and reopen the widget resumes into the same queued/connecting state, not a fresh request",
           "Two rapid 'talk to a human' clicks from the same visitor collapse into one request, not two queue entries",
           "An agent who was 'connected' going offline mid-conversation (crash, lost connection) re-queues the visitor for another agent rather than leaving them talking to nobody",
           "The safety/high-risk trigger bypasses the normal 'connecting' UI and jumps straight to an available-now path or, if truly nobody is reachable, an urgent ticket — it never silently falls back to the routine 'we'll email you' outcome"]),

    # --- Deferred: not part of the serial BE-01..BE-23 build sequence. Billing
    # isn't a real feature yet (matches the frontend, where this whole surface
    # is hidden behind the V2 app-version switch and invisible by default).
    # Owner's people.seats.request / workspace.billing.view grants stay
    # reserved on the role model (BE-02) but have nothing behind them until
    # this is picked up.
    story("BE-19", "Seat & plan allocation service", "billing/owner client",
          "seat totals and plan tier to be tracked with a request/approval workflow for changes",
          "seat usage never exceeds what's actually been purchased",
          ["GET /billing/seats returns total, used, plan, renewal date, and any pending change",
           "POST /billing/seats/request records a requested change without altering the active total",
           "Invite creation is blocked once used == total"],
          ["A pending change request does not grant extra seats until explicitly approved externally",
           "Approving a downgrade below current usage is rejected until usage is reduced first",
           "Concurrent invite requests near the seat limit do not both succeed and overshoot the cap (race condition)"]),
]

AI_STORIES = [
    story("AI-01", "Bot conversational engine: intent understanding & confidence scoring", "chat handling system",
          "the bot to interpret a visitor's message and produce an intent with a confidence score",
          "the system can decide whether the bot should answer or hand off to a human",
          ["Every inbound message produces a matched intent (or none) and a confidence score 0-1",
           "Confidence below the low-confidence threshold (0.6 in the prototype) is a first-class signal, not just a low number to log"],
          ["Ambiguous messages matching two intents nearly equally do not oscillate between them turn to turn",
           "Non-English or garbled input degrades to a graceful low-confidence handoff rather than a wrong-confidence answer",
           "A message combining two distinct requests (e.g. billing + shipping) is not force-fit into a single intent"]),

    story("AI-02", "Bot handoff decision engine", "chat handling system",
          "a clear, auditable reason whenever a conversation moves from bot to human",
          "supervisors and reporting can distinguish why the bot stopped handling a chat",
          ["Handoff reason is one of: low-confidence, explicit-request, repeated-fallback, negative-sentiment",
           "Repeated-fallback counts consecutive failures to help and triggers handoff at a defined threshold",
           "Handoff reason is recorded and visible to the agent taking over"],
          ["A visitor who explicitly asks for a human is handed off immediately regardless of confidence, even mid-sentence on an otherwise on-track topic",
           "Fallback counter resets appropriately once the bot successfully helps, so one early stumble doesn't force an unnecessary handoff later",
           "Two handoff triggers firing on the same message (e.g. explicit-request AND negative-sentiment) resolve to one reason via a defined precedence, not both/random"]),

    story("AI-03", "High-risk / safety trigger detection & override routing", "chat handling system",
          "certain high-risk signals (fraud, security breach, self-harm, threats, legal) to always override normal bot flow",
          "genuinely urgent or sensitive situations are never left with the bot or a scripted response",
          ["High-risk detection runs first, before any other trigger check, and short-circuits normal flow",
           "A detected high-risk message routes to an immediate human/appropriate-resource path, not a canned reply"],
          ["High-risk detection outranks even an explicit 'let me talk to a bot only' preference — safety overrides stated preference",
           "False positives (e.g. a customer joking) still route safely — the cost of a false positive here is acceptable, false negative is not",
           "A high-risk phrase appearing inside an otherwise unrelated long message is still caught, not only at message start"]),

    story("AI-04", "Backend-action detection -> auto-ticket routing", "chat handling system",
          "requests the bot cannot itself fulfill (refund, cancel order, change billing/address, close account) to skip the normal escalation menu",
          "customers aren't given false choices for things only a human backend action can do",
          ["Detected backend-action requests route straight to ticket creation, bypassing the standard 3-option escalation menu",
           "The bot still gathers relevant details (order number, reason) before handing off, rather than an empty handoff"],
          ["A backend-action request combined with an unrelated question splits correctly: the action goes to a ticket, the question still gets answered if possible",
           "Detecting a backend-action keyword inside a hypothetical/past-tense sentence ('I refunded someone once') does not falsely trigger routing"]),

    story("AI-05", "Privacy / DSAR request detection & routing", "chat handling system",
          "privacy requests (GDPR/CCPA, 'forget me', opt-out) to be recognized and routed to the correct team",
          "compliance-sensitive requests are handled correctly and consistently, not improvised by the bot",
          ["Privacy-pattern detection routes to a dedicated queue/team distinct from general support",
           "The bot confirms receipt of the request to the visitor before handoff"],
          ["A privacy request phrased informally ('delete my info please') is still recognized, not just formal legal phrasing",
           "This routing takes precedence over normal low-confidence handoff, since misrouting a DSAR has compliance consequences"]),

    story("AI-06", "Knowledge ingestion & indexing pipeline for chatbot training", "bot-training system",
          "documents and URLs to be processed into retrievable, chunked, indexed content",
          "the bot can answer from current source material rather than stale or unindexed data",
          ["Ingestion produces a chunk count and a queryable index per source",
           "Status transitions (queued -> indexing -> indexed/failed) are observable in real time by the admin UI"],
          ["A source that changes after initial indexing is re-crawled/re-chunked on retrain without leaving stale chunks servable",
           "Extremely large documents are chunked within defined size bounds rather than producing a single unusable mega-chunk",
           "A disabled source's chunks are excluded from retrieval immediately, not after the next reindex cycle"]),

    story("AI-07", "FAQ intent tagging & retrieval ranking", "chat suggested-reply system",
          "FAQs to be tagged with the intents they answer and ranked accordingly when suggesting a reply",
          "the agent sees the single most relevant FAQ first instead of a generic list",
          ["FAQ tagged with matched intents is prioritized when that intent is matched on the live conversation",
           "Disabled FAQs are excluded from ranking entirely, matching that the bot itself would never answer from them"],
          ["A FAQ matching multiple intents ranks correctly for whichever intent is actually active on this conversation, not just its first tag",
           "No FAQ matches the current intent: the system returns an honest empty/low-confidence result rather than a weak forced suggestion"]),

    story("AI-08", "Agent-assist: internal knowledge search & reply draft generation", "chat / knowledge-base frontend",
          "a search over internal knowledge that turns a match into an editable customer-reply draft",
          "agents answer faster without accidentally pasting internal-only language to a customer",
          ["Search scores results using a defined, documented weighting (title/summary/category/body + pinned boost + stale penalty)",
           "Generated draft flags internal-policy language (e.g. 'escalate', 'approval', 'SLA') as needing rewrite before sending",
           "Results below a defined weak-match threshold are reported as 'nothing useful found', not shown as if confident"],
          ["A stale or draft-status source is still searchable but visibly flagged so agents don't quote it with false confidence",
           "The draft generator never auto-sends — every draft requires explicit agent action to send",
           "A query matching only stale content returns the stale result WITH its warning rather than suppressing it entirely and returning nothing"]),

    story("AI-09", "Bot performance telemetry for reporting", "reports system",
          "bot performance metrics (answers served, chunks used, fallback/handoff rate, confidence distribution) exposed to Reports",
          "the team can evaluate and improve the bot's actual effectiveness over time",
          ["Answers-served and fallback-rate metrics are available per source and in aggregate",
           "Handoff-reason breakdown (low-confidence vs explicit vs repeated-fallback vs negative-sentiment) is reportable"],
          ["A newly added source with zero traffic yet shows a clear zero-state, not a misleading 0% success rate implying poor performance",
           "Metrics respect the same own/team/all scoping as other reports where they touch agent-level data (e.g. supervised handoffs)"]),

    story("AI-10", "Sentiment signal for negative-sentiment handoff trigger", "chat handling system",
          "visitor sentiment to be assessed on each message as an input to the handoff decision",
          "a frustrated or upset customer is escalated to a human promptly",
          ["Sentiment assessment runs per inbound message and feeds the handoff-reason logic",
           "Negative-sentiment handoff has a defined confidence/severity threshold, not a hair-trigger on any negative word"],
          ["Sarcasm or a negative word used positively ('this is stupidly easy, thanks!') does not falsely trigger handoff",
           "Sentiment trending negative across several messages (without one strongly negative message) is still caught by an aggregate/trend check, not just a single-message check",
           "A customer swearing about an unrelated third party (not the company/bot) is not equivalent to a complaint about the service"]),

    story("AI-11", "Availability-aware handoff", "chat handling system",
          "the handoff path to differ when no human agent is currently available, while the bot itself keeps answering",
          "customers are never left stuck, in or out of human working hours",
          ["When alwaysAvailable is true, a requested human handoff routes to a live/queued agent normally",
           "When alwaysAvailable is false and no agent is available, the visitor is asked for an email and routed into the ticket flow instead of a live queue"],
          ["The bot's own ability to answer is never gated by availability hours — only the human-handoff path is",
           "A visitor who is mid-handoff when availability changes (edge of the window) gets a consistent, non-confusing outcome, not a dropped request"]),

    story("AI-12", "Bot training source lifecycle management", "bot-training system",
          "sources to be enabled/disabled, retrained, and deleted with correct effects on live answering",
          "admins can safely curate what the bot is allowed to answer from",
          ["Retrain re-runs ingestion without requiring the source to be removed and re-added",
           "Delete removes the source and its chunks from the retrievable index, not just from the admin list view"],
          ["Disabling a heavily-used source (high answers-served) still takes effect immediately, no matter how much traffic it was serving",
           "A retrain triggered while a previous indexing job for the same source is still running is queued or rejected, never run concurrently against the same source"]),
]

# ---------------------------------------------------------------------------
# DOCX HELPERS
# ---------------------------------------------------------------------------

def set_cell_background(cell, hex_color):
    shd = OxmlElement('w:shd')
    shd.set(qn('w:fill'), hex_color)
    cell._tc.get_or_add_tcPr().append(shd)


def style_header_row(row, hex_color=BRAND_HEX):
    for cell in row.cells:
        set_cell_background(cell, hex_color)
        for p in cell.paragraphs:
            for run in p.runs:
                run.font.bold = True
                run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
                run.font.size = Pt(9)


def add_title_page(doc, title, subtitle, meta_lines):
    h = doc.add_heading(title, level=0)
    for run in h.runs:
        run.font.color.rgb = BRAND
    p = doc.add_paragraph(subtitle)
    p.runs[0].font.size = Pt(13)
    p.runs[0].font.color.rgb = RGBColor(0x55, 0x55, 0x55)
    doc.add_paragraph()
    for line in meta_lines:
        mp = doc.add_paragraph(line)
        mp.runs[0].font.size = Pt(10)
        mp.runs[0].font.color.rgb = RGBColor(0x77, 0x77, 0x77)
    doc.add_page_break()


def new_doc():
    doc = Document()
    style = doc.styles['Normal']
    style.font.name = 'Calibri'
    style.font.size = Pt(10)
    return doc


# ---------------------------------------------------------------------------
# BUILD: FEATURE LISTING DOCX
# ---------------------------------------------------------------------------

def build_feature_listing_docx():
    doc = new_doc()
    add_title_page(
        doc, "Mercury — V1 Feature Listing",
        "CSR / AI Chatbot Admin Console — Feature Inventory",
        ["Prepared by: Project Management", "Scope: V1 (excludes Shifts, Business Plan, Integration — V2-only features)",
         "Format: Standard Feature Listing (Module / Feature / Description / Capabilities / Role / Priority / Status)"],
    )

    doc.add_heading("1. Purpose", level=1)
    doc.add_paragraph(
        "This document is the authoritative inventory of every feature in Mercury's V1 scope, grouped by module. "
        "It is intended for engineering leads, QA, and stakeholders to confirm scope before sprint planning, and as "
        "the source document the accompanying User Story documents (Frontend, Backend, AI Engineer) were derived from."
    )

    doc.add_heading("2. Priority Key", level=1)
    for line in ["Must Have — required for V1 to be usable / launchable.",
                 "Should Have — important, expected soon after core launch.",
                 "Could Have — valuable but deferrable without blocking launch."]:
        doc.add_paragraph(line, style="List Bullet")

    doc.add_heading("3. Feature Inventory", level=1)

    modules = []
    for f in FEATURES:
        if f[1] not in modules:
            modules.append(f[1])

    for module in modules:
        doc.add_heading(module, level=2)
        for f in FEATURES:
            fid, mod, name, desc, caps, ai, roles, priority, status, perms = f
            if mod != module:
                continue
            p = doc.add_paragraph()
            r = p.add_run(f"{fid}  {name}")
            r.bold = True
            r.font.size = Pt(11)
            r.font.color.rgb = BRAND

            table = doc.add_table(rows=0, cols=2)
            table.autofit = True
            rows_data = [
                ("Description", desc),
                ("Key Capabilities", "; ".join(caps)),
                ("AI / Bot Involvement", ai),
                ("User Roles", roles),
                ("Priority", priority),
                ("Status", status),
                ("Governing Permission(s)", perms),
            ]
            for label, value in rows_data:
                row = table.add_row()
                row.cells[0].text = label
                row.cells[0].paragraphs[0].runs[0].font.bold = True
                row.cells[0].paragraphs[0].runs[0].font.size = Pt(9)
                row.cells[1].text = value
                row.cells[1].paragraphs[0].runs[0].font.size = Pt(9)
                row.cells[0].width = Cm(3.5)
                row.cells[1].width = Cm(13)
            doc.add_paragraph()

    out_path = os.path.join(OUT, "Mercury_V1_Feature_Listing.docx")
    doc.save(out_path)
    print("Wrote", out_path)


# ---------------------------------------------------------------------------
# BUILD: FEATURE LISTING XLSX
# ---------------------------------------------------------------------------

def build_feature_listing_xlsx():
    wb = Workbook()
    ws = wb.active
    ws.title = "Feature Listing"

    header_fill = PatternFill(start_color=BRAND_HEX, end_color=BRAND_HEX, fill_type="solid")
    header_font = Font(color="FFFFFF", bold=True, size=10)
    wrap = Alignment(wrap_text=True, vertical="top")
    thin = Side(style="thin", color="DDDDDD")
    border = Border(left=thin, right=thin, top=thin, bottom=thin)

    ws.append(FEATURE_COLUMNS)
    for col_idx in range(1, len(FEATURE_COLUMNS) + 1):
        cell = ws.cell(row=1, column=col_idx)
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = wrap
        cell.border = border
    ws.freeze_panes = "A2"

    priority_fill = {
        "Must Have": PatternFill(start_color="FDE8E8", end_color="FDE8E8", fill_type="solid"),
        "Should Have": PatternFill(start_color="FFF6DB", end_color="FFF6DB", fill_type="solid"),
        "Could Have": PatternFill(start_color="E8F5E9", end_color="E8F5E9", fill_type="solid"),
    }

    for f in FEATURES:
        fid, module, name, desc, caps, ai, roles, priority, status, perms = f
        row = [fid, module, name, desc, "\n".join(f"- {c}" for c in caps), ai, roles, priority, status, perms]
        ws.append(row)
        r = ws.max_row
        for col_idx in range(1, len(FEATURE_COLUMNS) + 1):
            cell = ws.cell(row=r, column=col_idx)
            cell.alignment = wrap
            cell.border = border
        ws.cell(row=r, column=8).fill = priority_fill.get(priority, PatternFill())

    widths = [10, 16, 30, 42, 46, 30, 30, 12, 28, 40]
    for i, w in enumerate(widths, start=1):
        ws.column_dimensions[get_column_letter(i)].width = w

    # Second sheet: legend
    legend = wb.create_sheet("Legend")
    legend.append(["Priority", "Meaning"])
    legend.append(["Must Have", "Required for V1 to be usable / launchable."])
    legend.append(["Should Have", "Important, expected soon after core launch."])
    legend.append(["Could Have", "Valuable but deferrable without blocking launch."])
    legend.append([])
    legend.append(["Scope note", "V1 excludes Shifts, Business Plan, and Integration (V2-only features)."])
    for col, w in zip("AB", [18, 60]):
        legend.column_dimensions[col].width = w
    for cell in legend[1]:
        cell.font = Font(bold=True)

    out_path = os.path.join(OUT, "Mercury_V1_Feature_Listing.xlsx")
    wb.save(out_path)
    print("Wrote", out_path)


# ---------------------------------------------------------------------------
# BUILD: USER STORY DOCX (shared builder)
# ---------------------------------------------------------------------------

def build_user_story_docx(role_label, filename, stories, intro):
    doc = new_doc()
    add_title_page(
        doc, f"Mercury — V1 User Stories: {role_label}",
        "CSR / AI Chatbot Admin Console",
        ["Prepared by: Project Management / Scrum Master", "Scope: V1",
         f"Audience: {role_label} engineering", f"Story count: {len(stories)}"],
    )

    doc.add_heading("1. How to read these stories", level=1)
    doc.add_paragraph(intro)
    doc.add_paragraph(
        "Each story follows the standard format: 'As a <role>, I want <capability>, so that <benefit>.' "
        "Acceptance Criteria define 'done'. Edge Cases are known scenarios that MUST be handled — treat them as "
        "additional acceptance criteria, not optional polish."
    )

    doc.add_heading("2. Stories", level=1)

    for s in stories:
        h = doc.add_heading(f"{s['id']} — {s['title']}", level=2)
        for run in h.runs:
            run.font.color.rgb = BRAND

        p = doc.add_paragraph()
        p.add_run("As a ").italic = False
        p.add_run(s["as_a"]).bold = True
        p.add_run(", I want to ")
        p.add_run(s["i_want"]).bold = True
        p.add_run(", so that ")
        p.add_run(s["so_that"]).bold = True
        p.add_run(".")

        doc.add_paragraph("Acceptance Criteria:", style="Intense Quote")
        for a in s["acceptance"]:
            doc.add_paragraph(a, style="List Bullet")

        doc.add_paragraph("Edge Cases:", style="Intense Quote")
        for e in s["edge_cases"]:
            doc.add_paragraph(e, style="List Bullet")

        doc.add_paragraph()

    out_path = os.path.join(OUT, filename)
    doc.save(out_path)
    print("Wrote", out_path)


# ---------------------------------------------------------------------------
# BACKEND USER STORIES — SPRINT-READY, EPIC-GROUPED EDITION
# ---------------------------------------------------------------------------
# Same BACKEND_STORIES content as the source of truth, re-presented the way a
# scrum master / PM would hand it to a team: grouped into epics that build on
# each other in order, each story tagged with priority, a rough size, and an
# explicit "depends on" list — plus a one-line plain-English summary before
# the technical detail, so a non-engineer can follow it too.

BACKEND_EPICS = [
    ("Epic 1 — Identity, Access & Platform Foundations",
     "Everything else needs to know who's calling and what they're allowed to do. This epic builds that ground "
     "floor once, so no later story has to reinvent it.",
     ["BE-01", "BE-02", "BE-03", "BE-04", "BE-05"]),
    ("Epic 2 — People & Team Management",
     "Turns the access model into something an Admin can actually operate day to day: inviting, adjusting, and "
     "removing teammates.",
     ["BE-06", "BE-24"]),
    ("Epic 3 — Live Chat",
     "The real-time conversation engine both agents and the AI bot work through.",
     ["BE-07", "BE-08"]),
    ("Epic 4 — Support Tickets",
     "The asynchronous follow-up system, including the bridge that turns a live chat into a ticket.",
     ["BE-09", "BE-10", "BE-11"]),
    ("Epic 5 — Visitors & Customer Context",
     "Gives the team a visitor's history before they even say hello.",
     ["BE-12"]),
    ("Epic 6 — Knowledge & Canned Content",
     "Everything the team, and the bot, draws answers from — including reading straight from the company's own "
     "website.",
     ["BE-13", "BE-14", "BE-15"]),
    ("Epic 7 — Widget, Campaigns & Reporting",
     "The customer-facing widget's configuration, proactive outreach, and the analytics that tie everything "
     "above together.",
     ["BE-16", "BE-17", "BE-18"]),
    ("Epic 8 — Website Integration (Visitor-Facing Widget API)",
     "Everything above this line is the admin/agent side. This epic is the OTHER end of the same conversation and "
     "ticket systems — the public, unauthenticated contract the embedded widget on an actual customer website "
     "talks to: starting a session, sending/receiving messages, filing a ticket without ever chatting, and asking "
     "for — and being handed off to — a human agent. Nothing here is a separate system; it's the visitor-side "
     "door into Epics 3 and 4.",
     ["BE-20", "BE-21", "BE-22", "BE-23"]),
]

BACKEND_DEFERRED_IDS = ["BE-19"]

# id -> {priority, size, depends_on, plain}
# Size is a rough relative estimate (S/M/L/XL) for sprint-planning purposes,
# not a committed estimate — re-size once a team actually scopes each story.
BACKEND_META = {
    "BE-01": {"priority": "Must Have", "size": "L", "depends_on": [], "enables_fe": ["FE-01"],
              "plain": "When someone signs in, we hand them off to Mercury 360 to check their password, then keep them signed in here with our own lightweight session."},
    "BE-02": {"priority": "Must Have", "size": "M", "depends_on": ["BE-01"], "enables_fe": ["FE-05"],
              "plain": "One place that knows what each of the four roles is allowed to do, so every other service can just ask instead of guessing."},
    "BE-03": {"priority": "Must Have", "size": "S", "depends_on": ["BE-01", "BE-02"], "enables_fe": ["FE-16", "FE-20"],
              "plain": "A single place to upload and safely serve files (documents, logos, icons) so every feature isn't building its own."},
    "BE-04": {"priority": "Should Have", "size": "M", "depends_on": ["BE-01", "BE-02"], "enables_fe": ["FE-21"],
              "plain": "A running diary of what happened in the workspace, plus a way to tap someone on the shoulder when something needs them."},
    "BE-05": {"priority": "Should Have", "size": "S", "depends_on": ["BE-01", "BE-02"], "enables_fe": ["FE-14"],
              "plain": "One shared list of categories and one shared list of tags, so Chat and Tickets never drift into two different sets."},
    "BE-06": {"priority": "Must Have", "size": "M", "depends_on": ["BE-01", "BE-02"], "enables_fe": ["FE-03", "FE-04"],
              "plain": "The actual invite / edit / suspend / remove actions an Admin uses to manage who's on the team."},
    "BE-24": {"priority": "Should Have", "size": "S", "depends_on": ["BE-01", "BE-02"], "enables_fe": ["FE-22"],
              "plain": "Lets an Admin add or remove the group names themselves (Finance, Technical, ...) that people, "
                       "chats, tickets, and knowledge content all get tagged with — the vocabulary, not just who's in which one."},
    "BE-07": {"priority": "Must Have", "size": "XL", "depends_on": ["BE-01", "BE-02", "BE-05", "BE-06"], "enables_fe": ["FE-06", "FE-07"],
              "plain": "Where conversations and messages actually live, delivered to agents live instead of by refreshing the page."},
    "BE-08": {"priority": "Must Have", "size": "M", "depends_on": ["BE-06", "BE-07"], "enables_fe": ["FE-08"],
              "plain": "Decides which pool or agent a conversation lands with, and stops it being handed to someone who can't take it."},
    "BE-09": {"priority": "Must Have", "size": "M", "depends_on": ["BE-01", "BE-02", "BE-05"], "enables_fe": ["FE-11", "FE-12"],
              "plain": "The ticket record itself — create it, reply to it, move it through statuses, file it away."},
    "BE-10": {"priority": "Must Have", "size": "S", "depends_on": ["BE-06", "BE-09"], "enables_fe": ["FE-12"],
              "plain": "Makes sure a ticket can only be handed to someone actually allowed and able to work it."},
    "BE-11": {"priority": "Must Have", "size": "S", "depends_on": ["BE-07", "BE-09"], "enables_fe": ["FE-09"],
              "plain": "The one-click 'turn this chat into a ticket' action, with a snapshot of the conversation attached."},
    "BE-12": {"priority": "Could Have", "size": "M", "depends_on": ["BE-07", "BE-09"], "enables_fe": ["FE-13"],
              "plain": "Quietly tracks who's on the site and links that to their conversations/tickets, best-effort."},
    "BE-13": {"priority": "Should Have", "size": "S", "depends_on": ["BE-01", "BE-02", "BE-06"], "enables_fe": ["FE-15"],
              "plain": "The shared library of canned replies, with private-vs-shared visibility enforced on the server, not just hidden in the UI."},
    "BE-14": {"priority": "Must Have", "size": "M", "depends_on": ["BE-02", "BE-03", "BE-06"], "enables_fe": ["FE-16", "FE-10"],
              "plain": "The staff-only knowledge base — articles, documents, links — that never reaches the bot or the customer."},
    "BE-15": {"priority": "Must Have", "size": "L", "depends_on": ["BE-03"], "enables_fe": ["FE-17"],
              "plain": "How the bot actually learns — from uploaded documents, or by reading pages straight off the company's website."},
    "BE-16": {"priority": "Must Have", "size": "M", "depends_on": ["BE-02", "BE-03"], "enables_fe": ["FE-20"],
              "plain": "The settings that control how the widget looks and behaves for customers, read by both the admin screen and the live widget."},
    "BE-17": {"priority": "Could Have", "size": "M", "depends_on": ["BE-01", "BE-02"], "enables_fe": ["FE-18"],
              "plain": "Proactive pop-up campaigns, plus the stats on how they performed."},
    "BE-18": {"priority": "Must Have", "size": "L", "depends_on": ["BE-06", "BE-07", "BE-08", "BE-09", "BE-10", "BE-14", "BE-15", "BE-17"], "enables_fe": ["FE-19", "FE-02"],
              "plain": "Pre-computed numbers for every report, already filtered to what each viewer is allowed to see."},
    "BE-19": {"priority": "Deferred", "size": "M", "depends_on": ["BE-06"], "enables_fe": [],
              "plain": "Seat counts and plan tier — deferred until billing is a real feature."},
    "BE-20": {"priority": "Must Have", "size": "M", "depends_on": ["BE-03", "BE-16"], "enables_fe": [],
              "enables_note": "The embedded website widget itself — a separate, public-facing deliverable from the admin console covered by the Frontend User Stories doc. See FE-20 for the admin screen that configures what this bootstraps.",
              "plain": "How a visitor's browser, on someone else's website, gets a foot in the door with Mercury without ever logging in."},
    "BE-21": {"priority": "Must Have", "size": "L", "depends_on": ["BE-07", "BE-20"], "enables_fe": [],
              "enables_note": "The embedded website widget itself — see BE-20's note.",
              "plain": "The visitor's half of the same live chat agents already see — same conversation, same messages, just the other end of it."},
    "BE-22": {"priority": "Must Have", "size": "M", "depends_on": ["BE-09", "BE-20"], "enables_fe": [],
              "enables_note": "The embedded website widget itself — see BE-20's note.",
              "plain": "A 'contact us' form that creates a real ticket, for a visitor who'd rather not chat at all."},
    "BE-23": {"priority": "Must Have", "size": "L", "depends_on": ["BE-08", "BE-21", "BE-22"], "enables_fe": [],
              "enables_note": "The embedded website widget itself — see BE-20's note.",
              "plain": "The 'talk to a person' button and everything that can happen after it's pressed — connected, queued, or turned into a ticket."},
}

BACKEND_DOD = [
    "The endpoint(s) are implemented, documented, and match the acceptance criteria exactly.",
    "Every edge case listed is covered by an automated test, not just the happy path.",
    "Every permission/scope check happens on the server — the frontend is never the only thing enforcing it.",
    "Code is reviewed and merged.",
    "Deployed to staging and manually smoke-tested against the acceptance criteria.",
]


def build_backend_epics_docx(stories, filename, frontend_stories):
    by_id = {s["id"]: s for s in stories}
    fe_by_id = {s["id"]: s["title"] for s in frontend_stories}

    doc = new_doc()
    add_title_page(
        doc, "Mercury — V1 User Stories: Backend Engineer",
        "CSR / AI Chatbot Admin Console — Sprint-Ready, Epic-Grouped Edition",
        ["Prepared by: Project Management / Scrum Master", "Scope: V1",
         "Audience: Backend engineering", f"Story count: {len(by_id)} ({len(by_id) - len(BACKEND_DEFERRED_IDS)} in "
         f"the build sequence, {len(BACKEND_DEFERRED_IDS)} deferred)"],
    )

    doc.add_heading("1. How to read this document", level=1)
    doc.add_paragraph(
        "These stories describe the services, APIs, and data model a backend engineer must build to support the "
        "frontend. The current codebase is a prototype using in-memory mock data — these stories describe the "
        "real service behavior that mock data currently stands in for."
    )
    doc.add_paragraph(
        "Stories are grouped into epics, and epics are ordered so that a single engineer — or a small team — can "
        "work straight through from Epic 1 onward without ever being blocked waiting on something later in the "
        "list. Each story states what it depends on explicitly; nothing depends on a story that appears after it."
    )
    doc.add_paragraph(
        "Each story starts with a one-line plain-English summary before the technical detail, so it's readable "
        "without an engineering background. Acceptance Criteria define 'done' for that story specifically; Edge "
        "Cases are known scenarios that MUST be handled, not optional polish. The shared Definition of Done below "
        "applies to every story in this document."
    )
    doc.add_paragraph(
        "Each story also names the user-facing (frontend) story it exists to support — the actual screen or "
        "interaction on the other end that a person uses. That's what 'Enables (frontend)' points to: this "
        "backend work has no purpose on its own, only in service of that end-user story. See the companion "
        "Frontend Engineer document for that story's own detail."
    )

    doc.add_heading("2. Definition of Done (applies to every story)", level=1)
    for line in BACKEND_DOD:
        doc.add_paragraph(line, style="List Bullet")

    doc.add_heading("3. Priority & sizing key", level=1)
    for line in ["Must Have — required for V1 to be usable / launchable.",
                 "Should Have — important, expected soon after core launch.",
                 "Could Have — valuable but deferrable without blocking launch.",
                 "Deferred — not part of this release; do not schedule.",
                 "Size — a rough relative estimate (S / M / L / XL) for sprint planning, not a committed number. "
                 "Re-size once a team actually scopes the story."]:
        doc.add_paragraph(line, style="List Bullet")

    doc.add_heading("4. Epics", level=1)
    doc.add_paragraph("Work through these in order. Each depends only on epics before it.")
    for epic_title, epic_blurb, story_ids in BACKEND_EPICS:
        p = doc.add_paragraph()
        r = p.add_run(f"{epic_title}  ")
        r.bold = True
        r2 = p.add_run("— " + ", ".join(story_ids))
        r2.italic = True
        r2.font.color.rgb = RGBColor(0x88, 0x88, 0x88)
        doc.add_paragraph(epic_blurb)
    doc.add_paragraph()
    dp = doc.add_paragraph()
    dr = dp.add_run("Deferred (not in this build sequence): ")
    dr.bold = True
    dp.add_run(", ".join(BACKEND_DEFERRED_IDS))
    doc.add_page_break()

    doc.add_heading("5. Stories", level=1)

    def render_story(story_id):
        s = by_id[story_id]
        meta = BACKEND_META[story_id]

        h = doc.add_heading(f"{s['id']} — {s['title']}", level=2)
        for run in h.runs:
            run.font.color.rgb = BRAND

        badge = doc.add_paragraph()
        for label, value in [("Priority", meta["priority"]), ("Size", meta["size"]),
                              ("Depends on", ", ".join(meta["depends_on"]) or "None — can start immediately")]:
            lr = badge.add_run(f"{label}: ")
            lr.bold = True
            lr.font.size = Pt(9)
            vr = badge.add_run(f"{value}    ")
            vr.font.size = Pt(9)

        enables = meta["enables_fe"]
        if enables:
            enables_text = ", ".join(f"{fe_id} ({fe_by_id[fe_id]})" for fe_id in enables)
        elif meta.get("enables_note"):
            enables_text = meta["enables_note"]
        else:
            enables_text = "None yet — no frontend story exists for this in the current scope"
        enables_p = doc.add_paragraph()
        enables_label = enables_p.add_run("Enables (frontend): ")
        enables_label.bold = True
        enables_label.font.size = Pt(9)
        enables_val = enables_p.add_run(enables_text)
        enables_val.font.size = Pt(9)

        plain_p = doc.add_paragraph()
        plain_label = plain_p.add_run("In short: ")
        plain_label.bold = True
        plain_label.italic = True
        plain_rest = plain_p.add_run(meta["plain"])
        plain_rest.italic = True

        p = doc.add_paragraph()
        p.add_run("As a ")
        p.add_run(s["as_a"]).bold = True
        p.add_run(", I want to ")
        p.add_run(s["i_want"]).bold = True
        p.add_run(", so that ")
        p.add_run(s["so_that"]).bold = True
        p.add_run(".")

        doc.add_paragraph("Acceptance Criteria:", style="Intense Quote")
        for a in s["acceptance"]:
            doc.add_paragraph(a, style="List Bullet")

        doc.add_paragraph("Edge Cases:", style="Intense Quote")
        for e in s["edge_cases"]:
            doc.add_paragraph(e, style="List Bullet")

        doc.add_paragraph()

    for epic_title, epic_blurb, story_ids in BACKEND_EPICS:
        h1 = doc.add_heading(epic_title, level=1)
        for run in h1.runs:
            run.font.color.rgb = BRAND
        doc.add_paragraph(epic_blurb)
        for story_id in story_ids:
            render_story(story_id)

    doc.add_heading("Deferred — not part of this release", level=1)
    doc.add_paragraph(
        "Billing isn't a real feature yet — this matches the frontend, where the whole surface (Business Plan, "
        "\"Request more seats\", plan/renewal details) is hidden behind the V2 app-version switch and invisible "
        "by default. Owner's people.seats.request / workspace.billing.view permission grants stay reserved on "
        "the role model (BE-02) but have nothing behind them until this is explicitly scheduled."
    )
    for story_id in BACKEND_DEFERRED_IDS:
        render_story(story_id)

    out_path = os.path.join(OUT, filename)
    doc.save(out_path)
    print("Wrote", out_path)


# ---------------------------------------------------------------------------
# PLAIN-LANGUAGE REQUIREMENTS OVERVIEW
# ---------------------------------------------------------------------------
# A non-technical companion to the Feature Listing and the three engineering
# User Story docs — same scope (all of V1), explained without permission
# strings or API jargon, for anyone (stakeholders, new hires, support) who
# needs to understand what Mercury does without reading code or a backlog.
# Each section names the FE-/BE-/AI- story ids it maps to, so this stays
# traceable back to the engineering documents rather than becoming a second,
# drifting source of truth.

ROLES_PLAIN = [
    ("CSR", "The front-line agent.", "Handles the chats and tickets assigned to them. Reads the help docs. Sees their own stats."),
    ("CSR Admin", "The team lead.", "Everything a CSR can do, plus sees their whole team's work, assigns tickets, manages the team's groups, and runs the shift schedule."),
    ("Admin", "Runs the whole workspace.", "Everything a CSR Admin can do, plus manages the whole workspace: all chats/tickets, the bot's training, inviting/removing people, and changing settings."),
    ("Owner", "The account holder.", "Same as Admin, for now — the only account that can't be removed or demoted below the last one remaining. Owner will get its own extra abilities (billing, requesting more seats) once billing exists — not needed yet."),
]

# Each section: (module_title, intro, [bullets], who_line, related_story_ids)
# A bullet is either a plain string, or (bold_lead, rest) for emphasis.
PLAIN_REQUIREMENTS = [
    ("Dashboard",
     "The first thing anyone sees after signing in — a quick snapshot of how the workspace is doing right now, so nobody has to go digging for it.",
     ["Simple stat cards (with a plain-language explanation on hover) for things like open conversations and tickets.",
      "A chart showing how many conversations came in vs. how many got resolved.",
      "A breakdown of tickets by category, so you can see what people are contacting you about most.",
      "A list of the most recent conversations, and a leaderboard of top-performing agents."],
     "Everyone who signs in sees this — it's the home page.",
     "FE-02"),

    ("Team & Access (User Management)",
     "Where an Admin or Owner manages who has access to the workspace, and what each person is allowed to do.",
     ["Invite a new team member (they must already have a Mercury 360 account).",
      "Change someone's role, or narrow a front-line agent to chat-only, tickets-only, or view-only on tickets.",
      "Set how many chats someone can handle at once, and put people into groups (e.g. 'Finance', 'Technical') so work routes to the right team.",
      "Create or remove the groups themselves — the actual list of names people, chats, tickets, and knowledge content get tagged with — not just who's assigned to an existing one.",
      "Suspend someone's access temporarily, or remove them for good.",
      "Resend or cancel a pending invitation."],
     "CSR Admins view/adjust their own team's capacity and groups; Admins can also invite, change roles, suspend, remove people, and manage the group list.",
     "FE-03, FE-04, FE-22 · BE-06, BE-24"),

    ("Roles & Permissions",
     "A reference page showing, at a glance, exactly what each of the four roles (Owner, Admin, CSR Admin, CSR) is allowed to do.",
     ["One table, always accurate — generated from the real rules the system enforces, so it can never say one thing while the system does another.",
      "Search or filter by category.",
      "Toggle to see only the rows where roles actually differ, instead of scanning dozens of identical ones."],
     "Owner, Admin, and CSR Admin can view it. Nobody can edit it in this version — custom roles aren't supported yet.",
     "FE-05 · BE-02"),

    ("Chat",
     "The live chat inbox where agents talk to website visitors in real time, with the AI bot handling the first line of conversation.",
     ["Four inboxes — My Chats, AI Bot, Team Chats, Archive — so you always know where to look.",
      "The bot answers first; an agent can take over any time, or the bot hands off on its own when it's stuck, when asked, or when something sounds urgent.",
      "Reply to a customer or leave a private note for your team — never confused for one another.",
      "Change a conversation's status, transfer it to a teammate, tag it, or ban an abusive customer.",
      "Turn a chat into a support ticket in one click, carrying over what's been said so far.",
      "While chatting, search your team's internal knowledge or get a suggested reply, without leaving the conversation."],
     "Every CSR handles their own chats; CSR Admins see their whole team's; Admins see everything.",
     "FE-06 – FE-10 · BE-07, BE-08, BE-11 · AI-01 – AI-05, AI-10, AI-11"),

    ("Tickets",
     "The support-ticket system for anything that needs to be tracked and followed up on — whether it came from a chat, an email, or was created directly.",
     ["Create a ticket, reply to it, or leave an internal note.",
      "Set its status (open, pending, on hold, solved, closed) and priority (low to urgent), and tag it for easy searching.",
      "Assign it to whoever's best placed to handle it.",
      "File it to Archive, mark it Spam, or send it to Trash — separate from its status, so a solved ticket can still be filed away.",
      "Trash is kept 30 days before it's automatically cleared, unless deleted sooner."],
     "Every CSR handles their own tickets; CSR Admins see and assign their team's; Admins see and can permanently delete any ticket.",
     "FE-11, FE-12 · BE-09, BE-10"),

    ("Visitors",
     "A read-only page showing who's browsing your website right now, or has in the past — even before they say a word.",
     ["See where a visitor is from, what device/browser they're using, how they found you, and how many times they've visited.",
      "See any conversations or tickets linked to that visitor, for context before engaging."],
     "CSR Admins and above.",
     "FE-13 · BE-12"),

    ("Category & Tags",
     "The shared labeling system used across both Chat and Tickets, so everything is organized the same way no matter where it started.",
     ["Add a category, with a record of who added it and when.",
      "Add a tag with a color from a fixed set of options, so tags stay visually consistent."],
     "Admins and the Owner manage these; everyone else uses them when tagging a chat or ticket.",
     "FE-14 · BE-05"),

    ("Canned Responses",
     "A library of ready-made replies agents can drop into a conversation instead of typing the same answer over and over.",
     ["Create a response with a title, the reply text, and a shortcut (like /refund) that pulls it up instantly while typing.",
      "Mark a response private (only you can use it) or shared (your team, or everyone, can use it)."],
     "Every CSR can use the shared library; CSR Admins and above manage what's in it.",
     "FE-15 · BE-13"),

    ("Internal Knowledge (staff-only reference)",
     "A private knowledge base for your own team — playbooks, policies, procedures. Customers and the bot never see this; it's purely for agents to reference while helping someone.",
     ["Three sections: Articles (full write-ups), Documents (uploaded files), and Links (references to other internal pages).",
      "Articles can be pinned, assigned a category and group, and marked with a review status (current, due, stale, or still a draft).",
      "While chatting, search this knowledge base and turn a match straight into an editable reply."],
     "Every CSR can read it; CSR Admins and above create and edit it.",
     "FE-16 · BE-14 · AI-08"),

    ("Chatbot Knowledge — including learning from your website",
     "This is what the AI bot itself actually learns from and answers with — separate from the internal knowledge base above (that's for staff), and separate from the bot's appearance (that's Bot Setting below).",
     [("Learn from your website: ", "give the bot a page URL and how many links deep to follow from it, and it reads those pages and learns from them automatically — the same way a search engine would, no manual copy-pasting required."),
      "Add a source document — upload a file and the bot reads and learns from it.",
      "Turn any source on or off — an off source stops being used for answers immediately, without deleting it.",
      "Retrain a source any time to pick up changes, and see its status: indexed and ready, still indexing, queued, or failed (with a reason why, if it failed).",
      "Add structured FAQs directly — a question, an answer, and which topics it should match.",
      "See how much each source is actually being used, and when it was last trained."],
     "Every CSR can see what the bot knows (read-only); Admins manage sources, add new ones, and retrain them.",
     "FE-17 · BE-15 · AI-06, AI-07, AI-12"),

    ("Campaigns",
     "Proactive, pop-up-style messages sent to visitors on your site — a sale announcement, a welcome message — not something the visitor has to ask for.",
     ["Create a campaign with a title, message, image, and one or more action buttons.",
      "Target all visitors, only new visitors, or only returning visitors.",
      "Set it to Draft, Active, or Inactive, and optionally schedule a start and end time.",
      "See performance stats: views, clicks, and what came of it."],
     "Admins and the Owner.",
     "FE-18 · BE-17"),

    ("Reports",
     "Dashboards and charts showing how the workspace is actually performing, broken down by area.",
     ["Grouped by topic: Overview, Chats, AI Bot, Tickets, Agents, Knowledge.",
      "Everyone only ever sees data appropriate to them — a CSR sees their own numbers, a CSR Admin sees their team's, an Admin sees everyone's.",
      "Export a report, or schedule it to be delivered automatically on a recurring basis."],
     "Everyone sees their own data; CSR Admins can export; Admins can also schedule.",
     "FE-19 · BE-18 · AI-09"),

    ("Bot Setting (the widget's look and rules)",
     "Everything about how the chat widget looks and behaves on your website for the person typing into it — not the bot's knowledge (that's above), just its appearance and rules.",
     ["Colors, launcher icon, position on the page, company name, greeting message, and logo.",
      "When the widget icon shows up — always, only once a conversation starts, or never — and what happens when nobody's available.",
      "Optional forms before a chat starts (ask for name/email) and after it ends (a short survey).",
      "How the bot behaves in conversation: try to help, check whether that worked, try again once, then offer a real person or a ticket — with a safety concern, an explicit request for a person, or anything needing a real action (like a refund) always skipping straight to the right path instead of the normal menu.",
      "An install snippet for your website, plus a live, click-through preview so you can test exactly what a visitor would experience before it goes live."],
     "CSR Admins view the settings (read-only); Admins change them.",
     "FE-20 · BE-16 · AI-11"),

    ("Activity Log & Notifications",
     "Two closely related things: a record of everything that's happened in the workspace, and alerts for the things that need YOUR attention specifically.",
     [("Activity Log — ", "every meaningful action (who did what, to what, and when) is recorded and can be filtered/searched. This is the audit trail if you ever need to answer 'who changed this, and when.'"),
      ("Notifications — ", "a panel showing things relevant to you personally, like a chat handed to you or a ticket assigned to you. Each one is clearly marked read or unread, so nothing gets missed.")],
     "CSR Admins and above see the full Activity Log; everyone sees their own Notifications.",
     "FE-21 · BE-04"),

    ("Signing in",
     "How someone actually gets into Mercury — handled by Mercury 360 (the parent platform), not built inside this app, so Mercury never has to store a password of its own.",
     ["Sign in once through Mercury 360; Mercury trusts that session rather than asking for separate credentials.",
      "Stay signed in across visits until the session genuinely ends.",
      "If an account is suspended or access is revoked, that person is signed out on their very next action — not just the next time they try to log in."],
     "Everyone — this is how you get in the door before any role applies.",
     "FE-01 · BE-01"),
]

NOT_YET_INCLUDED = [
    "Shifts & scheduling",
    "Business Plan / subscription details",
    "Third-party integrations",
    "Billing & requesting more seats",
]


def add_plain_bullet(doc, item):
    p = doc.add_paragraph(style="List Bullet")
    if isinstance(item, tuple):
        lead, rest = item
        p.add_run(lead).bold = True
        p.add_run(rest)
    else:
        p.add_run(item)


def build_plain_requirements_docx():
    doc = new_doc()
    add_title_page(
        doc, "Mercury — Requirements Overview",
        "What the product does, explained in plain language",
        ["Prepared by: Project Management", "Scope: V1",
         "Audience: anyone — stakeholders, new hires, support, no technical background required",
         "Companion documents: Feature Listing, and the Frontend / Backend / AI Engineer User Story docs — "
         "each section below names the story ids it maps to, so this can be cross-checked against them."],
    )

    doc.add_heading("1. What is Mercury?", level=1)
    doc.add_paragraph(
        "Mercury is a support desk: a live chat widget for your website, backed by an AI bot that answers "
        "customers first and hands off to a human agent when it can't help. Everything a support team needs "
        "day to day — chat, tickets, a knowledge base, reporting, and managing who has access — lives in one "
        "place, organized around four roles so everyone sees exactly as much as their job needs."
    )

    doc.add_heading("2. Who uses it — the four roles", level=1)
    doc.add_paragraph(
        "Each role includes everything the role below it can do — nothing is ever taken away going up the list."
    )
    table = doc.add_table(rows=1, cols=3)
    table.style = "Light Grid Accent 1"
    hdr = table.rows[0].cells
    hdr[0].text, hdr[1].text, hdr[2].text = "Role", "Think of them as", "What they can do"
    for cell in hdr:
        for p in cell.paragraphs:
            for run in p.runs:
                run.font.bold = True
    for role, tagline, desc in ROLES_PLAIN:
        row = table.add_row().cells
        row[0].text = role
        row[1].text = tagline
        row[2].text = desc
    doc.add_paragraph()

    doc.add_heading("3. What you can do, area by area", level=1)
    doc.add_paragraph(
        "Every area below is real and working in this version (V1) unless the 'Not included yet' section at the "
        "end says otherwise."
    )

    for title, intro, bullets, who, story_ids in PLAIN_REQUIREMENTS:
        h = doc.add_heading(title, level=2)
        for run in h.runs:
            run.font.color.rgb = BRAND
        doc.add_paragraph(intro)
        for b in bullets:
            add_plain_bullet(doc, b)
        who_p = doc.add_paragraph()
        who_run = who_p.add_run("Who can use it: ")
        who_run.bold = True
        who_run.font.size = Pt(9)
        rest_run = who_p.add_run(who)
        rest_run.font.size = Pt(9)
        story_p = doc.add_paragraph()
        story_label = story_p.add_run("Related user stories: ")
        story_label.bold = True
        story_label.font.size = Pt(9)
        story_label.font.color.rgb = RGBColor(0x88, 0x88, 0x88)
        story_val = story_p.add_run(story_ids)
        story_val.font.size = Pt(9)
        story_val.font.color.rgb = RGBColor(0x88, 0x88, 0x88)
        doc.add_paragraph()

    doc.add_heading("4. Not included in this version yet", level=1)
    doc.add_paragraph(
        "These exist in the product but are intentionally hidden in V1 — they'll appear once a workspace is "
        "switched to V2:"
    )
    for item in NOT_YET_INCLUDED:
        doc.add_paragraph(item, style="List Bullet")

    out_path = os.path.join(OUT, "Mercury_V1_Requirements_Overview.docx")
    doc.save(out_path)
    print("Wrote", out_path)


# ---------------------------------------------------------------------------
# MAIN
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    build_feature_listing_docx()
    build_feature_listing_xlsx()
    build_user_story_docx(
        "Frontend Engineer", "Mercury_V1_User_Stories_Frontend.docx", FRONTEND_STORIES,
        "These stories describe what a frontend engineer must build in the React/TypeScript admin console: screens, "
        "components, client-side state, and the interaction behavior a user directly experiences. Backend/AI "
        "contracts these screens depend on are covered in the companion Backend and AI Engineer documents.",
    )
    build_backend_epics_docx(BACKEND_STORIES, "Mercury_V1_User_Stories_Backend.docx", FRONTEND_STORIES)
    build_user_story_docx(
        "AI Engineer", "Mercury_V1_User_Stories_AI_Engineer.docx", AI_STORIES,
        "These stories describe the conversational AI / retrieval behavior the bot and agent-assist features need. "
        "The current codebase implements deterministic, rule-based stand-ins for these (explicitly commented as such "
        "in source) — these stories describe the real model-backed behavior intended to replace them.",
    )
    build_plain_requirements_docx()
    print("\nAll done.")
