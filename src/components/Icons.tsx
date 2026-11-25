import React from 'react'

export interface IconProps {
  className?: string
  size?: number
  strokeWidth?: number
}

const DEFAULT_SIZE = 16
const DEFAULT_STROKE = 2.2

function baseProps(size: number, strokeWidth: number, className?: string) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none' as const,
    stroke: 'currentColor',
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true as const,
    className: className ? `shrink-0 ${className}` : 'w-4 h-4 shrink-0',
  }
}

export function RefreshIcon({
  className = 'w-3.5 h-3.5',
  size = 14,
  strokeWidth = DEFAULT_STROKE,
}: IconProps) {
  return (
    <svg {...baseProps(size, strokeWidth, className)}>
      <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  )
}

export function VolumeOnIcon({
  className = 'w-3.5 h-3.5',
  size = 14,
  strokeWidth = DEFAULT_STROKE,
}: IconProps) {
  return (
    <svg {...baseProps(size, strokeWidth, className)}>
      <path d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    </svg>
  )
}

export function VolumeOffIcon({
  className = 'w-3.5 h-3.5',
  size = 14,
  strokeWidth = DEFAULT_STROKE,
}: IconProps) {
  return (
    <svg {...baseProps(size, strokeWidth, className)}>
      <path d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
      <path d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
    </svg>
  )
}

export function ClipboardIcon({
  className = 'w-3.5 h-3.5',
  size = 14,
  strokeWidth = DEFAULT_STROKE,
}: IconProps) {
  return (
    <svg {...baseProps(size, strokeWidth, className)}>
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
    </svg>
  )
}

export function CheckCircleIcon({
  className = 'w-3.5 h-3.5',
  size = 14,
  strokeWidth = DEFAULT_STROKE,
}: IconProps) {
  return (
    <svg {...baseProps(size, strokeWidth, className)}>
      <path d="M9 12l2 2 4-4" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  )
}

export function AlertTriangleIcon({
  className = 'w-3.5 h-3.5',
  size = 14,
  strokeWidth = DEFAULT_STROKE,
}: IconProps) {
  return (
    <svg {...baseProps(size, strokeWidth, className)}>
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  )
}

export function MapPinIcon({
  className = 'w-4 h-4',
  size = DEFAULT_SIZE,
  strokeWidth = DEFAULT_STROKE,
}: IconProps) {
  return (
    <svg {...baseProps(size, strokeWidth, className)}>
      <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

export function FlameIcon({
  className = 'w-4 h-4',
  size = DEFAULT_SIZE,
  strokeWidth = DEFAULT_STROKE,
}: IconProps) {
  return (
    <svg {...baseProps(size, strokeWidth, className)}>
      <path d="M12 2c.5 3.5-2.5 5.5-2.5 8.5a2.5 2.5 0 005 0c0-1.2-.5-2.2-1-3 2.5 1.3 4.5 4 4.5 7A6 6 0 116 14.5c0-3.3 2.2-6.2 6-12.5z" />
    </svg>
  )
}

export function TrophyIcon({
  className = 'w-4 h-4',
  size = DEFAULT_SIZE,
  strokeWidth = DEFAULT_STROKE,
}: IconProps) {
  return (
    <svg {...baseProps(size, strokeWidth, className)}>
      <path d="M6 9H4.5a2.5 2.5 0 010-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 000-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0012 0V2z" />
    </svg>
  )
}

export function ArrowRightIcon({
  className = 'w-4 h-4',
  size = DEFAULT_SIZE,
  strokeWidth = DEFAULT_STROKE,
}: IconProps) {
  return (
    <svg {...baseProps(size, strokeWidth, className)}>
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  )
}

export function WalkIcon({
  className = 'w-3.5 h-3.5',
  size = 14,
  strokeWidth = DEFAULT_STROKE,
}: IconProps) {
  return (
    <svg {...baseProps(size, strokeWidth, className)}>
      <circle cx="13" cy="4.5" r="1.5" />
      <path d="M10 21l1.5-5.5L9 13l2-4.5 3 2 3 1" />
      <path d="M15.5 21l-2.5-5" />
      <path d="M7.5 14.5L6 19" />
    </svg>
  )
}

export function BoltIcon({
  className = 'w-4 h-4',
  size = DEFAULT_SIZE,
  strokeWidth = DEFAULT_STROKE,
}: IconProps) {
  return (
    <svg {...baseProps(size, strokeWidth, className)}>
      <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
    </svg>
  )
}

export function TargetIcon({
  className = 'w-8 h-8',
  size = 32,
  strokeWidth = DEFAULT_STROKE,
}: IconProps) {
  return (
    <svg {...baseProps(size, strokeWidth, className)}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" />
    </svg>
  )
}

export function CrosshairIcon({
  className = 'w-4 h-4',
  size = DEFAULT_SIZE,
  strokeWidth = DEFAULT_STROKE,
}: IconProps) {
  return (
    <svg {...baseProps(size, strokeWidth, className)}>
      <circle cx="12" cy="12" r="7" />
      <path d="M12 2v3" />
      <path d="M12 19v3" />
      <path d="M2 12h3" />
      <path d="M19 12h3" />
    </svg>
  )
}

export function LoaderIcon({
  className = 'w-4 h-4',
  size = DEFAULT_SIZE,
  strokeWidth = DEFAULT_STROKE,
}: IconProps) {
  return (
    <svg {...baseProps(size, strokeWidth, className)}>
      <path d="M12 2v4" />
      <path d="M12 18v4" />
      <path d="M4.93 4.93l2.83 2.83" />
      <path d="M16.24 16.24l2.83 2.83" />
      <path d="M2 12h4" />
      <path d="M18 12h4" />
      <path d="M4.93 19.07l2.83-2.83" />
      <path d="M16.24 7.76l2.83-2.83" />
    </svg>
  )
}

export function RotateCcwIcon({
  className = 'w-3.5 h-3.5',
  size = 14,
  strokeWidth = DEFAULT_STROKE,
}: IconProps) {
  return (
    <svg {...baseProps(size, strokeWidth, className)}>
      <path d="M3 12a9 9 0 103-6.7L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  )
}

export function CheckIcon({
  className = 'w-4 h-4',
  size = DEFAULT_SIZE,
  strokeWidth = 2.5,
}: IconProps) {
  return (
    <svg {...baseProps(size, strokeWidth, className)}>
      <path d="M5 13l4 4L19 7" />
    </svg>
  )
}

export function PackageIcon({
  className = 'w-3.5 h-3.5',
  size = 14,
  strokeWidth = DEFAULT_STROKE,
}: IconProps) {
  return (
    <svg {...baseProps(size, strokeWidth, className)}>
      <path d="M16.5 9.4l-9-5.19" />
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <path d="M3.27 6.96L12 12.01l8.73-5.05" />
      <path d="M12 22.08V12" />
    </svg>
  )
}

export function StoreIcon({
  className = 'w-4 h-4',
  size = DEFAULT_SIZE,
  strokeWidth = DEFAULT_STROKE,
}: IconProps) {
  return (
    <svg {...baseProps(size, strokeWidth, className)}>
      <path d="M3 9l1-5h16l1 5" />
      <path d="M3 9a3 3 0 006 0 3 3 0 006 0 3 3 0 006 0" />
      <path d="M5 12v8h14v-8" />
      <path d="M9 20v-5h6v5" />
    </svg>
  )
}

export function BarChartIcon({
  className = 'w-3.5 h-3.5',
  size = 14,
  strokeWidth = DEFAULT_STROKE,
}: IconProps) {
  return (
    <svg {...baseProps(size, strokeWidth, className)}>
      <path d="M3 20h18" />
      <path d="M7 20v-6" />
      <path d="M12 20V8" />
      <path d="M17 20v-9" />
    </svg>
  )
}

export function DropletIcon({
  className = 'w-4 h-4',
  size = DEFAULT_SIZE,
  strokeWidth = DEFAULT_STROKE,
}: IconProps) {
  return (
    <svg {...baseProps(size, strokeWidth, className)}>
      <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0L12 2.69z" />
    </svg>
  )
}

export function CloseIcon({
  className = 'w-5 h-5',
  size = 20,
  strokeWidth = DEFAULT_STROKE,
}: IconProps) {
  return (
    <svg {...baseProps(size, strokeWidth, className)}>
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </svg>
  )
}
