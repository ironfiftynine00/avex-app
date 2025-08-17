// Mock Exam Configuration based on category requirements
export const MOCK_EXAM_CONFIG = {
  "Air Law & Airworthiness": {
    questionCount: 30,
    skipsAllowed: 3,
    timeLimit: 30
  },
  "Aircraft Engineering": {
    questionCount: 30,
    skipsAllowed: 3,
    timeLimit: 30
  },
  "Aircraft Maintenance": {
    questionCount: 30,
    skipsAllowed: 3,
    timeLimit: 30
  },
  "Airframe Rating": {
    questionCount: 50,
    skipsAllowed: 5,
    timeLimit: null // No time limit specified
  },
  "Electronics Rating": {
    questionCount: 50,
    skipsAllowed: 5,
    timeLimit: null // No time limit specified
  },
  "Human Performance and Limitations": {
    questionCount: 30,
    skipsAllowed: 3,
    timeLimit: 30
  },
  "Natural Science & Aircraft General Knowledge": {
    questionCount: 30,
    skipsAllowed: 3,
    timeLimit: 30
  },
  "Powerplant Rating": {
    questionCount: 50,
    skipsAllowed: 5,
    timeLimit: 30
  }
};

export const CATEGORIES = [
  {
    id: 22,
    name: "Aircraft Maintenance",
    slug: "aircraft-maintenance",
    questionCount: 30,
    timeLimit: 30,
    skipsAllowed: 3,
    subtopics: [
      "Materials & Processes",
      "Ground Operation & Servicing",
      "Fluid Lines and Fittings",
      "Cleaning & Corrosion Control",
      "Maintenance Forms & Records",
      "Sheet Metal & Non-Metallic Structures",
      "Hydraulic & Pneumatic Power System",
      "Aircraft Fuel System",
      "Aircraft Landing Gear System",
      "Reciprocating Engines",
      "Turbine Engines",
      "Fuel Metering Systems",
      "Engine Fuel System",
      "Induction & Engine Airflow",
      "Engine Inspection",
      "Lubrication System",
      "Propellers",
      "Auxiliary Power Unit"
    ]
  },
  {
    id: 25,
    name: "Aircraft Engineering",
    slug: "aircraft-engineering",
    questionCount: 30,
    timeLimit: 30,
    skipsAllowed: 3,
    subtopics: [
      "Materials & Processes",
      "Fluid Lines & Fittings",
      "Aircraft Instrument System",
      "Sheet Metal & Non-Metallic Structures",
      "Welding",
      "Assembly & Rigging",
      "Wood Structures",
      "Aircraft Finishes",
      "Aircraft Electrical System",
      "Engine Electrical System",
      "Engine Inspection"
    ]
  },
  {
    id: 26,
    name: "Air Law & Airworthiness",
    slug: "air-law-airworthiness",
    questionCount: 30,
    timeLimit: 30,
    skipsAllowed: 3,
    subtopics: [
      "PCAR Part 1–8",
      "S/AFCAR/PCAR Files",
      "Airframe Inspection",
      "Maintenance Forms & Records",
      "Maintenance Publications",
      "Mechanic Privileges & Limitations"
    ]
  },
  {
    id: 23,
    name: "Powerplant Rating",
    slug: "powerplant-rating",
    questionCount: 50,
    timeLimit: 30,
    skipsAllowed: 5,
    subtopics: [
      "Reciprocating Engines",
      "Turbine Engines",
      "Engine Instrument Systems",
      "Ignition & Starting Systems",
      "Fuel Metering Systems"
    ]
  },
  {
    id: 27,
    name: "Human Performance and Limitations",
    slug: "human-performance",
    questionCount: 30,
    timeLimit: 30,
    skipsAllowed: 3,
    subtopics: [
      "Human Performance (OASIS)",
      "Mechanic Privileges & Limitations"
    ]
  },
  {
    id: 28,
    name: "Natural Science & Aircraft General Knowledge",
    slug: "natural-science",
    questionCount: 30,
    timeLimit: 30,
    skipsAllowed: 3,
    subtopics: [
      "Mathematics",
      "Basic Physics",
      "Materials & Processes"
    ]
  },
  {
    id: 24,
    name: "Airframe Rating",
    slug: "airframe-rating",
    questionCount: 50,
    timeLimit: null,
    skipsAllowed: 5,
    subtopics: [
      "Wood Structures",
      "Aircraft Finishes",
      "Sheet Metal & Non-Metallic Structures",
      "Assembly & Rigging",
      "Aircraft Landing Gear System",
      "Hydraulic & Pneumatic Power System",
      "Aircraft Fuel System",
      "Ice & Rain Control System",
      "Fire Protection System",
      "Aircraft Electrical System",
      "Engine Electrical System",
      "Position & Warning System"
    ]
  },
  {
    id: 29,
    name: "Electronics Rating",
    slug: "electronics-rating",
    questionCount: 50,
    timeLimit: null,
    skipsAllowed: 5,
    subtopics: [
      "Basic Electricity",
      "Hydraulic & Pneumatic Power System",
      "Cabin Atmosphere Control System",
      "Aircraft Instrument System",
      "Communications & Navigation Systems",
      "Aircraft Electrical System",
      "Position & Warning System",
      "Ice & Rain Control System",
      "Fire Protection System"
    ]
  }
];

export const BADGES = [
  {
    id: 1,
    name: "Rookie Wrencher",
    description: "Account created",
    icon: "fas fa-baby",
    condition: "create_account",
    gradient: "from-yellow-400 to-orange-500"
  },
  {
    id: 2,
    name: "Study Starter",
    description: "First practice session",
    icon: "fas fa-book",
    condition: "first_practice",
    gradient: "from-blue-500 to-purple-600"
  },
  {
    id: 3,
    name: "First Pass!",
    description: "First mock exam passed",
    icon: "fas fa-check",
    condition: "first_exam_pass",
    gradient: "from-green-500 to-teal-600"
  },
  {
    id: 4,
    name: "Air Law Ace",
    description: "Air Law category passed",
    icon: "fas fa-gavel",
    condition: "air_law_pass",
    gradient: "from-indigo-500 to-purple-600"
  },
  {
    id: 5,
    name: "Maintenance Pro",
    description: "All Aircraft Maintenance passed",
    icon: "fas fa-wrench",
    condition: "maintenance_complete",
    gradient: "from-orange-500 to-red-600"
  },
  {
    id: 6,
    name: "Consistent Cadet",
    description: "7-day streak",
    icon: "fas fa-fire",
    condition: "7_day_streak",
    gradient: "from-orange-500 to-red-600"
  },
  {
    id: 7,
    name: "Quiz Champion",
    description: "Win 3 battle quizzes",
    icon: "fas fa-trophy",
    condition: "battle_wins_3",
    gradient: "from-yellow-400 to-orange-500"
  },
  {
    id: 8,
    name: "Full License!",
    description: "All categories ≥70%",
    icon: "fas fa-crown",
    condition: "all_categories_pass",
    gradient: "from-purple-600 to-pink-600"
  }
];

export const POWER_UPS = [
  // Support Arsenal
  {
    id: "fifty_fifty",
    name: "FiftyFifty",
    description: "Remove 2 incorrect choices from current question",
    icon: "🔍",
    color: "blue",
    type: "support",
    rarity: "common"
  },
  {
    id: "extra_time",
    name: "ExtraTime",
    description: "Add 15 seconds to your current timer",
    icon: "➕",
    color: "indigo",
    type: "support",
    rarity: "common"
  },


  // Boost Arsenal (removed from system)
  // Defense Arsenal
  {
    id: "streak_protector",
    name: "StreakProtector",
    description: "Prevents next wrong answer from breaking your current streak",
    icon: "⭐",
    color: "pink",
    type: "defense",
    rarity: "uncommon"
  },
  {
    id: "second_chance",
    name: "SecondChance",
    description: "Allows retry of the last incorrect answer (same question, no point loss)",
    icon: "🔄",
    color: "yellow",
    type: "defense",
    rarity: "rare"
  }
];
