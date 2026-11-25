// ═══════════════════════════════════════════════════════════════════
// SOUND ENGINE — Soda Can Opening & Effervescence
// Gesture-deferred Web Audio API synthesizer + persistent mute state
// ═══════════════════════════════════════════════════════════════════

const MUTE_STORAGE_KEY = 'fridgecig_muted'

let cachedContext: AudioContext | null = null
let canOpenBuffer: AudioBuffer | null = null
let canOpenLoading: Promise<AudioBuffer | null> | null = null

export function isMuted(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(MUTE_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export function setMuted(muted: boolean): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(MUTE_STORAGE_KEY, String(muted))
  } catch {
    // Ignore storage errors (e.g. private mode)
  }
}

export function toggleMute(): boolean {
  const next = !isMuted()
  setMuted(next)
  return next
}

function getAudioContext(): AudioContext {
  if (cachedContext) return cachedContext
  const AudioCtx =
    typeof window !== 'undefined'
      ? window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      : null
  if (!AudioCtx) {
    throw new Error('Web Audio API not supported in this environment')
  }
  cachedContext = new AudioCtx()
  return cachedContext
}

async function ensureActiveContext(): Promise<AudioContext> {
  const ctx = getAudioContext()
  if (ctx.state === 'suspended') {
    await ctx.resume()
  }
  return ctx
}

function loadCanOpenBuffer(ctx: AudioContext): Promise<AudioBuffer | null> {
  if (canOpenBuffer) return Promise.resolve(canOpenBuffer)
  if (canOpenLoading) return canOpenLoading

  canOpenLoading = fetch('/fridgecig/sounds/can_open.m4a')
    .then((res) => (res.ok ? res.arrayBuffer() : null))
    .then((arr) => (arr ? ctx.decodeAudioData(arr) : null))
    .then((decoded) => {
      canOpenBuffer = decoded
      return decoded
    })
    .catch(() => null)

  return canOpenLoading
}

/**
 * Procedural synthesis simulating physical soda can crack and hiss.
 */
export function playCrackSound(): void {
  if (typeof window === 'undefined' || isMuted()) return

  try {
    const ctx = getAudioContext()
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {})
    }
    const now = ctx.currentTime

    const master = ctx.createGain()
    master.gain.setValueAtTime(0.7, now)
    master.connect(ctx.destination)

    // 1. Initial metallic tab puncture (fast high-frequency transient click)
    const popOsc = ctx.createOscillator()
    popOsc.type = 'triangle'
    popOsc.frequency.setValueAtTime(3200, now)
    popOsc.frequency.exponentialRampToValueAtTime(420, now + 0.035)

    const popGain = ctx.createGain()
    popGain.gain.setValueAtTime(0.85, now)
    popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04)

    popOsc.connect(popGain)
    popGain.connect(master)
    popOsc.start(now)
    popOsc.stop(now + 0.045)

    // 2. High-pressure pressurized gas release hiss (white noise burst)
    const bufferSize = Math.floor(ctx.sampleRate * 0.45)
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const output = noiseBuffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1
    }

    const whiteNoise = ctx.createBufferSource()
    whiteNoise.buffer = noiseBuffer

    // Bandpass filter to isolate crisp carbonation fizz
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(5400, now)
    filter.Q.setValueAtTime(1.8, now)

    const noiseGain = ctx.createGain()
    noiseGain.gain.setValueAtTime(0.01, now)
    noiseGain.gain.exponentialRampToValueAtTime(0.65, now + 0.025)
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.42)

    whiteNoise.connect(filter)
    filter.connect(noiseGain)
    noiseGain.connect(master)

    whiteNoise.start(now + 0.01)
    whiteNoise.stop(now + 0.45)
  } catch (err) {
    console.debug('Web Audio procedural crack failed:', err)
  }
}

/**
 * Play soda can open sound strictly inside user gesture.
 * Uses cached decoded m4a buffer when available, else procedural crack + lazy decode.
 */
export function playCanOpenSound(): void {
  if (typeof window === 'undefined' || isMuted()) return

  try {
    const ctx = getAudioContext()
    if (canOpenBuffer) {
      ensureActiveContext()
        .then((activeCtx) => {
          if (isMuted() || !canOpenBuffer) return
          const source = activeCtx.createBufferSource()
          source.buffer = canOpenBuffer
          const gain = activeCtx.createGain()
          gain.gain.setValueAtTime(0.75, activeCtx.currentTime)
          source.connect(gain)
          gain.connect(activeCtx.destination)
          source.start(0)
        })
        .catch(() => {
          playCrackSound()
        })
      return
    }

    // Immediate zero-latency procedural feedback on first gesture, decode sample for subsequent opens
    playCrackSound()
    loadCanOpenBuffer(ctx).catch(() => {})
  } catch (err) {
    console.debug('Web Audio can-open sound failed:', err)
  }
}

/**
 * Play crisp tactile tab switch click.
 */
export function playTabSound(): void {
  if (typeof window === 'undefined' || isMuted()) return

  try {
    const ctx = getAudioContext()
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {})
    }
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(1250, now)
    osc.frequency.exponentialRampToValueAtTime(480, now + 0.025)

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.18, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.028)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.03)
  } catch (err) {
    console.debug('Web Audio tab sound unavailable:', err)
  }
}

/**
 * Play subtle confirmation chime on clipboard copy or verified Snitch intel.
 */
export function playSuccessSound(): void {
  if (typeof window === 'undefined' || isMuted()) return

  try {
    const ctx = getAudioContext()
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {})
    }
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, now)
    osc.frequency.setValueAtTime(1318.5, now + 0.06)

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.14, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.19)
  } catch (err) {
    console.debug('Web Audio success sound unavailable:', err)
  }
}

/**
 * Play a crispy, clean micro-droplet pop when wiping condensation.
 */
export function playDropletPopSound(): void {
  if (typeof window === 'undefined' || isMuted()) return

  try {
    const ctx = getAudioContext()
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {})
    }

    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(2950, now)
    osc.frequency.exponentialRampToValueAtTime(980, now + 0.038)

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.3, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.042)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.045)
  } catch (err) {
    console.debug('Web Audio droplet sound unavailable:', err)
  }
}

export function playWipeSound(): void {
  playDropletPopSound()
}
