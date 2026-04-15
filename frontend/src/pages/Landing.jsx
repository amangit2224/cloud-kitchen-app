import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import SarasLogo from '../components/common/SarasLogo';

/* ─── Animated counter hook ─────────────────────────────────── */
const useCounter = (target, duration = 1800, start = false) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
};

/* ─── Intersection observer hook ────────────────────────────── */
const useInView = (threshold = 0.15) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
};

/* ─── Stats data ─────────────────────────────────────────────── */
const STATS = [
  { value: 3000, suffix: '+', label: 'Orders Delivered', icon: '📦' },
  { value: 50,   suffix: '+', label: 'Menu Items',        icon: '🍽️' },
  { value: 98,   suffix: '%', label: 'Happy Customers',   icon: '😊' },
  { value: 30,   suffix: ' min', label: 'Avg Delivery',   icon: '⚡' },
];

/* ─── Menu highlights ────────────────────────────────────────── */
const DISHES = [
  {
    name: 'Butter Chicken',
    desc: 'Slow-cooked in a rich tomato & cream gravy with aromatic spices',
    tag: 'Best Seller',
    price: '₹280',
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&h=300&fit=crop',
    gradient: 'linear-gradient(135deg, #FF6B35 0%, #F7C59F 100%)',
  },
  {
    name: 'Paneer Tikka Masala',
    desc: 'Charred cottage cheese cubes in a smoky, velvety masala sauce',
    tag: 'Veg Favourite',
    price: '₹240',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=300&fit=crop',
    gradient: 'linear-gradient(135deg, #E8412A 0%, #FFB347 100%)',
  },
  {
    name: 'Hyderabadi Biryani',
    desc: 'Dum-cooked basmati with saffron, caramelised onions & whole spices',
    tag: 'Chef Special',
    price: '₹320',
    image: 'https://www.whiskaffair.com/wp-content/uploads/2020/07/Chicken-Biryani-2-1.jpg',
    gradient: 'linear-gradient(135deg, #C4321D 0%, #FD9644 100%)',
  },
  {
    name: 'Dal Makhani',
    desc: 'Black lentils simmered overnight with butter & cream — pure comfort',
    tag: 'House Staple',
    price: '₹180',
    image: 'https://www.vegrecipesofindia.com/wp-content/uploads/2024/02/dal-makhani-recipe-2.jpg',
    gradient: 'linear-gradient(135deg, #8B2FC9 0%, #E8412A 100%)',
  },
];

/* ─── How It Works steps ─────────────────────────────────────── */
const HOW = [
  { step: '01', icon: '📲', title: 'Browse Our Menu', desc: 'Explore 50+ freshly-prepared dishes across categories — from hearty mains to indulgent desserts.' },
  { step: '02', icon: '🛒', title: 'Add & Customise', desc: 'Build your order, add special instructions, and pick from saved delivery addresses.' },
  { step: '03', icon: '💳', title: 'Pay Securely', desc: 'Choose Cash on Delivery or pay online via Razorpay — fast, safe, and hassle-free.' },
  { step: '04', icon: '🛵', title: 'Track Live', desc: "Real-time order tracking from kitchen to your door. No guessing, no waiting in the dark." },
];

/* ─── Testimonials ───────────────────────────────────────────── */
const REVIEWS = [
  { name: 'Priya Sharma', role: 'Regular Customer', stars: 5, text: "The butter chicken is absolutely divine! Consistently great quality, always hot, and delivery is always on time. My go-to for family dinners." },
  { name: 'Rahul Mehta', role: 'Office Lunch Customer', stars: 5, text: "We order for our entire office of 20+ people. The food never disappoints — everyone loves the biryani. Sara's Kitchen has become our office caterer!" },
  { name: 'Anjali Nair', role: 'Weekend Regular', stars: 5, text: "Best cloud kitchen in the city. The packaging is leak-proof, the food is always fresh, and the app is so easy to use. Love the live tracking feature!" },
];

/* ═══════════════════════════════════════════════════════════════
   LANDING PAGE
═══════════════════════════════════════════════════════════════ */
const Landing = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [statsRef, statsInView] = useInView();

  const orders   = useCounter(3000, 1800, statsInView);
  const items    = useCounter(50,   1500, statsInView);
  const happy    = useCounter(98,   1600, statsInView);
  const delivery = useCounter(30,   1400, statsInView);
  const counters = [orders, items, happy, delivery];

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <div className="ck-landing">

      {/* ── NAVBAR ───────────────────────────────────────────── */}
      <nav className={`ck-lnav ${scrolled ? 'ck-lnav--scrolled' : ''}`}>
        <div className="ck-lnav-inner">
          {/* Logo */}
          <Link to="/" className="ck-lnav-logo">
            <SarasLogo size={42} showText={false} />
          </Link>

          {/* Desktop links */}
          <div className="ck-lnav-links">
            <button onClick={() => scrollTo('about')}   className="ck-lnav-link">About</button>
            <button onClick={() => scrollTo('menu')}    className="ck-lnav-link">Menu</button>
            <button onClick={() => scrollTo('how')}     className="ck-lnav-link">How It Works</button>
            <button onClick={() => scrollTo('reviews')} className="ck-lnav-link">Reviews</button>
            <button onClick={() => scrollTo('contact')} className="ck-lnav-link">Contact</button>
          </div>

          {/* CTA buttons */}
          <div className="ck-lnav-cta">
            <Link to="/login"    className="ck-lnav-signin">Sign In</Link>
            <Link to="/register" className="ck-lnav-signup">Sign Up</Link>
          </div>

          {/* Mobile hamburger */}
          <button className="ck-lnav-hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <span className={mobileMenuOpen ? 'open' : ''}></span>
            <span className={mobileMenuOpen ? 'open' : ''}></span>
            <span className={mobileMenuOpen ? 'open' : ''}></span>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="ck-lnav-mobile">
            <button onClick={() => scrollTo('about')}>About</button>
            <button onClick={() => scrollTo('menu')}>Menu</button>
            <button onClick={() => scrollTo('how')}>How It Works</button>
            <button onClick={() => scrollTo('reviews')}>Reviews</button>
            <button onClick={() => scrollTo('contact')}>Contact</button>
            <div className="ck-lnav-mobile-cta">
              <Link to="/login"    onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}>Sign Up Free</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="ck-hero">
        <div className="ck-hero-bg">
          <div className="ck-hero-orb ck-hero-orb-1" />
          <div className="ck-hero-orb ck-hero-orb-2" />
          <div className="ck-hero-orb ck-hero-orb-3" />
          {['🍛','🍚','🫕','🍗','🥘','🍜'].map((e, i) => (
            <span key={i} className="ck-hero-float" style={{ '--i': i }}>{e}</span>
          ))}
        </div>

        <div className="ck-hero-content">
          <div className="ck-hero-badge">🔥 Fresh • Fast • Flavorful</div>
          <h1 className="ck-hero-title">
            Authentic Indian<br />
            <span className="ck-hero-accent">Flavours</span>, Delivered<br />
            To Your Door
          </h1>
          <p className="ck-hero-sub">
            From our kitchen to your table in under 30 minutes. Over 50 handcrafted dishes made daily with fresh ingredients — no shortcuts, no compromise.
          </p>
          <div className="ck-hero-actions">
            <Link to="/menu" className="ck-btn-hero-primary">Explore Menu →</Link>
            <button onClick={() => scrollTo('how')} className="ck-btn-hero-ghost">▶ How it works</button>
          </div>
          <div className="ck-hero-trust">
            <span className="ck-trust-pill">⭐ 4.9 Rating</span>
            <span className="ck-trust-pill">🛵 30-min Delivery</span>
            <span className="ck-trust-pill">🔒 Secure Payments</span>
          </div>
        </div>

        {/* Hero food card */}
        <div className="ck-hero-card-wrap">
          <div className="ck-hero-card">
            <div className="ck-hero-card-img">
              <img src="https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&h=250&fit=crop" alt="Butter Chicken"/>
            </div>
            <div className="ck-hero-card-body">
              <span className="ck-hero-card-tag">Chef's Pick Today</span>
              <div className="ck-hero-card-name">Butter Chicken</div>
              <div className="ck-hero-card-desc">Slow-cooked in a rich tomato cream gravy</div>
              <div className="ck-hero-card-footer">
                <span className="ck-hero-card-price">₹280</span>
                <Link to="/menu" className="ck-hero-card-btn">Order Now</Link>
              </div>
            </div>
            <div className="ck-hero-live">
              <span className="ck-hero-live-dot" />
              <span>Live Orders Open</span>
            </div>
          </div>
          <div className="ck-hero-badge-float">
            <span className="ck-hero-badge-num">3K+</span>
            <span className="ck-hero-badge-label">Happy<br/>Customers</span>
          </div>
        </div>

        <div className="ck-hero-scroll" onClick={() => scrollTo('about')}>
          <span />
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────── */}
      <section className="ck-stats" ref={statsRef}>
        <div className="ck-container">
          <div className="ck-stats-grid">
            {STATS.map((s, i) => (
              <div key={i} className="ck-stat-item">
                <div className="ck-stat-icon">{s.icon}</div>
                <div className="ck-stat-number">{counters[i]}{s.suffix}</div>
                <div className="ck-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT ────────────────────────────────────────────── */}
      <section className="ck-about ck-section" id="about">
        <div className="ck-container ck-about-grid">
          <div className="ck-about-visual">
            <div className="ck-about-main-img">
              <img src="https://st2.depositphotos.com/3785099/7401/i/950/depositphotos_74013483-stock-photo-young-woman-cooking-in-kitchen.jpg" alt="Chef preparing fresh food"/>
              <div className="ck-about-img-caption">
                <strong>Freshly Prepared</strong>
                <span>Every single day</span>
              </div>
            </div>
            <div className="ck-about-side-card ck-about-side-top">
              <span>🌿</span>
              <div><strong>100% Fresh</strong><p>No frozen ingredients</p></div>
            </div>
            <div className="ck-about-side-card ck-about-side-bot">
              <span>⏱️</span>
              <div><strong>Ready in 20 min</strong><p>From order to kitchen</p></div>
            </div>
          </div>

          <div className="ck-about-text">
            <div className="ck-section-tag">Introduction</div>
            <h2 className="ck-section-title">
              Good things come to<br />
              those who <span className="ck-accent">cook for others</span>
            </h2>
            <p className="ck-about-lead">
              Welcome to Sara's Kitchen — where the art of fine Indian cuisine meets modern nutritional needs. Founded with a passion for authentic flavours, we craft every dish using traditional recipes and fresh, locally-sourced ingredients.
            </p>
            <p className="ck-about-body">
              With the capacity to produce and pack up to 3,000 daily parcels, we cater to individual customers, corporate offices, and everything in between. Our goal is to bring restaurant-quality food directly to your table — fast, fresh, and consistently delicious.
            </p>
            <ul className="ck-about-feats">
              <li><span className="ck-feat-check">✓</span> Freshness and flavour in every bite</li>
              <li><span className="ck-feat-check">✓</span> Hassle-free online ordering & live tracking</li>
              <li><span className="ck-feat-check">✓</span> Corporate catering for MNC clients</li>
              <li><span className="ck-feat-check">✓</span> Your satisfaction is our top priority</li>
            </ul>
            <div className="ck-about-actions">
              <Link to="/menu" className="ck-btn-primary">Order Now</Link>
              <button onClick={() => scrollTo('contact')} className="ck-btn-ghost">Contact Us</button>
            </div>
          </div>
        </div>
      </section>

      {/* ── MENU HIGHLIGHTS ──────────────────────────────────── */}
      <section className="ck-menu-section ck-section" id="menu">
        <div className="ck-container">
          <div className="ck-section-header">
            <div className="ck-section-tag">Our Menu</div>
            <h2 className="ck-section-title">Signature Dishes<br/>You'll <span className="ck-accent">Keep Coming Back For</span></h2>
            <p className="ck-section-sub">Every dish on our menu is crafted with care, cooked fresh to order, and packed for your perfect meal experience.</p>
          </div>
          <div className="ck-dishes-grid">
            {DISHES.map((d, i) => (
              <div key={i} className="ck-dish-card">
                <div className="ck-dish-img" style={{ background: d.gradient }}>
                  <img src={d.image} alt={d.name} />
                  <div className="ck-dish-tag">{d.tag}</div>
                </div>
                <div className="ck-dish-body">
                  <div className="ck-dish-name">{d.name}</div>
                  <div className="ck-dish-desc">{d.desc}</div>
                  <div className="ck-dish-footer">
                    <span className="ck-dish-price">{d.price}</span>
                    <Link to="/menu" className="ck-dish-btn">Add to Cart +</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="ck-menu-cta">
            <Link to="/menu" className="ck-btn-primary ck-btn-lg">View Full Menu — 50+ Dishes →</Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section className="ck-how ck-section" id="how">
        <div className="ck-container">
          <div className="ck-section-header">
            <div className="ck-section-tag">Process</div>
            <h2 className="ck-section-title">Ordering is <span className="ck-accent">Ridiculously Easy</span></h2>
            <p className="ck-section-sub">Four simple steps between you and an incredible meal.</p>
          </div>
          <div className="ck-how-grid">
            {HOW.map((h, i) => (
              <div key={i} className="ck-how-card">
                <div className="ck-how-step">{h.step}</div>
                <div className="ck-how-icon">{h.icon}</div>
                <div className="ck-how-title">{h.title}</div>
                <div className="ck-how-desc">{h.desc}</div>
                {i < HOW.length - 1 && <div className="ck-how-arrow">→</div>}
              </div>
            ))}
          </div>
          <div className="ck-how-cta">
            <Link to="/register" className="ck-btn-primary ck-btn-lg">Get Started Free →</Link>
          </div>
        </div>
      </section>

      {/* ── REVIEWS ──────────────────────────────────────────── */}
      <section className="ck-reviews ck-section" id="reviews">
        <div className="ck-container">
          <div className="ck-section-header">
            <div className="ck-section-tag">Testimonials</div>
            <h2 className="ck-section-title">What Our <span className="ck-accent">Customers Say</span></h2>
            <p className="ck-section-sub">Real reviews from real food lovers who order every week.</p>
          </div>
          <div className="ck-reviews-grid">
            {REVIEWS.map((r, i) => (
              <div key={i} className="ck-review-card">
                <div className="ck-review-stars">{'★'.repeat(r.stars)}</div>
                <p className="ck-review-text">"{r.text}"</p>
                <div className="ck-review-author">
                  <div className="ck-review-avatar">{r.name[0]}</div>
                  <div>
                    <div className="ck-review-name">{r.name}</div>
                    <div className="ck-review-role">{r.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────── */}
      <section className="ck-cta-banner">
        <div className="ck-cta-orb-1" /><div className="ck-cta-orb-2" />
        <div className="ck-container ck-cta-inner">
          <div>
            <h2 className="ck-cta-title">Ready to Order?</h2>
            <p className="ck-cta-sub">Join 3,000+ happy customers. Sign up free, browse the menu, and get your first meal delivered in under 30 minutes.</p>
          </div>
          <div className="ck-cta-btns">
            <Link to="/register" className="ck-btn-cta-primary">Create Free Account</Link>
            <Link to="/menu"     className="ck-btn-cta-ghost">View Menu</Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="ck-footer" id="contact">
        <div className="ck-container ck-footer-grid">
          <div className="ck-footer-brand">
            <div className="ck-footer-logo">
              <SarasLogo size={60} showText={false} />
            </div>
            <p className="ck-footer-tagline">Fresh ingredients. Authentic flavours. Delivered to your door with love.</p>
            <div className="ck-footer-social">
              {['f', 'in', 'yt', 'ig'].map(s => (
                <a key={s} href="#" className="ck-social-btn">{s}</a>
              ))}
            </div>
          </div>

          <div className="ck-footer-col">
            <div className="ck-footer-col-title">Quick Links</div>
            <button onClick={() => scrollTo('about')}   className="ck-footer-link">About Us</button>
            <button onClick={() => scrollTo('menu')}    className="ck-footer-link">Our Menu</button>
            <button onClick={() => scrollTo('how')}     className="ck-footer-link">How It Works</button>
            <button onClick={() => scrollTo('reviews')} className="ck-footer-link">Reviews</button>
          </div>

          <div className="ck-footer-col">
            <div className="ck-footer-col-title">Account</div>
            <Link to="/login"          className="ck-footer-link">Sign In</Link>
            <Link to="/register"       className="ck-footer-link">Create Account</Link>
            <Link to="/rider/register" className="ck-footer-link">Become a Rider</Link>
            <Link to="/menu"           className="ck-footer-link">Browse Menu</Link>
          </div>

          <div className="ck-footer-col">
            <div className="ck-footer-col-title">Contact Us</div>
            <div className="ck-footer-contact-item"><span>📍</span><span>Bangalore, Karnataka, India</span></div>
            <div className="ck-footer-contact-item"><span>📞</span><span>+91 97421 46783</span></div>
            <div className="ck-footer-contact-item"><span>✉️</span><span>hello@saraskitchen.in</span></div>
            <div className="ck-footer-contact-item"><span>🕐</span><span>Mon–Sun: 11am – 10pm</span></div>
          </div>
        </div>

        <div className="ck-footer-bottom">
          <span>© {new Date().getFullYear()} Sara's Kitchen. All rights reserved.</span>
          <div className="ck-footer-legal">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms & Conditions</a>
            <a href="#">FAQ</a>
          </div>
        </div>
      </footer>

      {/* ════════════ ALL LANDING STYLES ════════════ */}
      <style>{`
        .ck-landing { font-family: var(--font-body); color: var(--ink); overflow-x: hidden; }
        .ck-container { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; }
        .ck-section { padding: 6rem 0; }
        .ck-accent { color: var(--coral); }

        .ck-section-header { text-align: center; max-width: 640px; margin: 0 auto 3.5rem; }
        .ck-section-tag {
          display: inline-block; background: var(--coral-bg); color: var(--coral);
          font-size: 0.75rem; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; padding: 0.35rem 1rem; border-radius: var(--r-full);
          margin-bottom: 1rem;
        }
        .ck-section-title { font-family: var(--font-display); font-size: clamp(1.8rem, 3.5vw, 2.6rem); line-height: 1.2; margin-bottom: 1rem; color: var(--ink); }
        .ck-section-sub { color: var(--ink-50); font-size: 1rem; line-height: 1.7; }

        .ck-btn-primary {
          display: inline-flex; align-items: center; gap: 0.5rem;
          background: var(--coral); color: white; font-weight: 600;
          padding: 0.75rem 1.75rem; border-radius: var(--r-md); border: none;
          cursor: pointer; text-decoration: none; font-size: 0.95rem;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 14px rgba(232,65,42,0.35);
        }
        .ck-btn-primary:hover { background: var(--coral-dark); transform: translateY(-1px); box-shadow: 0 6px 20px rgba(232,65,42,0.45); color: white; }
        .ck-btn-ghost {
          display: inline-flex; align-items: center; gap: 0.5rem;
          background: transparent; color: var(--ink-80); font-weight: 600;
          padding: 0.75rem 1.75rem; border-radius: var(--r-md);
          border: 1.5px solid var(--ink-10); cursor: pointer;
          text-decoration: none; font-size: 0.95rem; transition: all 0.2s;
        }
        .ck-btn-ghost:hover { border-color: var(--coral); color: var(--coral); background: var(--coral-bg); }
        .ck-btn-lg { padding: 1rem 2.25rem; font-size: 1rem; }

        /* NAVBAR */
        .ck-lnav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
          padding: 1.25rem 0; transition: all 0.3s ease;
        }
        .ck-lnav--scrolled {
          background: rgba(255,255,255,0.95); backdrop-filter: blur(12px);
          padding: 0.75rem 0; border-bottom: 1px solid var(--ink-10);
          box-shadow: 0 2px 20px rgba(0,0,0,0.06);
        }
        .ck-lnav-inner {
          max-width: 1200px; margin: 0 auto; padding: 0 1.5rem;
          display: flex; align-items: center; justify-content: space-between; gap: 1rem;
        }
        .ck-lnav-logo { display: flex; align-items: center; gap: 0.6rem; text-decoration: none; }
        .ck-lnav-links { display: flex; align-items: center; gap: 0.25rem; }
        .ck-lnav-link {
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.85); font-weight: 500; font-size: 0.9rem;
          padding: 0.5rem 0.75rem; border-radius: var(--r-md);
          transition: all 0.2s; font-family: var(--font-body);
        }
        .ck-lnav-link:hover { background: rgba(255,255,255,0.1); color: white; }
        .ck-lnav--scrolled .ck-lnav-link { color: var(--ink-80); }
        .ck-lnav--scrolled .ck-lnav-link:hover { background: var(--ink-05); color: var(--ink); }
        .ck-lnav-cta { display: flex; align-items: center; gap: 0.75rem; }
        .ck-lnav-signin {
          color: rgba(255,255,255,0.9); font-weight: 600; font-size: 0.875rem;
          text-decoration: none; padding: 0.5rem 1rem; transition: color 0.2s;
        }
        .ck-lnav-signin:hover { color: white; }
        .ck-lnav--scrolled .ck-lnav-signin { color: var(--ink-80); }
        .ck-lnav--scrolled .ck-lnav-signin:hover { color: var(--ink); }
        .ck-lnav-signup {
          background: var(--coral); color: white !important; font-weight: 600; font-size: 0.875rem;
          text-decoration: none; padding: 0.55rem 1.25rem; border-radius: var(--r-md);
          transition: all 0.2s; box-shadow: 0 2px 10px rgba(232,65,42,0.35);
        }
        .ck-lnav-signup:hover { background: var(--coral-dark); transform: translateY(-1px); }
        .ck-lnav-hamburger {
          display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: 4px;
        }
        .ck-lnav-hamburger span { display: block; width: 24px; height: 2px; background: white; border-radius: 2px; transition: all 0.3s; }
        .ck-lnav--scrolled .ck-lnav-hamburger span { background: var(--ink); }
        .ck-lnav-mobile {
          background: white; border-top: 1px solid var(--ink-10);
          padding: 1rem 1.5rem; display: flex; flex-direction: column; gap: 0.5rem;
        }
        .ck-lnav-mobile button {
          background: none; border: none; cursor: pointer; text-align: left;
          color: var(--ink-80); font-size: 1rem; font-weight: 500; padding: 0.6rem 0;
          font-family: var(--font-body); border-bottom: 1px solid var(--ink-05);
        }
        .ck-lnav-mobile-cta { display: flex; gap: 1rem; margin-top: 1rem; }
        .ck-lnav-mobile-cta a { flex: 1; text-align: center; padding: 0.7rem 1rem; border-radius: var(--r-md); font-weight: 600; text-decoration: none; }
        .ck-lnav-mobile-cta a:first-child { border: 1.5px solid var(--ink-10); color: var(--ink-80); }
        .ck-lnav-mobile-cta a:last-child  { background: var(--coral); color: white; }

        /* HERO */
        .ck-hero {
          min-height: 100vh; display: flex; align-items: center;
          background: linear-gradient(135deg, #1C1917 0%, #2D1B0E 40%, #3D2B1F 70%, #1C1917 100%);
          position: relative; overflow: hidden; padding: 8rem 1.5rem 4rem;
          max-width: 100%; flex-wrap: wrap; gap: 3rem; justify-content: center;
        }
        .ck-hero-bg { position: absolute; inset: 0; pointer-events: none; }
        .ck-hero-orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.35; }
        .ck-hero-orb-1 { width: 500px; height: 500px; background: radial-gradient(circle, #E8412A, transparent); top: -100px; right: -100px; animation: float1 8s ease-in-out infinite; }
        .ck-hero-orb-2 { width: 350px; height: 350px; background: radial-gradient(circle, #FF6B35, transparent); bottom: -50px; left: 10%; animation: float2 10s ease-in-out infinite; }
        .ck-hero-orb-3 { width: 250px; height: 250px; background: radial-gradient(circle, #C4321D, transparent); top: 30%; left: 40%; opacity: 0.2; animation: float3 12s ease-in-out infinite; }
        @keyframes float1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-30px,20px)} }
        @keyframes float2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(20px,-30px)} }
        @keyframes float3 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-20px,20px)} }
        .ck-hero-float { position: absolute; font-size: 2rem; opacity: 0.08; animation: floatEmoji 6s ease-in-out infinite; animation-delay: calc(var(--i) * 1s); }
        .ck-hero-float:nth-child(1) { top: 20%; left: 5%; }
        .ck-hero-float:nth-child(2) { top: 60%; left: 8%; }
        .ck-hero-float:nth-child(3) { top: 15%; right: 30%; }
        .ck-hero-float:nth-child(4) { bottom: 25%; right: 5%; }
        .ck-hero-float:nth-child(5) { top: 40%; left: 50%; }
        .ck-hero-float:nth-child(6) { bottom: 15%; left: 35%; }
        @keyframes floatEmoji { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-20px) rotate(10deg)} }
        .ck-hero-content { position: relative; z-index: 1; max-width: 560px; flex: 1 1 auto; }
        .ck-hero-badge { display: inline-block; background: rgba(232,65,42,0.2); color: #FF9A8B; border: 1px solid rgba(232,65,42,0.3); font-size: 0.8rem; font-weight: 600; padding: 0.4rem 1rem; border-radius: var(--r-full); margin-bottom: 1.5rem; letter-spacing: 0.05em; }
        .ck-hero-title { font-family: var(--font-display); font-size: clamp(2.5rem, 5vw, 4rem); line-height: 1.1; color: white; margin-bottom: 1.5rem; font-weight: 700; }
        .ck-hero-accent { color: var(--coral-light); }
        .ck-hero-sub { color: rgba(255,255,255,0.65); font-size: 1.05rem; line-height: 1.75; margin-bottom: 2rem; max-width: 480px; }
        .ck-hero-actions { display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 2rem; }
        .ck-btn-hero-primary { background: var(--coral); color: white; font-weight: 700; font-size: 1rem; padding: 0.9rem 2rem; border-radius: var(--r-md); text-decoration: none; transition: all 0.2s; box-shadow: 0 6px 24px rgba(232,65,42,0.45); display: inline-flex; align-items: center; gap: 0.5rem; }
        .ck-btn-hero-primary:hover { background: var(--coral-dark); transform: translateY(-2px); color: white; }
        .ck-btn-hero-ghost { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.85); font-weight: 600; font-size: 1rem; padding: 0.9rem 1.75rem; border-radius: var(--r-md); border: 1px solid rgba(255,255,255,0.15); cursor: pointer; font-family: var(--font-body); transition: all 0.2s; display: inline-flex; align-items: center; gap: 0.5rem; }
        .ck-btn-hero-ghost:hover { background: rgba(255,255,255,0.15); color: white; }
        .ck-hero-trust { display: flex; gap: 0.75rem; flex-wrap: wrap; }
        .ck-trust-pill { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.75); font-size: 0.78rem; font-weight: 500; padding: 0.35rem 0.85rem; border-radius: var(--r-full); border: 1px solid rgba(255,255,255,0.12); }

        .ck-hero-card-wrap { position: relative; flex: 1 1 320px; max-width: 360px; z-index: 1; }
        .ck-hero-card { background: rgba(255,255,255,0.07); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.12); border-radius: 24px; overflow: hidden; box-shadow: 0 30px 60px rgba(0,0,0,0.4); animation: heroCardFloat 4s ease-in-out infinite; }
        @keyframes heroCardFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        .ck-hero-card-img { height: 180px; width: 100%; overflow: hidden; }
        .ck-hero-card-img img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.4s ease; }
        .ck-hero-card:hover .ck-hero-card-img img { transform: scale(1.05); }
        .ck-hero-card-body { padding: 1.25rem 1.25rem 1rem; }
        .ck-hero-card-tag { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #FF9A8B; margin-bottom: 0.5rem; display: block; }
        .ck-hero-card-name { font-family: var(--font-display); font-size: 1.3rem; color: white; font-weight: 700; }
        .ck-hero-card-desc { font-size: 0.8rem; color: rgba(255,255,255,0.6); margin-top: 0.35rem; line-height: 1.5; }
        .ck-hero-card-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 1.1rem; }
        .ck-hero-card-price { font-size: 1.3rem; font-weight: 800; color: white; }
        .ck-hero-card-btn { background: var(--coral); color: white; text-decoration: none; font-size: 0.8rem; font-weight: 700; padding: 0.5rem 1.1rem; border-radius: var(--r-md); transition: all 0.2s; }
        .ck-hero-card-btn:hover { background: var(--coral-dark); color: white; }
        .ck-hero-live { display: flex; align-items: center; gap: 0.5rem; padding: 0.65rem 1.25rem; background: rgba(22,163,74,0.12); border-top: 1px solid rgba(22,163,74,0.2); font-size: 0.78rem; color: #4ADE80; font-weight: 600; }
        .ck-hero-live-dot { width: 8px; height: 8px; background: #22C55E; border-radius: 50%; animation: livePulse 1.5s infinite; }
        @keyframes livePulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.3)} }
        .ck-hero-badge-float { position: absolute; top: -20px; left: -20px; background: white; border-radius: 16px; padding: 0.75rem 1rem; box-shadow: 0 8px 30px rgba(0,0,0,0.2); display: flex; align-items: center; gap: 0.5rem; animation: badgeFloat 3s ease-in-out infinite; }
        @keyframes badgeFloat { 0%,100%{transform:rotate(-3deg)} 50%{transform:rotate(3deg)} }
        .ck-hero-badge-num { font-size: 1.25rem; font-weight: 800; color: var(--coral); }
        .ck-hero-badge-label { font-size: 0.72rem; font-weight: 600; color: var(--ink-50); line-height: 1.3; }
        .ck-hero-scroll { position: absolute; bottom: 2.5rem; left: 50%; transform: translateX(-50%); cursor: pointer; z-index: 1; }
        .ck-hero-scroll span { display: block; width: 24px; height: 38px; border: 2px solid rgba(255,255,255,0.3); border-radius: 12px; position: relative; }
        .ck-hero-scroll span::after { content: ''; position: absolute; top: 6px; left: 50%; transform: translateX(-50%); width: 4px; height: 8px; background: rgba(255,255,255,0.6); border-radius: 2px; animation: scrollDown 1.5s infinite; }
        @keyframes scrollDown { 0%{opacity:1;transform:translateX(-50%) translateY(0)} 100%{opacity:0;transform:translateX(-50%) translateY(12px)} }

        /* STATS */
        .ck-stats { padding: 3.5rem 0; background: var(--ink); }
        .ck-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; }
        .ck-stat-item { text-align: center; padding: 2rem 1rem; border-right: 1px solid rgba(255,255,255,0.08); }
        .ck-stat-item:last-child { border-right: none; }
        .ck-stat-icon { font-size: 1.75rem; margin-bottom: 0.5rem; display: block; }
        .ck-stat-number { font-family: var(--font-display); font-size: clamp(2rem, 3.5vw, 3rem); font-weight: 700; color: white; line-height: 1; }
        .ck-stat-label { font-size: 0.8rem; color: rgba(255,255,255,0.5); margin-top: 0.35rem; font-weight: 500; }

        /* ABOUT */
        .ck-about { background: var(--cream); }
        .ck-about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5rem; align-items: center; }
        .ck-about-visual { position: relative; }
        .ck-about-main-img { position: relative; border-radius: 24px; height: 420px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.15); }
        .ck-about-main-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .ck-about-img-caption { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(0,0,0,0.75), transparent); padding: 2rem 1.5rem 1.5rem; }
        .ck-about-img-caption strong { display: block; font-size: 1rem; font-weight: 700; color: white; }
        .ck-about-img-caption span { font-size: 0.8rem; color: rgba(255,255,255,0.7); }
        .ck-about-side-card { position: absolute; background: white; border-radius: 14px; padding: 0.85rem 1rem; display: flex; align-items: center; gap: 0.65rem; box-shadow: 0 8px 30px rgba(0,0,0,0.1); font-size: 0.85rem; }
        .ck-about-side-card span:first-child { font-size: 1.5rem; }
        .ck-about-side-card strong { display: block; font-weight: 700; color: var(--ink); font-size: 0.85rem; }
        .ck-about-side-card p { color: var(--ink-50); font-size: 0.75rem; margin: 0; }
        .ck-about-side-top { bottom: -20px; left: -20px; }
        .ck-about-side-bot { top: -20px; right: -20px; }
        .ck-about-lead { font-size: 1.05rem; color: var(--ink-80); line-height: 1.8; margin-bottom: 1rem; }
        .ck-about-body { color: var(--ink-50); line-height: 1.8; margin-bottom: 1.5rem; }
        .ck-about-feats { list-style: none; margin-bottom: 2rem; display: flex; flex-direction: column; gap: 0.65rem; }
        .ck-about-feats li { display: flex; align-items: center; gap: 0.75rem; color: var(--ink-80); font-size: 0.95rem; }
        .ck-feat-check { width: 22px; height: 22px; background: var(--coral-bg); color: var(--coral); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 800; flex-shrink: 0; }
        .ck-about-actions { display: flex; gap: 1rem; flex-wrap: wrap; }

        /* MENU */
        .ck-menu-section { background: white; }
        .ck-dishes-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; }
        .ck-dish-card { background: white; border-radius: 18px; overflow: hidden; border: 1px solid var(--ink-10); transition: transform 0.2s, box-shadow 0.2s; box-shadow: var(--shadow-sm); display: flex; flex-direction: column; }
        .ck-dish-card:hover { transform: translateY(-6px); box-shadow: var(--shadow-xl); }
        .ck-dish-img { height: 160px; width: 100%; position: relative; overflow: hidden; flex-shrink: 0; }
        .ck-dish-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .ck-dish-tag { position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.5); color: white; backdrop-filter: blur(4px); font-size: 0.68rem; font-weight: 700; padding: 0.25rem 0.75rem; border-radius: var(--r-full); }
        .ck-dish-body { padding: 1.1rem; flex: 1; display: flex; flex-direction: column; }
        .ck-dish-name { font-weight: 700; font-size: 1rem; color: var(--ink); margin-bottom: 0.4rem; }
        .ck-dish-desc { font-size: 0.8rem; color: var(--ink-50); line-height: 1.5; margin-bottom: 1rem; flex: 1; }
        .ck-dish-footer { display: flex; align-items: center; justify-content: space-between; }
        .ck-dish-price { font-weight: 800; font-size: 1.1rem; color: var(--ink); }
        .ck-dish-btn { font-size: 0.78rem; font-weight: 700; color: var(--coral); text-decoration: none; background: var(--coral-bg); padding: 0.45rem 0.9rem; border-radius: var(--r-md); transition: all 0.2s; }
        .ck-dish-btn:hover { background: var(--coral); color: white; }
        .ck-menu-cta { text-align: center; margin-top: 3rem; }

        /* HOW */
        .ck-how { background: var(--cream); }
        .ck-how-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; position: relative; }
        .ck-how-card { background: white; border-radius: 18px; padding: 2rem 1.5rem; border: 1px solid var(--ink-10); text-align: center; position: relative; box-shadow: var(--shadow-sm); transition: transform 0.2s, box-shadow 0.2s; }
        .ck-how-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
        .ck-how-step { position: absolute; top: -14px; left: 1.5rem; background: var(--coral); color: white; font-size: 0.68rem; font-weight: 800; padding: 0.2rem 0.65rem; border-radius: var(--r-full); }
        .ck-how-icon { font-size: 2.5rem; margin-bottom: 1rem; display: block; }
        .ck-how-title { font-weight: 700; font-size: 1rem; color: var(--ink); margin-bottom: 0.5rem; }
        .ck-how-desc { font-size: 0.82rem; color: var(--ink-50); line-height: 1.6; }
        .ck-how-arrow { position: absolute; top: 50%; right: -1rem; transform: translateY(-50%); font-size: 1.2rem; color: var(--ink-30); z-index: 1; }
        .ck-how-cta { text-align: center; margin-top: 3rem; }

        /* REVIEWS */
        .ck-reviews { background: white; }
        .ck-reviews-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
        .ck-review-card { background: var(--cream); border-radius: 18px; padding: 2rem; border: 1px solid var(--ink-10); transition: transform 0.2s, box-shadow 0.2s; }
        .ck-review-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
        .ck-review-stars { color: #FBBF24; font-size: 1.1rem; margin-bottom: 1rem; letter-spacing: 2px; }
        .ck-review-text { font-size: 0.92rem; color: var(--ink-80); line-height: 1.75; margin-bottom: 1.5rem; font-style: italic; }
        .ck-review-author { display: flex; align-items: center; gap: 0.75rem; }
        .ck-review-avatar { width: 42px; height: 42px; border-radius: 50%; background: var(--coral); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1rem; flex-shrink: 0; }
        .ck-review-name { font-weight: 700; font-size: 0.9rem; color: var(--ink); }
        .ck-review-role { font-size: 0.78rem; color: var(--ink-50); }

        /* CTA BANNER */
        .ck-cta-banner { background: linear-gradient(135deg, #1C1917 0%, #3D2B1F 100%); padding: 5rem 1.5rem; position: relative; overflow: hidden; }
        .ck-cta-orb-1, .ck-cta-orb-2 { position: absolute; border-radius: 50%; filter: blur(60px); opacity: 0.3; }
        .ck-cta-orb-1 { width: 400px; height: 400px; background: var(--coral); top: -100px; right: -100px; }
        .ck-cta-orb-2 { width: 300px; height: 300px; background: #FF6B35; bottom: -80px; left: -80px; }
        .ck-cta-inner { position: relative; z-index: 1; display: flex; align-items: center; justify-content: space-between; gap: 2rem; flex-wrap: wrap; }
        .ck-cta-title { font-family: var(--font-display); font-size: clamp(1.8rem, 3vw, 2.5rem); color: white; margin-bottom: 0.75rem; }
        .ck-cta-sub { color: rgba(255,255,255,0.6); font-size: 1rem; line-height: 1.7; max-width: 500px; }
        .ck-cta-btns { display: flex; gap: 1rem; flex-wrap: wrap; }
        .ck-btn-cta-primary { background: var(--coral); color: white; font-weight: 700; font-size: 1rem; padding: 0.9rem 2rem; border-radius: var(--r-md); text-decoration: none; transition: all 0.2s; box-shadow: 0 6px 20px rgba(232,65,42,0.4); white-space: nowrap; }
        .ck-btn-cta-primary:hover { background: var(--coral-dark); transform: translateY(-1px); color: white; }
        .ck-btn-cta-ghost { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.85); font-weight: 600; font-size: 1rem; padding: 0.9rem 1.75rem; border-radius: var(--r-md); border: 1px solid rgba(255,255,255,0.2); text-decoration: none; white-space: nowrap; transition: all 0.2s; }
        .ck-btn-cta-ghost:hover { background: rgba(255,255,255,0.18); color: white; }

        /* FOOTER */
        .ck-footer { background: #0F0F0F; padding: 4rem 0 0; color: rgba(255,255,255,0.7); }
        .ck-footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1.5fr; gap: 3rem; padding-bottom: 3rem; border-bottom: 1px solid rgba(255,255,255,0.08); }
        .ck-footer-logo { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 1rem; }
        .ck-footer-tagline { font-size: 0.88rem; line-height: 1.7; color: rgba(255,255,255,0.5); margin-bottom: 1.5rem; }
        .ck-footer-social { display: flex; gap: 0.5rem; }
        .ck-social-btn { width: 36px; height: 36px; border-radius: 8px; background: rgba(255,255,255,0.07); display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.55); font-size: 0.7rem; font-weight: 700; text-decoration: none; transition: all 0.2s; text-transform: uppercase; }
        .ck-social-btn:hover { background: var(--coral); color: white; }
        .ck-footer-col { display: flex; flex-direction: column; gap: 0.6rem; }
        .ck-footer-col-title { color: white; font-weight: 700; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.5rem; }
        .ck-footer-link { color: rgba(255,255,255,0.5); font-size: 0.88rem; text-decoration: none; transition: color 0.2s; background: none; border: none; cursor: pointer; text-align: left; font-family: var(--font-body); padding: 0; }
        .ck-footer-link:hover { color: white; }
        .ck-footer-contact-item { display: flex; gap: 0.65rem; font-size: 0.85rem; align-items: flex-start; color: rgba(255,255,255,0.5); }
        .ck-footer-contact-item span:first-child { flex-shrink: 0; }
        .ck-footer-bottom { padding: 1.5rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; font-size: 0.8rem; color: rgba(255,255,255,0.3); }
        .ck-footer-legal { display: flex; gap: 1.25rem; }
        .ck-footer-legal a { color: rgba(255,255,255,0.3); text-decoration: none; transition: color 0.2s; }
        .ck-footer-legal a:hover { color: rgba(255,255,255,0.7); }

        /* RESPONSIVE */
        @media (max-width: 1024px) {
          .ck-dishes-grid { grid-template-columns: repeat(2, 1fr); }
          .ck-how-grid    { grid-template-columns: repeat(2, 1fr); }
          .ck-how-arrow   { display: none; }
          .ck-about-grid  { grid-template-columns: 1fr; gap: 3rem; }
          .ck-footer-grid { grid-template-columns: 1fr 1fr; }
          .ck-stats-grid  { grid-template-columns: repeat(2, 1fr); }
          .ck-stat-item { border-bottom: 1px solid rgba(255,255,255,0.08); }
        }
        @media (max-width: 768px) {
          .ck-lnav-links, .ck-lnav-cta { display: none; }
          .ck-lnav-hamburger { display: flex; }
          .ck-section { padding: 4rem 0; }
          .ck-hero { padding: 7rem 1.5rem 3rem; justify-content: center; text-align: center; }
          .ck-hero-actions, .ck-hero-trust { justify-content: center; }
          .ck-hero-sub { text-align: center; margin: 0 auto 2rem; }
          .ck-hero-card-wrap { display: none; }
          .ck-dishes-grid { grid-template-columns: 1fr; }
          .ck-how-grid { grid-template-columns: 1fr; }
          .ck-reviews-grid { grid-template-columns: 1fr; }
          .ck-stats-grid { grid-template-columns: repeat(2, 1fr); }
          .ck-footer-grid { grid-template-columns: 1fr; gap: 2rem; }
          .ck-cta-inner { text-align: center; justify-content: center; }
          .ck-cta-btns { justify-content: center; }
          .ck-footer-bottom { flex-direction: column; text-align: center; }
        }
      `}</style>
    </div>
  );
};

export default Landing;