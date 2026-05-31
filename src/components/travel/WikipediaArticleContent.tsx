/**
 * Render Wikipedia mobile-html article body inside Nauta.
 */
import { useCallback } from 'react';
import { parseItalianWikipediaArticleTitle } from '../../lib/travel/wikipediaArticle';

type Props = {
  html: string;
  onNavigate: (wikiTitle: string) => void;
};

export default function WikipediaArticleContent({ html, onNavigate }: Props) {
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const anchor = (event.target as Element).closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      const wikiTitle = parseItalianWikipediaArticleTitle(href);
      if (wikiTitle) {
        event.preventDefault();
        onNavigate(wikiTitle);
        return;
      }

      if (/^https?:\/\//i.test(href)) {
        event.preventDefault();
        window.open(href, '_blank', 'noopener,noreferrer');
      }
    },
    [onNavigate]
  );

  return (
    <div
      className="wiki-article-content"
      onClick={handleClick}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
