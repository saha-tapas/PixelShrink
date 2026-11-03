import { Sparkles } from 'lucide-react';
import './Header.css';

function Header() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <a className="brand" href="/" aria-label="PixelShrink home">
          <span className="brand__mark" aria-hidden="true">
            <Sparkles size={19} strokeWidth={2.4} />
          </span>
          <span className="brand__name">PixelShrink</span>
        </a>

        <span className="site-header__badge">Fast, private image compression</span>
      </div>
    </header>
  );
}

export default Header;
