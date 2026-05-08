import { useState } from 'react'
import { useEditorStore } from '../../store/editor'
import { templateToHtml } from '../../lib/renderer'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
 } from "@/components/ui/dialog"
import { Input } from '../ui/input'


export default function SendTestModal() {
  const template = useEditorStore((s) => s.template)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [showModal, setShowModal] = useState(false)

  function onClose() {
    setShowModal(false)
    setEmail('')
    setStatus('idle')
  }


  const handleSend = async () => {
    if (!email) return
    setStatus('sending')

    try {
      const html = templateToHtml(template)
      const res = await fetch('/api/resend/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'dispatch@coros.click',
          to: email,
          subject: `Test: ${template.name}`,
          html,
        }),
      })

      if (res.ok) {
        setStatus('sent')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <Dialog open={showModal} onOpenChange={onClose}>
      <button
        onClick={() => setShowModal(true)}
        className="text-xs px-3 py-1.5 rounded-md bg-white text-black font-medium hover:bg-white/90 transition-colors cursor-pointer"
      >
        Send Test Email
      </button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send test email </DialogTitle>
          <DialogDescription>
            Sends the current newsletter to your inbox
          </DialogDescription>
        </DialogHeader>
         {status === 'sent' ? (
          <div className="text-xs text-green-400 text-center py-4">
            ✓ Email sent — check your inbox
          </div>
        ) : (
          <>
            <Input
              type="email"
              placeholder="your@email.com"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {status === 'error' && (
              <p className="text-xs text-red-400">Something went wrong. Check your API key.</p>
            )}

            <div className="flex gap-2 justify-end">
              <button
                onClick={onClose}
                className="text-xs px-3 py-1.5 rounded-md border border-white/15 text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={!email || status === 'sending'}
                className="text-xs px-3 py-1.5 rounded-md bg-white text-black font-medium hover:bg-white/90 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {status === 'sending' ? 'Sending...' : 'Send'}
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}