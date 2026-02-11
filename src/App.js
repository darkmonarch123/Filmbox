import React, { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaSearch, FaPlay, FaInfoCircle, FaTimes, 
  FaPlus, FaCheck, FaBell, FaChevronDown, 
  FaLock, FaEnvelope, FaChevronRight, FaCheckCircle 
} from 'react-icons/fa';
import './App.css';

// --- CONFIG ---
const API_URL = "https://imdb.iamidiotareyoutoo.com/search?size=20&q=";

// --- MOCK BACKEND SERVICE ---
const AuthService = {
  getUsers: () => JSON.parse(localStorage.getItem('filmbox_users')) || [],
  otps: {}, 
  signup: (email, password, name, plan) => { // Added Plan to user object
    const users = AuthService.getUsers();
    if (users.find(u => u.email === email)) return { error: "User already exists" };
    const newUser = { email, password, name, plan, myList: [] };
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
  sendOTP: (email) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    AuthService.otps[email] = code;
    return code; 
  },
  verifyOTP: (email, inputCode) => {
    if (AuthService.otps[email] === inputCode) {
        delete AuthService.otps[email];
        return true;
    }
    return false;
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
  const [notification, setNotification] = useState(null);
  
  // Routing State: 'landing' | 'payment' | 'auth' | 'main'
  // If user exists, default to 'main', else 'landing'
  const [view, setView] = useState(user ? 'main' : 'landing');
  const [selectedPlan, setSelectedPlan] = useState('Standard'); // Default plan
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'

  const showNotification = (message, title = "System Notification") => {
      setNotification({ title, message });
      setTimeout(() => setNotification(null), 6000);
  };

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('filmbox_current_user', JSON.stringify(userData));
    setView('main');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('filmbox_current_user');
    setView('landing'); // Go back to landing on logout
  };

  const updateUserList = (newList) => {
    const updatedUser = { ...user, myList: newList };
    setUser(updatedUser);
    localStorage.setItem('filmbox_current_user', JSON.stringify(updatedUser));
    AuthService.saveUserList(user.email, newList);
  };

  // Flow handlers
  const goToLogin = () => { setAuthMode('login'); setView('auth'); };
  const goToPayment = () => { setView('payment'); };
  const goToSignup = (plan) => { 
      setSelectedPlan(plan); 
      setAuthMode('signup'); 
      setView('auth'); 
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUserList, showNotification }}>
      <div className="app">
        {/* NOTIFICATIONS */}
        <AnimatePresence>
            {notification && (
                <motion.div 
                    className="push-notification"
                    initial={{ y: -100, opacity: 0 }} animate={{ y: 20, opacity: 1 }} exit={{ y: -100, opacity: 0 }}
                    onClick={() => setNotification(null)}
                >
                    <div className="push-icon"><FaEnvelope /></div>
                    <div className="push-content">
                        <h4>{notification.title}</h4>
                        <p>{notification.message}</p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* VIEW ROUTING */}
        <AnimatePresence mode="wait">
          {view === 'landing' && (
             <LandingPage key="landing" onSignIn={goToLogin} onGetStarted={goToPayment} />
          )}
          
          {view === 'payment' && (
             <PaymentScreen key="payment" onSelectPlan={goToSignup} onBack={() => setView('landing')} />
          )}

          {view === 'auth' && (
             <AuthScreen key="auth" initialMode={authMode} selectedPlan={selectedPlan} onBack={() => setView('landing')} />
          )}

          {view === 'main' && (
             <MainApp key="main" />
          )}
        </AnimatePresence>
      </div>
    </AuthContext.Provider>
  );
}

// --- LANDING PAGE ---
function LandingPage({ onSignIn, onGetStarted }) {
    // Background Carousel Images
    const bgImages = [
        "https://assets.nflxext.com/ffe/siteui/vlv3/f841d4c7-10e1-40af-bcae-07a3f8dc141a/f6d7434e-d6de-4185-a6d4-c77a2d08737b/US-en-20220502-popsignuptwoweeks-perspective_alpha_website_medium.jpg",
        "https://wallpaperaccess.com/full/1076854.jpg", // Dark Knight
        "https://wallpapercave.com/wp/wp1917118.jpg" // Interstellar
    ];
    const [currentBg, setCurrentBg] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentBg(prev => (prev + 1) % bgImages.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [bgImages.length]);

    return (
        <motion.div className="landing-container" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
            {/* Background Carousel */}
            {bgImages.map((img, index) => (
                <motion.div 
                    key={index}
                    className="landing-bg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: index === currentBg ? 1 : 0 }}
                    transition={{ duration: 1.5 }}
                    style={{ backgroundImage: `url(${img})` }}
                />
            ))}
            <div className="landing-overlay"></div>

            <nav className="landing-nav">
                <div className="brand"><span className="red-text">FILM</span>BOX</div>
                <button className="btn-signin" onClick={onSignIn}>Sign In</button>
            </nav>

            <div className="landing-hero">
                <h1>Unlimited movies, TV shows, and more.</h1>
                <h2>Watch anywhere. Cancel anytime.</h2>
                <p>Ready to watch? Choose a plan to create your membership.</p>
                <button className="btn-get-started" onClick={onGetStarted}>
                    Get Started <FaChevronRight />
                </button>
            </div>

            {/* Feature Banner */}
            <div className="landing-feature">
                <div className="feature-text">
                    <h1>Enjoy on your TV.</h1>
                    <p>Watch on Smart TVs, Playstation, Xbox, Chromecast, Apple TV, Blu-ray players, and more.</p>
                </div>
                <div className="feature-img">
                    <img src="https://assets.nflxext.com/ffe/siteui/acquisition/ourStory/fuji/desktop/tv.png" alt="TV" />
                </div>
            </div>
            
            <Footer />
        </motion.div>
    );
}

// --- PAYMENT SCREEN ---
function PaymentScreen({ onSelectPlan, onBack }) {
    const plans = [
        { name: "Basic", price: "$8.99", quality: "Good", res: "720p" },
        { name: "Standard", price: "$13.99", quality: "Better", res: "1080p", recommended: true },
        { name: "Premium", price: "$17.99", quality: "Best", res: "4K+HDR" },
    ];

    return (
        <motion.div className="payment-container" initial={{x: '100%'}} animate={{x: 0}} exit={{x: '-100%'}}>
            <nav className="landing-nav simple">
                 <div className="brand" onClick={onBack} style={{cursor:'pointer'}}><span className="red-text">FILM</span>BOX</div>
                 <button className="btn-link" onClick={onBack}>Cancel</button>
            </nav>

            <div className="payment-content">
                <span className="step-indicator">STEP 1 OF 2</span>
                <h1>Choose your plan.</h1>
                <ul className="plan-benefits">
                    <li><FaCheck className="red-text" /> No commitments, cancel anytime.</li>
                    <li><FaCheck className="red-text" /> Everything on FilmBox for one low price.</li>
                    <li><FaCheck className="red-text" /> Unlimited viewing on all your devices.</li>
                </ul>

                <div className="plan-cards">
                    {plans.map((p, i) => (
                        <div key={i} className={`plan-card ${p.recommended ? 'active' : ''}`} onClick={() => onSelectPlan(p.name)}>
                             {p.recommended && <div className="plan-tag">Most Popular</div>}
                             <h3>{p.name}</h3>
                             <div className="price">{p.price}</div>
                             <div className="features">
                                 <div>{p.quality} quality</div>
                                 <div>{p.res} resolution</div>
                             </div>
                             <button className="btn-select">Select</button>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}

// --- AUTH SCREEN (Modified to accept initialMode) ---
function AuthScreen({ initialMode, selectedPlan, onBack }) {
  const { login, showNotification } = useContext(AuthContext);
  const [step, setStep] = useState('credentials');
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [otp, setOtp] = useState('');
  const [pendingUser, setPendingUser] = useState(null);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    setTimeout(() => {
        let res;
        if (isLogin) {
            res = AuthService.login(formData.email, formData.password);
        } else {
            if (!formData.name) {
                setLoading(false);
                return setError("Name is required");
            }
            res = AuthService.signup(formData.email, formData.password, formData.name, selectedPlan);
        }

        if (res.error) {
            setError(res.error);
            setLoading(false);
        } else {
            const code = AuthService.sendOTP(res.user.email);
            setPendingUser(res.user);
            setStep('2fa');
            setLoading(false);
            showNotification(`Your code is: ${code}`, "📧 Verification");
        }
    }, 800);
  };

  const handleVerify = (e) => {
      e.preventDefault();
      if(AuthService.verifyOTP(pendingUser.email, otp)) {
          login(pendingUser);
      } else {
          setError("Invalid code.");
      }
  };

  return (
    <motion.div className="auth-container" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}>
      <div className="auth-overlay">
        <div className="auth-box">
          <div className="auth-brand" onClick={onBack} style={{cursor:'pointer'}}>
              <span className="red-text">FILM</span>BOX
          </div>
          
          {step === 'credentials' ? (
              <>
                <h2>{isLogin ? 'Sign In' : 'Finish Setting Up'}</h2>
                {!isLogin && selectedPlan && <div className="plan-badge">Plan: {selectedPlan}</div>}
                
                {error && <div className="auth-error">{error}</div>}
                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                    <input type="text" placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    )}
                    <input type="email" placeholder="Email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    <input type="password" placeholder="Password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                    <button type="submit" className="auth-btn" disabled={loading}>
                    {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Start Membership')}
                    </button>
                </form>
                <div className="auth-footer">
                    <span className="gray-text">{isLogin ? "New here?" : "Already have an account?"} </span>
                    <span className="auth-link" onClick={() => setIsLogin(!isLogin)}>
                    {isLogin ? 'Sign up now.' : 'Sign in.'}
                    </span>
                </div>
              </>
          ) : (
              <motion.div initial={{ x: 50 }} animate={{ x: 0 }}>
                  <h2><FaLock style={{fontSize:'0.8em'}}/> Security Check</h2>
                  <p className="gray-text">Code sent to <b>{formData.email}</b></p>
                  {error && <div className="auth-error">{error}</div>}
                  <form onSubmit={handleVerify}>
                      <input type="text" placeholder="123456" value={otp} onChange={e => setOtp(e.target.value)} style={{textAlign: 'center', letterSpacing:'5px'}} maxLength={6} autoFocus />
                      <button type="submit" className="auth-btn">Verify</button>
                  </form>
              </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// --- MAIN APP, SEARCH RESULTS, VIDEO PLAYER, MODALS ---
// (These remain exactly the same as your previous code, pasted below for completeness)

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

  const handlePlay = (movie) => { setPlayingMovie(movie); setSelectedMovie(null); };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
      <Navbar search={search} setSearch={setSearch} isScrolled={isScrolled} />
      <main>
        {search.length > 2 ? (
          <SearchResults search={search} onSelect={setSelectedMovie} onPlay={handlePlay} />
        ) : (
          <HomeView onSelect={setSelectedMovie} onPlay={handlePlay} />
        )}
      </main>
      <AnimatePresence>
        {selectedMovie && (
          <MovieDetails movie={selectedMovie} onClose={() => setSelectedMovie(null)} onPlay={() => handlePlay(selectedMovie)} />
        )}
        {playingMovie && (
            <VideoPlayer movie={playingMovie} onClose={() => setPlayingMovie(null)} />
        )}
      </AnimatePresence>
      <Footer />
    </motion.div>
  );
}

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
            <li>My List</li>
        </ul>
      </div>
      <div className="nav-right">
        <div className={`search-box ${search ? 'active' : ''}`}>
          <FaSearch className="search-icon" />
          <input type="text" placeholder="Titles, people, genres" value={search} onChange={(e) => setSearch(e.target.value)} />
          {search && <FaTimes className="clear-icon" onClick={() => setSearch('')} />}
        </div>
        <div className="nav-item"><FaBell /></div>
        <div className="nav-user" onMouseEnter={() => setShowDropdown(true)} onMouseLeave={() => setShowDropdown(false)}>
          <div className="user-trigger">
            <img src={`https://ui-avatars.com/api/?name=${user.name}&background=E50914&color=fff&rounded=true`} alt="User" />
            <motion.span animate={{ rotate: showDropdown ? 180 : 0 }} className="caret"><FaChevronDown size={12} /></motion.span>
          </div>
          <AnimatePresence>
            {showDropdown && (
                <motion.div className="user-dropdown" initial={{opacity:0, y:-20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-20}}>
                    <div className="dropdown-arrow"></div>
                    <div className="dropdown-item">Plan: <b>{user.plan || "Free"}</b></div>
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

function VideoPlayer({ movie, onClose }) {
    const query = encodeURIComponent(`${movie["#AKA"]} ${movie["#YEAR"]} trailer`);
    const embedUrl = `https://www.youtube.com/embed?listType=search&list=${query}&autoplay=1&controls=1&modestbranding=1&rel=0`;
    return (
        <motion.div className="video-player-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="video-header">
                <h3>Now Playing: {movie["#AKA"]}</h3>
                <button onClick={onClose}><FaTimes /></button>
            </div>
            <div className="iframe-container">
                <iframe src={embedUrl} title="Player" frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen></iframe>
            </div>
        </motion.div>
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

  if (!movie) return <div className="hero-container skeleton-pulse"><div className="hero-content"></div></div>;

  return (
    <div className="hero-container">
      <div className="hero-bg">
        <img src={movie["#IMG_POSTER"]} alt="Hero" />
        <div className="hero-vignette"></div>
      </div>
      <motion.div className="hero-content" initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5, duration: 0.8 }}>
        <h1 className="hero-title">{movie["#AKA"]}</h1>
        <p className="hero-desc">Ranked #{movie["#RANK"]} • {movie["#YEAR"]}</p>
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
    <motion.div className="modal-backdrop" onClick={onClose} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
      <motion.div className="modal-content" onClick={e => e.stopPropagation()} initial={{y: 100, opacity:0}} animate={{y:0, opacity:1}} exit={{y: 100, opacity: 0}}>
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
        <motion.div key={i} className="search-card" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
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
    return (
        <div className="footer">
            <div className="links">
                <span>FAQ</span><span>Help Center</span>
                <span>Account</span><span>Media Center</span>
            </div>
            <p>© 2026 FilmBox, Inc.</p>
        </div>
    );
}