"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PricingContactModal } from "@/components/home/PricingContactModal";
import type { PricingPlanType } from "@/services/pricingContact";

export default function HomeLandingPage() {
  const [contactOpen, setContactOpen] = useState(false);
  const [contactPlan, setContactPlan] = useState<PricingPlanType>("standard");

  useEffect(() => {
    const revealEls = document.querySelectorAll(".hl-reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach((el) => io.observe(el));

    const nav = document.querySelector(".hl-nav");
    const onScroll = () => {
      if (nav && window.scrollY > 50) {
        (nav as HTMLElement).style.background = "rgba(10,10,15,0.92)";
      } else if (nav) {
        (nav as HTMLElement).style.background = "rgba(10,10,15,0.7)";
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="home-landing">
      {/* Nav */}
      <nav className="hl-nav">
        <Link href="/home" className="hl-nav-logo">
          <Image
            src="/assets/images/logo.png"
            alt="Averox"
            width={38}
            height={38}
            className="hl-logo-img"
          />
          {/* <div className="hl-logo-text">
            <span className="hl-logo-top">Averox</span>
            <span className="hl-logo-sub">Time Track</span>
          </div> */}
        </Link>
        <ul className="hl-nav-links">
          <li>
            <a href="#features">Features</a>
          </li>
          <li>
            <a href="#how-it-works">How it Works</a>
          </li>
          <li>
            <a href="#pricing">Pricing</a>
          </li>
          <li>
            <a href="#testimonials">Customers</a>
          </li>
        </ul>
        <div className="hl-nav-actions">
          <Link href="/auth/login" className="hl-btn-ghost">
            Sign In
          </Link>
          <Link href="/auth/register-tenant" className="hl-btn-primary">
            Register your organization
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="hl-hero">
        <div className="hl-hero-bg" />
        <div className="hl-hero-grid" />
        <div className="hl-orb hl-orb-1" />
        <div className="hl-orb hl-orb-2" />
        <div className="hl-orb hl-orb-3" />

        <div className="hl-hero-content">
          <div className="hl-hero-badge">
            <span className="hl-badge-dot" />
            Productivity tracking for modern teams
          </div>

          <h1>
            Know <span className="hl-highlight">exactly</span> where
            <br />
            each minute goes
          </h1>

          <p className="hl-hero-desc">
            Averox Time Track gives your organization automatic activity tracking, real-time productivity analytics, and actionable reports — so you can lead with clarity, not guesswork.
          </p>

          <div className="hl-hero-actions">
            <Link href="/auth/register-tenant" className="hl-btn-hero">
              Register your organization
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Link>
            <a href="#how-it-works" className="hl-btn-outline-hero">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" />
              </svg>
              See how it works
            </a>
          </div>

          <div className="hl-hero-social-proof">
            <div className="hl-sp-item">
              <div className="hl-stars">
                <span className="hl-star">★</span>
                <span className="hl-star">★</span>
                <span className="hl-star">★</span>
                <span className="hl-star">★</span>
                <span className="hl-star">★</span>
              </div>
              <span>Built for teams</span>
            </div>
            <div className="hl-sp-divider" />
            <div className="hl-sp-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span>Teams &amp; users</span>
            </div>
            <div className="hl-sp-divider" />
            <div className="hl-sp-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>No credit card to register</span>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard preview */}
      <div className="hl-dashboard-preview">
        <div className="hl-dash-frame">
          <div className="hl-dash-topbar">
            <div className="hl-dot-row">
              <div className="hl-dot hl-dot-r" />
              <div className="hl-dot hl-dot-y" />
              <div className="hl-dot hl-dot-g" />
            </div>
            <div className="hl-dash-url">Averox Time Track · Dashboard</div>
          </div>
          <div className="hl-dash-body">
            <div className="hl-dash-sidebar">
              <div className="hl-dash-logo-area">
                <div className="hl-dash-logo-badge">
                  <div className="hl-dlb-icon">AT</div>
                  <div className="hl-dlb-name">Averox</div>
                </div>
              </div>
              <div className="hl-dash-nav-item active">
                <span className="ni-dot" /> Overview
              </div>
              <div className="hl-dash-nav-item">
                <span className="ni-dot" /> Teams
              </div>
              <div className="hl-dash-nav-item">
                <span className="ni-dot" /> Users
              </div>
              <div className="hl-dash-nav-item">
                <span className="ni-dot" /> Productivity rules
              </div>
              <div className="hl-dash-nav-item">
                <span className="ni-dot" /> Reports
              </div>
            </div>
            <div className="hl-dash-main">
              <div className="hl-dash-header-row">
                <div className="hl-dash-title">Team overview</div>
                <div className="hl-dash-date-badge">Today</div>
              </div>

              <div className="hl-stat-cards">
                <div className="hl-stat-card c1">
                  <div className="hl-stat-label">Avg productivity</div>
                  <div className="hl-stat-value">84%</div>
                  <div className="hl-stat-change up">↑ vs last week</div>
                </div>
                <div className="hl-stat-card c2">
                  <div className="hl-stat-label">Hours tracked</div>
                  <div className="hl-stat-value">312h</div>
                  <div className="hl-stat-change up">↑ team total</div>
                </div>
                <div className="hl-stat-card c3">
                  <div className="hl-stat-label">Active now</div>
                  <div className="hl-stat-value">24</div>
                  <div className="hl-stat-change up">↑ users</div>
                </div>
                <div className="hl-stat-card c4">
                  <div className="hl-stat-label">Top app today</div>
                  <div className="hl-stat-value" style={{ fontSize: 15, paddingTop: 4 }}>
                    VS Code
                  </div>
                  <div className="hl-stat-change" style={{ color: "var(--hl-text-dim)" }}>
                    Productive
                  </div>
                </div>
              </div>

              <div className="hl-activity-row">
                <div className="hl-chart-box">
                  <div className="hl-chart-label">Activity this week</div>
                  <div className="hl-bar-chart">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                      <div key={i} className="hl-bar" />
                    ))}
                  </div>
                </div>
                <div className="hl-chart-box">
                  <div className="hl-chart-label">Top performers today</div>
                  <div className="hl-user-list">
                    {[
                      { name: "Sara A.", hrs: "7.4h", pct: 92, bg: "linear-gradient(135deg,#ef4581,#8b5cf6)" },
                      { name: "Mike K.", hrs: "6.2h", pct: 78, bg: "linear-gradient(135deg,#14b8a6,#10b981)" },
                      { name: "Zara N.", hrs: "5.1h", pct: 65, bg: "linear-gradient(135deg,#f59e0b,#f43f5e)" },
                      { name: "Ali R.", hrs: "4.4h", pct: 55, bg: "linear-gradient(135deg,#8b5cf6,#ef4581)" },
                    ].map((u) => (
                      <div key={u.name} className="hl-user-row">
                        <div className="hl-user-av" style={{ background: u.bg }}>
                          {u.name.slice(0, 2).replace(" ", "")}
                        </div>
                        <div className="hl-user-name">{u.name}</div>
                        <div className="hl-user-bar-wrap">
                          <div
                            className="hl-user-bar-fill"
                            style={{
                              width: `${u.pct}%`,
                              background: "linear-gradient(90deg,var(--hl-primary),var(--hl-violet))",
                            }}
                          />
                        </div>
                        <div className="hl-user-hrs">{u.hrs}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logos strip */}
      <div className="hl-logos-strip">
        <div className="hl-logos-label">Trusted by teams worldwide</div>
      </div>

      {/* Features */}
      <section className="hl-section" id="features">
        <div className="hl-reveal">
          <span className="hl-section-badge">Everything you need</span>
          <h2 className="hl-section-title">
            Built for teams that value
            <br />
            deep work &amp; accountability
          </h2>
          <p className="hl-section-desc">
            From small teams to growing organizations — Averox adapts to how you work. Create teams, add users, and define productivity rules that match your workflow.
          </p>
        </div>

        <div className="hl-features-grid">
          <div className="hl-feature-card featured">
            <div className="hl-feature-icon">⏱️</div>
            <div className="hl-feature-title">Automatic time tracking</div>
            <div className="hl-feature-desc">
              A lightweight desktop agent runs in the background and tracks active applications, websites, and idle time — so you get accurate data without timers or manual logging.
            </div>
            <div className="hl-feature-tags">
              <span className="hl-ftag">Auto-detect</span>
              <span className="hl-ftag">Idle detection</span>
              <span className="hl-ftag">Mac &amp; Windows</span>
            </div>
          </div>

          <div className="hl-feature-card">
            <div className="hl-feature-icon hl-fi-violet">📊</div>
            <div className="hl-feature-title">Productivity dashboard</div>
            <div className="hl-feature-desc">
              See individual and team productivity scores, desk time, and effectiveness at a glance. Filter by user or team and export reports.
            </div>
          </div>

          <div className="hl-feature-card">
            <div className="hl-feature-icon">👥</div>
            <div className="hl-feature-title">Teams &amp; users</div>
            <div className="hl-feature-desc">
              Organize your organization into teams, invite or create users, and assign them to teams. One tenant admin per organization; full control from the dashboard.
            </div>
          </div>

          <div className="hl-feature-card">
            <div className="hl-feature-icon hl-fi-teal">🌐</div>
            <div className="hl-feature-title">App &amp; URL rules</div>
            <div className="hl-feature-desc">
              Create rule collections that classify apps and websites as productive, unproductive, or neutral. Assign collections to teams so productivity scores reflect your definitions.
            </div>
          </div>

          {/* <div className="hl-feature-card">
            <div className="hl-feature-icon hl-fi-violet">📁</div>
            <div className="hl-feature-title">Rule collections</div>
            <div className="hl-feature-desc">
              Define sets of rules per team (e.g. “Engineering” vs “Marketing”). Unclassified apps can be reviewed and added to collections from a single place.
            </div>
          </div> */}

          <div className="hl-feature-card">
            <div className="hl-feature-icon hl-fi-amber">⚡</div>
            <div className="hl-feature-title">Agent download</div>
            <div className="hl-feature-desc">
              Users install the desktop agent to start tracking. Once connected, activity flows to your organization dashboard in real time.
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <div className="hl-prod-section" id="how-it-works">
        <div className="hl-prod-inner">
          <div className="hl-prod-visual">
            <div className="hl-floating-badge hl-fb-top">
              <div className="hl-fb-icon">🔥</div>
              <div className="hl-fb-text">
                <div className="hl-fb-val">Clear view</div>
                <div className="hl-fb-sub">Productivity by app</div>
              </div>
            </div>

            <div className="hl-timeline-card">
              <div className="hl-tc-header">
                <div className="hl-tc-title">Daily application breakdown</div>
                <div className="hl-tc-date">Sample day</div>
              </div>
              <div className="hl-timeline-items">
                {[
                  { time: "09:00 – 11:30", app: "VS Code", cls: "hl-app-vs" },
                  { time: "11:30 – 12:00", app: "Zoom", cls: "hl-app-zoom" },
                  { time: "13:00 – 14:15", app: "Notion", cls: "hl-app-notion" },
                  { time: "14:15 – 15:30", app: "Chrome", cls: "hl-app-chrome" },
                  { time: "15:30 – 15:45", app: "Slack", cls: "hl-app-slack" },
                  { time: "15:45 – 18:00", app: "Figma", cls: "hl-app-figma" },
                ].map((row) => (
                  <div key={row.time} className="hl-tl-item">
                    <div className="hl-tl-time">{row.time}</div>
                    <div className="hl-tl-bar-wrap">
                      <div className={`hl-tl-bar ${row.cls}`}>{row.app}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* <div className="hl-floating-badge hl-fb-bot">
              <div className="hl-fb-icon">✅</div>
              <div className="hl-fb-text">
                <div className="hl-fb-val">7.2h</div>
                <div className="hl-fb-sub">Tracked</div>
              </div>
            </div> */}
          </div>

          <div className="hl-prod-text hl-reveal">
            <span className="hl-section-badge pink">See everything</span>
            <h2 className="hl-section-title">A full picture of your team&apos;s workday</h2>
            <p className="hl-section-desc">
              Averox Time Track doesn&apos;t just log hours — it maps where time goes by app and URL, so you can see what&apos;s productive and what&apos;s not, per team and per user.
            </p>
            <div style={{ marginTop: 24 }}>
              {[
                { n: 1, title: "Register your organization", desc: "Sign up as the tenant admin. After approval, set your password and log in.", color: "rgba(239,69,129,0.1)", border: "rgba(239,69,129,0.2)" },
                { n: 2, title: "Create teams and add users", desc: "Create teams, invite or add users, and assign them to teams. Share the agent download link so they can start tracking.", color: "rgba(139,92,246,0.1)", border: "rgba(139,92,246,0.2)" },
                { n: 3, title: "Define productivity rules", desc: "Create rule collections (e.g. productive / unproductive / neutral) and assign them to teams. Your dashboard reflects these rules.", color: "rgba(20,184,166,0.1)", border: "rgba(20,184,166,0.2)" },
              ].map((step) => (
                <div key={step.n} className="hl-prod-step">
                  <div className="hl-prod-step-num" style={{ background: step.color, border: `1px solid ${step.border}` }}>
                    {step.n}
                  </div>
                  <div>
                    <div className="hl-prod-step-title">{step.title}</div>
                    <div className="hl-prod-step-desc">{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="hl-metrics-band">
        <div className="hl-metrics-inner">
          <div className="hl-reveal">
            <div className="hl-metric-val">Teams</div>
            <div className="hl-metric-label">Worldwide</div>
            <div className="hl-metric-sub">Growing every day</div>
          </div>
          <div className="hl-reveal">
            <div className="hl-metric-val">Reliable</div>
            <div className="hl-metric-label">Infrastructure</div>
            <div className="hl-metric-sub">Built to last</div>
          </div>
          <div className="hl-reveal">
            <div className="hl-metric-val">Real time</div>
            <div className="hl-metric-label">Dashboard</div>
            <div className="hl-metric-sub">Live productivity data</div>
          </div>
          <div className="hl-reveal">
            <div className="hl-metric-val">Simple</div>
            <div className="hl-metric-label">Setup</div>
            <div className="hl-metric-sub">Register and go</div>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="hl-pricing-section" id="pricing">
        <div className="hl-pricing-inner-wide">
          <div className="hl-reveal">
            <span className="hl-section-badge pink">Pricing</span>
            <h2 className="hl-section-title">Simple, transparent pricing</h2>
            <p className="hl-section-desc" style={{ margin: "0 auto 8px", maxWidth: 640 }}>
              Choose the plan that fits your team. Contact us to get started — we&apos;ll confirm details and onboarding with you directly.
            </p>
            <div className="hl-pricing-grid">
              <div className="hl-price-card featured">
                <div className="hl-price-tier">Team</div>
                <div className="hl-price-amount">$15 USD</div>
                <div className="hl-price-sub">per user / month · billed according to your agreement</div>
                <ul className="hl-price-features">
                  <li>Desktop tracking agent (Windows) with secure device registration</li>
                  <li>Browser extension for web activity (where you enable it)</li>
                  <li>Live dashboards: productivity, app usage, and timeline views</li>
                  <li>Teams, projects, and organization structure</li>
                  <li>Productivity rules and rule collections per team</li>
                  <li>Role-based access for admins and employees</li>
                </ul>
                <button
                  type="button"
                  className="hl-btn-primary"
                  onClick={() => {
                    setContactPlan("standard");
                    setContactOpen(true);
                  }}
                >
                  Contact us
                </button>
              </div>
              <div className="hl-price-card">
                <div className="hl-price-tier">Enterprise</div>
                <div className="hl-price-amount">Custom</div>
                <div className="hl-price-sub">For larger rollouts and tailored requirements</div>
                <ul className="hl-price-features">
                  <li>Everything in the standard offering, scoped to your org</li>
                  <li>Volume pricing and contract terms to match your size</li>
                  <li>Custom integrations and deployment options (as agreed)</li>
                  <li>Security, compliance, and data-handling discussions</li>
                  <li>Dedicated onboarding and success alignment</li>
                  <li>SLA and support levels tailored to your needs</li>
                </ul>
                <button
                  type="button"
                  className="hl-btn-primary"
                  onClick={() => {
                    setContactPlan("enterprise");
                    setContactOpen(true);
                  }}
                >
                  Contact us
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PricingContactModal
        open={contactOpen}
        planType={contactPlan}
        onClose={() => setContactOpen(false)}
      />

      {/* Testimonials */}
      <div className="hl-testi-section" id="testimonials">
        <div className="hl-testi-inner">
          <div className="hl-reveal" style={{ textAlign: "center" }}>
            <span className="hl-section-badge">What teams say</span>
            <h2 className="hl-section-title">Built for clarity</h2>
          </div>
          <div className="hl-testi-grid">
            {[
              { text: "Finally we can see where time actually goes without asking everyone to fill timesheets. The rule collections let us define what counts as productive for each team.", name: "Engineering lead", role: "Tech company" },
              { text: "Setting up teams and assigning rule collections was straightforward. Our dashboard now shows productivity the way we care about it.", name: "Operations manager", role: "Growing startup" },
              { text: "The desktop agent is lightweight and our team adopted it quickly. Having one place for all activity and reports has made a real difference.", name: "Product lead", role: "Remote team" },
            ].map((t) => (
              <div key={t.name} className="hl-testi-card">
                <div className="hl-testi-stars">
                  <span className="hl-ts">★</span>
                  <span className="hl-ts">★</span>
                  <span className="hl-ts">★</span>
                  <span className="hl-ts">★</span>
                  <span className="hl-ts">★</span>
                </div>
                <p className="hl-testi-text">&ldquo;{t.text}&rdquo;</p>
                <div className="hl-testi-author">
                  <div className="hl-ta-avatar" style={{ background: "linear-gradient(135deg,var(--hl-primary),var(--hl-violet))" }}>
                    {t.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="hl-ta-name">{t.name}</div>
                    <div className="hl-ta-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="hl-cta-section">
        <div className="hl-cta-bg" />
        <div className="hl-cta-inner hl-reveal">
          <span className="hl-section-badge pink" style={{ marginBottom: 24 }}>
            Get started today
          </span>
          <h2>
            Your team&apos;s best work
            <br />
            starts with{" "}
            <span
              style={{
                background: "linear-gradient(135deg,var(--hl-primary),var(--hl-violet))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              clear visibility
            </span>
          </h2>
          <p>Register your organization and invite your team. No credit card required.</p>
          <div className="hl-cta-actions">
            <Link href="/auth/register-tenant" className="hl-btn-hero">
              Register your organization
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Link>
            <Link href="/auth/login" className="hl-btn-outline-hero">
              Sign in
            </Link>
          </div>
          <div className="hl-cta-note">
            Already have an account? <span>Sign in</span> · No credit card needed to register
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="hl-footer">
        <div className="hl-footer-inner">
          <div className="hl-footer-top">
            <div className="hl-footer-brand">
              <Link href="/home" className="hl-nav-logo" style={{ textDecoration: "none" }}>
                <Image src="/assets/images/logo.png" alt="Averox" width={38} height={38} />
                <div className="hl-logo-text">
                  <span className="hl-logo-top">Averox</span>
                  {/* <span className="hl-logo-sub">Time Track</span> */}
                </div>
              </Link>
              <p>Employee productivity and time tracking for modern teams. A product of Averox Pvt Ltd.</p>
            </div>
            <div className="hl-footer-col">
              <h4>Product</h4>
              <ul>
                <li>
                  <a href="#features">Features</a>
                </li>
                <li>
                  <a href="#pricing">Pricing</a>
                </li>
                <li>
                  <a href="#how-it-works">How it works</a>
                </li>
              </ul>
            </div>
            <div className="hl-footer-col">
              <h4>Account</h4>
              <ul>
                <li>
                  <Link href="/auth/login">Sign in</Link>
                </li>
                <li>
                  <Link href="/auth/register-tenant">Register organization</Link>
                </li>
              </ul>
            </div>
            <div className="hl-footer-col">
              <h4>Support</h4>
              <ul>
                <li>
                  <a href="/auth/register-tenant">Get started</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="hl-footer-bottom">
            <div>© {new Date().getFullYear()} Averox Pvt Ltd. All rights reserved.</div>
            <div className="hl-footer-bottom-links">
              <Link href="/auth/login">Sign in</Link>
              <Link href="/auth/register-tenant">Register</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
