function Sponsors() {
  const sponsors = [
    {
      name: "Football",
      logo: "https://ext.same-assets.com/2224353730/3414874374.png"
    },
    {
      name: "Premier League",
      logo: "https://ext.same-assets.com/2224353730/2012321030.png"
    },
    {
      name: "Football Club",
      logo: "https://ext.same-assets.com/2224353730/755111312.png"
    },
    {
      name: "Football League",
      logo: "https://ext.same-assets.com/2224353730/3081030972.png"
    },
    {
      name: "Tournament",
      logo: "https://ext.same-assets.com/2224353730/473975703.png"
    },
    {
      name: "Champions",
      logo: "https://ext.same-assets.com/2224353730/3547537802.png"
    }
  ]

  return (
    <section className="bg-slate-800 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <div className="bg-slate-900 text-white p-4 inline-block">
            <h2 className="text-lg font-bold">SPONSOR</h2>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
          {sponsors.map((sponsor, index) => (
            <div key={index} className="flex justify-center">
              <img
                src={sponsor.logo}
                alt={sponsor.name}
                className="h-16 w-auto opacity-70 hover:opacity-100 transition-opacity duration-300 filter grayscale hover:grayscale-0"
              />
            </div>
          ))}
        </div>

        {/* Instagram Section */}
        <div className="mt-12">
          <div className="bg-slate-900 text-white p-4 mb-6 inline-block">
            <h2 className="text-lg font-bold">INSTAGRAM</h2>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {[
              "https://ext.same-assets.com/2224353730/2991065860.jpeg",
              "https://ext.same-assets.com/2224353730/2114759219.jpeg",
              "https://ext.same-assets.com/2224353730/3934094741.jpeg",
              "https://ext.same-assets.com/2224353730/3662326560.jpeg",
              "https://ext.same-assets.com/2224353730/1323114998.jpeg",
              "https://ext.same-assets.com/2224353730/2752180119.jpeg"
            ].map((image, index) => (
              <div key={index} className="aspect-square overflow-hidden rounded-lg hover:scale-105 transition-transform duration-300 cursor-pointer">
                <img
                  src={image}
                  alt={`Instagram post ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Sponsors
