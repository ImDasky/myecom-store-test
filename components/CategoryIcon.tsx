import {
  CubeIcon,
  FilmIcon,
  ScissorsIcon,
  ArchiveBoxIcon,
  HandRaisedIcon,
  ShieldCheckIcon,
  WrenchScrewdriverIcon,
  PaintBrushIcon,
  BoltIcon,
  BeakerIcon,
} from '@heroicons/react/24/outline'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'strapping': CubeIcon,
  'stretch-film': FilmIcon,
  'tape': ScissorsIcon,
  'packaging': ArchiveBoxIcon,
  'gloves': HandRaisedIcon,
  'safety': ShieldCheckIcon,
  'tools': WrenchScrewdriverIcon,
  'paint': PaintBrushIcon,
  'electrical': BoltIcon,
  'chemicals': BeakerIcon,
  'default': CubeIcon,
}

interface CategoryIconProps {
  iconName?: string | null
  className?: string
  color?: string
}

export function CategoryIcon({ iconName, className = 'w-12 h-12', color }: CategoryIconProps) {
  const IconComponent = iconName && iconMap[iconName.toLowerCase()] 
    ? iconMap[iconName.toLowerCase()] 
    : iconMap['default']

  // Default to dark gray/black if no color provided for better visibility
  const iconColor = color || '#1f2937'

  return (
    <div style={{ color: iconColor }} className="inline-flex">
      <IconComponent className={className} strokeWidth={2} />
    </div>
  )
}

