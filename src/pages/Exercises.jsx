import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { Dumbbell, AlertTriangle, Sparkles, PlayCircle, List, Repeat } from 'lucide-react'

// Dummy Data translated from Android allExercises
const allExercises = [
  {
    name: "Diaphragmatic Breathing",
    durationSec: 300,
    reps: "5 minutes",
    category: "Relaxation",
    videoFile: "diaphragmatic_breathing.mp4",
    difficulty: { label: "Mild", color: "#4CAF50" },
    steps: ["Sit comfortably or lie down.", "Breathe in slowly through your nose for 4 seconds.", "Exhale gently through your mouth for 6 seconds.", "Relax your jaw and facial muscles.", "Repeat this cycle for 5 minutes."]
  },
  {
    name: "Warm Compress",
    durationSec: 1200,
    reps: "15-20 minutes",
    category: "Relaxation",
    videoFile: "warm_compress.mp4",
    difficulty: { label: "Mild", color: "#4CAF50" },
    steps: ["Prepare a warm, moist towel or heat pack.", "Apply it directly to your jaw and temple area.", "Keep it in place for 15-20 minutes.", "Repeat up to 3 times daily."]
  },
  {
    name: "Neck Side Stretch",
    durationSec: 120,
    reps: "3 reps each side",
    category: "Stretching",
    videoFile: "neck_side_stretch.mp4",
    difficulty: { label: "Mild", color: "#4CAF50" },
    steps: ["Tilt your right ear to your right shoulder.", "Hold the stretch for 20-30 seconds.", "Repeat on your left side.", "Complete 3 repetitions on each side."]
  },
  {
    name: "Controlled Mouth Opening",
    durationSec: 30,
    reps: "Hold 5 seconds",
    category: "Mobility",
    videoFile: "controlled_mouth_opening.mp4",
    difficulty: { label: "Mild", color: "#4CAF50" },
    steps: ["Place your tongue on the roof of your mouth.", "Slowly open your mouth as wide as is comfortable.", "Hold the open position for 5 seconds.", "Slowly close your mouth."]
  },
  {
    name: "Chin Tucks",
    durationSec: 30,
    reps: "Hold 5 seconds",
    category: "Mobility",
    videoFile: "chin_tucks.mp4",
    difficulty: { label: "Mild", color: "#4CAF50" },
    steps: ["Sit upright and look straight ahead.", "Gently pull your chin straight back to create a 'double chin' position.", "Hold the position for 5 seconds.", "Relax and repeat."]
  },
  {
    name: "Jaw Muscle Self-Massage",
    durationSec: 120,
    reps: "1-2 minutes each side",
    category: "Relaxation",
    videoFile: "jaw_muscle_self_massage.mp4",
    difficulty: { label: "Mild", color: "#4CAF50" },
    steps: ["Place your fingers on your masseter muscle (the cheek area over the jaw joint).", "Apply gentle, circular pressure.", "Massage for 1-2 minutes on each side.", "Avoid pressing too hard if it causes sharp pain."]
  },
  {
    name: "Resisted Opening",
    durationSec: 30,
    reps: "Hold 3-5 seconds",
    category: "Strengthening",
    videoFile: "resisted_opening.mp4",
    difficulty: { label: "Moderate", color: "#FF9800" },
    steps: ["Place your thumb under your chin.", "Push upward gently with your thumb.", "At the same time, try to open your mouth slowly.", "Hold the open position for 3-5 seconds."]
  },
  {
    name: "Resisted Closing",
    durationSec: 30,
    reps: "Hold 3-5 seconds",
    category: "Strengthening",
    videoFile: "resisted_closing.mp4",
    difficulty: { label: "Moderate", color: "#FF9800" },
    steps: ["Gently pinch your chin with your index finger and thumb.", "Apply slight downward pressure.", "Try to close your mouth slowly against this pressure.", "Hold for 3-5 seconds."]
  },
  {
    name: "Side-to-Side Movement",
    durationSec: 60,
    reps: "5 reps each side",
    category: "Mobility",
    videoFile: "side_by_side_movement.mp4",
    difficulty: { label: "Moderate", color: "#FF9800" },
    steps: ["Place a 1/4 inch folded cloth or popsicle sticks between your front teeth.", "Slowly move your jaw from the left to the right.", "Increase the thickness of the object between your teeth as mobility improves.", "Repeat 5 times on each side."]
  },
  {
    name: "Box Breathing",
    durationSec: 120,
    reps: "2 minutes",
    category: "Stress Relief",
    videoFile: "box_breathing.mp4",
    difficulty: { label: "Mild", color: "#4CAF50" },
    steps: ["Inhale slowly through your nose for 4 seconds.", "Hold your breath for 4 seconds.", "Exhale slowly through your mouth for 4 seconds.", "Hold again for 4 seconds.", "Repeat the cycle for 2 minutes."]
  },
  {
    name: "Guided Jaw Relaxation",
    durationSec: 60,
    reps: "1 minute",
    category: "Relaxation",
    videoFile: "guided_jaw_relaxation.mp4",
    difficulty: { label: "Mild", color: "#4CAF50" },
    steps: ["Sit comfortably and close your eyes.", "Relax your jaw muscles completely.", "Keep your teeth slightly apart.", "Let your tongue rest naturally in your mouth.", "Hold this relaxed position for 1 minute."]
  },
  {
    name: "Shoulder Rolls",
    durationSec: 60,
    reps: "1 minute",
    category: "Posture Relaxation",
    videoFile: "shoulder_rolls.mp4",
    difficulty: { label: "Mild", color: "#4CAF50" },
    steps: ["Sit or stand with your arms relaxed at your sides.", "Roll your shoulders forward in slow circles for 30 seconds.", "Reverse direction and roll backward for 30 seconds.", "Relax your neck and upper body throughout."]
  }
]

const categoryOrder = ["Relaxation", "Mobility", "Strengthening", "Stress Relief", "Stretching", "Posture Relaxation"]

const categoryColor = (category) => {
  switch (category) {
    case "Relaxation": return "#00897B"
    case "Mobility": return "#1565C0"
    case "Strengthening": return "#E65100"
    case "Stress Relief": return "#6A1B9A"
    case "Stretching": return "#2E7D32"
    case "Posture Relaxation": return "#00838F"
    default: return "#455A64"
  }
}

export default function Exercises() {
  const { user } = useAuth()
  const [painLevel, setPainLevel] = useState(5)
  const [stressLevel, setStressLevel] = useState(5)

  useEffect(() => {
    async function fetchLastRecord() {
      if (!user) return
      try {
        const data = await api.get('/pain') || []
        const sortedData = [...data].sort((a, b) => new Date(b.timestamp || b.created_at) - new Date(a.timestamp || a.created_at))

        if (sortedData && sortedData.length > 0) {
          setPainLevel(sortedData[0].pain_level ?? 5)
          setStressLevel(sortedData[0].stress_level ?? 5)
        }
      } catch (err) {
        console.error('Failed to fetch pain records', err)
      }
    }
    fetchLastRecord()
  }, [user])

  // Simple recommendation logic mimicking Android
  let recommendationMessage = "Based on your recent logs, here is a balanced exercise routine."
  if (painLevel >= 7) recommendationMessage = "Your pain is high. Stick to gentle relaxation and avoid strengthening exercises."
  else if (stressLevel >= 7) recommendationMessage = "Your stress is high. Focus on breathing and relaxation exercises today."

  const isHighRisk = painLevel >= 7 || stressLevel >= 7

  // Apply dynamic filtering based on pain and stress (from Android HealthRecommendationEngine)
  let filteredExercises = allExercises

  if (painLevel >= 7) {
    filteredExercises = allExercises.filter(e => 
      ["Relaxation", "Stress Relief"].includes(e.category) ||
      (e.category === "Mobility" && e.difficulty.label === "Mild")
    )
  } else if (painLevel >= 4) {
    filteredExercises = allExercises.filter(e => e.category !== "Strengthening")
  }

  // Group exercises
  const groupedExercises = categoryOrder.map(cat => ({
    category: cat,
    exercises: filteredExercises.filter(e => e.category === cat)
  })).filter(g => g.exercises.length > 0)

  return (
    <div style={{ padding: '0 1rem', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>Your Exercise Program</h1>
      </header>

      {/* Recommendation Card */}
      <div style={{
        backgroundColor: isHighRisk ? 'rgba(179, 38, 30, 0.1)' : 'rgba(0, 86, 210, 0.1)',
        borderRadius: '14px',
        padding: '1rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        {/* Icon placeholder for Warning/SelfImprovement/FitnessCenter */}
        <div style={{ color: painLevel >= 7 ? 'var(--error-color)' : 'var(--primary-color)' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.4 14.4 9.6 9.6"/><path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829z"/><path d="m21.5 21.5-1.4-1.4"/><path d="M3.9 3.9 2.5 2.5"/><path d="M6.404 2.768a2 2 0 1 1 2.829 2.829l1.768-1.767a2 2 0 1 1 2.828 2.829L7.465 13.023a2 2 0 1 1-2.829-2.829l1.768-1.767a2 2 0 1 1-2.829-2.829z"/></svg>
        </div>
        <div>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.25rem' }}>
            <span style={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Pain: {painLevel}/10</span>
            <span style={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Stress: {stressLevel}/10</span>
          </div>
          <p style={{ fontSize: '0.75rem', lineHeight: '1.2' }}>{recommendationMessage}</p>
        </div>
      </div>

      {groupedExercises.map(group => (
        <div key={group.category} style={{ marginBottom: '2rem' }}>
          {/* Category Header */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{
              backgroundColor: `${categoryColor(group.category)}1A`, // 10% opacity
              color: categoryColor(group.category),
              padding: '6px 14px',
              borderRadius: '20px',
              fontWeight: 'bold',
              fontSize: '0.8125rem'
            }}>
              {group.category}
            </div>
            <div style={{ flex: 1, height: '1px', backgroundColor: `${categoryColor(group.category)}33`, marginLeft: '10px' }} />
          </div>

          {/* Exercises */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {group.exercises.map(exercise => (
              <ExerciseCard key={exercise.name} exercise={exercise} user={user} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function ExerciseCard({ exercise, user }) {
  const [activeTab, setActiveTab] = useState(0) // 0: Video, 1: Step Guide
  const [timeLeft, setTimeLeft] = useState(exercise.durationSec)
  const [isRunning, setIsRunning] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  useEffect(() => {
    let interval = null
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => t - 1)
      }, 1000)
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false)
      handleComplete()
    }
    return () => clearInterval(interval)
  }, [isRunning, timeLeft])

  const handleComplete = async () => {
    if (isCompleted) return
    setIsCompleted(true)
    
    if (user) {
      try {
        const date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')
        const result = await api.post('/exercise', {
          exercise_name: exercise.name,
          duration_sec: exercise.durationSec,
          category: exercise.category,
          date: date,
          timestamp: Date.now()
        })
        if (result && result.error) throw new Error(result.error);
      } catch (err) {
        console.error(err)
        alert(`Error saving exercise: ${err.message}`)
      }
    }
  }

  return (
    <div className="glass-panel" style={{ padding: '1rem', border: '1px solid var(--surface-variant)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 'bold' }}>{exercise.name}</h3>
          {exercise.reps && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>
              <span>{exercise.reps}</span>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <span style={{
            backgroundColor: `${exercise.difficulty.color}26`,
            color: exercise.difficulty.color,
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '0.6875rem',
            fontWeight: 'bold'
          }}>
            {exercise.difficulty.label}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', backgroundColor: 'var(--surface-variant)', borderRadius: '10px', overflow: 'hidden', marginBottom: '1rem' }}>
        {['Watch Video', 'Step Guide'].map((tab, idx) => (
          <button
            key={tab}
            onClick={() => setActiveTab(idx)}
            style={{
              flex: 1,
              padding: '0.5rem',
              border: 'none',
              backgroundColor: activeTab === idx ? 'var(--primary-color)' : 'transparent',
              color: activeTab === idx ? '#fff' : 'var(--text-main)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              borderRadius: '10px',
              transition: 'background-color 0.2s'
            }}
          >
            {idx === 0 ? 
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
            : 
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>
            }
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ marginBottom: '1rem' }}>
        {activeTab === 0 ? (
          <div style={{ 
            aspectRatio: '16/9', 
            width: '100%',
            backgroundColor: '#000', 
            borderRadius: '12px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            overflow: 'hidden',
            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
          }}>
            {exercise.videoFile ? (
              <video 
                src={`/videos/${exercise.videoFile}`} 
                controls
                controlsList="nodownload"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            ) : (
              <span style={{ color: '#888' }}>No video available</span>
            )}
          </div>
        ) : (
          <div style={{ padding: '1rem', backgroundColor: 'var(--surface-variant)', borderRadius: '12px' }}>
            <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.875rem' }}>
              {exercise.steps.map((step, i) => <li key={i} style={{ marginBottom: '0.5rem' }}>{step}</li>)}
            </ul>
          </div>
        )}
      </div>

      {/* Progress & Controls */}
      {isCompleted ? (
        <div style={{ backgroundColor: 'rgba(76, 175, 80, 0.1)', color: '#4CAF50', padding: '0.75rem', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold', fontSize: '0.875rem' }}>
          Exercise Completed Successfully ✔️
        </div>
      ) : (
        <>
          <div style={{ height: '8px', backgroundColor: 'var(--surface-variant)', borderRadius: '4px', overflow: 'hidden', marginBottom: '1rem' }}>
            <div style={{ 
              height: '100%', 
              backgroundColor: 'var(--primary-color)', 
              width: `${(1 - timeLeft / exercise.durationSec) * 100}%`,
              transition: 'width 1s linear'
            }} />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{timeLeft}s</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setIsRunning(!isRunning)} style={{ padding: '0.5rem 1rem' }}>
                {isRunning ? 'Pause' : 'Start'}
              </button>
              <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem', border: '1px solid var(--border-color)' }} onClick={() => {
                setIsRunning(false)
                setTimeLeft(0)
                handleComplete()
              }}>
                Complete
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
