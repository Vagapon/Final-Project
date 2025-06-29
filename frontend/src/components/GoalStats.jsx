function GoalStats() {
  const players = [
    { name: "Mark Lawrence", goals: 4, assists: 4 },
    { name: "Nick Walker", goals: 3, assists: 1 },
    { name: "Geff Barker", goals: 3, assists: 5 },
    { name: "Robert Thompson", goals: 2, assists: 1 },
    { name: "John Moore", goals: 2, assists: 2 },
    { name: "Tim Cole", goals: 1, assists: 1 },
    { name: "Justin Lewis", goals: 1, assists: 1 },
    { name: "Sean Matthews", goals: 1, assists: 0 }
  ]

  return (
    <div className="bg-white rounded-lg shadow-md mb-6">
      <div className="bg-slate-800 text-white p-4 rounded-t-lg">
        <h2 className="text-lg font-bold">GOALS STATS</h2>
      </div>

      <div className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-gray-600 font-semibold">PLAYER</th>
                <th className="text-center py-2 text-gray-600 font-semibold">GOALS</th>
                <th className="text-center py-2 text-gray-600 font-semibold">ASSISTS</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3">
                    <span className="text-blue-600 hover:text-blue-800 cursor-pointer font-medium">
                      {player.name}
                    </span>
                  </td>
                  <td className="text-center py-3 font-semibold text-gray-900">{player.goals}</td>
                  <td className="text-center py-3 font-semibold text-gray-900">{player.assists}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default GoalStats
