import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaSearch, FaPlay, FaInfoCircle, FaTimes, 
  FaPlus, FaCheck, FaBell, FaSignOutAlt, FaUser, FaArrowUp, FaChevronDown 
} from 'react-icons/fa';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';
import './App.css';

// --- CONFIG ---
const API_URL = "https://imdb.iamidiotareyoutoo.com/search?size=20&q=";

// --- AUTH SERVICE (Same as before) ---
const AuthService = {
  getUsers: () => JSON.parse(localStorage.getItem('filmbox_users')) || [],
  signup: (email, password, name) => {
    const users = AuthService.getUsers();
    if (users.find(u => u.email === email)) return { error: "User already exists" };
    const newUser = { email, password, name, myList: [] };
    users.push(newUser);
    localStorage.setItem('filmbox_users', JSON.stringify(users));
    return { user: newUser };
  },
  login: (email, password) => {
    const users = AuthService.getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return { error: "Invalid email or password" };
    return { user };
  },
  saveUserList: (email, myList) => {
    const users = AuthService.getUsers();
    const index = users.findIndex(u => u.email === email);
    if (index !== -1) {
      users[index].myList = myList;
      localStorage.setItem('filmbox_users', JSON.stringify(users));
    }
  }
};

const AuthContext = createContext();

export default function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('filmbox_current_user')));
  const [appLoading, setAppLoading] = useState(false);

  const login = (userData) => {
    setAppLoading(true); // Trigger Splash Screen
    setUser(userData);
    localStorage.setItem('filmbox_current_user', JSON.stringify(userData));
    
    // Fake loading delay to show the animation
    setTimeout(() => {
        setAppLoading(false);
    }, 2500);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('filmbox_current_user');
  };

  const updateUserList = (newList) => {
    const updatedUser = { ...user, myList: newList };
    setUser(updatedUser);
    localStorage.setItem('filmbox_current_user', JSON.stringify(updatedUser));
    AuthService.saveUserList(user.email, newList);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUserList }}>
      <div className="app">
        <AnimatePresence mode="wait">
          {!user ? (
            <AuthScreen key="auth" />
          ) : appLoading ? (
            <SplashScreen key="splash" />
          ) : (
            <MainApp key="main" />
          )}
        </AnimatePresence>
      </div>
    </AuthContext.Provider>
  );
}

// --- NEW COMPONENT: SPLASH SCREEN ---
function SplashScreen() {
    return (
        <motion.div 
            className="splash-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            <motion.div 
                className="splash-logo"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.2, opacity: 1 }}
                transition={{ 
                    duration: 2, 
                    ease: "easeInOut", 
                    repeat: Infinity, 
                    repeatType: "reverse" 
                }}
            >
                <span className="red-text">FILM</span>BOX
            </motion.div>
            <div className="loading-spinner"></div>
        </motion.div>
    );
}

// --- AUTH SCREEN ---
function AuthScreen() {
  const { login } = useContext(AuthContext);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    setTimeout(() => {
        if (isLogin) {
            const res = AuthService.login(formData.email, formData.password);
            if (res.error) setError(res.error);
            else login(res.user);
        } else {
            if (!formData.name) {
                setLoading(false);
                return setError("Name is required");
            }
            const res = AuthService.signup(formData.email, formData.password, formData.name);
            if (res.error) setError(res.error);
            else login(res.user);
        }
        setLoading(false);
    }, 800);
  };

  return (
    <motion.div 
        className="auth-container"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <div className="auth-overlay">
        <div className="auth-box">
          <div className="auth-brand"><span className="red-text">FILM</span>BOX</div>
          <h2>{isLogin ? 'Sign In' : 'Sign Up'}</h2>
          {error && <div className="auth-error">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <input 
                type="text" placeholder="Full Name" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            )}
            <input 
              type="email" placeholder="Email or phone number" required
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
            <input 
              type="password" placeholder="Password" required
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
            </button>
          </form>

          <div className="auth-footer">
            <span className="gray-text">{isLogin ? "New to FilmBox?" : "Already have an account?"} </span>
            <span className="auth-link" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? 'Sign up now.' : 'Sign in.'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// --- MAIN APP ---
function MainApp() {
  const [search, setSearch] = useState(""); 
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [playingMovie, setPlayingMovie] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handlePlay = (movie) => {
    setPlayingMovie(movie);
    setSelectedMovie(null); 
  };

  return (
    <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}
    >
      <Navbar search={search} setSearch={setSearch} isScrolled={isScrolled} />
      
      <main>
        {search.length > 2 ? (
          <SearchResults search={search} onSelect={setSelectedMovie} onPlay={handlePlay} />
        ) : (
          <HomeView onSelect={setSelectedMovie} onPlay={handlePlay} />
        )}
      </main>

      {/* MODALS */}
      <AnimatePresence>
        {selectedMovie && (
          <MovieDetails 
            movie={selectedMovie} 
            onClose={() => setSelectedMovie(null)} 
            onPlay={() => handlePlay(selectedMovie)}
          />
        )}
        {playingMovie && (
            <VideoPlayer movie={playingMovie} onClose={() => setPlayingMovie(null)} />
        )}
      </AnimatePresence>

      <Footer />
    </motion.div>
  );
}

// --- UPDATED NAVBAR WITH ANIMATED DROPDOWN ---
function Navbar({ search, setSearch, isScrolled }) {
  const { user, logout } = useContext(AuthContext);
  const [showDropdown, setShowDropdown] = useState(false);

  // Animation variants for the dropdown
  const dropdownVariants = {
    hidden: { opacity: 0, y: -20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.2, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.15 } }
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-left">
        <div className="brand" onClick={() => setSearch("")}><span className="red-text">FILM</span>BOX</div>
        <ul className="nav-menu">
            <li className="active">Home</li>
            <li>Series</li>
            <li>Films</li>
            <li>My List</li>
        </ul>
      </div>

      <div className="nav-right">
        <div className={`search-box ${search ? 'active' : ''}`}>
          <FaSearch className="search-icon" />
          <input 
            type="text" placeholder="Titles, people, genres" 
            value={search} onChange={(e) => setSearch(e.target.value)}
          />
          {search && <FaTimes className="clear-icon" onClick={() => setSearch('')} />}
        </div>
        
        <div className="nav-item"><FaBell /></div>
        
        <div 
            className="nav-user" 
            onMouseEnter={() => setShowDropdown(true)} 
            onMouseLeave={() => setShowDropdown(false)}
        >
          <div className="user-trigger">
            <img src={`https://ui-avatars.com/api/?name=${user.name}&background=E50914&color=fff&rounded=true`} alt="User" />
            <motion.span 
                animate={{ rotate: showDropdown ? 180 : 0 }} 
                className="caret"
            >
                <FaChevronDown size={12} />
            </motion.span>
          </div>

          <AnimatePresence>
            {showDropdown && (
                <motion.div 
                    className="user-dropdown"
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                >
                    <div className="dropdown-arrow"></div>
                    <div className="dropdown-item">Profile</div>
                    <div className="dropdown-item">Settings</div>
                    <div className="dropdown-divider"></div>
                    <div className="dropdown-item" onClick={logout}>Sign out</div>
                </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
}

// --- VIDEO PLAYER (Same as before) ---
function VideoPlayer({ movie, onClose }) {
    const query = encodeURIComponent(`${movie["#AKA"]} ${movie["#YEAR"]} trailer`);
    const embedUrl = `https://www.youtube.com/embed?listType=search&list=${query}&autoplay=1&controls=1&modestbranding=1&rel=0`;

    return (
        <motion.div 
            className="video-player-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
            <div className="video-header">
                <h3>Now Playing: {movie["#AKA"]}</h3>
                <button onClick={onClose}><FaTimes /></button>
            </div>
            <div className="iframe-container">
                <iframe 
                    src={embedUrl} title="Player" frameBorder="0" 
                    allow="autoplay; encrypted-media" allowFullScreen
                ></iframe>
            </div>
        </motion.div>
    );
}

// --- HOME VIEW & SLIDER (Same structure, added Motion) ---
function HomeView({ onSelect, onPlay }) {
  return (
    <>
      <HeroSlider query="Dune" onSelect={onSelect} onPlay={onPlay} />
      <div className="content-rows-container">
        <RankingCarousel query="Marvel" onSelect={onSelect} />
        <MovieCarousel title="Trending Now" query="2024" onSelect={onSelect} />
        <MovieCarousel title="Action Thrillers" query="Action" onSelect={onSelect} />
      </div>
    </>
  );
}

function HeroSlider({ query, onSelect, onPlay }) {
  const [movie, setMovie] = useState(null);

  useEffect(() => {
    fetch(API_URL + query).then(res => res.json()).then(data => {
        if(data.description && data.description.length > 0) setMovie(data.description[0]);
    });
  }, [query]);

  // SKELETON LOADING FOR HERO
  if (!movie) return (
      <div className="hero-container skeleton-pulse">
          <div className="hero-content">
              <div className="sk-title"></div>
              <div className="sk-desc"></div>
          </div>
      </div>
  );

  return (
    <div className="hero-container">
      <div className="hero-bg">
        <img src={movie["#IMG_POSTER"]} alt="Hero" />
        <div className="hero-vignette"></div>
      </div>
      <motion.div 
        className="hero-content"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        <h1 className="hero-title">{movie["#AKA"]}</h1>
        <p className="hero-desc">
            Ranked #{movie["#RANK"]} • {movie["#YEAR"]}
        </p>
        <div className="hero-buttons">
          <button className="btn btn-play" onClick={() => onPlay(movie)}><FaPlay /> Play</button>
          <button className="btn btn-info" onClick={() => onSelect(movie)}><FaInfoCircle /> More Info</button>
        </div>
      </motion.div>
    </div>
  );
}

function MovieDetails({ movie, onClose, onPlay }) {
  const { user, updateUserList } = useContext(AuthContext);
  const inList = user.myList.some(m => m["#IMDB_ID"] === movie["#IMDB_ID"]);

  const toggleList = () => {
    let newList = [...user.myList];
    if (inList) newList = newList.filter(m => m["#IMDB_ID"] !== movie["#IMDB_ID"]);
    else newList.push(movie);
    updateUserList(newList);
  };

  return (
    <motion.div 
        className="modal-backdrop" onClick={onClose} 
        initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
    >
      <motion.div 
        className="modal-content" onClick={e => e.stopPropagation()} 
        initial={{y: 100, opacity:0}} animate={{y:0, opacity:1}} exit={{y: 100, opacity: 0}}
      >
        <div className="modal-close" onClick={onClose}><FaTimes /></div>
        <div className="modal-hero">
            <img src={movie["#IMG_POSTER"]} alt="cover" />
            <div className="modal-overlay">
                <h2>{movie["#AKA"]}</h2>
                <div className="modal-actions">
                    <button className="btn btn-play" onClick={onPlay}><FaPlay /> Play</button>
                    <button className="circle-btn" onClick={toggleList}>
                        {inList ? <FaCheck /> : <FaPlus />}
                    </button>
                </div>
            </div>
        </div>
        <div className="modal-body">
            <p className="synopsis">
                This critically acclaimed film features {movie["#ACTORS"]}. 
                Ranked #{movie["#RANK"]} on IMDb.
            </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

function MovieCarousel({ title, query, onSelect }) {
  const [movies, setMovies] = useState([]);
  useEffect(() => {
    fetch(API_URL + query).then(res => res.json()).then(data => setMovies(data.description || []));
  }, [query]);

  return (
    <div className="row">
      <h3>{title}</h3>
      <div className="row-posters">
        {/* SKELETONS IF EMPTY */}
        {movies.length === 0 
            ? [...Array(6)].map((_, i) => <div key={i} className="poster-card skeleton-card" />)
            : movies.map((m, i) => (
                <div key={i} className="poster-card" onClick={() => onSelect(m)}>
                    <img src={m["#IMG_POSTER"]} alt={m["#AKA"]} loading="lazy" />
                </div>
            ))
        }
      </div>
    </div>
  );
}

function RankingCarousel({ query, onSelect }) {
    const [movies, setMovies] = useState([]);
    useEffect(() => {
      fetch(API_URL + query).then(res => res.json()).then(data => setMovies(data.description || []));
    }, [query]);
  
    return (
      <div className="row">
        <h3>Top 10 Today</h3>
        <div className="row-posters rank-row">
          {movies.slice(0, 10).map((m, i) => (
            <div key={i} className="rank-card" onClick={() => onSelect(m)}>
               <span className="rank-number">{i+1}</span>
               <img src={m["#IMG_POSTER"]} alt={m["#AKA"]} />
            </div>
          ))}
        </div>
      </div>
    );
}

function SearchResults({ search, onSelect, onPlay }) {
  const [movies, setMovies] = useState([]);
  useEffect(() => {
    fetch(API_URL + search).then(res => res.json()).then(data => setMovies(data.description || []));
  }, [search]);

  return (
    <div className="search-results-container">
      {movies.map((m, i) => (
        <motion.div 
            key={i} className="search-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
        >
           <img src={m["#IMG_POSTER"]} alt="" onClick={() => onSelect(m)} />
           <div className="search-overlay">
               <h4>{m["#AKA"]}</h4>
               <button onClick={() => onPlay(m)}><FaPlay /></button>
           </div>
        </motion.div>
      ))}
    </div>
  );
}

function Footer() {
    return <div className="footer">© 2026 FilmBox, Inc.</div>
}