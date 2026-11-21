import { Lang, SITE_COPY } from '../config/fintaxConfig';

interface ChapterNavProps {
  lang: Lang;
  visible: boolean;
  activeIndex: number;
  onSelectChapter: (idx: number) => void;
}

export function ChapterNav({
  lang,
  visible,
  activeIndex,
  onSelectChapter,
}: ChapterNavProps) {
  const copy = SITE_COPY[lang];

  return (
    <nav className={`chapter-nav-dock ${visible ? '' : 'hidden'}`} aria-label="Story chapters">
      <div className="glass-track">
        {copy.chapters.map((ch, idx) => (
          <button
            key={ch.id}
            type="button"
            className={`glass-seg ${activeIndex === idx ? 'active' : ''}`}
            onClick={() => onSelectChapter(idx)}
          >
            {ch.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
