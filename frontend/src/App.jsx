import Header from './components/Header'
import Hero from './components/Hero'
import MatchResults from './components/MatchResults'
import LatestNews from './components/LatestNews'
import PremierLeague from './components/PremierLeague'
import NextMatch from './components/NextMatch'
import GoalStats from './components/GoalStats'
import TopNews from './components/TopNews'
import SponsorBanner from './components/SponsorBanner'
import Sponsors from './components/Sponsors'
import Footer from './components/Footer'

function App() {
  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      <Hero />
      <MatchResults />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <LatestNews />
            <TopNews />
          </div>
          <div className="lg:col-span-1">
            <PremierLeague />
            <NextMatch />
            <GoalStats />
            <SponsorBanner />
          </div>
        </div>
      </div>

      <Sponsors />
      <Footer />
    </div>
  )
}

export default App
