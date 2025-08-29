import React, { useState } from "react";
import { Trophy, Plus, Calendar } from "lucide-react";
import MatchOverview from "../MatchHome/MatchOverview";
import CreateMatch from "../MatchHome/NewMatch";
import MatchSchedule from "../MatchHome/MatchSchedule";

const Match = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    {
      id: "overview",
      label: "Tổng quan",
      icon: Trophy,
      component: MatchOverview,
    },
    {
      id: "create",
      label: "Tạo trận đấu",
      icon: Plus,
      component: CreateMatch,
    },
    {
      id: "schedule",
      label: "Quản lý trận đấu",
      icon: Calendar,
      component: MatchSchedule,
    },
  ];

  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component;

  return (
    <div className="min-h-screen  from-gray-100 via-white to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl md:text-2xl font-bold text-gray-700 dark:text-gray-200 mb-2 transition-colors duration-300">
            Quản lý trận đấu
          </h1>
        </div>

        {/* Navigation Tabs & Content */}
        <div className="bg-white/5 dark:bg-gray-800/10 backdrop-blur-sm rounded-2xl border border-white/10 dark:border-gray-700/20 overflow-hidden transition-colors duration-300">
          {/* Navigation Tabs */}
          <div className="bg-white/20 dark:bg-gray-700/40 border-b border-white/20 dark:border-gray-600/50 mx-6 transition-colors duration-300 backdrop-blur-sm hover:border-gray-200 dark:hover:border-gray-500 shadow-md dark:shadow-xl">
            <div className="flex">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
            flex items-center gap-2 px-6 py-4 transition-all duration-300 font-medium text-sm sm:text-base border-b-2 border-transparent relative
            ${
              activeTab === tab.id
                ? "text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400 bg-white dark:bg-gray-700 shadow-sm"
                : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/60 dark:hover:bg-gray-600/70"
            }
          `}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="whitespace-nowrap">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div>{ActiveComponent && <ActiveComponent />}</div>
        </div>
      </div>
    </div>
  );
};

export default Match;
