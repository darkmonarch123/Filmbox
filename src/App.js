import React, { useState, useMemo } from 'react';
import { 
  Play, Plus, Check, Info, Search, Home, Clapperboard, 
  User, LogOut, Lock, X, Zap 
} from 'lucide-react';

// --- MOCK DATA ---
const MOVIES = [
  {
    id: 1,
    title: "Cyberpunk: Edgerunners",
    desc: "In a dystopia riddled with corruption and cybernetic implants, a talented but reckless street kid strives to become an outlaw mercenary.",
    rating: "98% Match",
    year: 2022,
    duration: "1 Season",
    genre: "Sci-Fi",
    isPremium: true,
    img: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=1000",
    backdrop: "https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&q=80&w=1600"
  },
  {
    id: 2,
    title: "The Dark Knight",
    desc: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability.",
    rating: "96% Match",
    year: 2008,
    duration: "2h 32m",
    genre: "Action",
    isPremium: false,
    img: "https://images.unsplash.com/photo-1509347528160-9a9e33742cd4?auto=format&fit=crop&q=80&w=1000",
    backdrop: "https://images.unsplash.com/photo-1478720568477-152d9b164e63?auto=format&fit=crop&q=80&w=1600"
  },
  {
    id: 3,
    title: "Interstellar",
    desc: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    rating: "94% Match",
    year: 2014,
    duration: "2h 49m",
    genre: "Sci-Fi",
    isPremium: true,
    img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1000",
    backdrop: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=1600"
  },
  {
    id: 4,
    title: "Dune: Part Two",
    desc: "Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.",
    rating: "99% Match",
    year: 2024,
    duration: "2h 46m",
    genre: "Sci-Fi",
    isPremium: true,
    img: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=1000",
    backdrop: "https://images.unsplash.com/photo-1614728853913-1e320059699f?auto=format&fit=crop&q=80&w=1600"
  },
  {
    id: 5,
    title: "Inception",
    desc: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    rating: "92% Match",
    year: 2010,
    duration: "2h 28m",
    genre: "Action",
    isPremium: false,
    img: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=1000",
    backdrop: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&q=80&w=1600"
  },
  {
    id: 6,
    title: "The Godfather",
    desc: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
    rating: "99% Match",
    year: 1972,
    duration: "2h 55m",
    genre: "Drama",
    isPremium: true,
    img: "https://images.unsplash.com/photo-1533488765986-dfa2a9939acd?auto=format&fit=crop&q=80&w=1000",
    backdrop: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=1600"
  },
];

// --- STYLES (Injected) ---
const styles = `
:root {
  --bg-main: #09090b;
  --bg-card: #18181b;
  --bg-overlay: rgba(0,0,0,0.7);
  --primary: #dc2626;
  --text-main: #ffffff;
  --text-muted: #a1a1aa;
  --radius: 0.5rem;
  --nav-height: 60px;
}

* { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
body { background-color: var(--bg-main); color: var(--text-main); overflow-x: hidden; }

/* Layout */
.app-container { display: flex; min-height: 100vh; position: relative; }
.main-content { flex: 1; margin-left: 0; padding-bottom: 80px; width: 100%; transition: margin 0.3s; }
.desktop-nav { display: none; width: 240px; height: 100vh; position: fixed; left: 0; top: 0; background: black; border-right: 1px solid #27272a; padding: 20px; z-index: 50; }
.mobile-nav { display: flex; position: fixed; bottom: 0; left: 0; width: 100%; height: 60px; background: rgba(0,0,0,0.9); backdrop-filter: blur(10px); border-top: 1px solid #27272a; justify-content: space-around; align-items: center; z-index: 50; }

@media (min-width: 768px) {
  .main-content { margin-left: 240px; padding-bottom: 0; }
  .desktop-nav { display: block; }
  .mobile-nav { display: none; }
}

/* Auth */
.auth-screen { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background-image: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url('${MOVIES[0].backdrop}'); background-size: cover; }
.auth-card { background: rgba(0,0,0,0.75); padding: 3rem; border-radius: var(--radius); backdrop-filter: blur(10px); width: 100%; max-width: 450px; text-align: center; border: 1px solid #333; }
.btn-primary { background: var(--primary); color: white; border: none; padding: 12px 24px; border-radius: 4px; font-weight: bold; cursor: pointer; transition: 0.2s; width: 100%; font-size: 1rem; }
.btn-primary:hover { background: #b91c1c; }

/* Hero */
.hero { height: 70vh; position: relative; display: flex; align-items: flex-end; padding: 40px; }
.hero-bg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; mask-image: linear-gradient(to bottom, black 50%, transparent 100%); -webkit-mask-image: linear-gradient(to bottom, black 50%, transparent 100%); }
.hero-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(to top, var(--bg-main), transparent 80%); z-index: 1; }
.hero-content { position: relative; z-index: 2; max-width: 600px; }
.hero-title { font-size: 3rem; font-weight: 800; margin-bottom: 1rem; text-shadow: 0 2px 10px rgba(0,0,0,0.5); }
.hero-meta { display: flex; gap: 15px; margin-bottom: 1.5rem; align-items: center; color: #d4d4d8; }
.badge-match { color: #4ade80; font-weight: bold; }
.hero-actions { display: flex; gap: 1rem; }
.btn-hero { display: flex; align-items: center; gap: 8px; padding: 10px 24px; border-radius: 4px; font-weight: 600; cursor: pointer; border: none; font-size: 1.1rem; }
.btn-play { background: white; color: black; }
.btn-info { background: rgba(109, 109, 110, 0.7); color: white; backdrop-filter: blur(4px); }

/* Rows & Cards */
.row { padding: 20px 40px; }
.row-header { font-size: 1.2rem; font-weight: 600; margin-bottom: 15px; color: #e4e4e7; }
.row-scroller { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 20px; scrollbar-width: none; }
.row-scroller::-webkit-scrollbar { display: none; }
.movie-card { min-width: 200px; aspect-ratio: 16/9; position: relative; border-radius: 4px; overflow: hidden; cursor: pointer; transition: transform 0.3s; }
.movie-card:hover { transform: scale(1.05); z-index: 10; box-shadow: 0 10px 20px rgba(0,0,0,0.5); }
.card-img { width: 100%; height: 100%; object-fit: cover; }
.card-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.9), transparent); opacity: 0; transition: 0.2s; display: flex; flex-direction: column; justify-content: flex-end; padding: 10px; }
.movie-card:hover .card-overlay { opacity: 1; }
.premium-lock { position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.6); padding: 4px; border-radius: 50%; color: #fbbf24; }

/* Modal */
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 100; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px); }
.modal-content { background: #18181b; width: 90%; max-width: 800px; border-radius: 8px; overflow: hidden; position: relative; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); border: 1px solid #333; max-height: 90vh; overflow-y: auto; }
.modal-hero { height: 400px; position: relative; }
.modal-close { position: absolute; top: 15px; right: 15px; background: #18181b; color: white; border-radius: 50%; p: 8px; cursor: pointer; z-index: 50; border: none; width: 36px; height: 36px; display: grid; place-items: center; }
.modal-body { padding: 30px; }

/* Search */
.search-bar { padding: 20px 40px; position: sticky; top: 0; z-index: 40; background: linear-gradient(var(--bg-main), transparent); }
.search-input { width: 100%; background: #27272a; border: 1px solid #3f3f46; color: white; padding: 12px 40px; border-radius: 4px; font-size: 1rem; outline: none; }
.search-icon { position: absolute; left: 52px; top: 32px; color: #a1a1aa; }

/* Nav Styles */
.nav-link { display: flex; align-items: center; gap: 12px; color: #a1a1aa; text-decoration: none; padding: 12px; border-radius: 6px; transition: 0.2s; cursor: pointer; }
.nav-link:hover, .nav-link.active { color: white; background: #27272a; }
.nav-logo { font-size: 1.5rem; font-weight: 900; color: var(--primary); margin-bottom: 2rem; padding-left: 12px; }
.nav-section { margin-top: auto; border-top: 1px solid #27272a; padding-top: 20px; }

/* Utilities */
.tag { font-size: 0.75rem; padding: 2px 6px; border: 1px solid #52525b; border-radius: 2px; }
.hidden-mobile { display: none; }
@media (min-width: 768px) { .hidden-mobile { display: block; } }
`;

// --- COMPONENT: APP ---
export default function App() {
  const [user, setUser] = useState(null);
  const [isPro, setIsPro] = useState(false); // Simulated Subscription State
  const [watchlist, setWatchlist] = useState({}); // Local state for watchlist
  const [currentView, setCurrentView] = useState('home'); // home, search, list
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // --- ACTIONS ---
  const handleLogin = () => {
    // Simple mock login
    setUser({ uid: "demo-user", name: "Guest User" });
  };

  const handleLogout = () => {
    setUser(null);
    setWatchlist({}); // Clear local watchlist on logout
    setIsPro(false);
  };

  const toggleWatchlist = (movie) => {
    setWatchlist(prev => ({
      ...prev,
      [movie.id]: !prev[movie.id]
    }));
  };

  const handleUpgrade = () => {
    setIsPro(true);
    alert("Welcome to Pro! Premium content unlocked.");
  };

  // --- DERIVED STATE ---
  const filteredMovies = useMemo(() => {
    if (!searchQuery) return MOVIES;
    return MOVIES.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery]);

  const watchlistMovies = useMemo(() => {
    return MOVIES.filter(m => watchlist[m.id]);
  }, [watchlist]);

  if (!user) {
    return (
      <>
        <style>{styles}</style>
        <div className="auth-screen">
          <div className="auth-card">
            <h1 style={{fontSize: '2.5rem', marginBottom: '1rem', fontWeight: 900}}>StreamSaaS</h1>
            <p style={{marginBottom: '2rem', color: '#a1a1aa'}}>Unlimited movies, TV shows, and more. Watch anywhere. Cancel anytime.</p>
            <button onClick={handleLogin} className="btn-primary">
              Get Started (Guest)
            </button>
          </div>
        </div>
      </>
    );
  }

  // --- MAIN UI ---
  return (
    <>
      <style>{styles}</style>
      <div className="app-container">
        
        {/* DESKTOP SIDEBAR */}
        <nav className="desktop-nav">
          <div className="nav-logo">NETFLIX<span style={{color:'white', fontSize:'0.5em', marginLeft: 5}}>SAAS</span></div>
          <div style={{display:'flex', flexDirection:'column', gap: 5}}>
            <NavItem icon={<Home size={20} />} label="Home" active={currentView === 'home'} onClick={() => setCurrentView('home')} />
            <NavItem icon={<Search size={20} />} label="Search" active={currentView === 'search'} onClick={() => setCurrentView('search')} />
            <NavItem icon={<Clapperboard size={20} />} label="My List" active={currentView === 'list'} onClick={() => setCurrentView('list')} />
          </div>
          <div className="nav-section">
             {!isPro && (
               <div style={{background: 'linear-gradient(45deg, #7f1d1d, #ef4444)', padding: 15, borderRadius: 8, marginBottom: 20}}>
                 <h4 style={{marginBottom: 5, display:'flex', alignItems:'center', gap:5}}><Zap size={16} fill="white" /> Go Pro</h4>
                 <p style={{fontSize:'0.8rem', opacity:0.9, marginBottom:10}}>Unlock premium movies.</p>
                 <button onClick={handleUpgrade} style={{width:'100%', padding:8, border:'none', borderRadius:4, background:'white', fontWeight:'bold', cursor:'pointer'}}>Upgrade</button>
               </div>
             )}
             <NavItem icon={<LogOut size={20} />} label="Sign Out" onClick={handleLogout} />
          </div>
        </nav>

        {/* MAIN CONTENT AREA */}
        <main className="main-content">
          
          {/* SEARCH PAGE */}
          {currentView === 'search' && (
             <div className="search-page">
                <div className="search-bar">
                  <Search className="search-icon" size={20} />
                  <input 
                    type="text" 
                    className="search-input" 
                    placeholder="Titles, people, genres" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="row">
                  <h3 className="row-header">Results</h3>
                  <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap: 20}}>
                    {filteredMovies.map(movie => (
                       <MovieCard key={movie.id} movie={movie} onClick={() => setSelectedMovie(movie)} isPro={isPro} />
                    ))}
                  </div>
                </div>
             </div>
          )}

          {/* WATCHLIST PAGE */}
          {currentView === 'list' && (
             <div className="row" style={{paddingTop: 80}}>
                <h3 className="row-header">My Watchlist</h3>
                {watchlistMovies.length === 0 ? (
                  <p style={{color:'#52525b'}}>Your list is empty.</p>
                ) : (
                  <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap: 20}}>
                    {watchlistMovies.map(movie => (
                       <MovieCard key={movie.id} movie={movie} onClick={() => setSelectedMovie(movie)} isPro={isPro} />
                    ))}
                  </div>
                )}
             </div>
          )}

          {/* HOME PAGE */}
          {currentView === 'home' && (
            <>
              {/* Featured Hero */}
              <div className="hero">
                <img src={MOVIES[3].backdrop} alt="Hero" className="hero-bg" />
                <div className="hero-overlay" />
                <div className="hero-content">
                  <h1 className="hero-title">{MOVIES[3].title}</h1>
                  <div className="hero-meta">
                     <span className="badge-match">{MOVIES[3].rating}</span>
                     <span>{MOVIES[3].year}</span>
                     <span className="tag">{MOVIES[3].duration}</span>
                     <span className="tag">HD</span>
                  </div>
                  <p style={{marginBottom: '1.5rem', fontSize: '1.1rem', lineHeight: 1.4, maxWidth: '500px'}}>{MOVIES[3].desc}</p>
                  <div className="hero-actions">
                    <button className="btn-hero btn-play" onClick={() => setSelectedMovie(MOVIES[3])}><Play fill="black" size={20} /> Play</button>
                    <button className="btn-hero btn-info" onClick={() => setSelectedMovie(MOVIES[3])}><Info size={20} /> More Info</button>
                  </div>
                </div>
              </div>

              {/* Categories */}
              <MovieRow title="Trending Now" movies={MOVIES} onSelect={setSelectedMovie} isPro={isPro} />
              <MovieRow title="Sci-Fi Thrillers" movies={MOVIES.filter(m => m.genre === 'Sci-Fi')} onSelect={setSelectedMovie} isPro={isPro} />
              <MovieRow title="Action Blockbusters" movies={MOVIES.filter(m => m.genre === 'Action')} onSelect={setSelectedMovie} isPro={isPro} />
            </>
          )}
        </main>

        {/* MOBILE NAV */}
        <nav className="mobile-nav">
           <MobileNavItem icon={<Home size={24} />} active={currentView === 'home'} onClick={() => setCurrentView('home')} />
           <MobileNavItem icon={<Search size={24} />} active={currentView === 'search'} onClick={() => setCurrentView('search')} />
           <MobileNavItem icon={<Clapperboard size={24} />} active={currentView === 'list'} onClick={() => setCurrentView('list')} />
           <MobileNavItem icon={<User size={24} />} onClick={handleLogout} />
        </nav>

        {/* DETAILS MODAL */}
        {selectedMovie && (
          <div className="modal-backdrop" onClick={() => setSelectedMovie(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setSelectedMovie(null)}><X size={20} /></button>
              
              <div className="modal-hero">
                <img src={selectedMovie.backdrop} style={{width:'100%', height:'100%', objectFit:'cover'}} />
                <div style={{position:'absolute', inset:0, background:'linear-gradient(to top, #18181b, transparent)'}} />
                <div style={{position:'absolute', bottom: 30, left: 30}}>
                   <h2 style={{fontSize:'2.5rem', fontWeight: 800, marginBottom: 10}}>{selectedMovie.title}</h2>
                   <div style={{display:'flex', gap: 10}}>
                      <button className="btn-hero btn-play" style={{padding: '8px 24px'}}>
                         <Play fill="black" size={18} /> Play
                      </button>
                      <button 
                        className="btn-hero btn-info" 
                        style={{border: '1px solid white', background: 'transparent'}}
                        onClick={() => toggleWatchlist(selectedMovie)}
                      >
                        {watchlist[selectedMovie.id] ? <Check size={18} /> : <Plus size={18} />}
                        {watchlist[selectedMovie.id] ? 'On List' : 'My List'}
                      </button>
                   </div>
                </div>
              </div>

              <div className="modal-body">
                <div style={{display:'flex', gap: 20, flexWrap: 'wrap'}}>
                   <div style={{flex: 2, minWidth: 300}}>
                      <div className="hero-meta" style={{color: '#d4d4d8'}}>
                         <span className="badge-match">{selectedMovie.rating}</span>
                         <span>{selectedMovie.year}</span>
                         <span className="tag">{selectedMovie.duration}</span>
                      </div>
                      <p style={{fontSize: '1rem', lineHeight: 1.6, color: '#e4e4e7', marginBottom: 20}}>
                        {selectedMovie.desc}
                      </p>
                   </div>
                   <div style={{flex: 1, fontSize:'0.9rem', color: '#a1a1aa'}}>
                      <p><span style={{color: '#52525b'}}>Genres:</span> {selectedMovie.genre}</p>
                      <p><span style={{color: '#52525b'}}>Quality:</span> HD, Atmos</p>
                      {selectedMovie.isPremium && <p style={{marginTop:10, color: '#fbbf24', display:'flex', alignItems:'center', gap:5}}><Lock size={14}/> Pro Required</p>}
                   </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </>
  );
}

// --- SUB COMPONENTS ---

const NavItem = ({ icon, label, active, onClick }) => (
  <div onClick={onClick} className={`nav-link ${active ? 'active' : ''}`}>
    {icon}
    <span>{label}</span>
  </div>
);

const MobileNavItem = ({ icon, active, onClick }) => (
  <div onClick={onClick} style={{color: active ? 'white' : '#71717a', padding: 10}}>
    {icon}
  </div>
);

const MovieRow = ({ title, movies, onSelect, isPro }) => (
  <div className="row">
    <h3 className="row-header">{title}</h3>
    <div className="row-scroller">
      {movies.map(movie => (
        <MovieCard key={movie.id} movie={movie} onClick={() => onSelect(movie)} isPro={isPro} />
      ))}
    </div>
  </div>
);

const MovieCard = ({ movie, onClick, isPro }) => {
  const isLocked = movie.isPremium && !isPro;
  return (
    <div className="movie-card" onClick={onClick}>
      <img src={movie.img} alt={movie.title} className="card-img" />
      {isLocked && <div className="premium-lock"><Lock size={16} /></div>}
      <div className="card-overlay">
        <h4 style={{fontSize:'0.9rem', fontWeight:'bold', marginBottom: 4}}>{movie.title}</h4>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <span style={{fontSize:'0.7rem', color:'#4ade80'}}>{movie.rating}</span>
          <div style={{background:'white', borderRadius:'50%', padding: 4, display:'flex'}}>
            <Play size={10} fill="black" color="black" />
          </div>
        </div>
      </div>
    </div>
  );
};
