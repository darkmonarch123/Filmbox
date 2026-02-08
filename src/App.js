import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaSearch, FaPlay, FaHeart, FaFilm, FaTimes, 
  FaChevronLeft, FaChevronRight, FaPlus, FaRegHeart, FaBell, FaStar,
  FaArrowUp, FaSignOutAlt, FaUser
} from 'react-icons/fa';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';
import './App.css';

const API_URL = "https://imdb.iamidiotareyoutoo.com/search?size=10&q=";

// --- 1. MOCK BACKEND SERVICE (Local Storage) ---
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

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <div className="app">
        {!user ? <AuthScreen /> : <MainApp />}
      </div>
    </AuthContext.Provider>
  );
}

// --- 3. AUTH SCREEN COMPONENT ---
function AuthScreen() {
  const { login } = useContext(AuthContext);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (isLogin) {
      const res = AuthService.login(formData.email, formData.password);
      if (res.error) setError(res.error);
      else login(res.user);
    } else {
      if (!formData.name) return setError("Name is required");
      const res = AuthService.signup(formData.email, formData.password, formData.name);
      if (res.error) setError(res.error);
      else login(res.user);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-overlay">
        <div className="auth-box">
          <div className="auth-brand"><FaFilm /> FILMBOX</div>
          <h2>{isLogin ? 'Sign In' : 'Create Account'}</h2>
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
              type="email" placeholder="Email Address" required
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
            <input 
              type="password" placeholder="Password" required
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
            <button type="submit" className="auth-btn">
              {isLogin ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          <p className="auth-switch">
            {isLogin ? "New to FilmBox?" : "Already have an account?"} 
            <span onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? ' Sign up now.' : ' Sign in.'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

// --- 4. MAIN APP LOGIC ---
function MainApp() {
  const [search, setSearch] = useState(""); 
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <Navbar search={search} setSearch={setSearch} isScrolled={isScrolled} />
      
      <main>
        {search.length < 3 ? (
          <HomeView onSelect={setSelectedMovie} />
        ) : (
          <SearchResults search={search} onSelect={setSelectedMovie} />
        )}
      </main>

      <AnimatePresence>
        {selectedMovie && (
          <MovieDetails movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
        )}
      </AnimatePresence>

      <ScrollToTop />
      <Footer />
    </>
  );
}

// --- 5. SCROLL TO TOP COMPONENT ---
function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggle = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', toggle);
    return () => window.removeEventListener('scroll', toggle);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <div className={`scroll-top ${visible ? 'show' : ''}`} onClick={scrollToTop}>
      <FaArrowUp />
    </div>
  );
}

// --- EXISTING COMPONENTS (Refined) ---

function Navbar({ search, setSearch, isScrolled }) {
  const { user, logout } = useContext(AuthContext);
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <nav className={`navbar-new ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-content">
        <div className="nav-left">
          <div className="brand" onClick={() => setSearch("")}><FaFilm /> FILMBOX</div>
          <ul className="nav-menu">
            <li onClick={() => setSearch("")}>Home</li>
            <li>Movies</li>
            <li>TV Shows</li>
            <li>My List</li>
          </ul>
        </div>

        <div className="nav-right">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input 
              type="text" placeholder="Search..." 
              value={search} onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="nav-user-menu" onMouseEnter={() => setShowDropdown(true)} onMouseLeave={() => setShowDropdown(false)}>
            <div className="profile-avatar">
              <img src={`https://ui-avatars.com/api/?name=${user.name}&background=E50914&color=fff`} alt="User" />
            </div>
            {showDropdown && (
              <div className="user-dropdown">
                <div className="dropdown-item"><FaUser /> {user.name}</div>
                <div className="dropdown-item" onClick={logout}><FaSignOutAlt /> Sign out</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function HomeView({ onSelect }) {
  return (
    <>
      <HeroSlider query="2026 Blockbuster" onSelect={onSelect} />
      <div className="content-rows">
        <RankingCarousel query="Trending" onSelect={onSelect} />
        <MovieCarousel title="New Releases" query="2025" onSelect={onSelect} />
        <MovieCarousel title="Action & Adventure" query="Action" onSelect={onSelect} />
      </div>
    </>
  );
}

function MovieDetails({ movie, onClose }) {
  const { user } = useContext(AuthContext);

  const toggleMyList = () => {
    // Basic implementation of Local Storage persistence for "My List"
    let updatedList = [...(user.myList || [])];
    const exists = updatedList.find(m => m["#IMDB_ID"] === movie["#IMDB_ID"]);
    
    if (exists) updatedList = updatedList.filter(m => m["#IMDB_ID"] !== movie["#IMDB_ID"]);
    else updatedList.push(movie);
    
    // Update local storage via AuthService
    AuthService.saveUserList(user.email, updatedList);
    alert(exists ? "Removed from My List" : "Added to My List");
  };

  return (
    <motion.div 
      className="details-backdrop"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="details-window"
        initial={{ y: 100, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 100, opacity: 0, scale: 0.9 }}
        onClick={e => e.stopPropagation()}
      >
        <button className="close-details" onClick={onClose}><FaTimes /></button>
        <div className="details-hero">
          <img src={movie["#IMG_POSTER"]} alt="banner" className="details-bg" />
          <div className="details-hero-overlay">
            <h1>{movie["#AKA"]}</h1>
            <div className="details-meta-row">
              <span className="rating-badge"><FaStar /> {movie["#RANK"]}</span>
              <span>{movie["#YEAR"]}</span>
              <span className="hd-badge">4K</span>
            </div>
            <div className="details-actions">
              <button className="play-btn-large"><FaPlay /> Play</button>
              <button className="circ-action" onClick={toggleMyList}><FaPlus /></button>
            </div>
          </div>
        </div>
        <div className="details-body">
          <p className="plot-summary">
            {movie["#AKA"]} ({movie["#YEAR"]}) is currently ranked #{movie["#RANK"]}.
            An incredible cinematic experience featuring {movie["#ACTORS"]}.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

function RankingCarousel({ query, onSelect }) {
  const [movies, setMovies] = useState([]);
  useEffect(() => {
    fetch(API_URL + query).then(res => res.json()).then(data => setMovies(data.description.slice(0, 10)));
  }, [query]);

  return (
    <div className="carousel-row">
      <h3 className="row-title">Top 10 Today</h3>
      <div className="carousel-track">
        {movies.map((m, i) => (
          <div key={i} className="ranking-card-wrapper" onClick={() => onSelect(m)}>
            <div className="ranking-number">{i + 1}</div>
            <div className="m-card"><img src={m["#IMG_POSTER"]} alt="poster" /></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MovieCarousel({ title, query, onSelect }) {
  const [movies, setMovies] = useState([]);
  useEffect(() => {
    fetch(API_URL + query).then(res => res.json()).then(data => setMovies(data.description || []));
  }, [query]);

  return (
    <div className="carousel-row">
      <h3 className="row-title">{title}</h3>
      <div className="carousel-track">
        {movies.length === 0 
          ? [...Array(6)].map((_, i) => <div key={i} className="skeleton card-skeleton" />)
          : movies.map((m, i) => <MovieCard key={i} movie={m} onSelect={() => onSelect(m)} />)
        }
      </div>
    </div>
  );
}

function HeroSlider({ query, onSelect }) {
  const [movies, setMovies] = useState([]);
  useEffect(() => {
    fetch(API_URL + query).then(res => res.json()).then(data => setMovies(data.description.slice(0, 5)));
  }, [query]);

  if (!movies.length) return <div className="skeleton hero-skeleton" />;
  const active = movies[0];

  return (
    <div className="hero-wrap">
      <img src={active["#IMG_POSTER"]} className="hero-image" alt="bg" />
      <div className="hero-overlay">
        <div className="hero-text">
          <h1>{active["#AKA"]}</h1>
          <div className="hero-btns">
            <button className="play-btn" onClick={() => onSelect(active)}><FaPlay /> Play</button>
            <button className="list-btn"><FaPlus /> My List</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MovieCard({ movie, onSelect }) {
  return (
    <div className="m-card" onClick={onSelect}>
      <img src={movie["#IMG_POSTER"]} alt="poster" loading="lazy" />
      <div className="m-info">
        <h4>{movie["#AKA"]}</h4>
        <p>{movie["#YEAR"]}</p>
      </div>
    </div>
  );
}

function SearchResults({ search, onSelect }) {
  const [movies, setMovies] = useState([]);
  useEffect(() => {
    fetch(API_URL + search).then(res => res.json()).then(data => setMovies(data.description || []));
  }, [search]);

  return (
    <div className="search-section">
      <h2 className="search-heading">Results for "{search}"</h2>
      <div className="search-grid">
        {movies.map((m, i) => <MovieCard key={i} movie={m} onSelect={() => onSelect(m)} />)}
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="footer-new">
      <div className="f-top">
        <div className="f-logo"><FaFilm /> FILMBOX</div>
        <div className="f-social"><FaFacebook /><FaTwitter /><FaInstagram /><FaYoutube /></div>
      </div>
      <p>&copy; 2026 FilmBox Inc.</p>
    </footer>
  );
}