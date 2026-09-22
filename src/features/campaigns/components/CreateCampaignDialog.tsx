import { useMemo, useRef, useState } from 'react'
import { Image as ImageIcon, Plus, Trash2, Upload, X } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogPrimaryButton,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn, generateId } from '@/lib/utils'
import { campaignTypeOptions, createCampaignStatusOptions, visitorOptions } from '../data/mockCampaignData'
import type { CampaignActionButton, CampaignRecord } from '../types'
import { CampaignPreview } from './CampaignPreview'

interface ActionButtonDraft extends CampaignActionButton {
  id: string
}

interface CreateCampaignDialogProps {
  onClose: () => void
  onCreate: (campaign: CampaignRecord) => void
}

const TITLE_MAX = 80
const CONTENT_MAX = 200

type RequiredField = 'campaignName' | 'campaignType' | 'title' | 'content' | 'visitors' | 'status'

/** Loose enough for a marketing link, strict enough to catch typos — mirrors
 * what a browser's own URL bar would accept. Empty is valid: every URL field
 * here is optional. */
function isValidUrl(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed) return true
  try {
    const url = new URL(trimmed)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function SectionHeading({ index, title }: { index: number; title: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1B5E20]/10 text-[11px] font-semibold text-[#1B5E20]">
        {index}
      </span>
      <h3 className="text-xs font-semibold tracking-wide text-gray-500 uppercase">{title}</h3>
    </div>
  )
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 text-xs">
      <span className="shrink-0 text-gray-400">{label}</span>
      <span className="text-right font-medium text-gray-600">{value}</span>
    </div>
  )
}

function formatScheduleSummary(startAt: string, endAt: string): string {
  const format = (value: string) =>
    new Date(value).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })

  if (startAt && endAt) return `${format(startAt)} → ${format(endAt)}`
  if (startAt) return `Starts ${format(startAt)}, no end date`
  if (endAt) return `Ends ${format(endAt)}`
  return 'Runs immediately, no end date'
}

export function CreateCampaignDialog({ onClose, onCreate }: CreateCampaignDialogProps) {
  const [campaignName, setCampaignName] = useState('')
  const [campaignType, setCampaignType] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imageFileName, setImageFileName] = useState<string | null>(null)
  const [actionButtons, setActionButtons] = useState<ActionButtonDraft[]>([])
  const [visitors, setVisitors] = useState<string[]>([])
  // Held as the option's label, not its `CampaignStatus` value: this Select
  // wrapper's `SelectValue` loses the value→label mapping once the popup
  // unmounts (it falls back to rendering the raw value), which is invisible
  // everywhere `value === label` but would show "active" instead of "Active"
  // here. Converted back to `CampaignStatus` in `handleSubmit`.
  const [statusLabel, setStatusLabel] = useState<string | null>(null)
  const [startAt, setStartAt] = useState('')
  const [endAt, setEndAt] = useState('')

  const [touched, setTouched] = useState<Partial<Record<RequiredField | 'imageUrl' | 'endAt', boolean>>>({})
  const [touchedButtonIds, setTouchedButtonIds] = useState<Set<string>>(new Set())
  const [submitted, setSubmitted] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  function touch(field: RequiredField | 'imageUrl' | 'endAt') {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  function toggleVisitor(option: string) {
    setVisitors((prev) => (prev.includes(option) ? prev.filter((entry) => entry !== option) : [...prev, option]))
    touch('visitors')
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setImageUrl(typeof reader.result === 'string' ? reader.result : '')
      setImageFileName(file.name)
    }
    reader.readAsDataURL(file)
  }

  function clearImage() {
    setImageUrl('')
    setImageFileName(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function addActionButton() {
    setActionButtons((prev) => [...prev, { id: generateId(), label: '', url: '' }])
  }

  function updateActionButton(id: string, field: keyof CampaignActionButton, value: string) {
    setActionButtons((prev) => prev.map((button) => (button.id === id ? { ...button, [field]: value } : button)))
  }

  function removeActionButton(id: string) {
    setActionButtons((prev) => prev.filter((button) => button.id !== id))
  }

  const errors = useMemo(() => {
    const next: Partial<Record<RequiredField | 'imageUrl' | 'endAt', string>> = {}
    if (!campaignName.trim()) next.campaignName = 'Campaign name is required.'
    if (!campaignType) next.campaignType = 'Select a campaign type.'
    if (!title.trim()) next.title = 'Title is required.'
    if (!content.trim()) next.content = 'Content is required.'
    if (visitors.length === 0) next.visitors = 'Select at least one audience.'
    if (!statusLabel) next.status = 'Select a status.'
    if (!imageFileName && !isValidUrl(imageUrl)) next.imageUrl = 'Enter a valid image URL (https://...).'
    if (startAt && endAt && new Date(endAt).getTime() <= new Date(startAt).getTime()) {
      next.endAt = 'End must be after the start date & time.'
    }
    return next
  }, [campaignName, campaignType, title, content, visitors, statusLabel, imageUrl, imageFileName, startAt, endAt])

  const actionButtonErrors = useMemo(() => {
    const next: Record<string, string> = {}
    for (const button of actionButtons) {
      if (!isValidUrl(button.url)) next[button.id] = 'Enter a valid URL (https://...).'
    }
    return next
  }, [actionButtons])

  function shows(field: RequiredField | 'imageUrl' | 'endAt') {
    return Boolean((touched[field] || submitted) && errors[field])
  }

  function handleSubmit() {
    setSubmitted(true)
    setTouchedButtonIds(new Set(actionButtons.map((button) => button.id)))
    if (Object.keys(errors).length > 0 || Object.keys(actionButtonErrors).length > 0) return

    const filledButtons = actionButtons
      .filter((button) => button.label.trim() || button.url.trim())
      .map(({ label, url }) => ({ label: label.trim(), url: url.trim() }))

    const status = createCampaignStatusOptions.find((option) => option.label === statusLabel)!.value

    onCreate({
      id: generateId(),
      title: title.trim(),
      category: campaignType!,
      message: content.trim(),
      status,
      stats: { views: 0, clicks: 0, ctr: 0, conversions: 0, audience: visitors.join(', ') },
      imageUrl: imageUrl.trim() || undefined,
      actionButtons: filledButtons.length > 0 ? filledButtons : undefined,
      startAt: startAt || undefined,
      endAt: endAt || undefined,
    })
    onClose()
  }

  const previewButtons = actionButtons.filter((button) => button.label.trim())

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <DialogContent size="full" className="max-w-6xl">
        <DialogHeader>
          <DialogTitle>Create Campaign</DialogTitle>
        </DialogHeader>
        {/*
          `min-h-0` on the flex container and both children is load-bearing:
          without it a flex/grid item defaults to `min-height: auto`, so it
          grows to fit its content instead of shrinking to the row's height —
          the inner `overflow-y-auto` never gets a bounded box to scroll
          within, and content past `max-h-[80vh]` was just clipped by this
          container's `overflow-hidden` with no way to reach it.
        */}
        <DialogBody className="flex max-h-[80vh] min-h-0 flex-col gap-0 overflow-hidden p-0 sm:flex-row">
          <div className="flex min-h-0 flex-1 flex-col gap-7 overflow-y-auto px-5 py-5">
            {/* 1. BASIC INFORMATION */}
            <div className="flex flex-col gap-4">
              <SectionHeading index={1} title="Basic Information" />
              <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                <Input
                  label="Campaign Name *"
                  placeholder="Enter campaign name"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  onBlur={() => touch('campaignName')}
                  error={shows('campaignName') ? errors.campaignName : undefined}
                />

                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-gray-700">Campaign Type *</span>
                  <Select
                    value={campaignType}
                    onValueChange={(value) => {
                      setCampaignType(value as string)
                      touch('campaignType')
                    }}
                  >
                    <SelectTrigger className={cn(shows('campaignType') && 'border-red-500')}>
                      <SelectValue placeholder="Select campaign type" />
                    </SelectTrigger>
                    <SelectContent>
                      {campaignTypeOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {shows('campaignType') && <span className="text-xs text-red-600">{errors.campaignType}</span>}
                </div>
              </div>
              <p className="-mt-2 text-xs text-[#6E7678]">The internal name used to identify this campaign.</p>
            </div>

            {/* 2. CAMPAIGN CONTENT */}
            <div className="flex flex-col gap-4">
              <SectionHeading index={2} title="Campaign Content" />

              <div className="flex flex-col gap-1">
                <Input
                  label="Title *"
                  placeholder="E.g. Welcome to our site"
                  value={title}
                  maxLength={TITLE_MAX}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={() => touch('title')}
                  error={shows('title') ? errors.title : undefined}
                />
                <span className={cn('self-end text-xs', title.length >= TITLE_MAX ? 'text-red-500' : 'text-gray-400')}>
                  {title.length}/{TITLE_MAX}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <Textarea
                  label="Content / Message *"
                  placeholder="Write the message visitors will see"
                  value={content}
                  maxLength={CONTENT_MAX}
                  rows={4}
                  onChange={(e) => setContent(e.target.value)}
                  onBlur={() => touch('content')}
                  error={shows('content') ? errors.content : undefined}
                />
                <span className={cn('self-end text-xs', content.length >= CONTENT_MAX ? 'text-red-500' : 'text-gray-400')}>
                  {content.length}/{CONTENT_MAX}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-gray-700">Image</span>
                <div className="flex flex-wrap items-center gap-2.5">
                  <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFileChange} />
                  <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-3.5 w-3.5" />
                    Upload image
                  </Button>
                  {imageFileName && (
                    <span className="flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
                      <ImageIcon className="h-3 w-3" />
                      {imageFileName}
                      <button
                        type="button"
                        onClick={clearImage}
                        aria-label="Remove image"
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                </div>
                <Input
                  placeholder="Or paste an image URL (https://example.com/banner.png)"
                  value={imageFileName ? '' : imageUrl}
                  disabled={Boolean(imageFileName)}
                  onChange={(e) => setImageUrl(e.target.value)}
                  onBlur={() => touch('imageUrl')}
                  error={shows('imageUrl') ? errors.imageUrl : undefined}
                />
              </div>

              <div className="flex flex-col gap-3">
                <span className="text-sm font-medium text-gray-700">Action Buttons</span>
                {actionButtons.length > 0 && (
                  <div className="grid grid-cols-1 gap-x-3 gap-y-2 sm:grid-cols-[1fr_1fr_auto]">
                    {actionButtons.map((button) => {
                      const buttonError = (touchedButtonIds.has(button.id) || submitted) && actionButtonErrors[button.id]
                      return (
                        <div key={button.id} className="contents">
                          <Input
                            placeholder="e.g. Learn More"
                            value={button.label}
                            onChange={(e) => updateActionButton(button.id, 'label', e.target.value)}
                          />
                          <Input
                            placeholder="https://example.com"
                            value={button.url}
                            onChange={(e) => updateActionButton(button.id, 'url', e.target.value)}
                            onBlur={() => setTouchedButtonIds((prev) => new Set(prev).add(button.id))}
                            error={buttonError || undefined}
                          />
                          <button
                            type="button"
                            onClick={() => removeActionButton(button.id)}
                            aria-label="Remove action button"
                            className="flex h-9 w-9 shrink-0 items-center justify-center self-start rounded-lg text-gray-400 hover:bg-gray-50 hover:text-rose-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  className="w-fit border-[#1B5E20] text-[#1B5E20] hover:bg-[#1B5E20]/5"
                  onClick={addActionButton}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Button
                </Button>
                <p className="text-xs text-[#6E7678]">Optional. Add one or more call-to-action buttons.</p>
              </div>
            </div>

            {/* 3. AUDIENCE & TARGETING */}
            <div className="flex flex-col gap-4">
              <SectionHeading index={3} title="Audience & Targeting" />
              <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-gray-700">Visitor / Audience *</span>
                  <div className="flex min-h-9 flex-wrap items-center gap-1.5">
                    {visitorOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => toggleVisitor(option)}
                        className={cn(
                          'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                          visitors.includes(option)
                            ? 'border-[#1B5E20] bg-[#1B5E20] text-white'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50',
                        )}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  {shows('visitors') && <span className="text-xs text-red-600">{errors.visitors}</span>}
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-gray-700">Status *</span>
                  <Select
                    value={statusLabel}
                    onValueChange={(value) => {
                      setStatusLabel(value as string)
                      touch('status')
                    }}
                  >
                    <SelectTrigger className={cn(shows('status') && 'border-red-500')}>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {createCampaignStatusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.label}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {shows('status') && <span className="text-xs text-red-600">{errors.status}</span>}
                </div>
              </div>
            </div>

            {/* 4. SCHEDULE */}
            <div className="flex flex-col gap-4">
              <SectionHeading index={4} title="Schedule" />
              <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                <Input
                  type="datetime-local"
                  label="Start Date & Time"
                  value={startAt}
                  onChange={(e) => setStartAt(e.target.value)}
                />
                <Input
                  type="datetime-local"
                  label="End Date & Time"
                  value={endAt}
                  onChange={(e) => setEndAt(e.target.value)}
                  onBlur={() => touch('endAt')}
                  error={shows('endAt') ? errors.endAt : undefined}
                />
              </div>
              <p className="-mt-2 text-xs text-[#6E7678]">Optional. Leave blank to run immediately with no end date.</p>
            </div>
          </div>

          <div className="hidden min-h-0 w-full shrink-0 flex-col gap-5 overflow-y-auto border-l border-gray-100 bg-gray-50/60 px-5 py-5 sm:flex sm:w-80">
            <CampaignPreview title={title} content={content} imageUrl={imageUrl} actionButtons={previewButtons} />

            <div className="flex flex-col gap-2 rounded-xl border border-gray-100 bg-white p-3.5">
              <PreviewRow label="Type" value={campaignType ?? '—'} />
              <PreviewRow label="Audience" value={visitors.length > 0 ? visitors.join(', ') : '—'} />
              <PreviewRow label="Status" value={statusLabel ?? '—'} />
              <PreviewRow label="Schedule" value={formatScheduleSummary(startAt, endAt)} />
              {statusLabel && (
                <div className="pt-1">
                  <Badge variant={statusLabel === 'Active' ? 'emerald' : statusLabel === 'Inactive' ? 'gray' : 'amber'}>
                    {statusLabel}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </DialogBody>
        <DialogFooter className="border-t border-gray-100 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <DialogPrimaryButton className="w-auto px-6" onClick={handleSubmit}>
            Create Campaign
          </DialogPrimaryButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
