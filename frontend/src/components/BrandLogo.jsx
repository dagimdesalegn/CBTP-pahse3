import darkLogo from '../assets/shemachoch_blackbg_cropped.png'
import lightLogo from '../assets/shemachoch_whitebg_cropped.png'

export default function BrandLogo({ tone = 'dark', className = '', alt = 'Shemachoch' }) {
  const src = tone === 'light' ? lightLogo : darkLogo

  return (
    <img
      src={src}
      alt={alt}
      className={`object-contain ${className}`}
    />
  )
}
