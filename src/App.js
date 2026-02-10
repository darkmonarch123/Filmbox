import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaSearch, FaPlay, FaInfoCircle, FaTimes, 
  FaPlus, FaCheck, FaBell, FaSignOutAlt, FaUser, FaArrowUp 
} from 'react-icons/fa';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';
import './App.css';

// --- CONFIG ---
const API_URL = "https://imdb.iamidiotareyoutoo.com/search?size=20&q=";

// --- 1. MOCK BACKEND SERVICE ---
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

// --- 2. AUTH CONTEXT ---
const AuthContext = createContext();

export default function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('filmbox_current_user')));

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('filmbox_current_user', JSON.stringify(userData));
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
        {!user ? <AuthScreen /> : <MainApp />}
      </div>
    </AuthContext.Provider>
  );
}

// --- 3. AUTH SCREEN ---
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
    
    // Simulate network delay
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
    <div className="auth-container">
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
    </div>
  );
}

// --- 4. MAIN APP ---
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
    setSelectedMovie(null); // Close details if open
  };

  return (
    <>
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
    </>
  );
}

// --- 5. VIDEO PLAYER COMPONENT (NEW) ---
function VideoPlayer({ movie, onClose }) {
    // Uses YouTube Embed in "Search" mode to find the trailer automatically
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
                    src={embedUrl} 
                    title="Video Player"
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                ></iframe>
            </div>
        </motion.div>
    );
}

// --- 6. VIEW COMPONENTS ---

function Navbar({ search, setSearch, isScrolled }) {
  const { user, logout } = useContext(AuthContext);
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-left">
        <div className="brand" onClick={() => setSearch("")}><span className="red-text">FILM</span>BOX</div>
        <ul className="nav-menu">
            <li className="active">Home</li>
            <li>Series</li>
            <li>Films</li>
            <li>New & Popular</li>
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
        
        <div className="nav-user" onMouseEnter={() => setShowDropdown(true)} onMouseLeave={() => setShowDropdown(false)}>
          <img src={`https://ui-avatars.com/api/?name=${user.name}&background=E50914&color=fff&rounded=true`} alt="User" />
          <span className="caret">▼</span>
          {showDropdown && (
            <div className="user-dropdown">
              <div className="dropdown-item">Profile</div>
              <div className="dropdown-item">Manage Profiles</div>
              <div className="dropdown-divider"></div>
              <div className="dropdown-item" onClick={logout}>Sign out of FilmBox</div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

function HomeView({ onSelect, onPlay }) {
  return (
    <>
      <HeroSlider query="Dune" onSelect={onSelect} onPlay={onPlay} />
      <div className="content-rows-container">
        <RankingCarousel query="Marvel" onSelect={onSelect} />
        <MovieCarousel title="Trending Now" query="2024" onSelect={onSelect} />
        <MovieCarousel title="Action Thrillers" query="Action" onSelect={onSelect} />
        <MovieCarousel title="Sci-Fi Worlds" query="Space" onSelect={onSelect} />
        <MovieCarousel title="Comedy Hits" query="Comedy" onSelect={onSelect} />
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

  if (!movie) return <div className="hero-skeleton" />;

  return (
    <div className="hero-container">
      <div className="hero-bg">
        <img src={movie["#IMG_POSTER"]} alt="Hero" />
        <div className="hero-vignette"></div>
      </div>
      <div className="hero-content">
        <h1 className="hero-title">{movie["#AKA"]}</h1>
        <p className="hero-desc">
            Ranked #{movie["#RANK"]} • {movie["#YEAR"]} • {movie["#ACTORS"]}
        </p>
        <div className="hero-buttons">
          <button className="btn btn-play" onClick={() => onPlay(movie)}><FaPlay /> Play</button>
          <button className="btn btn-info" onClick={() => onSelect(movie)}><FaInfoCircle /> More Info</button>
        </div>
      </div>
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
    <motion.div className="modal-backdrop" onClick={onClose} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
      <motion.div className="modal-content" onClick={e => e.stopPropagation()} initial={{y: 50, opacity:0}} animate={{y:0, opacity:1}}>
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
            <div className="modal-left">
                <div className="meta-row">
                    <span className="match-score">98% Match</span>
                    <span className="year">{movie["#YEAR"]}</span>
                    <span className="badge-hd">HD</span>
                </div>
                <p className="synopsis">
                    This critically acclaimed film features {movie["#ACTORS"]}. 
                    Ranked #{movie["#RANK"]} on IMDb. A cinematic masterpiece that defines the genre.
                </p>
            </div>
            <div className="modal-right">
                <p><span>Cast:</span> {movie["#ACTORS"]}</p>
                <p><span>Genres:</span> Action, Adventure, Drama</p>
            </div>
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
        {movies.map((m, i) => (
          <div key={i} className="poster-card" onClick={() => onSelect(m)}>
            <img src={m["#IMG_POSTER"]} alt={m["#AKA"]} loading="lazy" />
          </div>
        ))}
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
        <div key={i} className="search-card">
           <img src={m["#IMG_POSTER"]} alt="" onClick={() => onSelect(m)} />
           <div className="search-overlay">
               <h4>{m["#AKA"]}</h4>
               <button onClick={() => onPlay(m)}><FaPlay /></button>
           </div>
        </div>
      ))}
    </div>
  );
}

function Footer() {
    return (
        <div className="footer">
            <div className="socials"><FaFacebook /><FaInstagram /><FaTwitter /><FaYoutube /></div>
            <div className="links">
                <span>Audio Description</span>
                <span>Help Center</span>
                <span>Gift Cards</span>
                <span>Media Center</span>
                <span>Terms of Use</span>
                <span>Privacy</span>
            </div>
            <div className="copyright">© 2026 FilmBox, Inc.</div>
        </div>
    )
}