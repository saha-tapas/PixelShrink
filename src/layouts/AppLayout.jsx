import Header from '../components/Header';
import './AppLayout.css';

function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Header />
      <main className="app-layout__main">{children}</main>
      <footer className="app-layout__footer">
        <span>PixelShrink</span>
        <span>Images stay private in your browser.</span>
      </footer>
    </div>
  );
}

export default AppLayout;
