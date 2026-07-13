import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { Lightbulb, Save, Check } from 'lucide-react'

const SvgRegion = ({ id, pathD, selectedRegions, hoveredRegion, painLevel, toggleRegion, setHoveredRegion }) => {
  const isSelected = selectedRegions.has(id)
  const isHovered = hoveredRegion === id

  const getRegionColor = (isSelected, isHovered, painLvl) => {
    if (isSelected) {
      if (painLvl <= 3) return 'rgba(16, 185, 129, 0.6)' // Green
      if (painLvl <= 6) return 'rgba(245, 158, 11, 0.6)' // Amber
      return 'rgba(239, 68, 68, 0.7)' // Red
    }
    if (isHovered) return 'rgba(37, 99, 235, 0.2)' // Brand Blue Hover
    return 'transparent'
  }

  return (
    <path 
      d={pathD}
      fill={getRegionColor(isSelected, isHovered, painLevel)}
      stroke={isSelected ? (painLevel > 6 ? '#B91C1C' : (painLevel > 3 ? '#B45309' : '#047857')) : 'var(--brand-primary)'}
      strokeWidth={isSelected || isHovered ? "2.5" : "1.5"}
      onClick={() => toggleRegion(id)}
      onMouseEnter={() => setHoveredRegion(id)}
      onMouseLeave={() => setHoveredRegion(null)}
      style={{ cursor: 'pointer', transition: 'all 0.2s ease', opacity: (isSelected || isHovered) ? 1 : 0.4 }}
    />
  )
}

export default function PainMap() {
  const { user } = useAuth()
  
  const [selectedRegions, setSelectedRegions] = useState(new Set(['Left Jaw']))
  const [painLevel, setPainLevel] = useState(5)
  const [stressLevel, setStressLevel] = useState(5)
  const [suggestedRegion, setSuggestedRegion] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [hoveredRegion, setHoveredRegion] = useState(null)

  const regions = ["Head", "Left Ear", "Right Ear", "Left Jaw", "Right Jaw", "Chin", "Neck"]

  useEffect(() => {
    async function fetchLastRecord() {
      if (!user) return
      try {
        const data = await api.get('/pain') || []
        const sortedData = [...data].sort((a, b) => new Date(b.timestamp || b.created_at) - new Date(a.timestamp || a.created_at))

        if (sortedData && sortedData.length > 0) {
          const lastRecord = sortedData[0]
          if (lastRecord.location) {
            const locs = lastRecord.location.split(',').map(l => l.trim())
            setSuggestedRegion(locs[0])
          }
        }
      } catch (err) {
        console.error('Failed to fetch last record', err)
      }
    }
    fetchLastRecord()
  }, [user])

  const toggleRegion = (region) => {
    const newRegions = new Set(selectedRegions)
    if (newRegions.has(region)) newRegions.delete(region)
    else newRegions.add(region)
    setSelectedRegions(newRegions)
  }

  const handleSave = async () => {
    if (!user) return
    if (selectedRegions.size === 0) {
      setMessage({ type: 'error', text: 'Please select at least one region.' })
      return
    }
    
    setLoading(true)
    setMessage(null)

    const date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')
    const timestamp = Date.now()

    const newRecord = {
      user_id: user.id,
      date: date,
      pain_level: parseInt(painLevel),
      stress_level: parseInt(stressLevel),
      location: Array.from(selectedRegions).join(', '),
      type: 'Map Log',
      timestamp: timestamp
    }

    try {
      const result = await api.post('/pain', newRecord)
      if (result && result.error) throw new Error(result.error)
      const successText = `Pain level ${painLevel}/10 saved successfully.`
      setMessage({ type: 'success', text: successText })
      alert(successText)
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>Map Your Pain</h1>
          <p className="text-secondary">Select regions on the anatomical model to log discomfort.</p>
        </div>
      </header>

      {message && (
        <div style={{ 
          padding: '1rem', marginBottom: '1.5rem', borderRadius: '8px', 
          backgroundColor: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          color: message.type === 'success' ? 'var(--accent-green)' : 'var(--accent-red)',
          borderLeft: `4px solid ${message.type === 'success' ? 'var(--accent-green)' : 'var(--accent-red)'}`
        }}>
          {message.text}
        </div>
      )}

      <div className="dashboard-grid">
        
        {/* Anatomical Model */}
        <div className="card col-span-7" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'var(--surface-hover)' }}>
          
          <div style={{ position: 'relative', width: '300px', height: '400px' }}>
            {/* Tooltip */}
            {hoveredRegion && (
              <div style={{ 
                position: 'absolute', top: '10px', right: '10px', padding: '0.5rem 1rem',
                backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)', 
                borderRadius: '8px', fontSize: '0.875rem', fontWeight: 'bold', zIndex: 10
              }}>
                {hoveredRegion}
              </div>
            )}

            <svg viewBox="0 0 200 250" style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}>
              {/* Base Head Outline - Just for structural context, not clickable */}
              <path d="M 100 20 C 40 20 40 120 40 160 C 40 190 70 230 100 230 C 130 230 160 190 160 160 C 160 120 160 20 100 20 Z" fill="var(--bg-secondary)" stroke="var(--surface-border)" strokeWidth="2" />
              
              {/* Head / Forehead */}
              <SvgRegion id="Head" pathD="M 100 20 C 40 20 45 80 50 100 C 70 110 130 110 150 100 C 155 80 160 20 100 20 Z" selectedRegions={selectedRegions} hoveredRegion={hoveredRegion} painLevel={painLevel} toggleRegion={toggleRegion} setHoveredRegion={setHoveredRegion} />
              
              {/* Ears */}
              <SvgRegion id="Left Ear" pathD="M 40 110 C 25 110 25 150 40 150 C 45 130 45 120 40 110 Z" selectedRegions={selectedRegions} hoveredRegion={hoveredRegion} painLevel={painLevel} toggleRegion={toggleRegion} setHoveredRegion={setHoveredRegion} />
              <SvgRegion id="Right Ear" pathD="M 160 110 C 175 110 175 150 160 150 C 155 130 155 120 160 110 Z" selectedRegions={selectedRegions} hoveredRegion={hoveredRegion} painLevel={painLevel} toggleRegion={toggleRegion} setHoveredRegion={setHoveredRegion} />
              
              {/* Jaws (Masseter / TMJ region) */}
              <SvgRegion id="Left Jaw" pathD="M 45 120 C 35 150 50 190 75 210 C 80 180 70 130 45 120 Z" selectedRegions={selectedRegions} hoveredRegion={hoveredRegion} painLevel={painLevel} toggleRegion={toggleRegion} setHoveredRegion={setHoveredRegion} />
              <SvgRegion id="Right Jaw" pathD="M 155 120 C 165 150 150 190 125 210 C 120 180 130 130 155 120 Z" selectedRegions={selectedRegions} hoveredRegion={hoveredRegion} painLevel={painLevel} toggleRegion={toggleRegion} setHoveredRegion={setHoveredRegion} />
              
              {/* Chin */}
              <SvgRegion id="Chin" pathD="M 75 210 C 90 235 110 235 125 210 C 110 195 90 195 75 210 Z" selectedRegions={selectedRegions} hoveredRegion={hoveredRegion} painLevel={painLevel} toggleRegion={toggleRegion} setHoveredRegion={setHoveredRegion} />
              
              {/* Neck */}
              <SvgRegion id="Neck" pathD="M 70 220 C 70 250 50 250 50 250 L 150 250 C 150 250 130 250 130 220 C 110 240 90 240 70 220 Z" selectedRegions={selectedRegions} hoveredRegion={hoveredRegion} painLevel={painLevel} toggleRegion={toggleRegion} setHoveredRegion={setHoveredRegion} />
            </svg>
          </div>
        </div>

        {/* Controls */}
        <div className="card col-span-5" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Quick Selection */}
          <div>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Selected Regions</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {regions.map(region => {
                const isSelected = selectedRegions.has(region)
                return (
                  <button
                    key={region}
                    onClick={() => toggleRegion(region)}
                    className={isSelected ? "btn btn-primary" : "btn btn-outline"}
                    style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', borderRadius: '24px' }}
                  >
                    {isSelected && <Check size={16} />}
                    {region}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Sliders */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 600 }}>Pain Intensity</span>
              <span style={{ fontWeight: 'bold', color: painLevel > 6 ? 'var(--accent-red)' : 'var(--brand-primary)' }}>{painLevel}/10</span>
            </div>
            <input 
              type="range" min="0" max="10" value={painLevel} 
              onChange={(e) => setPainLevel(e.target.value)}
              style={{ width: '100%', accentColor: painLevel > 6 ? 'var(--accent-red)' : 'var(--brand-primary)', marginBottom: '0.25rem' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <span>None</span>
              <span>Severe</span>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 600 }}>Stress Level</span>
              <span style={{ fontWeight: 'bold', color: 'var(--accent-orange)' }}>{stressLevel}/10</span>
            </div>
            <input 
              type="range" min="0" max="10" value={stressLevel} 
              onChange={(e) => setStressLevel(e.target.value)}
              style={{ width: '100%', accentColor: 'var(--accent-orange)', marginBottom: '0.25rem' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <span>Low</span>
              <span>High</span>
            </div>
          </div>

          {suggestedRegion && (
            <div style={{ backgroundColor: 'var(--brand-light)', padding: '1rem', borderRadius: '8px', display: 'flex', gap: '0.5rem', color: 'var(--brand-primary)' }}>
              <Lightbulb size={18} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '0.875rem' }}>Based on recent logs, your <strong>{suggestedRegion}</strong> is frequently affected.</span>
            </div>
          )}

          <button className="btn btn-primary" onClick={handleSave} disabled={loading} style={{ width: '100%', padding: '1rem', marginTop: 'auto' }}>
            <Save size={20} />
            {loading ? 'Saving Protocol...' : 'Save Clinical Log'}
          </button>
        </div>

      </div>
    </div>
  )
}
