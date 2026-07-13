import { useState } from 'react'
import { HelpCircle, ChevronDown } from 'lucide-react'

const faqs = [
  { q: 'What exercises are best for acute jaw pain?', a: 'Gentle stretching and resting the jaw are best. Avoid chewing hard foods.' },
  { q: 'How often should I use the pain tracker?', a: 'We recommend logging your pain at least once a day, preferably at the same time.' },
  { q: 'Can stress cause TMJ flare-ups?', a: 'Yes, stress often leads to clenching or grinding teeth, which exacerbates TMJ pain.' }
]

export default function Support() {
  const [openFaq, setOpenFaq] = useState(null)

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0 }}>Support Center</h1>
          <p className="text-secondary" style={{ margin: '0.25rem 0 0 0' }}>
            Get answers to common questions.
          </p>
        </div>
      </div>

      <div className="card">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <HelpCircle size={22} color="var(--brand-primary)" />
            Frequently Asked Questions
          </h3>
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
            <a href="mailto:ganeshabburi97@gmail.com" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>Contact Support</a>
          </div>
        </div>
    </div>
  )
}
