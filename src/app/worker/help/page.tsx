'use client';

import { useState } from 'react';

const FAQS = [
  { q:'How do I apply for a shift?',             a:'Go to "My Jobs" in the sidebar, browse available shifts, and click "Apply Now" on any shift. The facility will review your application and confirm or decline.' },
  { q:'Can I cancel a confirmed shift?',         a:'Contact the facility directly as soon as possible. Cancelling confirmed shifts may affect your rating. Use the calendar page to find the facility\'s contact details.' },
  { q:'How does the rating system work?',        a:'After each completed shift, both the facility and you can rate each other (1–5 stars with a comment). Ratings are public on your profile and help you get more bookings.' },
  { q:'How do I get paid?',                      a:'Payment is handled directly between you and the facility. Tiruf displays the agreed pay rate per shift; actual payment terms are agreed with the facility.' },
  { q:'What happens if two shifts clash?',       a:'Tiruf automatically detects clashing shifts. If you apply to a shift that overlaps with a confirmed booking, you\'ll see a conflict warning.' },
  { q:'How do I update my profile or cadre?',   a:'Go to "Profile" in the sidebar to see your current information. Full profile editing will be available in an upcoming update.' },
];

const TOPICS = [
  { icon:'💼', title:'Applying for Shifts',   desc:'How to find and apply for open positions' },
  { icon:'📅', title:'Managing Your Schedule', desc:'Calendar, conflicts and cancellations'    },
  { icon:'⭐', title:'Ratings & Reviews',      desc:'How the two-way rating system works'      },
  { icon:'💰', title:'Pay & Earnings',         desc:'Understanding shift pay and tracking income' },
  { icon:'👤', title:'Your Profile',           desc:'Updating cadre, bio, and experience'      },
  { icon:'🔒', title:'Account & Security',     desc:'Password, privacy and account settings'  },
];

export default function WorkerHelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [search,  setSearch]  = useState('');
  const [msgSent, setMsgSent] = useState(false);

  const filtered = FAQS.filter(f =>
    !search || f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth:760, margin:'0 auto', fontFamily:"'Inter',-apple-system,sans-serif" }}>

      {/* Header */}
      <div style={{ textAlign:'center', marginBottom:32 }}>
        <h1 style={{ fontSize:26, fontWeight:800, color:'#1a2332', letterSpacing:'-0.5px', marginBottom:8 }}>Help Centre</h1>
        <p style={{ fontSize:15, color:'#64748b', marginBottom:20 }}>Find answers or get in touch with our team</p>

        {/* Search */}
        <div style={{ maxWidth:480, margin:'0 auto', display:'flex', alignItems:'center', gap:10, padding:'13px 18px', background:'white', border:'1.5px solid #e2e8f0', borderRadius:50, boxShadow:'0 4px 20px rgba(0,0,0,0.06)' }}>
          <svg width="18" height="18" fill="none" stroke="#94a3b8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search for help topics…"
            style={{ flex:1, border:'none', outline:'none', fontSize:14, color:'#1a2332', background:'transparent' }} />
        </div>
      </div>

      {/* Topic cards */}
      {!search && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:32 }}>
          {TOPICS.map(t => (
            <div key={t.title} style={{ background:'white', borderRadius:14, border:'1.5px solid #f0f2f7', padding:'18px 16px', cursor:'pointer', transition:'box-shadow 0.2s, transform 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow='0 4px 20px rgba(0,0,0,0.08)'; (e.currentTarget as HTMLDivElement).style.transform='translateY(-2px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow='none'; (e.currentTarget as HTMLDivElement).style.transform='none'; }}
            >
              <div style={{ fontSize:28, marginBottom:10 }}>{t.icon}</div>
              <div style={{ fontSize:14, fontWeight:700, color:'#1a2332', marginBottom:4 }}>{t.title}</div>
              <div style={{ fontSize:12, color:'#64748b', lineHeight:1.5 }}>{t.desc}</div>
            </div>
          ))}
        </div>
      )}

      {/* FAQs */}
      <div style={{ marginBottom:32 }}>
        <h2 style={{ fontSize:16, fontWeight:700, color:'#1a2332', marginBottom:14 }}>
          {search ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''} for "${search}"` : 'Frequently Asked Questions'}
        </h2>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign:'center', padding:'32px 0', color:'#94a3b8' }}>
              <div style={{ fontSize:28, marginBottom:8 }}>🤔</div>
              <p style={{ fontSize:14 }}>No results found. Try different keywords.</p>
            </div>
          ) : filtered.map((faq, i) => (
            <div key={i} style={{ background:'white', borderRadius:14, border:'1.5px solid #f0f2f7', overflow:'hidden' }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', border:'none', background:'none', cursor:'pointer', textAlign:'left', gap:12 }}>
                <span style={{ fontSize:14, fontWeight:600, color:'#1a2332', flex:1 }}>{faq.q}</span>
                <span style={{ fontSize:18, color:'#94a3b8', transform: openFaq===i ? 'rotate(45deg)' : 'none', transition:'transform 0.2s', flexShrink:0 }}>+</span>
              </button>
              {openFaq === i && (
                <div style={{ padding:'0 20px 16px', fontSize:14, color:'#475569', lineHeight:1.7, borderTop:'1px solid #f0f2f7', paddingTop:14 }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact support */}
      <div style={{ background:'linear-gradient(135deg,#f0f4ff,#f5f0ff)', borderRadius:20, padding:28, border:'1px solid #e0e7ff' }}>
        <h2 style={{ fontSize:16, fontWeight:700, color:'#1a2332', marginBottom:4 }}>Still need help?</h2>
        <p style={{ fontSize:13, color:'#64748b', marginBottom:20 }}>Send us a message and our team will respond within 24 hours.</p>

        {msgSent ? (
          <div style={{ padding:'16px 20px', borderRadius:12, background:'#e6f5f0', border:'1px solid #a7f3d0', color:'#1D9E75', fontSize:14, fontWeight:600, textAlign:'center' }}>
            ✅ Message sent! We'll get back to you within 24 hours.
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div>
                <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#374151', marginBottom:6 }}>Your Name</label>
                <input placeholder="Abebe Girma" style={{ width:'100%', padding:'11px 14px', borderRadius:11, border:'1.5px solid #e2e8f0', fontSize:14, outline:'none', background:'white', boxSizing:'border-box' }} />
              </div>
              <div>
                <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#374151', marginBottom:6 }}>Topic</label>
                <select style={{ width:'100%', padding:'11px 14px', borderRadius:11, border:'1.5px solid #e2e8f0', fontSize:14, outline:'none', background:'white', boxSizing:'border-box' }}>
                  <option>Shift Application</option>
                  <option>Payment Query</option>
                  <option>Account Issue</option>
                  <option>Rating Dispute</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
            <div>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#374151', marginBottom:6 }}>Message</label>
              <textarea rows={4} placeholder="Describe your issue or question…"
                style={{ width:'100%', padding:'11px 14px', borderRadius:11, border:'1.5px solid #e2e8f0', fontSize:14, outline:'none', background:'white', resize:'none', boxSizing:'border-box', lineHeight:1.6 }} />
            </div>
            <button onClick={() => setMsgSent(true)}
              style={{ alignSelf:'flex-start', padding:'12px 28px', borderRadius:50, border:'none', background:'linear-gradient(135deg,#1c2f72,#4e7fe8)', color:'white', fontSize:14, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 16px rgba(78,127,232,0.3)' }}>
              Send Message
            </button>
          </div>
        )}

        {/* Quick links */}
        <div style={{ display:'flex', gap:16, marginTop:20, paddingTop:20, borderTop:'1px solid #d8e3ff', flexWrap:'wrap' }}>
          {[['📧','Email us','support@tiruf.et'],['📞','Call us','+251 911 123 456'],['💬','WhatsApp','Chat with us']].map(([icon, label, val]) => (
            <div key={label} style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span>{icon}</span>
              <div>
                <div style={{ fontSize:11, color:'#94a3b8', fontWeight:600 }}>{label}</div>
                <div style={{ fontSize:13, color:'#4e7fe8', fontWeight:600 }}>{val}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
