function TopNews() {
  const topNews = [
    {
      image: "https://ext.same-assets.com/2224353730/1861616789.jpeg",
      category: "Topics",
      date: "September 5, 2018",
      title: "The Best Moments of 2018 European Football",
      excerpt: "If you have missed a couple of games and want to stay up-to-date with the"
    },
    {
      image: "https://ext.same-assets.com/2224353730/1584228500.jpeg",
      category: "Topics",
      date: "September 4, 2018",
      title: "England's Top 10 Most Beautiful Stadiums",
      excerpt: "We take you on a trip through these top 10 most famous and beautiful stadiums"
    },
    {
      image: "https://ext.same-assets.com/2224353730/3539468968.jpeg",
      category: "Topics",
      date: "September 4, 2018",
      title: "The Players Who Changed Their Nationality",
      excerpt: "The fact that players change nationalities to play for other clubs is not a surprise"
    },
    {
      image: "https://ext.same-assets.com/2224353730/3584276754.jpeg",
      category: "Topics",
      date: "September 1, 2018",
      title: "Junior Football League Rules",
      excerpt: "We teach our small players to follow the rules, use time & space comprehension and"
    }
  ]

  return (
    <section className="mb-12">
      <div className="bg-slate-900 text-white p-4 mb-6">
        <h2 className="text-xl font-bold">TOP NEWS</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {topNews.map((article, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="h-48 overflow-hidden">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-4">
              <div className="flex items-center space-x-3 mb-2">
                <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold">
                  {article.category}
                </span>
                <span className="text-gray-500 text-xs">{article.date}</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-red-600 cursor-pointer transition-colors leading-tight">
                {article.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {article.excerpt}...
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default TopNews
