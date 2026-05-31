/**
 * Stop notes body — bold underlined Wikipedia links for significant place names.
 */
import type { StopPlaceLink } from '../../types/travelState';
import { segmentStopNotes } from '../../lib/travel/stopNotesRichText';
import type { WikipediaPlaceTarget } from '../../lib/travel/wikipediaSummary';

type Props = {
  notes: string;
  placeLinks?: StopPlaceLink[];
  onPlaceLinkClick?: (target: WikipediaPlaceTarget) => void;
};

const LINK_CLASS =
  'font-semibold text-amber-50 underline decoration-amber-500/80 underline-offset-[3px] hover:text-white hover:decoration-amber-300 touch-manipulation';

export default function StopNotesBody({ notes, placeLinks, onPlaceLinkClick }: Props) {
  const segments = segmentStopNotes(notes, placeLinks);

  return (
    <div className="text-sm text-amber-100/90 leading-relaxed pl-6 whitespace-pre-line">
      {segments.map((seg, i) =>
        seg.type === 'link' ? (
          onPlaceLinkClick ? (
            <button
              key={`${seg.wikiTitle}-${i}`}
              type="button"
              onClick={() =>
                onPlaceLinkClick({
                  label: seg.label,
                  wikiTitle: seg.wikiTitle,
                  wikiSection: seg.wikiSection,
                  sectionTitle: seg.sectionTitle,
                })
              }
              className={`${LINK_CLASS} inline text-left bg-transparent border-0 p-0 cursor-pointer`}
            >
              {seg.label}
            </button>
          ) : (
            <a
              key={`${seg.href}-${i}`}
              href={seg.href}
              target="_blank"
              rel="noopener noreferrer"
              className={LINK_CLASS}
            >
              {seg.label}
            </a>
          )
        ) : (
          <span key={`t-${i}`}>{seg.text}</span>
        )
      )}
    </div>
  );
}
