function MatchResults() {
  const matches = [
    {
      date: "July 18, 2018",
      title: "Second Match",
      homeTeam: {
        name: "FC United",
        logo: "https://ext.same-assets.com/2224353730/163332264.png"
      },
      awayTeam: {
        name: "Feyenoord",
        logo: "https://ext.same-assets.com/2224353730/157028534.png"
      },
      score: "1 - 1",
      league: "Premier League"
    },
    {
      date: "July 11, 2018",
      title: "First Match",
      homeTeam: {
        name: "FC United",
        logo: "https://ext.same-assets.com/2224353730/163332264.png"
      },
      awayTeam: {
        name: "FC Manchester",
        logo: "https://ext.same-assets.com/2224353730/2642549229.png"
      },
      score: "3 - 1",
      league: "Premier League"
    },
    {
      date: "July 25, 2018",
      title: "Third Match",
      homeTeam: {
        name: "FC United",
        logo: "https://ext.same-assets.com/2224353730/163332264.png"
      },
      awayTeam: {
        name: "FC Napoli",
        logo: "https://ext.same-assets.com/2224353730/2877012948.png"
      },
      score: "2 - 3",
      league: "Premier League"
    }
  ]

  return (
    <section className="bg-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {matches.map((match, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="p-6">
                <div className="text-sm text-gray-500 mb-4">{match.date}</div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={match.homeTeam.logo}
                      alt={match.homeTeam.name}
                      className="w-8 h-8"
                    />
                    <span className="font-medium text-sm">{match.homeTeam.name}</span>
                  </div>

                  <div className="text-xl font-bold text-gray-900">
                    {match.score}
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-sm">{match.awayTeam.name}</span>
                    <img
                      src={match.awayTeam.logo}
                      alt={match.awayTeam.name}
                      className="w-8 h-8"
                    />
                  </div>
                </div>

                <div className="text-xs text-gray-400 text-center mb-2">
                  {match.league}
                </div>

                <h4 className="text-sm font-semibold text-center text-gray-800 hover:text-red-600 cursor-pointer transition-colors">
                  {match.title}
                </h4>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default MatchResults
