'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import type { ChartData, ChartOptions } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

interface Tournament {
  name: string
  dates: string
  cost: string
  strategy: string
  legacy: string
  takeaway: string
}

const tournamentData: Record<string, Tournament> = {
  "1990": {
    name: "Italy 1990",
    dates: "June 8 – July 8, 1990",
    cost: "~$4.0 Billion",
    strategy: "Stadium Modernization",
    legacy: "Italy invested heavily to modernize stadiums, initially budgeting $2B but ultimately spending double. Marked the beginning of hyper-commercialized tournaments.",
    takeaway: "Significant national debt contribution but created the first modern 'event' template."
  },
  "1994": {
    name: "United States 1994",
    dates: "June 17 – July 17, 1994",
    cost: "~$500 Million",
    strategy: "Existing Infrastructure",
    legacy: "The blueprint for commercial efficiency. Spent virtually nothing on new stadiums. Birthed Major League Soccer (MLS) in 1996.",
    takeaway: "Broke attendance records (3.59M fans) and yielded $623M for LA alone."
  },
  "2002": {
    name: "Japan / South Korea 2002",
    dates: "May 31 – June 30, 2002",
    cost: "~$7.0 Billion",
    strategy: "Stadium Building Race",
    legacy: "First Asian tournament. South Korea built 10 new venues; Japan built/refurbished 10. Many became 'white elephants' post-tournament.",
    takeaway: "High maintenance costs left regional economic burdens for decades."
  },
  "2006": {
    name: "Germany 2006",
    dates: "June 9 – July 9, 2006",
    cost: "~$4.3 Billion",
    strategy: "Sustainable Integration",
    legacy: "Highly successful modernization. Stadiums were immediately reintegrated into the Bundesliga, ensuring long-term profitability.",
    takeaway: "Generated $900M in net national tourism income."
  },
  "2010": {
    name: "South Africa 2010",
    dates: "June 11 – July 11, 2010",
    cost: "~$3.6 - $7.2 Billion",
    strategy: "Development Catalyst",
    legacy: "Vital milestone for Africa. Half of the expected tourists arrived, and national growth slowed during the event period.",
    takeaway: "Left a legacy of modernized public transport but low direct financial return."
  },
  "2014": {
    name: "Brazil 2014",
    dates: "June 12 – July 13, 2014",
    cost: "~$15.0 - $19.7 Billion",
    strategy: "Public Expenditure",
    legacy: "A cautionary tale. Stadiums built in remote locations like Manaus lacked domestic clubs to fill them later, leading to huge losses.",
    takeaway: "Sparked massive domestic protests over misallocated public funds."
  },
  "2018": {
    name: "Russia 2018",
    dates: "June 14 – July 15, 2018",
    cost: "~$11.6 - $16.0 Billion",
    strategy: "Geopolitical Branding",
    legacy: "Massive investment in transport and airport terminals. World Bank noted a temporary lift, but growth stagnated shortly after.",
    takeaway: "Underscored the fleeting nature of mega-event economic stimuli."
  },
  "2022": {
    name: "Qatar 2022",
    dates: "Nov 20 – Dec 18, 2022",
    cost: "~$200.0 - $220.0 Billion",
    strategy: "Nation Building",
    legacy: "Extreme anomaly. Qatar built entire cities, metros, and airports. Short-term return from visitor spending was just 2% of total investment.",
    takeaway: "The most expensive sports event in human history."
  },
  "2026": {
    name: "North America 2026",
    dates: "June 11 – July 19, 2026",
    cost: "~$3.76 Billion (Operational)",
    strategy: "Asset-Light Model",
    legacy: "Uses existing NFL/MLS stadiums. While operational costs are low for FIFA, cities like Vancouver have seen public costs triple.",
    takeaway: "Expected to generate $17.2B in economic activity for the USA."
  }
}

const revenueData = {
  labels: ['1999-02', '2003-06', '2007-10', '2011-14', '2015-18', '2019-22', '2023-26 (Bud.)'],
  values: [2.20, 3.23, 4.19, 5.72, 6.42, 7.57, 13.00]
}

export default function FifaInteractive() {
  const [activeYear, setActiveYear] = useState<string>("1994")
  const [fade, setFade] = useState(true)

  const handleYearChange = (year: string) => {
    if (year === activeYear) return
    setFade(false)
    setTimeout(() => {
      setActiveYear(year)
      setFade(true)
    }, 200)
  }

  const chartData: ChartData<'bar'> = {
    labels: revenueData.labels,
    datasets: [{
      label: 'Total Cycle Revenue (Billions USD)',
      data: revenueData.values,
      backgroundColor: revenueData.labels.map((_, i) => 
        i === 6 ? '#166534' : '#d1d5db'
      ),
      borderRadius: 8,
      hoverBackgroundColor: '#854d0e'
    }]
  }

  const chartOptions: ChartOptions<'bar'> = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `$${context.parsed.y} Billion`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(243, 244, 246, 0.6)' },
        ticks: { 
          callback: value => '$' + value + 'B',
          font: { size: 10 }
        }
      },
      x: { 
        grid: { display: false },
        ticks: { font: { size: 10 } }
      }
    }
  }

  const activeData = tournamentData[activeYear]

  return (
    <div className="not-prose space-y-20 my-12">
      
      {/* Overview Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white dark:bg-gray-900 border border-stone-100 dark:border-gray-800 rounded-2xl shadow-sm">
          <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest mb-1">Projected Revenue</p>
          <p className="text-3xl font-bold text-green-700 dark:text-green-500">$13.0B</p>
          <p className="text-xs text-stone-500 mt-2">2023–2026 Cycle</p>
        </div>
        <div className="p-6 bg-white dark:bg-gray-900 border border-stone-100 dark:border-gray-800 rounded-2xl shadow-sm">
          <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest mb-1">Broadcasting Rights</p>
          <p className="text-3xl font-bold text-blue-700 dark:text-blue-500">$4.26B</p>
          <p className="text-xs text-stone-500 mt-2">Main revenue driver for 2026</p>
        </div>
        <div className="p-6 bg-white dark:bg-gray-900 border border-stone-100 dark:border-gray-800 rounded-2xl shadow-sm">
          <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest mb-1">Champion's Prize</p>
          <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-500">$50.0M</p>
          <p className="text-xs text-stone-500 mt-2">Highest payout in history</p>
        </div>
      </section>

      {/* Revenue Chart Section */}
      <section id="earnings" className="pt-12 border-t border-stone-100 dark:border-gray-800">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold mb-4 font-serif dark:text-white">The Revenue Explosion</h2>
          <p className="text-stone-600 dark:text-gray-400 max-w-2xl mx-auto text-sm leading-relaxed">
            FIFA operates on a four-year financial heartbeat. In the early 2000s, revenue sat at just over $2 billion. Today, that number has grown by nearly 500%. Use the chart below to explore the trajectory of FIFA's earnings across the decades.
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-stone-100 dark:border-gray-800 shadow-xl mb-8">
          <div className="h-[300px] md:h-[400px]">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
      </section>

      {/* Host Nation Selector Section */}
      <section id="hosts" className="pt-12 border-t border-stone-100 dark:border-gray-800">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold mb-4 font-serif dark:text-white">Who Pays for the Party?</h2>
          <p className="text-stone-600 dark:text-gray-400 max-w-2xl mx-auto text-sm leading-relaxed">
            While FIFA earns billions, host nations often find themselves in the red. Select a tournament below to see the exact dates, the estimated infrastructure costs, and the economic legacy left behind.
          </p>
        </div>

        <div className="flex overflow-x-auto space-x-4 pb-6 mb-8 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">
          {Object.keys(tournamentData).map((year) => (
            <button
              key={year}
              onClick={() => handleYearChange(year)}
              className={`flex-shrink-0 px-6 py-3 rounded-xl border font-bold text-sm transition-all duration-300 ${
                activeYear === year 
                  ? "border-yellow-600 bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-500 transform -translate-y-1 shadow-md" 
                  : "border-stone-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-stone-600 dark:text-gray-400 hover:border-stone-300 dark:hover:border-gray-600"
              }`}
            >
              {year}
            </button>
          ))}
        </div>

        <div className={`bg-stone-900 text-white p-8 md:p-12 rounded-3xl shadow-2xl relative overflow-hidden transition-all duration-300 min-h-[400px] ${fade ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="relative z-10 grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-4xl font-bold mb-2 font-serif">{activeData.name}</h3>
              <p className="text-yellow-500 font-medium tracking-wide mb-6">{activeData.dates}</p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <span className="w-10 h-10 flex items-center justify-center bg-stone-800 rounded-lg text-lg">💰</span>
                  <div>
                    <p className="text-stone-400 text-[10px] uppercase font-bold tracking-widest">Estimated Cost</p>
                    <p className="text-xl font-semibold">{activeData.cost}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="w-10 h-10 flex items-center justify-center bg-stone-800 rounded-lg text-lg">🏟️</span>
                  <div>
                    <p className="text-stone-400 text-[10px] uppercase font-bold tracking-widest">Key Strategy</p>
                    <p className="text-xl font-semibold">{activeData.strategy}</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-stone-400 text-[10px] uppercase font-bold mb-3 tracking-widest">Economic Legacy</h4>
              <p className="text-stone-300 leading-relaxed italic text-sm">
                "{activeData.legacy}"
              </p>
              <div className="mt-8 p-4 bg-stone-800/50 rounded-xl border border-stone-700">
                <p className="text-[10px] text-stone-400 uppercase font-bold mb-1 tracking-widest">Key Takeaway</p>
                <p className="text-sm">{activeData.takeaway}</p>
              </div>
            </div>
          </div>
          {/* Background decoration */}
          <div className="absolute -bottom-12 -right-12 text-[12rem] opacity-[0.03] font-black select-none pointer-events-none">
            {activeYear}
          </div>
        </div>
      </section>

      {/* Ticket Pricing Comparison Section */}
      <section id="tickets" className="pt-12 border-t border-stone-100 dark:border-gray-800">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold mb-4 font-serif dark:text-white">The Gentrification of the Game</h2>
          <p className="text-stone-600 dark:text-gray-400 max-w-2xl mx-auto text-sm leading-relaxed">
            The biggest shift for fans in 2026 is the introduction of <strong>Dynamic Pricing</strong>. We compared the 1994 World Cup (last time in North America) with today's figures, and the results are eye-watering.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-stone-100 dark:border-gray-800 shadow-lg">
            <h3 className="text-xl font-bold mb-6 text-stone-800 dark:text-white">Final Ticket (Category 1)</h3>
            
            <div className="mb-8">
              <div className="flex justify-between items-end mb-2">
                <span className="text-stone-500 font-bold uppercase text-[10px] tracking-widest">USA 1994 (Inflation Adj.)</span>
                <span className="text-2xl font-bold text-stone-900 dark:text-white">$1,069</span>
              </div>
              <div className="w-full bg-stone-100 dark:bg-gray-800 h-4 rounded-full overflow-hidden">
                <div className="bg-stone-400 h-full w-[10%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-green-800 dark:text-green-500 font-bold uppercase text-[10px] tracking-widest">North America 2026 (Base)</span>
                <span className="text-2xl font-bold text-green-700 dark:text-green-400">$10,990</span>
              </div>
              <div className="w-full bg-stone-100 dark:bg-gray-800 h-4 rounded-full overflow-hidden">
                <div className="bg-green-600 h-full w-full"></div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-stone-100 dark:border-gray-800">
              <p className="text-xs text-stone-500 dark:text-gray-400 leading-relaxed">
                <strong>The 1,000% Jump:</strong> While U.S. median incomes rose ~32% since 1994, premium final ticket costs surged by nearly 1,000%.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900/30">
              <h4 className="text-red-900 dark:text-red-400 font-bold mb-2 text-sm uppercase tracking-wider">The "Invisible" Markup</h4>
              <p className="text-red-800 dark:text-red-300/80 text-xs leading-relaxed">
                Dynamic pricing allows costs to fluctuate in real-time. Texas investigations are probing algorithms that raised rates by an average of 34% after initial selection.
              </p>
            </div>
            <div className="p-6 bg-amber-50 dark:bg-amber-950/20 rounded-2xl border border-amber-100 dark:border-amber-900/30">
              <h4 className="text-amber-900 dark:text-amber-400 font-bold mb-2 text-sm uppercase tracking-wider">The Total Trip Cost</h4>
              <p className="text-amber-800 dark:text-amber-300/80 text-xs leading-relaxed">
                A family of four visiting Miami for a single match can expect to spend over $5,600 on tickets, travel, and lodging.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
