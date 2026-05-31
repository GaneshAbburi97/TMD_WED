import { useState } from 'react'
import { Stethoscope, HelpCircle, Calendar, ChevronLeft, Search, Phone, MapPin, ChevronDown } from 'lucide-react'

const SupportCard = ({ icon: Icon, title, bgColor, color, onClick }) => (
  <div 
    onClick={onClick}
    style={{
      backgroundColor: bgColor,
      color: color,
      borderRadius: '16px',
      padding: '2rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1.5rem',
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      transition: 'all 0.2s ease',
      border: `1px solid ${color}20`
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)'
      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)'
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'
    }}
  >
    <div style={{ backgroundColor: '#fff', padding: '1rem', borderRadius: '12px', display: 'flex' }}>
      <Icon size={32} color={color} />
    </div>
    <div>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0, color: 'var(--text-primary)' }}>{title}</h3>
      <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
        {title === 'Find a Doctor' ? 'Locate TMJ specialists near you' : 
         title === 'Help & FAQs' ? 'Get answers to common questions' : 
         'Manage your upcoming visits'}
      </p>
    </div>
  </div>
)

const doctors = [
  { name: 'Dr. Sarah Jenkins', spec: 'TMJ Specialist', distance: '2.4 miles', rating: '4.9 (120 reviews)' },
  { name: 'Dr. Michael Chen', spec: 'Orofacial Pain Specialist', distance: '3.1 miles', rating: '4.8 (85 reviews)' },
  { name: 'Dr. Emily Carter', spec: 'Maxillofacial Surgeon', distance: '5.0 miles', rating: '4.7 (200 reviews)' }
]

const faqs = [
  { q: 'What exercises are best for acute jaw pain?', a: 'Gentle stretching and resting the jaw are best. Avoid chewing hard foods.' },
  { q: 'How often should I use the pain tracker?', a: 'We recommend logging your pain at least once a day, preferably at the same time.' },
  { q: 'Can stress cause TMJ flare-ups?', a: 'Yes, stress often leads to clenching or grinding teeth, which exacerbates TMJ pain.' }
]

const appointments = [
  { dr: 'Dr. Sarah Jenkins', date: 'Oct 24, 2026', time: '10:00 AM', status: 'Upcoming' },
  { dr: 'Dr. Michael Chen', date: 'Nov 12, 2026', time: '2:30 PM', status: 'Upcoming' }
]

export default function Support() {
  const [activeView, setActiveView] = useState('menu')
  const [openFaq, setOpenFaq] = useState(null)

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
        {activeView !== 'menu' && (
          <button 
            onClick={() => setActiveView('menu')}
            style={{
              background: 'var(--surface-border)', border: 'none', padding: '0.5rem',
              borderRadius: '50%', cursor: 'pointer', display: 'flex'
            }}
          >
            <ChevronLeft size={24} color="var(--text-primary)" />
          </button>
        )}
        <div>
          <h1 style={{ margin: 0 }}>Support Center</h1>
          <p className="text-secondary" style={{ margin: '0.25rem 0 0 0' }}>
            {activeView === 'menu' ? 'How can we help you today?' : activeView}
          </p>
        </div>
      </div>

      {activeView === 'menu' && (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <SupportCard 
            icon={Stethoscope} 
            title="Find a Doctor" 
            bgColor="var(--brand-light)" 
            color="var(--brand-primary)" 
            onClick={() => setActiveView('Find a Doctor')}
          />
          <SupportCard 
            icon={HelpCircle} 
            title="Help & FAQs" 
            bgColor="rgba(59, 130, 246, 0.1)" 
            color="#3b82f6" 
            onClick={() => setActiveView('Help & FAQs')}
          />
          <SupportCard 
            icon={Calendar} 
            title="My Appointments" 
            bgColor="rgba(16, 185, 129, 0.1)" 
            color="#10b981" 
            onClick={() => setActiveView('My Appointments')}
          />
        </div>
      )}

      {activeView === 'Find a Doctor' && (
        <div className="card">
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'var(--background)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--surface-border)' }}>
              <Search size={20} color="var(--text-secondary)" style={{ marginRight: '0.5rem' }} />
              <input type="text" placeholder="Search by name or specialty..." style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', color: 'var(--text-primary)' }} />
            </div>
          </div>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {doctors.map((dr, i) => (
              <div key={i} style={{ padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.25rem 0' }}>{dr.name}</h3>
                  <div className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>{dr.spec}</div>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={14}/> {dr.distance}</span>
                    <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>★ {dr.rating}</span>
                  </div>
                </div>
                <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Phone size={16} /> Contact
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeView === 'Help & FAQs' && (
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem' }}>Frequently Asked Questions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{ border: '1px solid var(--surface-border)', borderRadius: '8px', overflow: 'hidden' }}>
                <button 
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{ width: '100%', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface)', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', fontWeight: 600, textAlign: 'left' }}
                >
                  {faq.q}
                  <ChevronDown size={20} style={{ transform: openFaq === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>
                {openFaq === i && (
                  <div style={{ padding: '1rem', background: 'var(--background)', color: 'var(--text-secondary)', borderTop: '1px solid var(--surface-border)' }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--brand-light)', borderRadius: '8px', textAlign: 'center' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--brand-primary)' }}>Still need help?</h4>
            <p className="text-secondary" style={{ marginBottom: '1rem' }}>Our support team is available 24/7 to assist you.</p>
            <button className="btn-primary">Contact Support</button>
          </div>
        </div>
      )}

      {activeView === 'My Appointments' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0 }}>Upcoming Appointments</h3>
            <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>+ Book New</button>
          </div>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {appointments.map((apt, i) => (
              <div key={i} style={{ padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                  <div style={{ background: 'var(--brand-light)', color: 'var(--brand-primary)', padding: '1rem', borderRadius: '12px', textAlign: 'center', minWidth: '70px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>{apt.date.split(' ')[0]}</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{apt.date.split(' ')[1].replace(',', '')}</div>
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 0.25rem 0' }}>{apt.dr}</h3>
                    <div className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar size={14} /> {apt.date} at {apt.time}
                    </div>
                  </div>
                </div>
                <div style={{ padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontWeight: 'bold' }}>
                  {apt.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
