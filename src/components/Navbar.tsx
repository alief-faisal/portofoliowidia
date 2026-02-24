import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  activeSection: string;
}

export default function Navbar({ activeSection }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Me' },
    { id: 'gallery', label: 'My Gallery' },
  ];

  const scrollTo = (id: string) => {
    setIsOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const goToLogin = () => {
    setIsOpen(false);
    navigate('/login');
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-background/80 backdrop-blur-xl shadow-sm' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="w-8" />

        {/* Hamburger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden relative w-8 h-8 flex flex-col items-center justify-center gap-1.5 z-50"
          aria-label="Toggle menu"
        >
          <span className={`block w-6 h-0.5 bg-foreground rounded-full transition-all duration-400 ease-[cubic-bezier(0.77,0,0.175,1)] origin-center ${isOpen ? 'rotate-45 translate-y-[4px]' : ''}`} />
          <span className={`block w-6 h-0.5 bg-foreground rounded-full transition-all duration-400 ease-[cubic-bezier(0.77,0,0.175,1)] origin-center ${isOpen ? '-rotate-45 -translate-y-[4px]' : ''}`} />
        </button>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-8">
          {navItems.map(item => (
            <li key={item.id}>
              <button
                onClick={() => scrollTo(item.id)}
                className={`text-sm font-medium transition-colors duration-300 hover:text-primary ${activeSection === item.id ? 'text-primary' : 'text-muted-foreground'}`}
              >
                {item.label}
              </button>
            </li>
          ))}
          <li>
            <button
              onClick={goToLogin}
              className="text-sm font-medium px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-300"
            >
              Login
            </button>
          </li>
        </ul>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden fixed inset-0 bg-background/95 backdrop-blur-2xl transition-all duration-500 ease-[cubic-bezier(0.77,0,0.175,1)] ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <ul className="flex flex-col items-center justify-center h-full gap-10">
          {navItems.map((item, i) => (
            <li
              key={item.id}
              className={`transition-all duration-500 ease-[cubic-bezier(0.77,0,0.175,1)] ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              style={{ transitionDelay: isOpen ? `${i * 80 + 150}ms` : '0ms' }}
            >
              <button
                onClick={() => scrollTo(item.id)}
                className={`text-2xl font-semibold transition-colors duration-300 ${activeSection === item.id ? 'text-primary' : 'text-foreground hover:text-primary'}`}
              >
                {item.label}
              </button>
            </li>
          ))}
          <li
            className={`transition-all duration-500 ease-[cubic-bezier(0.77,0,0.175,1)] ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{ transitionDelay: isOpen ? `${navItems.length * 80 + 150}ms` : '0ms' }}
          >
            <button
              onClick={goToLogin}
              className="text-xl font-semibold px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-300"
            >
              Login
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}
