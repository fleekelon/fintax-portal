import { Moon, Sun } from 'lucide-react';
import { HeroMode, Lang, SITE_COPY, Theme } from '../config/fintaxConfig';
import { WordmarkLogo } from './WordmarkLogo';

interface TopBarProps {
  lang: Lang;
  theme: Theme;
  heroMode: HeroMode;
  showHeroMode: boolean;
  onHeroModeChange: (m: HeroMode) => void;
  onThemeChange: (t: Theme) => void;
  onLangChange: (l: Lang) => void;
  onLogoClick: () => void;
}

export function TopBar({
  lang,
  theme,
  heroMode,
  showHeroMode,
  onHeroModeChange,
  onThemeChange,
  onLangChange,
  onLogoClick,
}: TopBarProps) {
  const copy = SITE_COPY[lang];

  return (
    <header className="top-bar">
      <div className={`top-left ${showHeroMode ? '' : 'hidden'}`}>
        <div className="glass-track" role="radiogroup" aria-label="Grid layout mode">
          <button
            type="button"
            className={`glass-seg ${heroMode === 'breathe' ? 'active' : ''}`}
            onClick={() => onHeroModeChange('breathe')}
          >
            {copy.heroModeBreathe}
          </button>
          <button
            type="button"
            className={`glass-seg ${heroMode === 'float' ? 'active' : ''}`}
            onClick={() => onHeroModeChange('float')}
          >
            {copy.heroModeFloat}
          </button>
        </div>
      </div>

      <div className="top-center">
        <a
          href="#top"
          className="brand-link"
          onClick={(e) => {
            e.preventDefault();
            onLogoClick();
          }}
        >
          <WordmarkLogo />
        </a>
      </div>

      <div className="top-right">
        <div className="glass-track" role="radiogroup" aria-label="Language">
          <button
            type="button"
            className={`glass-seg ${lang === 'zh' ? 'active' : ''}`}
            style={{ padding: '6px 10px', fontSize: '12px' }}
            onClick={() => onLangChange('zh')}
          >
            中
          </button>
          <button
            type="button"
            className={`glass-seg ${lang === 'en' ? 'active' : ''}`}
            style={{ padding: '6px 10px', fontSize: '12px' }}
            onClick={() => onLangChange('en')}
          >
            EN
          </button>
        </div>

        <div className="glass-track" role="radiogroup" aria-label="Theme">
          <button
            type="button"
            className={`glass-seg ${theme === 'light' ? 'active' : ''}`}
            style={{ padding: '6px 10px' }}
            onClick={() => onThemeChange('light')}
            aria-label="Light theme"
          >
            <Sun size={15} strokeWidth={1.9} />
          </button>
          <button
            type="button"
            className={`glass-seg ${theme === 'dark' ? 'active' : ''}`}
            style={{ padding: '6px 10px' }}
            onClick={() => onThemeChange('dark')}
            aria-label="Dark theme"
          >
            <Moon size={15} strokeWidth={1.9} />
          </button>
        </div>
      </div>
    </header>
  );
}
