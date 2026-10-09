import { useEffect, useRef } from 'react'
import { btnPrimary, btnSecondary } from './ui'

interface Props {
  open: boolean
  title: string
  body: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
}

/** A small in-page confirmation. Uses <dialog>, so focus stays inside it and Esc closes it. */
export function ConfirmDialog({ open, title, body, confirmLabel, onConfirm, onCancel }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-labelledby="confirm-title"
      aria-describedby="confirm-body"
      onCancel={(e) => { e.preventDefault(); onCancel() }}
      onClick={(e) => { if (e.target === ref.current) onCancel() }}
      className="confirm m-auto w-[min(92vw,380px)] rounded-2xl border border-stone-200 bg-white p-0 text-stone-900 shadow-2xl backdrop:bg-black/40 dark:border-white/10 dark:bg-neutral-900 dark:text-stone-100"
    >
      <div className="p-6">
        <h2 id="confirm-title" className="font-display text-lg font-semibold tracking-tight">{title}</h2>
        <p id="confirm-body" className="mt-1.5 text-sm text-stone-500 dark:text-white/55">{body}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" autoFocus onClick={onCancel} className={btnSecondary}>Cancel</button>
          <button type="button" onClick={onConfirm} className={btnPrimary}>{confirmLabel}</button>
        </div>
      </div>
    </dialog>
  )
}
