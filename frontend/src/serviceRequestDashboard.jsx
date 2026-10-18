import { useState, useEffect, useMemo } from 'react';

export default function serviceRequestsDashboard() {
  // Data
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [dateRange, setDateRange] = useState('30D');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExported, setIsExported] = useState(false);
  const [formData, setFormData] = useState({
    location: '',
    category: 'Plumbing',
    severity: 'Critical',
    brief: '',
  });

  // Fetch from backend
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const response = await fetch(`${apiUrl}/api/requests`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setRequests(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch requests:', error);
        setRequests([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRequests();
  }, []);

  // Filtering (must come AFTER the requests state)
  const filteredRequests = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return requests.filter((req) => {
      const matchesQuery =
        !q ||
        req.reference_number?.toLowerCase().includes(q) ||
        req.category?.toLowerCase().includes(q) ||
        req.location?.toLowerCase().includes(q);

      const matchesCat =
        selectedCategory === 'ALL' ||
        req.category?.toLowerCase().includes(selectedCategory.toLowerCase());

      const matchesSev =
        selectedSeverity === 'ALL' ||
        req.severity?.toLowerCase() === selectedSeverity.toLowerCase();

      return matchesQuery && matchesCat && matchesSev;
    });
  }, [requests, searchQuery, selectedCategory, selectedSeverity]);

  const handleExport = () => {
    setIsExported(true);
    setTimeout(() => setIsExported(false), 2000);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedSeverity('ALL');
    setDateRange('30D');
  };

  return (
 
    <div className="bg-[#1b0f1d] text-[#f2dcf1] min-h-screen antialiased selection:bg-[#fe571e] selection:text-[#531300] font-['Plus_Jakarta_Sans',sans-serif]">
      {/* ---------------- PERSISTENT LEFT SIDEBAR ---------------- */}
      <aside className="fixed left-0 top-0 h-full w-72 bg-[#160a18]/80 backdrop-blur-2xl z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.3)]">
        <div className="flex flex-col">
          {/* Brand Header */}
          <div className="h-20 flex items-center px-6 gap-2 bg-[#241726]/40">
           <img
              src="https://ui-avatars.com/api/?name=CC&background=fe571e&color=fff"
              alt="CivicConnect"
              className="h-8 w-8 rounded-lg"
            />
            <span className="font-['Poiret_One'] text-[26px] tracking-wider text-[#f2dcf1]">
              Civic Connect
            </span>
          </div>

          <div className="px-6 pt-6 pb-2">
            <span className="text-[10px] uppercase tracking-widest text-[#b5cbcb]/60 font-bold">
              Operations Core
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 px-2">
            <a
              href="#dashboard"
              className="flex items-center gap-4 px-4 py-2 rounded-lg text-[#b5cbcb] hover:bg-[#822625]/40 hover:text-[#f2dcf1] transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">grid_view</span>
              <span className="text-[14px] font-semibold">Dashboard</span>
            </a>

            <a
              href="#requests"
              aria-current="page"
              className="flex items-center justify-between px-4 py-2 rounded-lg transition-all bg-[#fe571e] text-[#531300] font-semibold shadow-[0_0_20px_rgba(254,87,30,0.35)]"
            >
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-[20px]">inbox</span>
                <span className="text-[14px] font-semibold">Requests</span>
              </div>
              <span className="px-1.5 py-0.5 rounded-full bg-[#fe571e] text-[#531300] text-[10px] font-bold leading-none">
                14
              </span>
            </a>

            <a
              href="#users"
              className="flex items-center gap-4 px-4 py-2 rounded-lg text-[#b5cbcb] hover:bg-[#822625]/40 hover:text-[#f2dcf1] transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">group</span>
              <span className="text-[14px] font-semibold">Users</span>
            </a>

            <a
              href="#settings"
              className="flex items-center gap-4 px-4 py-2 rounded-lg text-[#b5cbcb] hover:bg-[#822625]/40 hover:text-[#f2dcf1] transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">settings</span>
              <span className="text-[14px] font-semibold">Settings</span>
            </a>
          </nav>
        </div>

        {/* Live Grid Status Footer */}
        <div className="p-4 m-2 rounded-lg bg-[#241726]/60 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#fe571e] animate-pulse"></span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#b5cbcb]/80">
              Civic Grid Active
            </span>
          </div>
          <p className="text-[12px] text-[#b5cbcb]/60 mt-1">Metropolitan Zone 04 Live</p>
        </div>
      </aside>

      {/* ---------------- MAIN VIEWPORT WRAPPER ---------------- */}
      <div className="pl-72">
        {/* Top Header */}
        <header className="fixed top-0 left-72 right-0 h-20 bg-[#160a18]/70 backdrop-blur-2xl z-40 flex items-center justify-between px-8 shadow-[0_1px_8px_rgba(0,0,0,0.25)]">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#b5cbcb]/60 text-[20px]">
                search
              </span>
              <input
                className="w-full bg-[#281b2a]/60 text-[#b5cbcb] placeholder:text-[#b5cbcb]/40 pl-10 pr-4 py-2 rounded-lg text-[12px] outline-none focus:ring-1 focus:ring-[#fe571e] transition-all"
                placeholder="Search units, civic requests, tenants, or alerts..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#332535]/40">
              <span className="w-2 h-2 rounded-full bg-[#28C76F]"></span>
              <span className="text-[10px] font-bold text-[#b5cbcb]">Operational</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1">
              <button className="w-10 h-10 rounded-lg flex items-center justify-center text-[#b5cbcb] hover:bg-[#281b2a] hover:text-[#f2dcf1] transition-all">
                <span className="material-symbols-outlined text-[20px]">notifications</span>
              </button>
              <button className="w-10 h-10 rounded-lg flex items-center justify-center text-[#b5cbcb] hover:bg-[#281b2a] hover:text-[#f2dcf1] transition-all">
                <span className="material-symbols-outlined text-[20px]">tune</span>
              </button>
            </div>
            <div className="h-8 w-px bg-[#3e3040]/60"></div>
            <div className="flex items-center gap-3 pl-1">
              <div className="text-right hidden sm:block">
                <div className="text-[16px] font-semibold leading-tight text-[#f2dcf1]">
                  Elena Vance
                </div>
                <div className="text-[12px] text-[#b5cbcb]/70">Director of Operations</div>
              </div>
              <div className="relative">
                <img
                    src="https://ui-avatars.com/api/?name=CC&background=fe571e&color=fff"
                    alt="CivicConnect"
                    className="h-8 w-8 rounded-lg"
                  />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#28C76F] rounded-full ring-2 ring-[#160a18]"></span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="relative pt-20 w-full min-h-screen bg-[#1b0f1d] px-8">
          <div className="flex flex-col w-full pb-10">
            {/* Atmospheric Ambient Glows */}
            <div className="relative w-full overflow-hidden">
              <div className="absolute -top-24 right-10 w-[520px] h-[320px] bg-[#822625]/30 blur-[130px] pointer-events-none rounded-full"></div>
              <div className="absolute top-48 left-1/4 w-[380px] h-[260px] bg-[#fe571e]/10 blur-[140px] pointer-events-none rounded-full"></div>

              {/* ---------------- SECTION 1: HERO IDENTITY ---------------- */}
              <section className="relative pt-6 mb-10">
                <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
                  <div className="flex flex-col gap-1 max-w-3xl">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-block w-2 h-2 rounded-full bg-[#fe571e] animate-ping"></span>
                      <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#ffb59f]">
                        CIVICCONNECT INFRASTRUCTURE
                      </span>
                      <span className="text-[#b5cbcb]/40">/</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#b5cbcb]/70">
                        Wonderpark Park estate
                      </span>
                    </div>
                    <h1 className="font-['Poiret_One'] text-[56px] leading-[64px] tracking-wider text-[#f2dcf1]">
                      Service Requests
                    </h1>
                    {/* Philosophy Accent */}
                    <div className="relative mt-1 pl-4 py-1">
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#fe571e] via-[#822625] to-transparent"></div>
                      <p className="font-['Poiret_One'] text-[26px] text-[#ffb59f]/90 tracking-widest uppercase">
                        Dream Big — Govern Swiftly
                      </p>
                      <p className="text-[12px] text-[#b5cbcb]/80 mt-0.5 tracking-wide">
                        Operational mastery for high-density metropolitan assets and structural
                        integrity.
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-4 flex-wrap">
                    <button
                      onClick={handleExport}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#332535]/80 hover:bg-[#822625]/60 text-[#b5cbcb] hover:text-[#f2dcf1] shadow-sm transition-all group"
                    >
                      <span className="material-symbols-outlined text-[18px] text-[#b5cbcb] group-hover:text-[#ffb59f] transition-colors">
                        {isExported ? 'check' : 'download'}
                      </span>
                      <span className="text-[14px] font-semibold">
                        {isExported ? 'Generated!' : 'Export Report'}
                      </span>
                    </button>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="relative group flex items-center gap-2 px-6 py-2 rounded-lg bg-[#fe571e] text-[#5e1600] font-semibold text-[14px] shadow-[0_0_24px_rgba(254,87,30,0.35)] hover:shadow-[0_0_32px_rgba(254,87,30,0.55)] hover:bg-[#e04812] active:scale-[0.98] transition-all"
                    >
                      <span className="material-symbols-outlined text-[20px]">add_circle</span>
                      <span>+ New Request</span>
                      <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-[#fe571e]/0 via-white/20 to-[#fe571e]/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                    </button>
                  </div>
                </div>
              </section>

              {/* ---------------- SECTION 2: TOP KPI CARDS ---------------- */}
              <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {/* Metric 1 */}
                <div className="relative p-6 rounded-xl bg-[#281b2a]/70 backdrop-blur-xl shadow-lg hover:bg-[#332535]/60 transition-all duration-300 group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#fe571e]/10 rounded-full blur-2xl group-hover:bg-[#fe571e]/20 transition-all pointer-events-none"></div>
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#b5cbcb]/70">
                        Active Queue
                      </span>
                      <span className="text-[16px] font-semibold text-[#f2dcf1] mt-1">
                        Open Requests
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-[#822625]/40 flex items-center justify-center text-[#fe571e] group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[22px]">pending_actions</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-baseline gap-4">
                    <span className="font-['Poiret_One'] text-[56px] leading-none text-[#f2dcf1]">
                      42
                    </span>
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#fe571e]/15 text-[#fe571e]">
                      <span className="material-symbols-outlined text-[14px]">trending_up</span>
                      <span className="text-[10px] font-bold">+8 today</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-2 flex items-center justify-between">
                    <span className="text-[12px] text-[#b5cbcb]/60">Load distribution</span>
                    <svg
                      className="w-28 h-6 text-[#fe571e] overflow-visible"
                      fill="none"
                      viewBox="0 0 112 24"
                    >
                      <path
                        d="M2 18 L24 14 L46 19 L68 7 L90 12 L110 3"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      />
                      <circle
                        className="fill-[#fe571e] animate-pulse"
                        cx="110"
                        cy="3"
                        r="3"
                      />
                    </svg>
                  </div>
                </div>

                {/* Metric 2 */}
                <div className="relative p-6 rounded-xl bg-[#281b2a]/70 backdrop-blur-xl shadow-lg hover:bg-[#332535]/60 transition-all duration-300 group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#b5cbcb]/10 rounded-full blur-2xl group-hover:bg-[#b5cbcb]/15 transition-all pointer-events-none"></div>
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#b5cbcb]/70">
                        Dispatched Crews
                      </span>
                      <span className="text-[16px] font-semibold text-[#f2dcf1] mt-1">
                        In Progress
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-[#3e3040]/60 flex items-center justify-center text-[#b5cbcb] group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[22px]">engineering</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-baseline gap-4">
                    <span className="font-['Poiret_One'] text-[56px] leading-none text-[#f2dcf1]">
                      18
                    </span>
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#3e3040] text-[#b5cbcb]">
                      <span className="material-symbols-outlined text-[14px]">timelapse</span>
                      <span className="text-[10px] font-bold">4.2h avg dispatch</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-2 flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-[12px]">
                      <span className="text-[#b5cbcb]/60">Field Crew Capacity</span>
                      <span className="text-[#b5cbcb] text-[10px] font-bold">72% Active</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#160a18] overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#b5cbcb] to-[#fe571e] rounded-full"
                        style={{ width: '72%' }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Metric 3 */}
                <div className="relative p-6 rounded-xl bg-[#281b2a]/70 backdrop-blur-xl shadow-lg hover:bg-[#332535]/60 transition-all duration-300 group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#822625]/20 rounded-full blur-2xl group-hover:bg-[#822625]/30 transition-all pointer-events-none"></div>
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#b5cbcb]/70">
                        Resolution Velocity
                      </span>
                      <span className="text-[16px] font-semibold text-[#f2dcf1] mt-1">
                        Resolved (MTD)
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-[#28C76F]/10 flex items-center justify-center text-[#28C76F] group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[22px]">verified</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-baseline gap-4">
                    <span className="font-['Poiret_One'] text-[56px] leading-none text-[#f2dcf1]">
                      156
                    </span>
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#28C76F]/15 text-[#28C76F]">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      <span className="text-[10px] font-bold">94.8% SLA Target</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-2 flex items-center justify-between">
                    <span className="text-[12px] text-[#b5cbcb]/60">Mean Resolution Time</span>
                    <span className="text-[12px] font-semibold text-[#b5cbcb]">
                      3.6 hrs · Prime Spec
                    </span>
                  </div>
                </div>
              </section>

              {/* ---------------- SECTION 3: FILTER TOOLBAR ---------------- */}
              <section className="p-4 rounded-xl bg-[#281b2a]/60 backdrop-blur-xl shadow-md mb-6 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                <div className="relative flex-1 min-w-[260px] max-w-lg">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#b5cbcb]/50 text-[18px]">
                    search
                  </span>
                  <input
                    className="w-full bg-[#160a18]/80 text-[#f2dcf1] placeholder:text-[#b5cbcb]/40 pl-9 pr-4 py-2 rounded-lg text-[12px] outline-none focus:bg-[#160a18] transition-all"
                    placeholder="Filter by ref #, tenant, floor, or category..."
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Category Dropdown */}
                  <div className="relative">
                    <select
                      className="appearance-none bg-[#160a18]/80 text-[#b5cbcb] hover:text-[#f2dcf1] pl-3 pr-8 py-2 rounded-lg text-[12px] font-semibold outline-none cursor-pointer transition-colors"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      <option value="ALL">All Categories</option>
                      <option value="HVAC">Plumbing</option>
                      <option value="Elevator">Electrical</option>
                      <option value="Electrical">Security Gates</option>
                      <option value="Plumbing">Common Area</option>
                      <option value="Access">Lost Property</option>
                      <option value="Structural">Structural Glazing</option>
                      <option value="Fire">Fire & Safety</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[#b5cbcb]/50 pointer-events-none text-[16px]">
                      expand_more
                    </span>
                  </div>

                  {/* Severity Dropdown */}
                  <div className="relative">
                    <select
                      className="appearance-none bg-[#160a18]/80 text-[#b5cbcb] hover:text-[#f2dcf1] pl-3 pr-8 py-2 rounded-lg text-[12px] font-semibold outline-none cursor-pointer transition-colors"
                      value={selectedSeverity}
                      onChange={(e) => setSelectedSeverity(e.target.value)}
                    >
                      <option value="ALL">All Severities</option>
                      <option value="Critical">Critical</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[#b5cbcb]/50 pointer-events-none text-[16px]">
                      expand_more
                    </span>
                  </div>

                  {/* Time Range */}
                  <div className="relative">
                    <select
                      className="appearance-none bg-[#160a18]/80 text-[#b5cbcb] hover:text-[#f2dcf1] pl-3 pr-8 py-2 rounded-lg text-[12px] font-semibold outline-none cursor-pointer transition-colors"
                      value={dateRange}
                      onChange={(e) => setDateRange(e.target.value)}
                    >
                      <option value="30D">Past 30 Days</option>
                      <option value="7D">Past 7 Days</option>
                      <option value="24H">Past 24 Hours</option>
                      <option value="Q3">Q3 2024</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[#b5cbcb]/50 pointer-events-none text-[16px]">
                      expand_more
                    </span>
                  </div>

                  {/* Reset Button */}
                  <button
                    onClick={resetFilters}
                    className="p-2 rounded-lg text-[#b5cbcb]/60 hover:text-[#ffb59f] transition-colors flex items-center"
                    title="Reset Filters"
                  >
                    <span className="material-symbols-outlined text-[18px]">restart_alt</span>
                  </button>
                </div>
              </section>

              {/* ---------------- SECTION 4: DATA TABLE ---------------- */}
              <section className="rounded-xl bg-[#281b2a]/60 backdrop-blur-2xl shadow-xl overflow-hidden mb-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[960px]">
                    <thead>
                      <tr className="bg-[#332535]/90 text-[#b5cbcb]/70 text-[10px] uppercase tracking-wider">
                        <th className="py-4 px-6 font-semibold">Reference</th>
                        <th className="py-4 px-4 font-semibold">Category</th>
                        <th className="py-4 px-4 font-semibold">Location (Unit / Asset)</th>
                        <th className="py-4 px-4 font-semibold">Severity</th>
                        <th className="py-4 px-4 font-semibold">Status</th>
                        <th className="py-4 px-4 font-semibold">Date Logged</th>
                        <th className="py-4 px-6 text-right font-semibold">Quick Actions</th>
                      </tr>
                    </thead>
                        <tbody className="divide-y divide-[#b5cbcb]/5">
  {/* If the data is loading, show a clean loading message */}
  {isLoading ? (
    <tr><td colSpan="7" className="text-center py-8 text-[#B5CBCB]">Connecting to CivicConnect Live Database...</td></tr>
  ) : (
    /* Make sure you are mapping over 'requests' (the state we made) or 'filteredRequests' if Stitch made a search bar */
    filteredRequests.map((req) => (
      <tr
        key={req.id}
        className="group hover:bg-[#822625]/25 transition-colors relative cursor-pointer"
      >
        {/* Reference */}
        <td className="py-4 px-6 font-semibold text-[16px] text-[#f2dcf1] whitespace-nowrap">
          <div className="flex items-center gap-2">
            <span
              className={`w-1.5 h-6 rounded-full ${
                req.severity === 'Critical' ? 'bg-[#fe571e]' : 
                req.severity === 'High' ? 'bg-[#ffb3ae]' : 
                req.status === 'Closed' ? 'bg-[#28C76F]' : 'bg-[#3e3040]'
              }`}
            ></span>
            <span
              className={`font-mono tracking-tight ${
                req.severity === 'Critical' ? 'text-[#ffb59f]' : 
                req.status === 'Closed' ? 'text-[#b5cbcb]' : 'text-[#f2dcf1]'
              }`}
            >
              {req.reference_number} {/* DB Field */}
            </span>
          </div>
        </td>

        {/* Category */}
        <td className="py-4 px-4 text-[14px] text-[#f2dcf1] whitespace-nowrap">
          <div className="flex items-center gap-2">
            <span
              className={`material-symbols-outlined text-[18px] ${
                req.status === 'Closed' ? 'text-[#b5cbcb]/70' : 'text-[#b5cbcb]'
              }`}
            >
              build {/* Generic icon fallback since DB doesn't store icons */}
            </span>
            <span>{req.category}</span> {/* DB Field */}
          </div>
        </td>

        {/* Location (Fallback to Wonderpark since our quick GET query didn't pull location) */}
        <td className="py-4 px-4 text-[14px] text-[#b5cbcb] whitespace-nowrap">
          <span className="text-[#f2dcf1] font-medium">Wonderpark Estates</span>
        </td>

        {/* Severity Badge */}
        <td className="py-4 px-4 whitespace-nowrap">
          {req.severity === 'Critical' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#fe571e] text-[#531300] text-[10px] font-bold uppercase tracking-wider shadow-[0_0_12px_rgba(254,87,30,0.4)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#531300] animate-ping"></span>
              Critical
            </span>
          )}
          {req.severity === 'High' && (
            <span className="inline-flex items-center px-3 py-0.5 rounded-full bg-[#822625]/50 text-[#ffb3ae] text-[10px] font-bold uppercase tracking-wider">
              High
            </span>
          )}
          {req.severity === 'Medium' && (
            <span className="inline-flex items-center px-3 py-0.5 rounded-full bg-[#3e3040] text-[#b5cbcb] text-[10px] font-bold uppercase tracking-wider">
              Medium
            </span>
          )}
          {req.severity === 'Low' && (
            <span className="inline-flex items-center px-3 py-0.5 rounded-full bg-[#332535] text-[#b5cbcb]/80 text-[10px] font-bold uppercase tracking-wider">
              Low
            </span>
          )}
        </td>

        {/* Status Badge */}
        <td className="py-4 px-4 whitespace-nowrap">
          <span className="inline-flex items-center px-3 py-0.5 rounded-full bg-[#332535] text-[#ffb59f] text-[10px] font-bold">
             {req.status} {/* DB Field */}
          </span>
        </td>

        {/* Date Logged */}
        <td className="py-4 px-4 text-[12px] text-[#b5cbcb]/80 whitespace-nowrap">
          {new Date(req.created_at).toLocaleDateString()} {/* Converted DB Field */}
        </td>

        {/* Quick Actions */}
        <td className="py-4 px-6 text-right whitespace-nowrap">
          <div className="flex items-center justify-end gap-1">
            <button className="p-1.5 rounded-lg text-[#b5cbcb] hover:text-[#f2dcf1] hover:bg-[#332535] transition-colors">
              <span className="material-symbols-outlined text-[18px]">visibility</span>
            </button>
            <button className="p-1.5 rounded-lg text-[#b5cbcb] hover:text-[#ffb59f] hover:bg-[#332535] transition-colors">
              <span className="material-symbols-outlined text-[18px]">send</span>
            </button>
          </div>
        </td>
      </tr>
    ))
  )}
</tbody>
                  </table>
                </div>

                {/* Table Footer / Pagination */}
                <div className="px-6 py-4 bg-[#332535]/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <span className="text-[12px] text-[#b5cbcb]/70">
                    Showing <span className="text-[#f2dcf1] font-semibold">{filteredRequests.length ? 1 : 0}</span> to{' '}
                    <span className="text-[#f2dcf1] font-semibold">
                {filteredRequests.length}
              </span>{' '}
              of <span className="text-[#f2dcf1] font-semibold">{requests.length}</span> requests
                  </span>
                  <div className="flex items-center gap-1">
                    <button className="px-3 py-1 rounded-lg bg-[#160a18] text-[#b5cbcb]/60 hover:text-[#f2dcf1] hover:bg-[#241726] transition-colors text-[12px] font-semibold">
                      Previous
                    </button>
                    <button className="w-8 h-8 rounded-lg bg-[#fe571e] text-[#531300] text-[12px] font-semibold flex items-center justify-center shadow-md">
                      1
                    </button>
                    <button className="w-8 h-8 rounded-lg bg-[#281b2a] text-[#b5cbcb] hover:text-[#f2dcf1] hover:bg-[#332535] text-[12px] font-semibold flex items-center justify-center transition-colors">
                      2
                    </button>
                    <button className="w-8 h-8 rounded-lg bg-[#281b2a] text-[#b5cbcb] hover:text-[#f2dcf1] hover:bg-[#332535] text-[12px] font-semibold flex items-center justify-center transition-colors">
                      3
                    </button>
                    <span className="text-[#b5cbcb]/40 px-1">…</span>
                    <button className="w-8 h-8 rounded-lg bg-[#281b2a] text-[#b5cbcb] hover:text-[#f2dcf1] hover:bg-[#332535] text-[12px] font-semibold flex items-center justify-center transition-colors">
                      6
                    </button>
                    <button className="px-3 py-1 rounded-lg bg-[#160a18] text-[#b5cbcb] hover:text-[#f2dcf1] hover:bg-[#241726] transition-colors text-[12px] font-semibold">
                      Next
                    </button>
                  </div>
                </div>
              </section>

              {/* ---------------- SECTION 5: DISPATCH INSIGHT & FEED ---------------- */}
              <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Live Field Telemetry Card */}
                <div className="p-6 rounded-xl bg-[#281b2a]/70 backdrop-blur-xl shadow-lg flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#28C76F] animate-pulse"></span>
                        <span className="text-[16px] font-semibold text-[#f2dcf1]">
                          Telemetry Station Alpha
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-[#b5cbcb]/60 uppercase">
                        Node #04
                      </span>
                    </div>
                    <p className="text-[12px] text-[#b5cbcb]/80 my-2">
                      HVAC Chillers in Tower 1 reporting nominal differential pressure post-filter
                      recalibration. Ambient core temperature steady at 21.4°C.
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-[#b5cbcb]">
                      <span className="material-symbols-outlined text-[16px] text-[#ffb59f]">
                        router
                      </span>
                      <span>Mesh Synced: 2s ago</span>
                    </div>
                    <span className="font-mono text-[12px] text-[#ffb59f] tracking-wider">
                      04-SYS-OK
                    </span>
                  </div>
                </div>

                {/* Architectural Presence Image 1 */}
                <div className="relative rounded-xl overflow-hidden shadow-lg group h-44 lg:h-auto">
                  <img  src="https://picsum.photos/seed/civic1/600/400" alt="Profile" className="..." />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#160a18] via-[#160a18]/40 to-transparent p-4 flex flex-col justify-end">
                    <span className="text-[10px] uppercase tracking-widest text-[#ffb59f] font-bold">
                      Penthouse Tower 1
                    </span>
                    <span className="text-[16px] font-semibold text-[#f2dcf1]">
                      Mechanical Core & Chiller Deck
                    </span>
                  </div>
                </div>

                {/* Architectural Presence Image 2 */}
                <div className="relative rounded-xl overflow-hidden shadow-lg group h-44 lg:h-auto">
                  <img src="https://picsum.photos/seed/civic2/600/400"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#160a18] via-[#160a18]/40 to-transparent p-4 flex flex-col justify-end">
                    <span className="text-[10px] uppercase tracking-widest text-[#ffb3ae] font-bold">
                      East Shaft Array
                    </span>
                    <span className="text-[16px] font-semibold text-[#f2dcf1]">
                      High-Velocity Transit Shuttles
                    </span>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* ---------------- CREATE REQUEST MODAL ---------------- */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 bg-[#160a18]/80 backdrop-blur-md flex items-center justify-center p-4">
              <div className="relative w-full max-w-xl rounded-xl bg-[#332535] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between pb-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#ffb59f] text-[24px]">
                      add_circle
                    </span>
                    <h3 className="font-['Poiret_One'] text-[26px] text-[#f2dcf1]">
                      Initiate Service Request
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[#b5cbcb] hover:bg-[#3e3040] hover:text-[#f2dcf1] transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </div>

                <form
                  className="flex flex-col gap-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setIsModalOpen(false);
                  }}
                >
                  <div className="flex flex-col gap-1">
                    <label className="text-[12px] font-semibold uppercase tracking-wider text-[#b5cbcb]/70">
                      Asset / Location
                    </label>
                    <input
                      className="bg-[#160a18] text-[#f2dcf1] px-4 py-2 rounded-lg text-[14px] outline-none focus:ring-1 focus:ring-[#fe571e]"
                      placeholder="e.g. Tower 2 - Level 18 - South Corner"
                      required
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[12px] font-semibold uppercase tracking-wider text-[#b5cbcb]/70">
                        Category
                      </label>
                      <select
                        className="bg-[#160a18] text-[#b5cbcb] px-4 py-2 rounded-lg text-[14px] outline-none"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        <option>HVAC System</option>
                        <option>Elevator Malfunction</option>
                        <option>Electrical Surge</option>
                        <option>Plumbing Leak</option>
                        <option>Access Control</option>
                        <option>Structural Glazing</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[12px] font-semibold uppercase tracking-wider text-[#b5cbcb]/70">
                        Severity Level
                      </label>
                      <select
                        className="bg-[#160a18] text-[#ffb59f] font-semibold px-4 py-2 rounded-lg text-[14px] outline-none"
                        value={formData.severity}
                        onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                      >
                        <option>Critical</option>
                        <option>High</option>
                        <option>Medium</option>
                        <option>Low</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[12px] font-semibold uppercase tracking-wider text-[#b5cbcb]/70">
                      Issue Brief
                    </label>
                    <textarea
                      className="bg-[#160a18] text-[#f2dcf1] px-4 py-2 rounded-lg text-[14px] outline-none focus:ring-1 focus:ring-[#fe571e] resize-none"
                      placeholder="Provide precise mechanical symptoms, resident impact, or telemetry alerts..."
                      rows={3}
                      value={formData.brief}
                      onChange={(e) => setFormData({ ...formData, brief: e.target.value })}
                    />
                  </div>

                  <div className="flex items-center justify-end gap-4 pt-2">
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 rounded-lg text-[12px] font-semibold text-[#b5cbcb] hover:text-[#f2dcf1] transition-colors"
                      type="button"
                    >
                      Dismiss
                    </button>
                    <button
                      className="px-6 py-2 rounded-lg bg-[#fe571e] text-[#5e1600] font-semibold text-[14px] shadow-md hover:bg-[#e04812] transition-colors"
                      type="submit"
                    >
                      Dispatch Request
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
