'use client';

import Link from 'next/link';
import { useState } from 'react';
import SmoothScroll from '@/components/SmoothScroll';
import { 
  ArrowUpRight, 
  Search, 
  LayoutGrid, 
  PieChart, 
  Mail, 
  Calendar as CalendarIcon, 
  FileText, 
  Building2, 
  Stethoscope, 
  ShieldCheck, 
  CheckCircle2, 
  Users, 
  PhoneCall, 
  Clock, 
  Star,
  Sparkles,
  MapPin,
  Menu,
  X
} from 'lucide-react';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ background: '#F8FAFC', color: '#1c2f72' }}>
      
      {/* Smooth inertial scrolling */}
      <SmoothScroll />

      {/* ── Navigation Bar ── */}
      <header className="sticky top-0 z-50 bg-[#F8FAFC]/95 backdrop-blur-md border-b border-[#1c2f72]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <span className="text-3xl font-black tracking-tight text-[#1c2f72] flex items-center gap-1">
              <span className="text-3xl font-black text-[#4e7fe8]">T</span>
              <span className="font-extrabold tracking-tight">iruf</span>
              <span className="text-xs ml-1.5 px-2.5 py-0.5 rounded-full font-bold bg-[#e0f2fe] text-[#0284c7] border border-[#bae6fd]">
                ትርፍ
              </span>
            </span>
          </Link>

          {/* Center Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#1c2f72]/75">
            <a href="#shifts" className="hover:text-[#4e7fe8] transition-colors">Find Shifts</a>
            <a href="#hospitals" className="hover:text-[#4e7fe8] transition-colors">Hospitals</a>
            <a href="#how-it-works" className="hover:text-[#4e7fe8] transition-colors">How It Works</a>
            <a href="#benefits" className="hover:text-[#4e7fe8] transition-colors">Why Tiruf</a>
            <a href="#rates" className="hover:text-[#4e7fe8] transition-colors">Pay Rates</a>
          </nav>

          {/* Right Action */}
          <div className="hidden md:flex items-center gap-3">
            <Link 
              href="/auth/login" 
              className="px-5 py-2.5 rounded-full text-sm font-bold text-[#1c2f72] hover:bg-[#1c2f72]/5 transition-all"
            >
              Sign In
            </Link>
            <Link 
              href="/auth/register?type=facility" 
              className="px-6 py-2.5 rounded-full text-sm font-bold text-white shadow-md hover:shadow-lg hover:opacity-95 transition-all inline-flex items-center gap-1.5"
              style={{ background: 'linear-gradient(135deg, #1c2f72 0%, #4e7fe8 100%)' }}
            >
              Post a Shift
              <ArrowUpRight size={16} />
            </Link>
          </div>

          {/* Mobile menu button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="md:hidden p-2 rounded-xl text-[#1c2f72] hover:bg-[#1c2f72]/5"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#F8FAFC] border-b border-[#1c2f72]/10 px-6 py-5 space-y-4">
            <a href="#shifts" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-base font-semibold text-[#1c2f72]">
              Find Shifts
            </a>
            <a href="#hospitals" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-base font-semibold text-[#1c2f72]">
              Hospitals
            </a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-base font-semibold text-[#1c2f72]">
              How It Works
            </a>
            <a href="#benefits" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-base font-semibold text-[#1c2f72]">
              Why Tiruf
            </a>
            <div className="pt-3 border-t border-[#1c2f72]/10 flex flex-col gap-2.5">
              <Link 
                href="/auth/login" 
                className="w-full text-center py-2.5 rounded-full border border-[#1c2f72]/20 font-bold text-sm text-[#1c2f72]"
              >
                Sign In
              </Link>
              <Link 
                href="/auth/register" 
                className="w-full text-center py-2.5 rounded-full text-white font-bold text-sm"
                style={{ background: 'linear-gradient(135deg, #1c2f72 0%, #4e7fe8 100%)' }}
              >
                Get Started Now ↗
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO SECTION ── */}
      <section className="pt-16 pb-12 sm:pt-20 sm:pb-16 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          
          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-[68px] font-black tracking-tight text-[#1c2f72] leading-[1.12] mb-6">
            Unlock effortless <br className="hidden sm:inline" />
            healthcare shifts with top <br className="hidden sm:inline" />
            verified clinical talent.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-[#1c2f72]/70 max-w-2xl mx-auto font-normal leading-relaxed mb-9">
            Tiruf connects premier Addis Ababa hospitals and clinics with licensed nurses, midwives, and doctors for on-demand per-diem shift coverage.
          </p>

          {/* Pill CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-16">
            <Link
              href="/auth/register?type=worker"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full text-sm font-extrabold text-white shadow-lg hover:shadow-xl hover:opacity-95 transition-all inline-flex items-center justify-center gap-1.5"
              style={{ background: 'linear-gradient(135deg, #1c2f72 0%, #4e7fe8 60%, #35bdd0 100%)' }}
            >
              Get Started Now
              <ArrowUpRight size={17} />
            </Link>

            <Link
              href="/auth/register?type=facility"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full text-sm font-extrabold text-[#1c2f72] bg-white border border-[#1c2f72]/20 hover:border-[#4e7fe8] hover:text-[#4e7fe8] hover:bg-[#f0f4ff] transition-all inline-flex items-center justify-center gap-1.5 shadow-sm"
            >
              Request for Demo
              <ArrowUpRight size={17} />
            </Link>
          </div>
        </div>

        {/* ── HERO DASHBOARD PREVIEW (Laptop Screen Mockup Style) ── */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
          
          {/* Outer framing matching user reference in signature blue */}
          <div className="border-[6px] sm:border-[10px] border-[#1c2f72] rounded-[28px] sm:rounded-[36px] bg-[#eef2ff] shadow-2xl overflow-hidden text-left">
            
            {/* Top Bar with dots */}
            <div className="bg-[#1c2f72] px-5 py-2.5 flex items-center justify-between text-white/50 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                <span className="ml-2 font-mono text-[11px] text-white/70">tiruf.et/portal/shifts</span>
              </div>
              <span className="text-[11px] font-semibold text-[#35bdd0]">● Live Hospital Network</span>
            </div>

            {/* Inner Dashboard Canvas */}
            <div className="flex bg-[#F1F5F9] min-h-[460px] sm:min-h-[520px]">
              
              {/* Left Mockup Sidebar */}
              <div className="w-14 sm:w-16 bg-[#FFFFFF] border-r border-[#1c2f72]/10 flex flex-col items-center py-5 justify-between shrink-0">
                <div className="flex flex-col items-center gap-6">
                  {/* Logo mark */}
                  <div className="text-xl font-black text-[#4e7fe8]">T</div>

                  {/* Nav icons */}
                  <div className="flex flex-col gap-3">
                    <button className="w-9 h-9 rounded-xl bg-[#4e7fe8] text-white flex items-center justify-center shadow-sm">
                      <LayoutGrid size={18} />
                    </button>
                    <button className="w-9 h-9 rounded-xl text-[#1c2f72]/40 hover:text-[#1c2f72] flex items-center justify-center">
                      <PieChart size={18} />
                    </button>
                    <button className="w-9 h-9 rounded-xl text-[#1c2f72]/40 hover:text-[#1c2f72] flex items-center justify-center">
                      <Mail size={18} />
                    </button>
                    <button className="w-9 h-9 rounded-xl text-[#1c2f72]/40 hover:text-[#1c2f72] flex items-center justify-center">
                      <CalendarIcon size={18} />
                    </button>
                    <button className="w-9 h-9 rounded-xl text-[#1c2f72]/40 hover:text-[#1c2f72] flex items-center justify-center">
                      <FileText size={18} />
                    </button>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-full bg-[#1c2f72] text-white flex items-center justify-center text-xs font-bold">
                  ST
                </div>
              </div>

              {/* Main App Content */}
              <div className="flex-1 p-5 sm:p-7 overflow-hidden">
                
                {/* Top header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-[#1c2f72]">Hello, Selam Tadesse</h2>
                    <p className="text-xs text-[#1c2f72]/60">Certified Senior Nurse · Addis Ababa Roster</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative flex-1 sm:w-64">
                      <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1c2f72]/40" />
                      <input 
                        type="text" 
                        readOnly 
                        value="Search shifts, hospitals..." 
                        className="w-full bg-white rounded-full py-1.5 pl-9 pr-3 text-xs border border-[#1c2f72]/10 text-[#1c2f72]/70 outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-[#1c2f72]/10">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-[#4e7fe8] text-[10px] font-bold flex items-center justify-center">
                        ✓
                      </div>
                      <span className="text-xs font-bold text-[#1c2f72]">Verified</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl sm:text-2xl font-black text-[#1c2f72]">Overview</h3>
                  <span className="text-xs font-bold text-[#1c2f72]/60 bg-white px-3 py-1 rounded-full border border-[#1c2f72]/10">
                    This Week ▾
                  </span>
                </div>

                {/* 3 Metric Cards like in the reference image */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-5">
                  
                  {/* Card 1 */}
                  <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#1c2f72]/10 shadow-sm relative">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-semibold text-[#1c2f72]/60">Shift Earnings</span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#e0f2fe] text-[#0284c7]">
                        +12%
                      </span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-[#1c2f72] tracking-tight">
                      ETB 14,850
                    </div>
                    <div className="text-[11px] text-[#1c2f72]/50 mt-1 flex items-center gap-1">
                      <span>Total Payouts</span>
                      <span className="ml-auto text-[#4e7fe8] font-bold">● Completed</span>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#1c2f72]/10 shadow-sm relative">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-semibold text-[#1c2f72]/60">Open Shifts</span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#e0f2fe] text-[#0284c7]">
                        +8 New
                      </span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-[#1c2f72] tracking-tight">
                      128
                    </div>
                    <div className="text-[11px] text-[#1c2f72]/50 mt-1 flex items-center gap-1">
                      <span>Across 18 Hospitals</span>
                      <span className="ml-auto text-[#35bdd0] font-bold">● Live</span>
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#1c2f72]/10 shadow-sm relative">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-semibold text-[#1c2f72]/60">Hospital Rating</span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#e0f2fe] text-[#0284c7]">
                        ★ 4.9
                      </span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-[#1c2f72] tracking-tight">
                      98.4%
                    </div>
                    <div className="text-[11px] text-[#1c2f72]/50 mt-1 flex items-center gap-1">
                      <span>Fulfillment Score</span>
                      <span className="ml-auto text-[#1c2f72] font-bold">Top 5%</span>
                    </div>
                  </div>

                </div>

                {/* Bottom Row inside Mockup */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
                  
                  {/* Left Column: Shift Demand Analysis Chart */}
                  <div className="lg:col-span-7 bg-white rounded-2xl p-4 sm:p-5 border border-[#1c2f72]/10 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-bold text-[#1c2f72]">Shift Demand Analysis</span>
                      <span className="text-[11px] text-[#1c2f72]/60">Weekly ▾</span>
                    </div>
                    {/* Visual Bar chart bars in shades of blue */}
                    <div className="flex items-end justify-between gap-2 h-24 pt-2 px-2">
                      {[
                        { day: 'Mon', h: '65%', active: false },
                        { day: 'Tue', h: '85%', active: false },
                        { day: 'Wed', h: '45%', active: false },
                        { day: 'Thu', h: '95%', active: true },
                        { day: 'Fri', h: '70%', active: false },
                        { day: 'Sat', h: '100%', active: true },
                        { day: 'Sun', h: '80%', active: false },
                      ].map((bar, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                          <div 
                            className="w-full rounded-t-md transition-all" 
                            style={{ 
                              height: bar.h, 
                              background: bar.active 
                                ? '#1c2f72' 
                                : 'linear-gradient(180deg, #4e7fe8 0%, #35bdd0 100%)' 
                            }} 
                          />
                          <span className="text-[10px] font-semibold text-[#1c2f72]/60">{bar.day}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Featured Shift Match Card */}
                  <div className="lg:col-span-5 bg-white rounded-2xl p-4 sm:p-5 border border-[#1c2f72]/10 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-[#1c2f72]">Next Urgent Shift</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                          Urgent
                        </span>
                      </div>
                      <div className="font-extrabold text-[#1c2f72] text-sm">
                        ICU Night Coverage
                      </div>
                      <div className="text-xs text-[#1c2f72]/60 flex items-center gap-1 mt-1">
                        <Building2 size={12} className="text-[#4e7fe8]" />
                        St. Paul Hospital · Gulele
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div>
                          <div className="text-[11px] text-[#1c2f72]/50">Offered Compensation</div>
                          <div className="text-base font-black text-[#1c2f72]">1,400 ETB</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[11px] text-[#1c2f72]/50">Shift Timing</div>
                          <div className="text-xs font-bold text-[#1c2f72]">19:00 – 07:00</div>
                        </div>
                      </div>
                    </div>

                    <Link
                      href="/auth/register?type=worker"
                      className="mt-4 w-full py-2 rounded-xl text-xs font-bold text-white text-center transition hover:opacity-90 shadow"
                      style={{ background: 'linear-gradient(135deg, #1c2f72 0%, #4e7fe8 100%)' }}
                    >
                      Instant Apply
                    </Link>
                  </div>

                </div>

              </div>
            </div>

          </div>

        </div>

        {/* Deep Midnight Blue Background Band across bottom (matching the photo layout) */}
        <div 
          className="w-full h-40 sm:h-52 absolute bottom-0 left-0 -z-10" 
          style={{ background: '#1c2f72' }} 
        />
      </section>

      {/* ── PARTNER HOSPITALS TICKER ── */}
      <section className="bg-[#1c2f72] text-white py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-[#35bdd0] mb-8">
            Trusted by Leading Medical Institutions Across Addis Ababa
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center text-white/80 font-bold text-sm items-center">
            <div className="bg-white/5 py-3 px-4 rounded-xl border border-white/10 hover:border-white/20 transition">St. Paul Hospital</div>
            <div className="bg-white/5 py-3 px-4 rounded-xl border border-white/10 hover:border-white/20 transition">Black Lion Hospital</div>
            <div className="bg-white/5 py-3 px-4 rounded-xl border border-white/10 hover:border-white/20 transition">MCM Korean Hospital</div>
            <div className="bg-white/5 py-3 px-4 rounded-xl border border-white/10 hover:border-white/20 transition">Landmark Hospital</div>
            <div className="bg-white/5 py-3 px-4 rounded-xl border border-white/10 hover:border-white/20 transition">Hayat Hospital</div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS SECTION ── */}
      <section id="how-it-works" className="py-20 sm:py-28 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0284c7] bg-[#e0f2fe] border border-[#bae6fd] px-3.5 py-1 rounded-full">
              Streamlined Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#1c2f72] mt-4 mb-3 tracking-tight">
              Hospital staffing designed without the friction
            </h2>
            <p className="text-[#1c2f72]/70 text-sm sm:text-base">
              A transparent, peer-reviewed ecosystem built to serve clinical departments across the capital.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="bg-white rounded-3xl p-8 border border-[#1c2f72]/10 shadow-sm relative">
              <div className="w-12 h-12 rounded-2xl bg-[#1c2f72] text-[#35bdd0] font-black text-xl flex items-center justify-center mb-6">
                01
              </div>
              <h3 className="text-xl font-black text-[#1c2f72] mb-2">Hospital Posts Shift</h3>
              <p className="text-sm text-[#1c2f72]/70 leading-relaxed">
                Specify cadre requirements (Nurse, Midwife, Doctor, Pharmacist), ward, exact date/time, and upfront ETB compensation.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-[#1c2f72]/10 shadow-sm relative">
              <div className="w-12 h-12 rounded-2xl bg-[#4e7fe8] text-white font-black text-xl flex items-center justify-center mb-6">
                02
              </div>
              <h3 className="text-xl font-black text-[#1c2f72] mb-2">Licensed Workers Apply</h3>
              <p className="text-sm text-[#1c2f72]/70 leading-relaxed">
                Available certified practitioners check shift details and apply with a single tap. Automated conflict checks ensure no overlaps.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-[#1c2f72]/10 shadow-sm relative">
              <div className="w-12 h-12 rounded-2xl bg-[#1c2f72] text-[#35bdd0] font-black text-xl flex items-center justify-center mb-6">
                03
              </div>
              <h3 className="text-xl font-black text-[#1c2f72] mb-2">Confirmed & Connected</h3>
              <p className="text-sm text-[#1c2f72]/70 leading-relaxed">
                The facility confirms the best candidate. Both parties immediately unlock direct phone numbers for seamless arrival coordination.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ── TWO COLUMN VALUE PROPOSITION ── */}
      <section id="benefits" className="py-20 bg-white border-y border-[#1c2f72]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 items-center">
            
            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-[#0284c7] bg-[#e0f2fe] border border-[#bae6fd] px-3.5 py-1 rounded-full">
                For Hospitals & Facilities
              </span>
              <h3 className="text-3xl sm:text-4xl font-black text-[#1c2f72] leading-tight">
                Fill roster vacancies before they impact patient care
              </h3>
              <p className="text-[#1c2f72]/70 leading-relaxed text-sm sm:text-base">
                Hospital admins and head nurses can post emergency shifts in 60 seconds and access certified practitioners ready for duty.
              </p>

              <div className="space-y-3 pt-2">
                {[
                  { title: 'Zero Agency Overhead', desc: 'Post directly without middleman markups or complicated contracting.' },
                  { title: 'Vetted Medical Licensure', desc: 'Every registered health worker holds verified credentials and practice permits.' },
                  { title: 'Completed Shifts Record', desc: 'Inspect peer ratings and reliability history before confirming a worker.' },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-3.5 items-start">
                    <div className="w-5 h-5 rounded-full bg-[#1c2f72] text-[#35bdd0] flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                      ✓
                    </div>
                    <div>
                      <h4 className="font-bold text-[#1c2f72] text-sm">{item.title}</h4>
                      <p className="text-xs text-[#1c2f72]/60 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <Link
                  href="/auth/register?type=facility"
                  className="px-7 py-3 rounded-full text-sm font-bold text-white shadow-md hover:opacity-95 inline-flex items-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #1c2f72 0%, #4e7fe8 100%)' }}
                >
                  Post a Hospital Shift ↗
                </Link>
              </div>
            </div>

            <div className="bg-[#1c2f72] text-white rounded-3xl p-8 sm:p-10 shadow-xl space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-[#35bdd0] bg-white/10 px-3 py-1 rounded-full">
                For Health Workers
              </span>
              <h3 className="text-2xl sm:text-3xl font-black leading-snug">
                Earn extra income on your days off with complete flexibility
              </h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Work per-diem shifts that match your schedule across top Addis Ababa hospitals. Keep 100% of your earnings with guaranteed rates.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                  <div className="text-2xl font-black text-[#35bdd0]">1,400 ETB</div>
                  <div className="text-xs text-white/70 mt-1">Average Shift Pay</div>
                </div>
                <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                  <div className="text-2xl font-black text-[#4e7fe8]">0% Cut</div>
                  <div className="text-xs text-white/70 mt-1">Worker Commission</div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/auth/register?type=worker"
                  className="w-full sm:w-auto px-7 py-3 rounded-full text-sm font-bold text-white shadow hover:opacity-90 inline-flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #4e7fe8 0%, #35bdd0 100%)' }}
                >
                  Join as Health Worker ↗
                </Link>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#1c2f72] text-white/70 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10 pb-10 border-b border-white/10">
            
            <div className="space-y-3">
              <div className="text-2xl font-black text-white flex items-center gap-1.5">
                <span className="text-[#4e7fe8]">T</span>
                <span>iruf</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-[#35bdd0] text-[#1c2f72]">
                  ትርፍ
                </span>
              </div>
              <p className="text-xs text-white/60 leading-relaxed">
                Empowering hospitals and certified health workers across Addis Ababa, Ethiopia.
              </p>
            </div>

            <div>
              <h5 className="text-white font-bold text-sm mb-3">For Hospitals</h5>
              <ul className="space-y-2 text-xs">
                <li><Link href="/auth/register?type=facility" className="hover:text-white transition">Post a Shift</Link></li>
                <li><Link href="/auth/login" className="hover:text-white transition">Facility Dashboard</Link></li>
                <li><Link href="/auth/login" className="hover:text-white transition">Manage Roster</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="text-white font-bold text-sm mb-3">For Health Workers</h5>
              <ul className="space-y-2 text-xs">
                <li><Link href="/auth/register?type=worker" className="hover:text-white transition">Browse Open Shifts</Link></li>
                <li><Link href="/auth/login" className="hover:text-white transition">Worker Sign In</Link></li>
                <li><Link href="/auth/register?type=worker" className="hover:text-white transition">Submit Credentials</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="text-white font-bold text-sm mb-3">Location</h5>
              <p className="text-xs text-white/60 leading-relaxed">
                Addis Ababa, Ethiopia<br />
                Direct Coordinator Line: +251 911 000 000<br />
                Available 24/7 for urgent clinical staffing
              </p>
            </div>

          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-white/50 gap-4">
            <p>© {new Date().getFullYear()} Tiruf (ትርፍ) Healthcare Technologies. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/auth/login" className="hover:text-white">Sign In</Link>
              <Link href="/auth/register" className="hover:text-white">Register</Link>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
