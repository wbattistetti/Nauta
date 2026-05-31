/**
 * Slide-up sheet — Italian Wikipedia summary, verified section, and full article.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, X } from 'lucide-react';
import {
  WIKI_SHEET_ARTICLE_LOADING,
  WIKI_SHEET_ATTRIBUTION,
  WIKI_SHEET_BACK_LABEL,
  WIKI_SHEET_CLOSE_LABEL,
  WIKI_SHEET_CONTEXT_LABEL,
  WIKI_SHEET_ERROR,
  WIKI_SHEET_LOADING,
  WIKI_SHEET_OPEN_FULL,
} from '../../lib/travel/itineraryCopy';
import { fetchWikipediaArticleHtml } from '../../lib/travel/wikipediaArticle';
import { fetchWikipediaSectionHtmlByAnchor } from '../../lib/travel/wikipediaSections';
import {
  fetchWikipediaSummary,
  type WikipediaPlaceTarget,
  type WikipediaSummary,
} from '../../lib/travel/wikipediaSummary';
import WikipediaArticleContent from './WikipediaArticleContent';

type SheetView = 'summary' | 'section' | 'article';

type Props = {
  open: boolean;
  target: WikipediaPlaceTarget | null;
  onClose: () => void;
};

function showContextSubtitle(target: WikipediaPlaceTarget, articleTitle: string): boolean {
  if (target.wikiSection) return true;
  return target.label.trim().toLowerCase() !== articleTitle.trim().toLowerCase();
}

export default function WikipediaPlaceSheet({ open, target, onClose }: Props) {
  const [view, setView] = useState<SheetView>('summary');
  const [summary, setSummary] = useState<WikipediaSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [sectionHtml, setSectionHtml] = useState<string | null>(null);
  const [sectionTitle, setSectionTitle] = useState<string | null>(null);
  const [sectionLoading, setSectionLoading] = useState(false);
  const [sectionError, setSectionError] = useState<string | null>(null);
  const [articleWikiTitle, setArticleWikiTitle] = useState<string | null>(null);
  const [articleScrollAnchor, setArticleScrollAnchor] = useState<string | null>(null);
  const [articleHtml, setArticleHtml] = useState<string | null>(null);
  const [articleLoading, setArticleLoading] = useState(false);
  const [articleError, setArticleError] = useState<string | null>(null);
  const articleScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !target?.wikiTitle.trim()) {
      setView('summary');
      setSummary(null);
      setSummaryLoading(false);
      setSummaryError(null);
      setSectionHtml(null);
      setSectionTitle(null);
      setSectionLoading(false);
      setSectionError(null);
      setArticleWikiTitle(null);
      setArticleScrollAnchor(null);
      setArticleHtml(null);
      setArticleLoading(false);
      setArticleError(null);
      return;
    }

    const controller = new AbortController();
    const hasSection = Boolean(target.wikiSection?.trim());

    setSummary(null);
    setSummaryError(null);
    setSectionHtml(null);
    setSectionTitle(target.sectionTitle ?? null);
    setSectionError(null);
    setArticleWikiTitle(null);
    setArticleScrollAnchor(null);
    setArticleHtml(null);
    setArticleError(null);

    if (hasSection) {
      setView('section');
      setSummaryLoading(false);
      setSectionLoading(true);

      fetchWikipediaSectionHtmlByAnchor(
        target.wikiTitle,
        target.wikiSection!,
        controller.signal
      )
        .then(({ html, sectionTitle: title }) => {
          setSectionHtml(html);
          setSectionTitle(title);
          setSectionLoading(false);
        })
        .catch(() => {
          if (controller.signal.aborted) return;
          setSectionLoading(false);
          setSectionError(WIKI_SHEET_ERROR);
        });
    } else {
      setView('summary');
      setSectionLoading(false);
      setSummaryLoading(true);

      fetchWikipediaSummary(target.wikiTitle, controller.signal)
        .then((data) => {
          setSummary(data);
          setSummaryLoading(false);
        })
        .catch(() => {
          if (controller.signal.aborted) return;
          setSummaryLoading(false);
          setSummaryError(WIKI_SHEET_ERROR);
        });
    }

    return () => controller.abort();
  }, [open, target?.wikiTitle, target?.wikiSection, target?.sectionTitle]);

  useEffect(() => {
    if (view !== 'article' || !articleWikiTitle?.trim()) return;

    const controller = new AbortController();
    setArticleHtml(null);
    setArticleError(null);
    setArticleLoading(true);

    fetchWikipediaArticleHtml(articleWikiTitle, controller.signal)
      .then((html) => {
        setArticleHtml(html);
        setArticleLoading(false);
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setArticleLoading(false);
        setArticleError(WIKI_SHEET_ERROR);
      });

    return () => controller.abort();
  }, [view, articleWikiTitle]);

  useEffect(() => {
    if (!articleHtml || !articleScrollAnchor || articleLoading) return;
    const root = articleScrollRef.current;
    if (!root) return;

    const anchor = articleScrollAnchor;
    const id = window.requestAnimationFrame(() => {
      const el =
        root.querySelector(`#${CSS.escape(anchor)}`) ??
        root.querySelector(`[id="${anchor}"]`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    return () => window.cancelAnimationFrame(id);
  }, [articleHtml, articleScrollAnchor, articleLoading]);

  const openArticle = useCallback((wikiTitle: string, scrollAnchor?: string | null) => {
    const trimmed = wikiTitle.trim();
    if (!trimmed) return;
    setView('article');
    setArticleWikiTitle(trimmed);
    setArticleScrollAnchor(scrollAnchor?.trim() || null);
  }, []);

  const handleOpenArticle = useCallback(() => {
    if (!target?.wikiTitle.trim()) return;
    openArticle(target.wikiTitle, target.wikiSection ?? null);
  }, [openArticle, target?.wikiTitle, target?.wikiSection]);

  const handleBackFromArticle = useCallback(() => {
    if (target?.wikiSection && sectionHtml) {
      setView('section');
    } else {
      setView('summary');
    }
    setArticleWikiTitle(null);
    setArticleScrollAnchor(null);
    setArticleHtml(null);
    setArticleError(null);
    setArticleLoading(false);
  }, [sectionHtml, target?.wikiSection]);

  const handleBackFromSection = useCallback(() => {
    if (!target?.wikiSection) return;
    setView('summary');
    setSummaryLoading(true);
    setSummaryError(null);

    fetchWikipediaSummary(target.wikiTitle)
      .then((data) => {
        setSummary(data);
        setSummaryLoading(false);
      })
      .catch(() => {
        setSummaryLoading(false);
        setSummaryError(WIKI_SHEET_ERROR);
      });
  }, [target?.wikiSection, target?.wikiTitle]);

  if (!open || !target) return null;

  const articleTitle =
    summary?.title ??
    (view === 'article' ? articleWikiTitle : null) ??
    target.wikiTitle;

  const sheetTitle =
    view === 'section'
      ? articleTitle
      : view === 'article'
        ? articleWikiTitle ?? articleTitle
        : articleTitle;

  const contextSubtitle = showContextSubtitle(target, articleTitle) ? target.label : null;
  const isTallView = view === 'section' || view === 'article';
  const showSummaryFooter =
    view === 'summary' && summary && !summaryLoading && !summaryError;
  const showSectionFooter = view === 'section' && sectionHtml && !sectionLoading && !sectionError;

  return createPortal(
    <div
      className="fixed inset-0 z-[94]"
      role="dialog"
      aria-modal
      aria-label={sheetTitle}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/55 backdrop-blur-[1px]"
        aria-label={WIKI_SHEET_CLOSE_LABEL}
        onClick={onClose}
      />

      <div
        className={`absolute inset-x-0 bottom-0 flex flex-col rounded-t-2xl border-t border-amber-900/40 bg-stone-950 shadow-2xl overflow-hidden ${
          isTallView ? 'max-h-[min(92dvh,900px)]' : 'max-h-[min(78dvh,640px)]'
        }`}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <header className="shrink-0 flex items-start gap-2 px-3 py-3 border-b border-amber-900/30">
          {view === 'article' ? (
            <button
              type="button"
              onClick={handleBackFromArticle}
              aria-label={WIKI_SHEET_BACK_LABEL}
              className="shrink-0 p-1.5 rounded-full text-amber-300/90 hover:bg-stone-800 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
          ) : view === 'section' && target.wikiSection ? (
            <button
              type="button"
              onClick={handleBackFromSection}
              aria-label={WIKI_SHEET_BACK_LABEL}
              className="shrink-0 p-1.5 rounded-full text-amber-300/90 hover:bg-stone-800 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
          ) : null}

          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-amber-50 truncate">{sheetTitle}</h3>
            {contextSubtitle ? (
              <p className="mt-0.5 text-[11px] text-amber-300/80 leading-snug">
                {WIKI_SHEET_CONTEXT_LABEL}{' '}
                <span className="text-amber-100/95">{contextSubtitle}</span>
                {sectionTitle && view === 'section' ? (
                  <span className="text-stone-500"> · {sectionTitle}</span>
                ) : null}
              </p>
            ) : sectionTitle && view === 'section' ? (
              <p className="mt-0.5 text-[11px] text-stone-400">{sectionTitle}</p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={WIKI_SHEET_CLOSE_LABEL}
            className="shrink-0 p-1.5 rounded-full text-amber-300/90 hover:bg-stone-800 transition-colors"
          >
            <X size={18} />
          </button>
        </header>

        <div
          ref={articleScrollRef}
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-4"
        >
          {view === 'summary' ? (
            summaryLoading ? (
              <p className="text-sm text-amber-400/85">{WIKI_SHEET_LOADING}</p>
            ) : summaryError ? (
              <p className="text-sm text-amber-200/90 leading-relaxed">{summaryError}</p>
            ) : summary ? (
              <div className="space-y-4">
                {summary.thumbnailUrl ? (
                  <img
                    src={summary.thumbnailUrl}
                    alt=""
                    className="w-full max-h-44 object-cover rounded-lg border border-amber-900/30"
                  />
                ) : null}
                <p className="text-sm text-amber-100/90 leading-relaxed whitespace-pre-line">
                  {summary.extract}
                </p>
                <p className="text-[10px] text-stone-500">{WIKI_SHEET_ATTRIBUTION}</p>
              </div>
            ) : null
          ) : view === 'section' ? (
            sectionLoading ? (
              <p className="text-sm text-amber-400/85">{WIKI_SHEET_ARTICLE_LOADING}</p>
            ) : sectionError ? (
              <p className="text-sm text-amber-200/90 leading-relaxed">{sectionError}</p>
            ) : sectionHtml ? (
              <div className="space-y-3">
                <WikipediaArticleContent
                  html={sectionHtml}
                  onNavigate={(title) => openArticle(title)}
                />
                <p className="text-[10px] text-stone-500">{WIKI_SHEET_ATTRIBUTION}</p>
              </div>
            ) : null
          ) : articleLoading ? (
            <p className="text-sm text-amber-400/85">{WIKI_SHEET_ARTICLE_LOADING}</p>
          ) : articleError ? (
            <p className="text-sm text-amber-200/90 leading-relaxed">{articleError}</p>
          ) : articleHtml ? (
            <div className="space-y-3">
              <WikipediaArticleContent html={articleHtml} onNavigate={(title) => openArticle(title)} />
              <p className="text-[10px] text-stone-500">{WIKI_SHEET_ATTRIBUTION}</p>
            </div>
          ) : null}
        </div>

        {showSummaryFooter ? (
          <footer className="shrink-0 px-4 py-3 border-t border-amber-900/30 bg-stone-900/40">
            <button
              type="button"
              onClick={handleOpenArticle}
              className="text-xs font-medium text-teal-200 hover:text-teal-100 underline underline-offset-2"
            >
              {WIKI_SHEET_OPEN_FULL}
            </button>
          </footer>
        ) : null}

        {showSectionFooter ? (
          <footer className="shrink-0 px-4 py-3 border-t border-amber-900/30 bg-stone-900/40">
            <button
              type="button"
              onClick={handleOpenArticle}
              className="text-xs font-medium text-teal-200 hover:text-teal-100 underline underline-offset-2"
            >
              {WIKI_SHEET_OPEN_FULL}
            </button>
          </footer>
        ) : null}
      </div>
    </div>,
    document.body
  );
}
