import { useState, useEffect } from 'react'

function NextMatch() {
  const [timeLeft, setTimeLeft] = useState({
    days: 308,
    hours: 5,
    minutes: 10,
    seconds: 25
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        let { days, hours, minutes, seconds } = prevTime

        if (seconds > 0) {
          seconds--
        } else if (minutes > 0) {
          minutes--
          seconds = 59
        } else if (hours > 0) {
          hours--
          minutes = 59
          seconds = 59
        } else if (days > 0) {
          days--
          hours = 23
          minutes = 59
          seconds = 59
        }

        return { days, hours, minutes, seconds }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="bg-white rounded-lg shadow-md mb-6">
      <div className="bg-slate-800 text-white p-4 rounded-t-lg">
        <h2 className="text-lg font-bold">NEXT MATCH</h2>
      </div>

      <div className="p-4 text-center">
        <div className="flex items-center justify-center space-x-4 mb-4">
          <img
            src="https://ext.same-assets.com/2224353730/2877012948.png"
            alt="FC Napoli"
            className="w-12 h-12"
          />
          <span className="text-sm font-medium">vs</span>
          <img
            src="https://ext.same-assets.com/2224353730/2642549229.png"
            alt="FC Manchester"
            className="w-12 h-12"
          />
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-2">Upcoming Match</h3>
        <p className="text-sm text-gray-600 mb-4">(On time)</p>

        <div className="text-red-600 font-semibold mb-4">March 28, 2026</div>

        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="bg-slate-800 text-white p-3 rounded">
            <div className="text-2xl font-bold">{timeLeft.days.toString().padStart(3, '0')}</div>
            <div className="text-xs">days</div>
          </div>
          <div className="bg-slate-800 text-white p-3 rounded">
            <div className="text-2xl font-bold">{timeLeft.hours.toString().padStart(2, '0')}</div>
            <div className="text-xs">hrs</div>
          </div>
          <div className="bg-slate-800 text-white p-3 rounded">
            <div className="text-2xl font-bold">{timeLeft.minutes.toString().padStart(2, '0')}</div>
            <div className="text-xs">mins</div>
          </div>
          <div className="bg-slate-800 text-white p-3 rounded">
            <div className="text-2xl font-bold">{timeLeft.seconds.toString().padStart(2, '0')}</div>
            <div className="text-xs">secs</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NextMatch
