import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHamburger, FaRocket, FaMapMarkerAlt, FaUtensils, FaShippingFast, FaLeaf, FaMobileAlt, FaTruck, FaClipboardList } from 'react-icons/fa';
import { getMenuItems } from '../api/menu';
import { optimizedImage } from '../utils/cloudinary';
import { useCart } from '../context/CartContext';
import './Landing.css';

export default function Landing() {
  const navigate = useNavigate();
  const cartCtx = useCart();
  const [dishes, setDishes] = useState([]);

  useEffect(() => {
    getMenuItems()
      .then((data) => {
        const arr = Array.isArray(data) ? data : (Array.isArray(data?.items) ? data.items : []);
        // Best Sellers is a marketing spot, not the full catalog — show a
        // handful of available real dishes rather than everything on the menu.
        setDishes(arr.filter((d) => d.available !== false).slice(0, 6));
      })
      .catch(() => setDishes([]));
  }, []);

  const handleBuyNow = (dish) => {
    cartCtx.addItem(dish);
    navigate('/order');
  };
  return (
    <div className="landing-page">
      <div className="landing-container">
        {/* Navbar */}
        <nav className="landing-nav">
          <div className="landing-logo">
            <span className="icon"><FaHamburger /></span> foodie
          </div>
          <div className="landing-nav-links">
            <Link to="/" className="active">Home</Link>
            <Link to="/menu">Our Menu</Link>
            <a href="#pages">Pages</a>
            <a href="#about">About us</a>
            <a href="#contact">Contact us</a>
          </div>
          <Link to="/login" className="btn-login">Login</Link>
        </nav>

        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">
              Desire <span className="hero-highlight">Food</span> <br />
              for Your Taste
            </h1>
            <p className="hero-subtitle">
              Food is what we eat to stay alive and healthy. It comes in many different forms and flavors, from fruits and vegetables to meats and grains.
            </p>
            <button className="btn-primary" onClick={() => navigate('/menu')}>Order Now</button>
          </div>
          <div className="hero-image-wrapper">
            <div className="hero-blob"></div>
            <img src="/images/landing/hero_image_black_1787180952673.jpg" alt="Woman enjoying pizza" className="hero-image-main" />
            
            <div className="floating-card top-left">
              <div className="floating-icon red"><FaRocket /></div>
              <div>
                <div style={{fontWeight: 700}}>Delivery</div>
                <div style={{color: '#777', fontSize: 12}}>in 30 mins</div>
              </div>
            </div>

            <div className="floating-card bottom-left" style={{padding: '8px 16px', gap: '8px'}}>
              <img src="/images/landing/nigerian_food_1_1787181844089.jpg" alt="User" className="floating-card-img" />
              <div>
                <div style={{fontWeight: 700, fontSize: 13}}>Ali Ahmad</div>
                <div style={{color: '#FFA800', fontSize: 11}}>⭐ 4.8 <span style={{color: '#777'}}>❤️ 34 Likes</span></div>
              </div>
            </div>

            <div className="floating-card bottom-right">
              <div className="floating-icon orange"><FaMapMarkerAlt /></div>
              <div>
                <div style={{fontWeight: 700}}>Location</div>
                <div style={{color: '#777', fontSize: 12}}>on exact address</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <div className="feature-card">
            <div className="feature-icon"><FaUtensils /></div>
            <h3 className="feature-title">Quality Food</h3>
            <p className="feature-desc">We serve only the freshest, locally sourced ingredients prepared by expert chefs.</p>
            <a href="#learn" className="feature-link">Learn More</a>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><FaShippingFast /></div>
            <h3 className="feature-title">Fast Delivery</h3>
            <p className="feature-desc">Get your hot meals delivered straight to your door in under 30 minutes.</p>
            <a href="#learn" className="feature-link">Learn More</a>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><FaLeaf /></div>
            <h3 className="feature-title">Healthy Food</h3>
            <p className="feature-desc">Nutritious and balanced meal options that don't compromise on delicious taste.</p>
            <a href="#learn" className="feature-link">Learn More</a>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><FaMobileAlt /></div>
            <h3 className="feature-title">Easy Order</h3>
            <p className="feature-desc">Browse our menu and place your order in just a few clicks with our seamless app.</p>
            <a href="#learn" className="feature-link">Learn More</a>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="why-section" id="about">
          <div className="why-image-wrapper">
            <img src="/images/landing/nigerian_food_1_1787181844089.jpg" alt="Delicious Jollof Rice" className="why-image" />
          </div>
          <div className="why-content">
            <h2 className="section-title">Why People Choose us?</h2>
            
            <div className="why-list">
              <div className="why-item">
                <div className="why-item-icon"><FaTruck /></div>
                <div>
                  <h4 className="why-item-title">Convenient and Reliable</h4>
                  <p className="why-item-desc">Whether you dine in, take out, or order delivery, our service is convenient, fast, and reliable, making mealtime hassle-free.</p>
                </div>
              </div>
              <div className="why-item">
                <div className="why-item-icon"><FaClipboardList /></div>
                <div>
                  <h4 className="why-item-title">Variety of Options</h4>
                  <p className="why-item-desc">From hearty meals to light snacks, we offer a wide range of options to suit every taste and craving.</p>
                </div>
              </div>
              <div className="why-item">
                <div className="why-item-icon"><FaHamburger /></div>
                <div>
                  <h4 className="why-item-title">Eat Burger</h4>
                  <p className="why-item-desc">Our burgers are grilled to perfection, with juicy patties and flavorsome toppings that make every bite a delicious experience.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Best Sellers Section */}
        <section className="best-sellers-section" id="menu">
          <h2 className="section-title">Our Best Seller Dishes</h2>
          <p className="section-subtitle">
            Experience the rich and vibrant flavors of our most popular authentic Nigerian meals. From smoky Jollof Rice to hearty Egusi Soup, every dish is prepared with fresh local ingredients and traditional recipes.
          </p>
          
          {dishes.length === 0 ? (
            <p className="section-subtitle" style={{ textAlign: 'center' }}>
              Our menu is being freshly plated — check back shortly, or{' '}
              <Link to="/menu" style={{ color: '#E84A3B', fontWeight: 700 }}>browse the full menu</Link>.
            </p>
          ) : (
            <div className="dishes-grid">
              {dishes.map((dish) => (
                <div className="dish-card" key={dish._id}>
                  {dish.image ? (
                    <img
                      src={optimizedImage(dish.image, { width: 480 })}
                      alt={dish.name}
                      className="dish-image"
                      loading="lazy"
                    />
                  ) : (
                    <div
                      className="dish-image"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f1ee', color: '#c9c2b8' }}
                    >
                      <FaUtensils size={32} />
                    </div>
                  )}
                  <div className="dish-info">
                    <div>
                      <h4 className="dish-title">{dish.name}</h4>
                      <div className="dish-rating">★★★★★</div>
                    </div>
                    <div className="dish-price-action">
                      <span className="dish-price">₦{Number(dish.price).toLocaleString()}</span>
                      <button className="btn-buy" onClick={() => handleBuyNow(dish)}>Buy Now</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Feedback Section */}
        <section className="feedback-section" id="pages">
          <div className="feedback-content">
            <h2 className="section-title">Customer <span style={{color: '#E84A3B'}}>Feedback</span></h2>
            <p className="feedback-text">
              "I recently dined at your restaurant and wanted to share my experience. The food was absolutely delicious, and I was impressed by the freshness of the ingredients. Each dish was bursting with flavor, and the portion sizes were perfect. The service was quick and efficient, and the staff was incredibly friendly and welcoming."
            </p>
            <div className="feedback-author">
              <img src="/images/landing/hero_image_black_1787180952673.jpg" alt="Salma Umar" />
              <div>
                <div className="author-name">Salma Umar</div>
                <div className="author-role">Food Vlogger</div>
              </div>
            </div>
          </div>
          <div className="feedback-image-wrapper">
            <div className="feedback-blob"></div>
            <img src="/images/landing/chef_image_black_1787180960361.jpg" alt="Chef OK" className="feedback-image" />
          </div>
        </section>

        {/* Footer Section */}
        <footer className="landing-footer">
          <div className="footer-top">
            <div className="landing-logo">
              <span className="icon"><FaHamburger /></span> foodie
            </div>
            <div className="footer-newsletter">
              <input type="email" placeholder="Enter your email address" />
              <button>Subscribe</button>
            </div>
          </div>
          
          <div className="footer-grid">
            <div className="footer-col">
              <h4>Contact Us</h4>
              <ul>
                <li><a href="#email">info@foodie.com</a></li>
                <li><a href="#phone">+123 456 7890</a></li>
                <li><a href="#address">Wuse 2, Abuja</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Useful Links</h4>
              <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About us</a></li>
                <li><a href="#menu">Our Menu</a></li>
                <li><a href="#contact">Contact us</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Services</h4>
              <ul>
                <li><a href="#delivery">Food Delivery</a></li>
                <li><a href="#catering">Catering</a></li>
                <li><a href="#reservation">Table Reservation</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Legal</h4>
              <ul>
                <li><a href="#terms">Terms & Conditions</a></li>
                <li><a href="#privacy">Privacy Policy</a></li>
                <li><a href="#cookies">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="footer-bottom">
            © 2026 Foodie Restaurant. All Rights Reserved.
          </div>
        </footer>
      </div>
    </div>
  );
}