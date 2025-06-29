function PremierLeague() {
  const standings = [
    { pos: 1, club: "FC United", w: 29, d: 4, l: 2, pts: 50 },
    { pos: 2, club: "FC Manchester", w: 25, d: 4, l: 2, pts: 50 },
    { pos: 2, club: "West Ham United", w: 23, d: 4, l: 2, pts: 50 },
    { pos: 4, club: "Blackburn", w: 26, d: 4, l: 2, pts: 50 },
    { pos: 5, club: "Tottenham", w: 24, d: 4, l: 2, pts: 45 },
    { pos: 6, club: "Feyenoord", w: 24, d: 4, l: 2, pts: 45 },
    { pos: 7, club: "FC Napoli", w: 27, d: 4, l: 2, pts: 45 }
  ]

  return (
    <div className="bg-white rounded-lg shadow-md mb-6">
      <div className="bg-slate-800 text-white p-4 rounded-t-lg">
        <h2 className="text-lg font-bold">PREMIER LEAGUE</h2>
      </div>

      <div className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-gray-600 font-semibold">POS</th>
                <th className="text-left py-2 text-gray-600 font-semibold">CLUB</th>
                <th className="text-center py-2 text-gray-600 font-semibold">W</th>
                <th className="text-center py-2 text-gray-600 font-semibold">D</th>
                <th className="text-center py-2 text-gray-600 font-semibold">L</th>
                <th className="text-center py-2 text-gray-600 font-semibold">PTS</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((team, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 font-semibold text-gray-900">{team.pos}</td>
                  <td className="py-3">
                    <span className="text-blue-600 hover:text-blue-800 cursor-pointer font-medium">
                      {team.club}
                    </span>
                  </td>
                  <td className="text-center py-3 text-gray-700">{team.w}</td>
                  <td className="text-center py-3 text-gray-700">{team.d}</td>
                  <td className="text-center py-3 text-gray-700">{team.l}</td>
                  <td className="text-center py-3 font-semibold text-gray-900">{team.pts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4">
          <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded font-semibold transition-colors duration-300">
            View full table
          </button>
        </div>
      </div>
    </div>
  )
}

export default PremierLeague
