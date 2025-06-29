import React, { useState } from "react";
import { Trophy, Plus, Calendar } from "lucide-react";
import MatchOverview from "./MatchHome/MatchOverview";
import CreateMatch from "./MatchHome/NewMatch";
import MatchSchedule from "./MatchHome/MatchSchedule";

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
    <div className="min-h-screen bg-white-to-br from-gray-100 via-white to-gray-200">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl md:text-4xl font-bold text-gray-700 mb-2">
            Quản lý trận đấu
          </h1>
        </div>

        {/* Navigation Tabs & Content */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
          {/* Navigation Tabs */}
          <div className="bg-white/10 border-b border-white/10 mx-6">
            <div className="flex">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
    flex items-center gap-2 px-6 py-4
    transition-all duration-300 font-medium text-sm sm:text-base
    border-b-2 border-transparent
    ${
      activeTab === tab.id
        ? "text-blue-600 border-blue-600 bg-white"
        : "text-gray-700 hover:text-blue-600 hover:bg-gray-100"
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
