import { NAUTA_LOGO_HEIGHT_PX } from '../lib/layout';

/** Brand mark from public/nauta.png (name and tagline are baked into the asset). */
type Props = {
  className?: string;
  /** Height in px; defaults to ¾ of sticky header. */
  height?: number;
};

export default function NautaLogo({ className = '', height = NAUTA_LOGO_HEIGHT_PX }: Props) {
  return (
    <img
      src="/nauta.png"
      alt="Nauta Viaggi Sicuri"
      className={className}
      style={{ height, width: 'auto' }}
      draggable={false}
    />
  );
}
