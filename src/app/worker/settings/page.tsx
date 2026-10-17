'use client';

import { useState } from 'react';

type Section = 'account' | 'notifications' | 'preferences' | 'privacy';

const SECTIONS: { key: Section; label: string; icon: string; desc: string }[] = [
  { key:'account',       label:'Account',       icon:'👤', desc:'Email, password & personal info' },
  { key:'notifications', label:'Notifications', icon:'🔔', desc:'Shift alerts & reminders'         },
  { key:'preferences',   label:'Preferences',   icon:'⚙️', desc:'Language, region & display'      },
  { key:'privacy',       label:'Privacy',       icon:'🔒', desc:'Data & visibility settings'      },
];

function Toggle({ defaultOn = false }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button onClick={() => setOn(v => !v)} style={{
      width:44, height:24, borderRadius:12, border:'none', cursor:'pointer',
      background: on ? '#4e7fe8' : '#e2e8f0', position:'relative', transition:'background 0.2s', flexShrink:0,
    }}>
      <span style={{
        position:'absolute', top:3, left: on ? 23 : 3,
        width:18, height:18, borderRadius:'50%', background:'white',
        boxShadow:'0 1px 4px rgba(0,0,0,0.18)', transition:'left 0.2s',
      }} />
    </button>
  );
}

function SettingRow({ label, desc, control }: { label: string; desc?: string; control: React.ReactNode }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 0', borderBottom:'1px solid #f0f2f7', gap:16 }}>
      <div>
        <div style={{ fontSize:14, fontWeight:600, color:'#1a2332' }}>{label}</div>
        {desc && <div style={{ fontSize:12, color:'#94a3b8', marginTop:2 }}>{desc}</div>}
      </div>
      {control}
    </div>
  );
}

export default function WorkerSettingsPage() {
  const [active, setActive] = useState<Section>('account');
  const [saved, setSaved]   = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div style={{ maxWidth:760, margin:'0 auto', fontFamily:"'Inter',-apple-system,sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:24, fontWeight:800, color:'#1a2332', letterSpacing:'-0.4px' }}>Settings</h1>
        <p style={{ fontSize:14, color:'#64748b', marginTop:4 }}>Manage your account preferences</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'200px 1fr', gap:20 }}>

        {/* Sidebar nav */}
        <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
          {SECTIONS.map(s => (
            <button key={s.key} onClick={() => setActive(s.key)} style={{
              display:'flex', alignItems:'center', gap:10, padding:'11px 14px', borderRadius:12,
              border:'none', cursor:'pointer', textAlign:'left', transition:'all 0.15s',
              background: active === s.key ? 'linear-gradient(135deg,#fce8f3,#ede9fb)' : 'transparent',
              fontWeight: active === s.key ? 700 : 500,
              color: active === s.key ? '#1a2332' : '#64748b',
            }}>
              <span style={{ fontSize:16 }}>{s.icon}</span>
              <span style={{ fontSize:14 }}>{s.label}</span>
            </button>
          ))}
        </div>

        {/* Content panel */}
        <div style={{ background:'white', borderRadius:16, border:'1.5px solid #f0f2f7', padding:24 }}>

          {/* Saved banner */}
          {saved && (
            <div style={{ marginBottom:16, padding:'11px 16px', borderRadius:10, background:'#e6f5f0', color:'#1D9E75', fontSize:14, fontWeight:600, border:'1px solid #a7f3d0' }}>
              ✅ Settings saved successfully
            </div>
          )}

          {/* Account */}
          {active === 'account' && (
            <div>
              <h2 style={{ fontSize:16, fontWeight:700, color:'#1a2332', marginBottom:4 }}>Account Details</h2>
              <p style={{ fontSize:13, color:'#94a3b8', marginBottom:20 }}>Update your personal information</p>

              <div style={{ display:'flex', flexDirection:'column', gap:14, marginBottom:24 }}>
                {[['Full Name','Abebe Girma','text'],['Email','abebe@tiruf.demo','email'],['Phone Number','+251 911 000 000','tel']].map(([label, placeholder, type]) => (
                  <div key={label}>
                    <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#374151', marginBottom:6 }}>{label}</label>
                    <input type={type} placeholder={placeholder} defaultValue={placeholder}
                      style={{ width:'100%', padding:'12px 14px', borderRadius:11, border:'1.5px solid #e2e8f0', fontSize:14, color:'#1a2332', outline:'none', boxSizing:'border-box' }} />
                  </div>
                ))}
              </div>

              <div style={{ borderTop:'1px solid #f0f2f7', paddingTop:20, marginBottom:20 }}>
                <h3 style={{ fontSize:15, fontWeight:700, color:'#1a2332', marginBottom:16 }}>Change Password</h3>
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {['Current Password','New Password','Confirm New Password'].map(label => (
                    <div key={label}>
                      <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#374151', marginBottom:6 }}>{label}</label>
                      <input type="password" placeholder="••••••••"
                        style={{ width:'100%', padding:'12px 14px', borderRadius:11, border:'1.5px solid #e2e8f0', fontSize:14, outline:'none', boxSizing:'border-box' }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          {active === 'notifications' && (
            <div>
              <h2 style={{ fontSize:16, fontWeight:700, color:'#1a2332', marginBottom:4 }}>Notifications</h2>
              <p style={{ fontSize:13, color:'#94a3b8', marginBottom:20 }}>Choose what alerts you receive</p>
              <SettingRow label="New shift available"        desc="Notify when a shift matching your cadre is posted" control={<Toggle defaultOn />} />
              <SettingRow label="Application update"         desc="When a facility accepts or rejects your application"  control={<Toggle defaultOn />} />
              <SettingRow label="Shift reminder"             desc="24h reminder before your confirmed shift"           control={<Toggle defaultOn />} />
              <SettingRow label="New rating received"        desc="When a facility rates you after a shift"             control={<Toggle defaultOn />} />
              <SettingRow label="Platform announcements"     desc="News, updates and new features from Tiruf"          control={<Toggle />} />
              <SettingRow label="Weekly earnings summary"    desc="Summary of your shifts and pay each week"           control={<Toggle />} />
            </div>
          )}

          {/* Preferences */}
          {active === 'preferences' && (
            <div>
              <h2 style={{ fontSize:16, fontWeight:700, color:'#1a2332', marginBottom:4 }}>Preferences</h2>
              <p style={{ fontSize:13, color:'#94a3b8', marginBottom:20 }}>Customise your experience</p>

              <SettingRow label="Language" desc="Display language for the app" control={
                <select defaultValue="en" style={{ padding:'8px 12px', borderRadius:9, border:'1.5px solid #e2e8f0', fontSize:13, color:'#1a2332', outline:'none', background:'white' }}>
                  <option value="en">English</option>
                  <option value="am">አማርኛ (Amharic)</option>
                </select>
              } />
              <SettingRow label="Preferred cadre filter" desc="Pre-select your role in shift browsing" control={
                <select defaultValue="Nurse" style={{ padding:'8px 12px', borderRadius:9, border:'1.5px solid #e2e8f0', fontSize:13, color:'#1a2332', outline:'none', background:'white' }}>
                  {['Nurse','Doctor','Midwife','Pharmacist','Lab Technician'].map(c => <option key={c}>{c}</option>)}
                </select>
              } />
              <SettingRow label="Show pay in ETB"          desc="Display all shift pay in Ethiopian Birr"   control={<Toggle defaultOn />} />
              <SettingRow label="Compact shift list view"  desc="Show more shifts per screen"               control={<Toggle />} />
            </div>
          )}

          {/* Privacy */}
          {active === 'privacy' && (
            <div>
              <h2 style={{ fontSize:16, fontWeight:700, color:'#1a2332', marginBottom:4 }}>Privacy & Data</h2>
              <p style={{ fontSize:13, color:'#94a3b8', marginBottom:20 }}>Control how your data is used</p>
              <SettingRow label="Public profile"              desc="Allow facilities to view your profile"         control={<Toggle defaultOn />} />
              <SettingRow label="Show rating publicly"        desc="Display your rating score on your profile"    control={<Toggle defaultOn />} />
              <SettingRow label="Allow shift recommendations" desc="Let Tiruf suggest you for shifts automatically" control={<Toggle defaultOn />} />
              <SettingRow label="Analytics & improvements"    desc="Help us improve by sharing usage data"        control={<Toggle />} />

              <div style={{ marginTop:24, padding:'16px 18px', borderRadius:12, background:'#fef2f2', border:'1px solid #fecaca' }}>
                <p style={{ fontSize:14, fontWeight:700, color:'#dc2626', marginBottom:4 }}>Danger Zone</p>
                <p style={{ fontSize:13, color:'#6b7280', marginBottom:12 }}>These actions are permanent and cannot be undone.</p>
                <button style={{ padding:'9px 20px', borderRadius:10, border:'1.5px solid #fca5a5', background:'white', color:'#dc2626', fontSize:13, fontWeight:700, cursor:'pointer' }}>
                  Delete My Account
                </button>
              </div>
            </div>
          )}

          {/* Save button */}
          <div style={{ paddingTop:20, marginTop:4 }}>
            <button onClick={handleSave} style={{ padding:'12px 32px', borderRadius:50, border:'none', background:'linear-gradient(135deg,#1c2f72,#4e7fe8)', color:'white', fontSize:14, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 16px rgba(78,127,232,0.3)' }}>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
