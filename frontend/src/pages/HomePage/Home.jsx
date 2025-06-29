import React from "react";
// import Hero from "../../components/homelayout/Hero";
import MatchResults from "./MatchResults";
// // import LatestNews from "./TeamLogos";
// import PremierLeague from "./PremierLeague";
// import NextMatch from "./NextMatch";
// import GoalStats from "./GoalStats";
// import TopNews from "./TopNews";
// import SponsorBanner from "./SponsorBanner";
import Contact from "./Contact";
import Sponsors from "./Sponsors";
// import Footer from "../../components/homelayout/Footer";
import TeamLogos from "./TeamLogos";

function Home() {
  return (
    <div className="bg-black-100 min-h-screen text-gray-900">
      {/* <Home pages /> */}
      {/* <Hero /> */}
      <MatchResults />
      <Sponsors />
      <TeamLogos />
      <Contact/>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* <LatestNews /> */}
            {/* <TopNews /> */}
          </div>
          <div className="lg:col-span-1">
            {/* <PremierLeague />
            <NextMatch />
            <SponsorBanner /> */}
          </div>
        </div>
      </div>
      {/* <GoalStats /> */}
{/* 
      <Footer /> */}
    </div>
  );
}

export default Home;
