'use client'

import dynamic from "next/dynamic"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useRef } from "react"
import { useGSAP } from "@gsap/react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ScrollToPlugin } from "gsap/ScrollToPlugin"

import { useSession } from "@/hooks/session"
import { authClient } from "@/lib/auth-client"

const NepalHorizonScene = dynamic(() => import("@/components/nepal-horizon-scene"), {
  ssr: false,
  loading: () => <div className="nh-scene-loading" aria-hidden="true" />,
})

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)

const routes = [
  { name: "Manaslu Circuit", place: "Gorkha, Nepal", days: "14 days", season: "Oct–Nov" },
  { name: "Upper Mustang", place: "Lo Manthang, Nepal", days: "11 days", season: "May–Oct" },
  { name: "Gokyo Traverse", place: "Khumbu, Nepal", days: "12 days", season: "Mar–May" },
]

export default function NepalHorizon() {
  const scope = useRef<HTMLElement>(null)
  const router = useRouter()
  const { user, isAdmin } = useSession()

  async function handleSignOut() {
    await authClient.signOut()
    router.refresh()
  }

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

      const root = scope.current
      if (!root) return

      const reveals = gsap.utils.toArray<HTMLElement>(".nh-reveal")
      gsap.set(reveals, { autoAlpha: 0, y: 24 })

      ScrollTrigger.batch(reveals, {
        start: "top 84%",
        onEnter: (items) => gsap.to(items, {
          autoAlpha: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.09,
          overwrite: true,
        }),
        onEnterBack: (items) => gsap.to(items, {
          autoAlpha: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.09,
          overwrite: true,
        }),
        onLeaveBack: (items) => gsap.set(items, { autoAlpha: 0, y: 24, overwrite: true }),
      })

      // Hero parallax — the "routing" feel as you move between sections.
      const hero = root.querySelector(".nh-hero")
      if (hero) {
        const scene = root.querySelector(".nh-scene")
        const veil = root.querySelector(".nh-hero-veil")
        const footer = root.querySelector(".nh-hero-footer")

        const st = { trigger: hero, start: "top top", end: "bottom top", scrub: 0.6 }
        if (scene) gsap.to(scene, { yPercent: 16, scale: 1.08, ease: "none", scrollTrigger: st })
        if (veil) gsap.to(veil, { autoAlpha: 0.35, ease: "none", scrollTrigger: st })
        if (footer) gsap.to(footer, { autoAlpha: 0, y: -24, ease: "none", scrollTrigger: { ...st, end: "55% top" } })
      }

      // Nav routing — tween the scroll instead of the browser's default smooth scroll.
      const nav = root.querySelector(".nh-nav")
      if (nav && !nav.hasAttribute("data-routing")) {
        nav.setAttribute("data-routing", "true")
        nav.addEventListener("click", (event) => {
          const link = (event.target as HTMLElement).closest("a")
          const id = link?.getAttribute("href")
          if (!link || !id?.startsWith("#")) return
          const target = document.querySelector<HTMLElement>(id)
          if (!target) return
          event.preventDefault()

          const doc = document.documentElement
          const prev = doc.style.scrollBehavior
          doc.style.scrollBehavior = "auto"
          gsap.to(window, {
            duration: 1.4,
            ease: "power3.inOut",
            scrollTo: { y: target, offsetY: 0 },
            onComplete: () => { doc.style.scrollBehavior = prev },
          })
        })
      }
    },
    { scope }
  )

  return (
    <main ref={scope} className="nh-route">
      <a className="nh-skip-link" href="#journeys">Skip to journeys</a>

      <section className="nh-hero" id="top" aria-labelledby="nh-title">
        <div className="nh-hero-stage">
          <div className="nh-hero-atmosphere" aria-hidden="true">
            <span className="nh-shape nh-shape--sun" />
            <span className="nh-shape nh-shape--ridge" />
            <span className="nh-shape nh-shape--prayer" />
            <span className="nh-shape nh-shape--stone" />
            <div className="nh-hero-shape-lines">
              <svg viewBox="0 0 1440 900" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 720 C240 640 480 690 720 600 C960 510 1200 560 1440 470" stroke="var(--nh-dawn)" strokeWidth="1" opacity="0.5" />
                <path d="M0 780 C280 700 520 760 760 680 C1000 600 1240 650 1440 570" stroke="var(--nh-ridge)" strokeWidth="1" opacity="0.4" />
                <path d="M0 840 C300 780 560 820 800 760 C1040 700 1280 740 1440 680" stroke="var(--nh-prayer)" strokeWidth="1" opacity="0.3" />
              </svg>
            </div>
          </div>
          <NepalHorizonScene />
          <div className="nh-hero-veil" aria-hidden="true" />

          <header className="nh-header">
            <Link className="nh-mark" href="/" aria-label="Nepal Horizon home">
              <span aria-hidden="true">NH</span>
              <span>NEPAL HORIZON</span>
            </Link>
            <nav className="nh-nav" aria-label="Primary navigation">
              {/* The real journeys ledger, not the sample cards further down the
                  page — this is the link visitors were missing. */}
              <Link className="nh-nav-ledger" href="/packages">Journeys</Link>
              <a className="nh-nav-section" href="#process">How We Work</a>
              <a className="nh-nav-section" href="#approach">Approach</a>
              <a className="nh-nav-section" href="#inquire">Inquire</a>

              {/* No "pending" gap: the sign-in route is always rendered so a
                  first-time visitor can never land on a nav with no account
                  option. It swaps to the account controls once the session
                  resolves. */}
              {user ? (
                <>
                  <Link className="nh-nav-account" href="/bookings">My Bookings</Link>
                  {isAdmin ? (
                    <Link className="nh-nav-account nh-nav-narrow" href="/admin">Console</Link>
                  ) : null}
                  <button className="nh-nav-auth" type="button" onClick={handleSignOut}>
                    Sign Out
                  </button>
                </>
              ) : (
                <Link className="nh-nav-auth" href="/login">
                  Sign In <span aria-hidden="true">↗</span>
                </Link>
              )}
            </nav>
          </header>

          <div className="nh-hero-copy">
            <p className="nh-kicker"><span aria-hidden="true">✦</span> Himalayan Field Office</p>
            <h1 id="nh-title">Take The<br /><em>Long</em> Way</h1>
            <p className="nh-intro">Small group journeys through Nepal’s quietest high places. Built around weather, local knowledge &amp; time to look up.</p>
            <div className="nh-actions">
              <a className="nh-button nh-button-primary" href="#journeys">Find a Journey <span aria-hidden="true">↘</span></a>
              <a className="nh-text-link" href="#approach">How We Travel <span aria-hidden="true">↗</span></a>
            </div>
          </div>

          <div className="nh-hero-footer">
            <p><span>Elevation</span> 4,700 m</p>
            <p><span>Coordinates</span> 28.5983° N, 83.9311° E</p>
            <a className="nh-scroll-cue" href="#journeys">Scroll to enter <span aria-hidden="true">↓</span></a>
          </div>
        </div>
      </section>

      <section className="nh-manifesto" id="approach" aria-labelledby="approach-title">
        <div className="nh-decor nh-decor--manifesto" aria-hidden="true">
          <svg className="nh-decor-sun" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="46" fill="var(--nh-dawn)" opacity="0.55" />
            <circle cx="100" cy="100" r="70" stroke="var(--nh-dawn)" strokeWidth="1" opacity="0.35" />
            <circle cx="100" cy="100" r="92" stroke="var(--nh-dawn)" strokeWidth="0.6" opacity="0.2" />
          </svg>
          <svg className="nh-decor-mountain" viewBox="0 0 1440 260" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 260 C 90 210, 170 175, 260 190 C 360 205, 420 135, 560 150 C 700 165, 760 95, 900 110 C 1040 125, 1100 70, 1240 95 C 1340 115, 1390 150, 1440 135 L1440 260 Z" fill="var(--nh-ridge)" opacity="0.18" />
            <path d="M0 260 C 120 225, 220 200, 340 210 C 460 220, 520 160, 660 175 C 800 190, 860 120, 1000 135 C 1140 150, 1200 105, 1320 125 C 1390 138, 1420 160, 1440 150 L1440 260 Z" fill="var(--nh-dawn)" opacity="0.12" />
          </svg>
        </div>
        <p className="nh-section-index nh-reveal">Our Approach <span>01</span></p>
        <div className="nh-manifesto-grid">
          <h2 className="nh-reveal" id="approach-title">Travel Is More<br />Interesting When<br /><em>Nothing Rushes.</em></h2>
          <div className="nh-manifesto-copy nh-reveal">
            <p>Nepal Horizon makes few departures, follows local rhythms &amp; leaves room for a route to change. The mountains decide the pace. That is the point.</p>
            <a className="nh-text-link" href="#inquire">Meet Your Route-Maker <span aria-hidden="true">↗</span></a>
          </div>
        </div>
      </section>

      <section className="nh-process" id="process" aria-labelledby="process-title">
        <p className="nh-section-index nh-reveal">How We Work <span>02</span></p>
        <div className="nh-process-grid">
          <div className="nh-process-left">
            <h2 className="nh-reveal" id="process-title">From Booking<br />To <em>The Trail.</em></h2>
            <div className="nh-process-illustration nh-reveal" aria-hidden="true">
              <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 260 C80 240 120 200 160 180 C200 160 240 100 280 80 C310 65 340 40 380 30" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 6" opacity="0.4" />
                <path d="M20 260 L60 220 L100 235 L140 190 L180 200 L220 150 L260 160 L300 110 L340 100 L380 30" stroke="currentColor" strokeWidth="1" opacity="0.25" fill="none" />
                <path d="M20 260 C60 250 100 230 140 210 C180 190 200 140 240 120 C280 100 320 60 380 30 L380 260 Z" fill="currentColor" opacity="0.04" />
                <circle cx="20" cy="260" r="5" fill="currentColor" opacity="0.6" />
                <circle cx="160" cy="180" r="4" fill="currentColor" opacity="0.45" />
                <circle cx="280" cy="80" r="4" fill="currentColor" opacity="0.45" />
                <circle cx="380" cy="30" r="6" fill="currentColor" opacity="0.8" />
                <path d="M375 25 L380 18 L385 25" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.8" />
                <circle cx="20" cy="260" r="12" stroke="currentColor" strokeWidth="1" opacity="0.2" />
                <circle cx="380" cy="30" r="14" stroke="currentColor" strokeWidth="1" opacity="0.2" />
              </svg>
            </div>
          </div>
          <div className="nh-process-steps">
            {[
              { num: "01", title: "You Book The Package", desc: "Browse our journeys and reserve your spot online." },
              { num: "02", title: "We Process You", desc: "We review your booking and prepare the groundwork." },
              { num: "03", title: "Book A Call For You", desc: "We reach out to schedule a one-on-one conversation." },
              { num: "04", title: "Understand Your Requirements", desc: "We listen your pace, your goals, your must-sees." },
              { num: "05", title: "Confirm The Booking", desc: "Lock in your dates, permits, and full itinerary." },
              { num: "06", title: "Pick You Up", desc: "We collect you on day one and handle everything after." },
            ].map((step) => (
              <div className="nh-process-step nh-reveal" key={step.num}>
                <span className="nh-process-num">{step.num}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="nh-journeys" id="journeys" aria-labelledby="journeys-title">
        <div className="nh-journeys-heading nh-reveal">
          <p className="nh-section-index">Next Departures <span>03</span></p>
          <h2 id="journeys-title">Three Ways<br />To Get Lost.</h2>
          <p>One route each month. Eight guests max.<br /><Link className="nh-text-link" href="/packages">Every Open Departure <span aria-hidden="true">↗</span></Link></p>
        </div>
        <div className="nh-route-list">
          {routes.map((route, index) => (
            <a className="nh-route-card nh-reveal" href="#inquire" key={route.name}>
              <span className="nh-route-number">0{index + 1}</span>
              <span className="nh-route-name">{route.name}</span>
              <span className="nh-route-place">{route.place}</span>
              <span className="nh-route-meta">{route.days}<br />{route.season}</span>
              <span className="nh-route-arrow" aria-hidden="true">↗</span>
            </a>
          ))}
        </div>
      </section>

      <section className="nh-details" aria-label="What is included">
        <div className="nh-detail-card nh-reveal">
          <span>01</span>
          <h3>Guides Who<br />Know When To<br /><em>Wait.</em></h3>
          <p>Local leaders with mountain instincts, not just a timetable.</p>
        </div>
        <div className="nh-detail-card nh-reveal">
          <span>02</span>
          <h3>Room For The<br /><em>Unexpected.</em></h3>
          <p>Rest days and open plans for weather, conversations &amp; side paths.</p>
        </div>
        <div className="nh-detail-card nh-reveal">
          <span>03</span>
          <h3>Small Groups.<br />Wide <em>Horizons.</em></h3>
          <p>Eight people at most. Enough company, never a crowd.</p>
        </div>
      </section>

      <section className="nh-inquire" id="inquire" aria-labelledby="inquire-title">
        <div className="nh-decor nh-decor--inquire" aria-hidden="true">
          <svg className="nh-decor-bloom" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="120" cy="120" r="30" fill="var(--nh-dawn)" opacity="0.45" />
            <circle cx="120" cy="120" r="60" stroke="var(--nh-dawn)" strokeWidth="1" opacity="0.3" />
            <circle cx="120" cy="120" r="90" stroke="var(--nh-prayer)" strokeWidth="0.8" opacity="0.22" />
            <circle cx="120" cy="120" r="118" stroke="var(--nh-ridge)" strokeWidth="0.6" opacity="0.18" />
          </svg>
        </div>
        <p className="nh-section-index nh-reveal">Start Here <span>04</span></p>
        <div className="nh-inquire-content nh-reveal">
          <h2 id="inquire-title">The Route Begins<br />With A <em>Question.</em></h2>
          <a className="nh-button nh-button-light" href="mailto:hello@nepalhorizon.travel?subject=Plan%20a%20journey">Tell Us Where You’re Drawn <span aria-hidden="true">↗</span></a>
        </div>
      </section>

      <footer className="nh-footer">
        <a className="nh-mark" href="#top" aria-label="Back to top"><span aria-hidden="true">NH</span><span>NEPAL HORIZON</span></a>
        <p>Mountain journeys, Nepal</p>
        <a href="mailto:hello@nepalhorizon.travel">hello@nepalhorizon.travel</a>
      </footer>
    </main>
  )
}
