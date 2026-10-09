import type { ReactNode } from 'react'
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
import { StepPanel } from './StepPanel'
import { Stepper, STEPS } from './Stepper'
import { StyleStep } from './StyleStep'
import { btnSecondary } from './ui'

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
  onRemove: () => void
  saved: boolean
  carriedFrom: DeviceKind | null
  onCreateOther: () => void
}

const primaryBtn =
  'inline-flex items-center justify-center rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-stone-700 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900 dark:bg-white dark:text-stone-900 dark:hover:bg-stone-200 dark:focus-visible:outline-white'

export function Wizard(p: Props) {
  const { kind, step, d, model, image } = p
  const i = STEPS.findIndex((s) => s.id === step)
  const prev = STEPS[i - 1]
  const next = STEPS[i + 1]
  const setSettings = (settings: typeof d.settings) => p.onPatch({ settings })

  const footer: ReactNode = (
    <>
      {prev && <button type="button" onClick={() => p.onStep(prev.id)} className={btnSecondary}>Back</button>}
      {step === 'style' && (
        <button type="button" onClick={p.onDownload} disabled={p.busy} className={btnSecondary}>
          {p.busy ? 'Exporting…' : p.saved ? 'Saved ✓' : 'Download'}
        </button>
      )}
      {next && <button type="button" onClick={() => p.onStep(next.id)} className={`${primaryBtn} ml-auto`}>Next: {next.label}</button>}
    </>
  )

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="sticky top-0 z-30 -mx-4 flex min-w-0 flex-col items-center gap-3 bg-stone-100 px-4 pt-2 pb-3 sm:-mx-8 sm:px-8 lg:top-6 lg:mx-0 lg:gap-5 lg:bg-transparent lg:p-0 dark:bg-neutral-950 dark:lg:bg-transparent">
        <div className="flex w-full justify-center">
          <DeviceStage key={kind} model={model} image={image.preview} settings={d.settings} view={d.view} blur={d.homeBlur} onChange={setSettings} onLegibility={p.onLevel} maxVh={40} />
        </div>
        <PreviewSwitch kind={kind} value={d.view} onChange={(view) => p.onPatch({ view })} />
      </div>

      <div className="min-w-0 space-y-4">
        <Stepper step={step} onStep={p.onStep} />
        {step === 'place' && (
          <StepPanel title="Place" hint="Pick the device, then zoom and move the image." footer={footer}>
            <PlaceStep
              kind={kind} onKind={p.onKind} image={image.preview} width={image.bitmap.width} height={image.bitmap.height}
              onReplace={p.onReplace} onRemove={p.onRemove}
              modelId={d.modelId} onModel={(modelId) => p.onPatch({ modelId })} custom={d.custom} onCustom={(custom) => p.onPatch({ custom })}
              settings={d.settings} onSettings={setSettings} view={d.view} level={p.level}
            />
          </StepPanel>
        )}
        {step === 'style' && (
          <StepPanel title="Style" hint="Give it a look. The preview updates as you go." footer={footer}>
            <StyleStep
              image={image.preview} settings={d.settings} onSettings={setSettings} onFinish={p.onFinish} view={d.view} level={p.level}
              showBlur={kind === 'iphone' && d.view === 'alt'} homeBlur={d.homeBlur} onHomeBlur={(homeBlur) => p.onPatch({ homeBlur })}
            />
          </StepPanel>
        )}
        {step === 'export' && (
          <StepPanel title="Export" hint="Save the file at the screen's native resolution." footer={footer}>
            <ExportStep model={model} format={p.format} onFormat={p.onFormat} upscale={p.upscale} busy={p.busy} exported={p.exported} onDownload={p.onDownload} onShare={p.onShare} saved={p.saved} carriedFrom={p.carriedFrom} onAdjust={() => p.onStep('place')} onCreateOther={p.onCreateOther} />
          </StepPanel>
        )}
      </div>
    </div>
  )
}
