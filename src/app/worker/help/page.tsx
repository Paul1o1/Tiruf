'use client';

import { useState } from 'react';
import {
  Briefcase, CalendarDays, Star, Banknote,
  UserCircle2, ShieldCheck, HelpCircle, Mail,
  Phone, MessageCircle, ChevronDown, ChevronUp, Search,
  CheckCircle2,
} from 'lucide-react';

const FAQS = [
  { q: 'How do I apply for a shift?',           a: 'Go to "Browse Shifts" in the navigation, find any open shift, and tap "Apply Now". The facility will review your application and confirm or decline within 24 hours.' },
  { q: 'Can I cancel a confirmed shift?',       a: 'Contact the facility directly as soon as possible. Cancelling confirmed shifts may affect your rating. Use the Calendar page to find the facility\'s contact details.' },
  { q: 'How does the rating system work?',      a: 'After each completed shift, the facility can rate your performance (1–5 stars with a comment). Ratings are visible on your public profile and help you get more bookings.' },
  { q: 'How do I get paid?',                    a: 'Payment is handled directly between you and the facility. Tiruf displays the agreed pay rate per shift; actual payment terms are confirmed with the facility before the shift.' },
  { q: 'What happens if two shifts clash?',     a: 'Tiruf automatically detects scheduling conflicts. If you apply to a shift that overlaps with a confirmed booking, you\'ll see a warning before submitting.' },
  { q: 'How do I update my profile or cadre?',  a: 'Go to "Profile" in the navigation. Full profile editing (cadre, bio, documents) will be available in an upcoming release.' },
];

const TOPICS = [
  { Icon: Briefcase,    title: 'Applying for Shifts',    desc: 'Find and apply for open positions' },
  { Icon: CalendarDays, title: 'Managing Your Schedule',  desc: 'Calendar, conflicts and cancellations' },
  { Icon: Star,         title: 'Ratings & Reviews',       desc: 'How the two-way rating system works' },
  { Icon: Banknote,     title: 'Pay & Earnings',          desc: 'Understanding shift pay and income' },
  { Icon: UserCircle2,  title: 'Your Profile',            desc: 'Updating cadre, bio, and experience' },
  { Icon: ShieldCheck,  title: 'Account & Security',      desc: 'Password, privacy and settings' },
];

const CONTACTS = [
  { Icon: Mail,           label: 'Email us',  val: 'support@tiruf.et'     },
  { Icon: Phone,          label: 'Call us',   val: '+251 911 123 456'     },
  { Icon: MessageCircle,  label: 'WhatsApp',  val: 'Chat with us'         },
];

export default function WorkerHelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [search,  setSearch]  = useState('');
  const [msgSent, setMsgSent] = useState(false);

  const filtered = FAQS.filter(f =>
    !search ||
    f.q.toLowerCase().includes(search.toLowerCase()) ||
    f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', fontFamily: "'Inter', -apple-system, sans-serif" }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ width: 52, height: 52, borderRadius: 16, background: '#eff6ff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
          <HelpCircle size={26} color="#1c2f72" />
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1a2332', letterSpacing: '-0.5px', marginBottom: 8 }}>
          Help Centre
        </h1>
        <p style={{ fontSize: 15, color: '#64748b', marginBottom: 20 }}>
          Find answers or get in touch with our team
        </p>

        {/* Search */}
        <div style={{ maxWidth: 480, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: 50, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <Search size={17} color="#94a3b8" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search for help topics…"
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, color: '#1a2332', background: 'transparent' }}
          />
        </div>
      </div>

      {/* Topic cards */}
      {!search && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 32 }}>
          {TOPICS.map(({ Icon, title, desc }) => (
            <div
              key={title}
              style={{ background: 'white', borderRadius: 14, border: '1.5px solid #f0f2f7', padding: '18px 16px', cursor: 'default', transition: 'box-shadow 0.2s, transform 0.15s' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                (e.currentTarget as HTMLDivElement).style.transform  = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                (e.currentTarget as HTMLDivElement).style.transform  = 'none';
              }}
            >
              <div style={{ width: 38, height: 38, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <Icon size={18} color="#1c2f72" />
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1a2332', marginBottom: 4 }}>{title}</div>
              <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>{desc}</div>
            </div>
          ))}
        </div>
      )}

      {/* FAQs */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a2332', marginBottom: 14 }}>
          {search
            ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''} for "${search}"`
            : 'Frequently Asked Questions'}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f1f5f9', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <HelpCircle size={22} color="#94a3b8" />
              </div>
              <p style={{ fontSize: 14 }}>No results found. Try different keywords.</p>
            </div>
          ) : filtered.map((faq, i) => (
            <div key={i} style={{ background: 'white', borderRadius: 14, border: '1.5px solid #f0f2f7', overflow: 'hidden' }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 20px', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', gap: 12 }}
              >
                <span style={{ fontSize: 14, fontWeight: 600, color: '#1a2332', flex: 1 }}>{faq.q}</span>
                {openFaq === i
                  ? <ChevronUp size={16} color="#94a3b8" />
                  : <ChevronDown size={16} color="#94a3b8" />}
              </button>
              {openFaq === i && (
                <div style={{ padding: '0 20px 16px', fontSize: 14, color: '#475569', lineHeight: 1.7, borderTop: '1px solid #f0f2f7', paddingTop: 14 }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact support */}
      <div style={{ background: '#fafbff', borderRadius: 20, padding: 28, border: '1.5px solid #e8edf8' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a2332', marginBottom: 4 }}>Still need help?</h2>
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>
          Send us a message and our team will respond within 24 hours.
        </p>

        {msgSent ? (
          <div style={{ padding: '16px 20px', borderRadius: 12, background: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: 10, color: '#15803d', fontSize: 14, fontWeight: 600 }}>
            <CheckCircle2 size={18} color="#15803d" />
            Message sent! We&apos;ll get back to you within 24 hours.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Your Name</label>
                <input placeholder="Abebe Girma" style={{ width: '100%', padding: '11px 14px', borderRadius: 11, border: '1.5px solid #e2e8f0', fontSize: 14, outline: 'none', background: 'white', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Topic</label>
                <select style={{ width: '100%', padding: '11px 14px', borderRadius: 11, border: '1.5px solid #e2e8f0', fontSize: 14, outline: 'none', background: 'white', boxSizing: 'border-box' }}>
                  <option>Shift Application</option>
                  <option>Payment Query</option>
                  <option>Account Issue</option>
                  <option>Rating Dispute</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Message</label>
              <textarea
                rows={4}
                placeholder="Describe your issue or question…"
                style={{ width: '100%', padding: '11px 14px', borderRadius: 11, border: '1.5px solid #e2e8f0', fontSize: 14, outline: 'none', background: 'white', resize: 'none', boxSizing: 'border-box', lineHeight: 1.6 }}
              />
            </div>
            <button
              onClick={() => setMsgSent(true)}
              style={{ alignSelf: 'flex-start', padding: '12px 28px', borderRadius: 50, border: 'none', background: '#1c2f72', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
            >
              Send Message
            </button>
          </div>
        )}

        {/* Quick contact links */}
        <div style={{ display: 'flex', gap: 20, marginTop: 24, paddingTop: 20, borderTop: '1px solid #e8edf8', flexWrap: 'wrap' }}>
          {CONTACTS.map(({ Icon, label, val }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={15} color="#1c2f72" />
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{label}</div>
                <div style={{ fontSize: 13, color: '#1c2f72', fontWeight: 600 }}>{val}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
