import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { Finish } from '../lib/draw'
import type { DeviceKind, DeviceModel } from '../lib/devices'
import type { Format } from '../lib/export'
import type { LoadedImage } from '../lib/image'
import type { Legibility } from '../lib/legibility'
import type { DeviceState, Step } from '../lib/state'
import { DeviceStage } from './DeviceStage'
import { ExportStep } from './ExportStep'
import { PlaceStep } from './PlaceStep'
import { PreviewSwitch } from './PreviewSwitch'
import { StepPanel, type StepDir } from './StepPanel'
import { Stepper, STEPS } from './Stepper'
import { StyleStep } from './StyleStep'
import { btnPrimary, btnSecondary } from './ui'

interface Props {
  kind: DeviceKind
  onKind: (k: DeviceKind) => void
  step: Step
  onStep: (s: Step) => void
  image: LoadedImage
  d: DeviceState
  model: DeviceModel
  onPatch: (p: Partial<DeviceState>) => void
  onFinish: (f: Finish) => void
  level: Legibility | null
  onLevel: (l: Legibility | null) => void
  upscale: number | null
  busy: boolean
  exported: boolean
  format: Format
  onFormat: (f: Format) => void
  onDownload: () => void
  onShare?: () => void
  onReplace: (f: File) => void
  saved: boolean
  carriedFrom: DeviceKind | null
  onCreateOther: () => void
}

export function Wizard(p: Props) {
  const { kind, step, d, model, image } = p
  const i = STEPS.findIndex((s) => s.id === step)
  const prev = STEPS[i - 1]
  const next = STEPS[i + 1]
  // Direction of the last step change. Kept in state so re-renders do not restart the animation.
  const [nav, setNav] = useState<{ step: Step; dir: StepDir }>({ step, dir: 'none' })
  if (nav.step !== step) setNav({ step, dir: i > STEPS.findIndex((s) => s.id === nav.step) ? 'fwd' : 'back' })
  const dir = nav.step === step ? nav.dir : 'none'
  // Move focus to the new step's heading so keyboard and screen reader users land in the right place.
  const shown = useRef(step)
  useEffect(() => {
    if (shown.current === step) return
    shown.current = step
    document.getElementById('step-title')?.focus({ preventScroll: true })
  }, [step])
  const announce = `Step ${i + 1} of ${STEPS.length}: ${STEPS[i].label}. ${kind === 'mac' ? 'Mac' : 'iPhone'} wallpaper.`
  const setSettings = (settings: typeof d.settings) => p.onPatch({ settings })

  const footer: ReactNode = (
    <>
      {prev && <button type="button" onClick={() => p.onStep(prev.id)} className={btnSecondary}>Back</button>}
      {step === 'style' && (
        <button type="button" onClick={p.onDownload} disabled={p.busy} className={btnSecondary}>
          {p.busy ? 'Exporting…' : p.saved ? 'Saved ✓' : 'Download'}
        </button>
      )}
      {next && <button type="button" onClick={() => p.onStep(next.id)} className={`${btnPrimary} ml-auto`}>Next: {next.label}</button>}
    </>
  )

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="sticky top-0 z-30 -mx-4 flex min-w-0 flex-col items-center gap-3 bg-stone-100 px-4 pt-2 pb-3 sm:-mx-8 sm:px-8 lg:top-6 lg:mx-0 lg:gap-5 lg:bg-transparent lg:p-0 dark:bg-neutral-950 dark:lg:bg-transparent">
        <div key={kind} className="stage-enter flex h-(--stage-h) w-full items-center justify-center [--stage-h:40svh] lg:[--stage-h:min(720px,calc(100svh_-_9rem))]">
          <DeviceStage model={model} image={image.preview} settings={d.settings} view={d.view} blur={d.homeBlur} onChange={setSettings} onLegibility={p.onLevel} />
        </div>
        <PreviewSwitch kind={kind} value={d.view} onChange={(view) => p.onPatch({ view })} />
      </div>

      <div className="min-w-0 space-y-4">
        <p role="status" aria-live="polite" className="sr-only">{announce}</p>
        <Stepper step={step} onStep={p.onStep} />
        {step === 'place' && (
          <StepPanel dir={dir} title="Place" hint="Zoom and drag to frame your image." footer={footer}>
            <PlaceStep
              kind={kind} onKind={p.onKind} image={image.preview} width={image.bitmap.width} height={image.bitmap.height}
              onReplace={p.onReplace}
              modelId={d.modelId} onModel={(modelId) => p.onPatch({ modelId })} custom={d.custom} onCustom={(custom) => p.onPatch({ custom })}
              settings={d.settings} onSettings={setSettings} view={d.view} level={p.level} upscale={p.upscale}
            />
          </StepPanel>
        )}
        {step === 'style' && (
          <StepPanel dir={dir} title="Style" hint="Set the mood. The preview updates as you go." footer={footer}>
            <StyleStep
              image={image.preview} model={model} settings={d.settings} onSettings={setSettings} onFinish={p.onFinish} view={d.view} level={p.level}
              showBlur={kind === 'iphone' && d.view === 'alt'} homeBlur={d.homeBlur} onHomeBlur={(homeBlur) => p.onPatch({ homeBlur })}
            />
          </StepPanel>
        )}
        {step === 'export' && (
          <StepPanel dir={dir} title="Export" hint="Ready at your screen's native resolution." footer={footer}>
            <ExportStep model={model} format={p.format} onFormat={p.onFormat} upscale={p.upscale} busy={p.busy} exported={p.exported} onDownload={p.onDownload} onShare={p.onShare} saved={p.saved} carriedFrom={p.carriedFrom} onAdjust={() => p.onStep('place')} view={d.view} level={p.level} scrim={d.settings.scrim} onFixClock={() => p.onStep('style')} onCreateOther={p.onCreateOther} />
          </StepPanel>
        )}
      </div>
    </div>
  )
}
