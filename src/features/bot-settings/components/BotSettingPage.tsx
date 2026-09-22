import { useState } from 'react'
import { toast } from 'react-toastify'
import { Button } from '@/components/ui/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/PageHeader'
import { roleCan } from '@/config/roles'
import { useWorkspaceRoleStore } from '@/stores/useWorkspaceRoleStore'
import { defaultBotSettings } from '../data/defaultBotSettings'
import type { BotSettings } from '../types'
import { AppearanceTab } from './AppearanceTab'
import { ChatBehaviorTab } from './ChatBehaviorTab'
import { ChatFormsTab } from './ChatFormsTab'
import { ContentMessagesTab } from './ContentMessagesTab'
import { InstallationCodeTab } from './InstallationCodeTab'
import { LivePreview } from './LivePreview'

const tabTriggerClassName = 'data-active:text-[#1B5E20] data-active:after:bg-[#1B5E20] after:h-1 after:rounded-full'

export function BotSettingPage() {
  const viewerRole = useWorkspaceRoleStore((state) => state.role)
  const canEdit = roleCan(viewerRole, 'bot.settings.edit')
  const canViewInstallCode = roleCan(viewerRole, 'bot.installCode.view')

  const [activeTab, setActiveTab] = useState('appearance')
  const [draft, setDraft] = useState<BotSettings>(defaultBotSettings)
  const [saved, setSaved] = useState<BotSettings>(defaultBotSettings)

  function handleCancel() {
    setDraft(saved)
  }

  function handleSave() {
    setSaved(draft)
    toast.success('Bot settings saved')
  }

  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-2xl">
      <PageHeader title="Setting" />

      <PageHeader as="h2" title="Bot Setting" description="Customize the look and feel of your chat widget" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_450px] lg:items-start">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as string)}>
            <div className="overflow-x-auto">
              <TabsList variant="line">
                <TabsTrigger value="appearance" className={tabTriggerClassName}>
                  Appearance
                </TabsTrigger>
                <TabsTrigger value="content" className={tabTriggerClassName}>
                  Content &amp; Messages
                </TabsTrigger>
                <TabsTrigger value="behavior" className={tabTriggerClassName}>
                  Chat Behavior
                </TabsTrigger>
                <TabsTrigger value="forms" className={tabTriggerClassName}>
                  Chat Forms
                </TabsTrigger>
                {canViewInstallCode && (
                  <TabsTrigger value="installation" className={tabTriggerClassName}>
                    Installation Code
                  </TabsTrigger>
                )}
              </TabsList>
            </div>

            <div className="mt-5">
              {/* A native fieldset cascades `disabled` to every real form control
                  inside it — inputs, selects, switches, buttons — without each
                  tab needing its own read-only prop. `bot.settings.view` without
                  `.edit` (CSR Admin) gets a genuinely inert form, not a hidden page. */}
              <fieldset disabled={!canEdit} className="contents">
                <TabsContent value="appearance">
                  <AppearanceTab value={draft.appearance} onChange={(appearance) => setDraft((prev) => ({ ...prev, appearance }))} />
                </TabsContent>
                <TabsContent value="content">
                  <ContentMessagesTab value={draft.content} onChange={(content) => setDraft((prev) => ({ ...prev, content }))} />
                </TabsContent>
                <TabsContent value="behavior">
                  <ChatBehaviorTab
                    availability={draft.availability}
                    behavior={draft.behavior}
                    onAvailabilityChange={(availability) => setDraft((prev) => ({ ...prev, availability }))}
                    onBehaviorChange={(behavior) => setDraft((prev) => ({ ...prev, behavior }))}
                  />
                </TabsContent>
                <TabsContent value="forms">
                  <ChatFormsTab
                    preChatForm={draft.preChatForm}
                    postChatForm={draft.postChatForm}
                    onPreChatFormChange={(preChatForm) => setDraft((prev) => ({ ...prev, preChatForm }))}
                    onPostChatFormChange={(postChatForm) => setDraft((prev) => ({ ...prev, postChatForm }))}
                  />
                </TabsContent>
              </fieldset>
              {canViewInstallCode && (
                <TabsContent value="installation">
                  <InstallationCodeTab settings={draft} />
                </TabsContent>
              )}
            </div>
          </Tabs>

          {activeTab !== 'installation' && (
            canEdit ? (
              <div className="mt-6 flex items-center gap-2 border-t border-gray-100 pt-4">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleSave} className="bg-[#1B5E20] text-white hover:bg-[#1B5E20]/90">
                  Save
                </Button>
              </div>
            ) : (
              <p className="mt-6 border-t border-gray-100 pt-4 text-xs text-[#6E7678]">
                Read-only for your role — Admin and above can change these settings.
              </p>
            )
          )}
        </div>

        <LivePreview settings={draft} />
      </div>
    </div>
  )
}
