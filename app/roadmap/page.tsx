"use client";

import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { Radar, Bar, Line } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

export default function RoadmapPage() {
  const [activeSection, setActiveSection] = useState("exec");
  const [marketFilter, setMarketFilter] = useState<"global" | "nepal">("global");

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // 1. Radar Chart for E-E-A-T
  const radarData = {
    labels: ["Experience", "Expertise", "Authoritativeness", "Trustworthiness"],
    datasets: [
      {
        label: "Lampard Target",
        data: [85, 95, 80, 98],
        backgroundColor: "rgba(5, 150, 105, 0.2)",
        borderColor: "#059669",
        pointBackgroundColor: "#059669",
        borderWidth: 2,
      },
    ],
  };

  const radarOptions = {
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: { display: false },
      },
    },
    plugins: {
      legend: { display: false },
    },
  };

  // 2. Bar Chart for Market Potential
  const marketDataPoints = {
    global: [45, 12, 18, 25],
    nepal: [15, 4, 6, 8],
  };

  const barData = {
    labels: ["Finance", "Cooking", "Lifestyle", "Tech News"],
    datasets: [
      {
        label: "Avg CPM ($)",
        data: marketDataPoints[marketFilter],
        backgroundColor: ["#059669", "#94a3b8", "#94a3b8", "#94a3b8"],
        borderRadius: 6,
      },
    ],
  };

  const barOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  // 3. Line Chart for Growth
  const growthData = {
    labels: ["Month 1", "Month 3", "Month 6", "Month 9", "Month 12"],
    datasets: [
      {
        label: "Monthly Visitors",
        data: [500, 4500, 15000, 45000, 100000],
        borderColor: "#059669",
        backgroundColor: "rgba(5, 150, 105, 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 8,
      },
    ],
  };

  const growthOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: string | number) {
            if (typeof value === 'number' && value >= 1000) return value / 1000 + "k";
            return value;
          },
        },
      },
    },
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["exec", "market", "tech", "roadmap"];
      let current = "";
      sections.forEach((section) => {
        const element = document.getElementById(section);
        if (element) {
          const sectionTop = element.offsetTop;
          if (window.pageYOffset >= sectionTop - 100) {
            current = section;
          }
        }
      });
      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="bg-slate-50 text-slate-800 selection:bg-emerald-100 selection:text-emerald-900">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-emerald-600 rounded flex items-center justify-center text-white font-bold text-xl">
                $
              </div>
              <span className="text-xl font-extrabold tracking-tighter text-slate-900">
                LAMP<span className="text-emerald-700">ARD</span>
              </span>
            </div>
            <div className="hidden md:flex space-x-8">
              {[
                { id: "exec", label: "Intelligence" },
                { id: "market", label: "Market Potential" },
                { id: "tech", label: "Tech Stack" },
                { id: "roadmap", label: "Roadmap" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`text-sm font-medium transition-colors hover:text-emerald-700 ${
                    activeSection === item.id
                      ? "text-emerald-700 border-b-2 border-emerald-600"
                      : "text-slate-600"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <header className="py-12 md:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">
            The Digital Frontier of <span className="text-emerald-700">Market Intelligence</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            A comprehensive strategic report on building a world-class financial blog using Next.js 16, MDX, and performance-driven SEO.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Section 1: Executive Intelligence */}
        <section id="exec" className="mb-20 scroll-mt-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Executive Strategy</h2>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Lampard is not just a blog; it is a **high-authority content engine**. In the YMYL (Your Money Your Life) category, Google demands extreme performance and trust. This section outlines the core mission to provide deep market research that impacts global digital finance.
              </p>
              <div className="space-y-4">
                <div className="flex items-start p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                  <span className="text-emerald-700 font-bold mr-3">01</span>
                  <div>
                    <h4 className="font-bold text-slate-900">Deep Research Focus</h4>
                    <p className="text-sm text-slate-600">Prioritizing 2,000+ word technical analyses over shallow daily news.</p>
                  </div>
                </div>
                <div className="flex items-start p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-600 font-bold mr-3">02</span>
                  <div>
                    <h4 className="font-bold text-slate-900">Tech-First SEO</h4>
                    <p className="text-sm text-slate-600">Using Next.js 16 for near-instant load speeds to boost search visibility.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white/90 border border-slate-200 shadow-sm p-8 rounded-2xl">
              <h3 className="text-center font-bold text-slate-800 mb-4 uppercase text-xs tracking-widest">
                E-E-A-T Performance Balance
              </h3>
              <div className="h-[350px]">
                <Radar data={radarData} options={radarOptions} />
              </div>
              <p className="text-[10px] text-center text-slate-400 mt-4 italic">
                Goal: Achieve 90%+ in all four quadrants via high-quality MDX content.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Market Analysis */}
        <section id="market" className="mb-20 scroll-mt-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">Market Potential Analysis</h2>
            <p className="text-slate-600 mt-2">Comparing the Finance Niche against other digital sectors.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2 bg-white/90 border border-slate-200 shadow-sm p-6 rounded-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-900">Ad Revenue Potential (CPM $)</h3>
                <select
                  value={marketFilter}
                  onChange={(e) => setMarketFilter(e.target.value as "global" | "nepal")}
                  className="text-xs border border-slate-200 rounded p-1 outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="global">Global Markets</option>
                  <option value="nepal">Local Market (NEPSE)</option>
                </select>
              </div>
              <div className="h-[350px]">
                <Bar data={barData} options={barOptions} />
              </div>
            </div>
            <div className="bg-emerald-600 text-white p-8 rounded-2xl flex flex-col justify-center shadow-lg">
              <h3 className="text-2xl font-bold mb-4">Why Finance?</h3>
              <p className="text-emerald-100 mb-6">
                Finance blogs command the highest RPM (Revenue per 1,000 views) in the industry, often reaching $30-$50 in premium markets.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-sm font-medium">
                  <span className="w-2 h-2 bg-white rounded-full mr-3"></span> High Advertiser Competition
                </li>
                <li className="flex items-center text-sm font-medium">
                  <span className="w-2 h-2 bg-white rounded-full mr-3"></span> Affiliate Integration (Brokers/Tools)
                </li>
                <li className="flex items-center text-sm font-medium">
                  <span className="w-2 h-2 bg-white rounded-full mr-3"></span> Long-Term Content Value
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 3: Technical Architecture */}
        <section id="tech" className="mb-20 scroll-mt-24">
          <div className="bg-slate-900 text-white p-8 md:p-16 rounded-[2rem] overflow-hidden relative shadow-2xl">
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">The &quot;Burning&quot; Tech Stack</h2>
              <p className="text-slate-400 mb-12 max-w-xl">
                We are utilizing cutting-edge frameworks to ensure the site is recognized by Google&apos;s crawlers faster than any WordPress competitor.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { title: "Next.js 16", desc: "Async params & Server Components for maximum speed." },
                  { title: "MDX 3.0", desc: "Rich content with React components inside Markdown." },
                  { title: "Tailwind CSS", desc: "Utility-first styling with zero runtime overhead." },
                  { title: "Cloudflare", desc: "Global edge deployment with 100% uptime." },
                ].map((item) => (
                  <div key={item.title} className="p-6 bg-slate-800 rounded-xl hover:bg-emerald-600 transition-all cursor-pointer group shadow-sm">
                    <h4 className="font-bold text-lg mb-2">{item.title}</h4>
                    <p className="text-xs text-slate-400 group-hover:text-emerald-50">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-emerald-600 opacity-20 rounded-full blur-3xl"></div>
          </div>
        </section>

        {/* Section 4: Growth Roadmap */}
        <section id="roadmap" className="scroll-mt-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">Growth Roadmap</h2>
            <p className="text-slate-600 mt-2">Projected traffic and monetization milestones for 2026-2027.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="bg-white/90 border border-slate-200 shadow-sm p-6 rounded-2xl">
              <h3 className="font-bold text-slate-900 mb-6">Traffic Growth Projection</h3>
              <div className="h-[350px]">
                <Line data={growthData} options={growthOptions} />
              </div>
            </div>

            <div className="space-y-8 relative before:content-[''] before:absolute before:left-[19px] before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-200">
              {[
                {
                  id: 1,
                  title: "Phase 1: Authority Launch",
                  desc: "Publish 20 \"Pillar\" posts. Submit XML sitemap to Google Search Console. Establish E-E-A-T pages (About/Disclaimer).",
                  active: true,
                },
                {
                  id: 2,
                  title: "Phase 2: AdSense Activation",
                  desc: "Integrate Google AdSense once site reaches 50+ posts. Optimize ad placement for viewability without hurting UX.",
                  active: false,
                },
                {
                  id: 3,
                  title: "Phase 3: Deep Scalability",
                  desc: "Introduction of premium calculators and interactive market tools to encourage long dwell times.",
                  active: false,
                },
              ].map((phase) => (
                <div key={phase.id} className="relative pl-12">
                  <div className={`absolute left-0 top-1 w-10 h-10 rounded-full border-4 border-white shadow-sm flex items-center justify-center text-xs font-bold ${
                    phase.active ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"
                  }`}>
                    {phase.id}
                  </div>
                  <h4 className="font-bold text-slate-900">{phase.title}</h4>
                  <p className="text-sm text-slate-600">{phase.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-6 h-6 bg-emerald-600 rounded flex items-center justify-center text-white font-bold text-sm">
              $
            </div>
            <span className="text-lg font-bold text-white tracking-tight">LAMPARD</span>
          </div>
          <p className="text-sm mb-4">© 2026 Lampard. Built with Next.js 16 &amp; MDX.</p>
          <div className="flex justify-center space-x-6 text-xs uppercase tracking-widest font-semibold">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Disclaimer</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
