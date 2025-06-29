import { useState, useEffect } from 'react'

function Hero() {
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
    <section
      className="relative h-[600px] bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1508098682722-e99c43a406b2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`
      }}
    >
      {/* Football and stadium decorative elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-32 h-32 rounded-full border-2 border-white transform rotate-45"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 rounded-full border border-white"></div>
        <div className="absolute top-1/2 left-1/3 w-16 h-16">
          <div className="w-full h-full rounded-full border-4 border-white/50 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-white/30"></div>
          </div>
        </div>
        {/* Football pattern */}
        <div className="absolute top-10 right-1/3 w-20 h-20 border-2 border-white/30 rounded-full transform rotate-12"></div>
        <div className="absolute bottom-32 left-1/4 w-12 h-12 border border-white/20 rounded-full"></div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-transparent"></div>

      <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight text-shadow">
            FC UNITED FEDERATION
            <br />
            <span className="text-2xl md:text-3xl font-normal">INFO AND UPDATES</span>
          </h1>

          <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-md font-semibold transition-colors duration-300 mb-8">
            Read More
          </button>
        </div>

        {/* Next Match Countdown */}
        <div className="absolute top-8 right-8 text-right text-white">
          <div className="text-sm mb-2 opacity-80">NEXT MATCH</div>
          <div className="text-lg font-semibold mb-2">vs Bluebirds FC</div>

          <div className="flex space-x-4 text-center">
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-3 min-w-[60px]">
              <div className="text-2xl font-bold">{timeLeft.days.toString().padStart(3, '0')}</div>
              <div className="text-xs opacity-80">Days</div>
            </div>
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-3 min-w-[60px]">
              <div className="text-2xl font-bold">{timeLeft.hours.toString().padStart(2, '0')}</div>
              <div className="text-xs opacity-80">Hrs</div>
            </div>
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-3 min-w-[60px]">
              <div className="text-2xl font-bold">{timeLeft.minutes.toString().padStart(2, '0')}</div>
              <div className="text-xs opacity-80">Mins</div>
            </div>
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-3 min-w-[60px]">
              <div className="text-2xl font-bold">{timeLeft.seconds.toString().padStart(2, '0')}</div>
              <div className="text-xs opacity-80">Secs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative football elements */}
      <div className="absolute bottom-10 left-10 opacity-20">
        <div className="w-20 h-20 rounded-full border-4 border-white/30 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/10"></div>
        </div>
      </div>

      <div className="absolute top-20 left-1/3 opacity-10">
        <div className="w-32 h-32 rounded-full border-2 border-white/20"></div>
      </div>
    </section>
  )
}

export default Hero
