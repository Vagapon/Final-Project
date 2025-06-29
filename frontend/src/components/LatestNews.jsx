function LatestNews() {
  const news = [
    {
      image: "https://ext.same-assets.com/2224353730/4286451874.jpeg",
      category: "Training",
      date: "August 28, 2018",
      title: "The Most Effective Training Programs",
      excerpt: "If you are looking to upgrade your playing skills, or simply are interested in professional football, we compiled top training programs from famous coaches."
    },
    {
      image: "https://ext.same-assets.com/2224353730/478348599.jpeg",
      category: "Training",
      date: "August 24, 2018",
      title: "Football Tactics: Why Choose Any?",
      excerpt: "There are a few tactics that basically define the way any game develops. Learn how they work and see if you notice them in action."
    },
    {
      image: "https://ext.same-assets.com/2224353730/3588058919.jpeg",
      category: "Training",
      date: "August 20, 2018",
      title: "What's the Football Equipment for Athletes?",
      excerpt: "Training equipment is important for professional football training and sometimes it can be used for athletes' training as well."
    }
  ]

  const videoNews = [
    {
      image: "https://ext.same-assets.com/2224353730/3146420509.jpeg",
      date: "August 16, 2018",
      title: "Stunning Goals by Top Players"
    },
    {
      image: "https://ext.same-assets.com/2224353730/1761866362.jpeg",
      date: "August 12, 2018",
      title: "Female Players in the History of Football"
    },
    {
      image: "https://ext.same-assets.com/2224353730/83756052.jpeg",
      date: "August 8, 2018",
      title: "The Game that Knows No Limit"
    }
  ]

  return (
    <section className="mb-12">
      <div className="bg-slate-900 text-white p-4 mb-6">
        <h2 className="text-xl font-bold">LATEST NEWS</h2>
      </div>

      <div className="space-y-6">
        {news.map((article, index) => (
          <div key={index} className="flex bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="w-48 h-32 flex-shrink-0">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 p-6">
              <div className="flex items-center space-x-4 mb-2">
                <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  {article.category}
                </span>
                <span className="text-gray-500 text-sm">{article.date}</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-red-600 cursor-pointer transition-colors">
                {article.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {article.excerpt}
              </p>
            </div>
          </div>
        ))}

        {/* Video News Section */}
        <div className="bg-slate-800 p-6 rounded-lg">
          <div className="relative">
            <img
              src="https://ext.same-assets.com/2224353730/3146420509.jpeg"
              alt="Stunning Goals by Top Players"
              className="w-full h-64 object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
              <button className="bg-red-600 hover:bg-red-700 rounded-full p-4 transition-colors duration-300">
                <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </button>
            </div>
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <span className="bg-red-600 px-2 py-1 rounded text-xs font-semibold mb-2 inline-block">
                August 16, 2018
              </span>
              <h3 className="text-xl font-bold">STUNNING GOALS BY TOP PLAYERS</h3>
            </div>
          </div>
        </div>

        {/* Additional Video News */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {videoNews.slice(1).map((video, index) => (
            <div key={index} className="relative">
              <img
                src={video.image}
                alt={video.title}
                className="w-full h-32 object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black/40 rounded-lg"></div>
              <div className="absolute bottom-2 left-2 right-2 text-white">
                <span className="bg-red-600 px-2 py-1 rounded text-xs font-semibold mb-1 inline-block">
                  {video.date}
                </span>
                <h4 className="text-sm font-bold">{video.title}</h4>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default LatestNews
