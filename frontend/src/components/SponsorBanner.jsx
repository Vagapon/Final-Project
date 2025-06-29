function SponsorBanner() {
  return (
    <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
      <div className="bg-slate-800 text-white p-4 rounded-t-lg">
        <h2 className="text-lg font-bold">SPONSOR</h2>
      </div>

      <div className="p-0">
        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
            alt="The National League"
            className="w-full h-64 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent">
            <div className="absolute bottom-4 left-4 text-white">
              <h3 className="text-2xl font-bold mb-2">THE NATIONAL LEAGUE</h3>
              <p className="text-sm opacity-90">Official Sponsor</p>
            </div>
          </div>
          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <button className="bg-red-600 hover:bg-red-700 rounded-full p-4 transform hover:scale-110 transition-all duration-300 shadow-lg">
              <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SponsorBanner
