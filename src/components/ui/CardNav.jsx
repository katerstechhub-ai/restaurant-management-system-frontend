import { useLayoutEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { GoArrowUpRight } from 'react-icons/go'
import './CardNav.css'

export default function CardNav({ logo, logoAlt = 'Logo', items = [], className = '', ease = 'power3.out', baseColor = '#fff', menuColor = '#000', buttonBgColor = '#111', buttonTextColor = '#fff' }) {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const navRef = useRef(null)
  const cardsRef = useRef([])
  const timelineRef = useRef(null)

  const calculateHeight = () => {
    const nav = navRef.current
    if (!nav) return 260
    const mobile = window.matchMedia('(max-width: 768px)').matches
    const content = nav.querySelector('.card-nav-content')
    if (mobile && content) {
      const previous = { visibility: content.style.visibility, pointerEvents: content.style.pointerEvents, position: content.style.position, height: content.style.height }
      content.style.visibility = 'visible'
      content.style.pointerEvents = 'auto'
      content.style.position = 'static'
      content.style.height = 'auto'
      const height = 60 + content.scrollHeight + 16
      Object.assign(content.style, previous)
      return Math.min(height, window.innerHeight - 32)
    }
    return 260
  }

  const createTimeline = () => {
    if (!navRef.current) return null
    gsap.set(navRef.current, { height: 60, overflow: 'hidden' })
    gsap.set(cardsRef.current, { y: 30, opacity: 0 })
    const timeline = gsap.timeline({ paused: true })
    timeline.to(navRef.current, { height: calculateHeight, duration: 0.38, ease })
    timeline.to(cardsRef.current, { y: 0, opacity: 1, duration: 0.3, ease, stagger: 0.06 }, '-=0.12')
    return timeline
  }

  useLayoutEffect(() => {
    const timeline = createTimeline()
    timelineRef.current = timeline
    return () => { timeline?.kill(); timelineRef.current = null }
  }, [ease, items])

  useLayoutEffect(() => {
    const onResize = () => {
      if (!timelineRef.current) return
      timelineRef.current.kill()
      const next = createTimeline()
      if (isExpanded) next?.progress(1)
      timelineRef.current = next
    }
    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
    }
  }, [isExpanded])

  const toggleMenu = () => {
    const timeline = timelineRef.current
    if (!timeline) return
    if (!isExpanded) {
      setIsOpen(true)
      setIsExpanded(true)
      timeline.play(0)
    } else {
      setIsOpen(false)
      timeline.eventCallback('onReverseComplete', () => setIsExpanded(false))
      timeline.reverse()
    }
  }

  const go = (href) => {
    if (!href) return
    if (href.startsWith('#')) {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setIsOpen(false)
      setIsExpanded(false)
      timelineRef.current?.reverse()
      return
    }
    navigate(href)
    setIsOpen(false)
    setIsExpanded(false)
    timelineRef.current?.reverse()
  }

  return (
    <div className={`card-nav-container ${className}`}>
      <nav ref={navRef} className={`card-nav ${isExpanded ? 'open' : ''}`} style={{ backgroundColor: baseColor }}>
        <div className="card-nav-top">
          <button type="button" className={`hamburger-menu ${isOpen ? 'open' : ''}`} onClick={toggleMenu} aria-label={isExpanded ? 'Close menu' : 'Open menu'} aria-expanded={isExpanded} style={{ color: menuColor }}>
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </button>
          <div className="logo-container">{logo ? <img src={logo} alt={logoAlt} className="logo" /> : <span className="card-nav-wordmark">Foodie</span>}</div>
          <button type="button" className="card-nav-cta-button" style={{ backgroundColor: buttonBgColor, color: buttonTextColor }} onClick={() => go('/menu')}>Order now</button>
        </div>
        <div className="card-nav-content" aria-hidden={!isExpanded}>
          {items.slice(0, 3).map((item, index) => (
            <div key={`${item.label}-${index}`} className="nav-card" ref={(element) => { if (element) cardsRef.current[index] = element }} style={{ backgroundColor: item.bgColor, color: item.textColor }}>
              <div className="nav-card-label">{item.label}</div>
              <div className="nav-card-links">
                {item.links?.map((link, linkIndex) => (
                  <button type="button" key={`${link.label}-${linkIndex}`} className="nav-card-link" onClick={() => go(link.href)} aria-label={link.ariaLabel || link.label}><GoArrowUpRight aria-hidden="true" />{link.label}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>
    </div>
  )
}
