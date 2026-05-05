import Link from "next/link";

import { prisma } from "@/lib/prisma";
import {
  buildSalaryWhere,
  compensationLabel,
  displayCompany,
  parseSortDirection,
  salarySearchParams,
  SALARY_LEVELS,
} from "@/lib/salary";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = new URLSearchParams();

  for (const key of ["company", "role", "level", "location", "sort"]) {
    const value = firstParam(params?.[key]);
    if (value) {
      query.set(key, value);
    }
  }

  const filters = salarySearchParams(query);
  const sort = parseSortDirection(query.get("sort"));
  const salaries = await prisma.salary.findMany({
    where: buildSalaryWhere(filters),
    orderBy: {
      total_compensation: sort,
    },
  });

  const companies = await prisma.salary.findMany({
    distinct: ["company"],
    orderBy: { company: "asc" },
    select: { company: true },
  });

  const roles = await prisma.salary.findMany({
    distinct: ["role"],
    orderBy: { role: "asc" },
    select: { role: true },
  });

  const locations = await prisma.salary.findMany({
    distinct: ["location"],
    orderBy: { location: "asc" },
    select: { location: true },
  });

  return (
    <main className="min-h-screen bg-[#fafafa] text-slate-900 font-sans selection:bg-violet-200">
      {/* Premium Navbar */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-black text-2xl tracking-tighter text-slate-900 group">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-rose-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-violet-600/20 group-hover:scale-105 transition-transform">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
          </div>
          PaySight<span className="text-violet-600">.</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500">
          <Link href="/" className="text-slate-900 transition-colors relative after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-violet-600 after:rounded-full">Benchmarks</Link>
          <Link href="/compare" className="hover:text-slate-900 transition-colors">Compare Tool</Link>
          <Link href="#" className="hover:text-slate-900 transition-colors flex items-center gap-1">
            API <span className="px-1.5 py-0.5 rounded bg-violet-100 text-violet-700 text-[10px] font-black uppercase">Pro</span>
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <button className="hidden sm:block text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">
            Sign in
          </button>
          <Link
            href="/add-salary"
            className="px-5 py-2.5 text-sm font-bold text-white bg-slate-900 rounded-full shadow-lg shadow-slate-900/20 hover:bg-violet-600 hover:shadow-violet-600/25 transition-all"
          >
            Add Salary
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative pt-24 pb-28 overflow-hidden bg-white border-b border-slate-100">
        <div className="absolute inset-0 bg-dot-pattern opacity-[0.4] [mask-image:radial-gradient(ellipse_at_top,white,transparent_80%)]"></div>
        {/* Abstract Glows */}
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[60%] rounded-full bg-violet-400/10 blur-[120px] pointer-events-none" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[50%] rounded-full bg-rose-400/10 blur-[120px] pointer-events-none" />
        
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-slate-200/60 shadow-sm mb-8 hover:scale-105 transition-transform cursor-pointer">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
            <span className="text-xs font-bold text-slate-700 tracking-wide uppercase">Live Data • {salaries.length} Verified Entries</span>
          </div>
          <h1 className="text-6xl sm:text-8xl font-black tracking-tighter text-slate-900 mb-6 leading-[1.05]">
            Discover your <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-rose-500 to-amber-500">true market value.</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
            Stop guessing. Use real, verified compensation data from industry peers to negotiate the salary you actually deserve.
          </p>
          
          {/* Floating Metric Orbs instead of a flat banner */}
          <div className="flex flex-wrap items-center justify-center gap-6">
            <div className="bg-white/60 backdrop-blur-xl border border-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-48 hover:-translate-y-1 transition-transform">
              <div className="text-3xl font-black text-slate-900 tracking-tight">₹42L</div>
              <div className="text-xs font-bold text-slate-500 mt-2 uppercase tracking-wider">Median SDE-2</div>
            </div>
            <div className="bg-white/60 backdrop-blur-xl border border-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-48 hover:-translate-y-1 transition-transform">
              <div className="text-3xl font-black text-slate-900 tracking-tight">{salaries.length}</div>
              <div className="text-xs font-bold text-slate-500 mt-2 uppercase tracking-wider">Total Records</div>
            </div>
            <div className="bg-white/60 backdrop-blur-xl border border-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-48 hover:-translate-y-1 transition-transform">
              <div className="text-3xl font-black text-emerald-500 tracking-tight flex items-center justify-center gap-1">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                4.1%
              </div>
              <div className="text-xs font-bold text-slate-500 mt-2 uppercase tracking-wider">YoY Growth</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col lg:flex-row gap-12 relative z-10">
        
        {/* Refined Sidebar Filters */}
        <aside className="w-full lg:w-[300px] shrink-0">
          <div className="sticky top-28 bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-base font-black tracking-tight text-slate-900">Refine Search</h2>
              <Link href="/" className="text-xs font-bold text-violet-600 hover:text-violet-800 bg-violet-50 px-3 py-1.5 rounded-full transition-colors">Reset</Link>
            </div>

            <form className="space-y-6">
              <div className="space-y-2.5">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Company</label>
                <div className="relative group">
                  <select
                    className="w-full h-12 appearance-none rounded-2xl border-2 border-slate-100 bg-slate-50/50 px-4 text-sm font-bold text-slate-900 outline-none transition-all hover:border-violet-200 focus:border-violet-500 focus:bg-white cursor-pointer"
                    name="company"
                    defaultValue={filters.company ?? ""}
                  >
                    <option value="">All companies</option>
                    {companies.map(({ company }) => (
                      <option key={company} value={company}>{displayCompany(company)}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 group-hover:text-violet-500 transition-colors">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Role</label>
                <div className="relative group">
                  <select
                    className="w-full h-12 appearance-none rounded-2xl border-2 border-slate-100 bg-slate-50/50 px-4 text-sm font-bold text-slate-900 outline-none transition-all hover:border-violet-200 focus:border-violet-500 focus:bg-white cursor-pointer"
                    name="role"
                    defaultValue={filters.role ?? ""}
                  >
                    <option value="">All roles</option>
                    {roles.map(({ role }) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 group-hover:text-violet-500 transition-colors">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Level</label>
                <div className="relative group">
                  <select
                    className="w-full h-12 appearance-none rounded-2xl border-2 border-slate-100 bg-slate-50/50 px-4 text-sm font-bold text-slate-900 outline-none transition-all hover:border-violet-200 focus:border-violet-500 focus:bg-white cursor-pointer"
                    name="level"
                    defaultValue={filters.level ?? ""}
                  >
                    <option value="">All levels</option>
                    {SALARY_LEVELS.map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 group-hover:text-violet-500 transition-colors">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Location</label>
                <div className="relative group">
                  <select
                    className="w-full h-12 appearance-none rounded-2xl border-2 border-slate-100 bg-slate-50/50 px-4 text-sm font-bold text-slate-900 outline-none transition-all hover:border-violet-200 focus:border-violet-500 focus:bg-white cursor-pointer"
                    name="location"
                    defaultValue={filters.location ?? ""}
                  >
                    <option value="">All locations</option>
                    {locations.map(({ location }) => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 group-hover:text-violet-500 transition-colors">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Sort</label>
                <div className="relative group">
                  <select
                    className="w-full h-12 appearance-none rounded-2xl border-2 border-slate-100 bg-slate-50/50 px-4 text-sm font-bold text-slate-900 outline-none transition-all hover:border-violet-200 focus:border-violet-500 focus:bg-white cursor-pointer"
                    name="sort"
                    defaultValue={sort}
                  >
                    <option value="desc">Highest total comp</option>
                    <option value="asc">Lowest total comp</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 group-hover:text-violet-500 transition-colors">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  className="w-full h-12 rounded-2xl bg-slate-900 px-5 text-sm font-black text-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all hover:-translate-y-0.5 active:translate-y-0 hover:bg-violet-600 hover:shadow-violet-600/30"
                  type="submit"
                >
                  Show Results
                </button>
              </div>
            </form>
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-sm">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" /></svg>
                </span>
                {salaries.length} Salary Records
              </h2>
            </div>
            
            <div className="flex bg-white p-1.5 rounded-xl border border-slate-200/60 shadow-sm w-max">
              <button className="px-5 py-2 text-xs font-black tracking-wide text-white bg-slate-900 rounded-lg shadow-sm">Total</button>
              <button className="px-5 py-2 text-xs font-bold tracking-wide text-slate-500 hover:text-slate-900 transition-colors">Base</button>
              <button className="px-5 py-2 text-xs font-bold tracking-wide text-slate-500 hover:text-slate-900 transition-colors">Newest</button>
            </div>
          </div>

          <div className="space-y-5">
            {salaries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200/60 rounded-3xl shadow-sm text-center">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">No matching records</h3>
                <p className="text-slate-500 font-medium max-w-sm mb-8">We couldn't find any salaries matching your exact criteria. Try broadening your filters.</p>
                <Link href="/" className="px-8 py-3 bg-slate-900 text-white font-bold rounded-full shadow-lg hover:bg-violet-600 transition-all hover:-translate-y-0.5">
                  Clear Filters
                </Link>
              </div>
            ) : (
              salaries.map((salary) => (
                <Link 
                  href={`/company/${encodeURIComponent(salary.company)}`}
                  key={salary.id} 
                  className="group flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-white border border-slate-200/60 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-violet-200 transition-all cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-violet-500 to-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="flex items-start sm:items-center gap-6 relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-2xl text-slate-700 shadow-sm shrink-0 group-hover:bg-violet-50 group-hover:text-violet-600 group-hover:border-violet-100 transition-colors">
                      {displayCompany(salary.company).charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-xl flex items-center gap-2 mb-1 group-hover:text-violet-600 transition-colors tracking-tight">
                        {salary.role} <span className="text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded-md text-sm">{salary.level}</span>
                      </h3>
                      <p className="text-sm font-semibold text-slate-500 flex items-center gap-2">
                        <span className="text-slate-700">{displayCompany(salary.company)}</span> 
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span> 
                        {salary.location} 
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span> 
                        {salary.experience_years} yrs exp
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-6 sm:mt-0 flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center relative z-10 w-full sm:w-auto border-t sm:border-t-0 border-slate-100 pt-5 sm:pt-0">
                    <div className="flex flex-col items-start sm:items-end">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 group-hover:text-violet-500 transition-colors">Total Comp</div>
                      <div className="text-3xl font-black text-slate-900 tracking-tighter group-hover:text-violet-600 transition-colors">
                        {compensationLabel(salary.total_compensation)}
                      </div>
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-2 flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg">
                        <span className="text-slate-600">{compensationLabel(salary.base_salary)}</span> Base
                        {salary.stock > 0 && <><span className="text-slate-300 mx-0.5">•</span> <span className="text-slate-600">{compensationLabel(salary.stock)}</span> RSU</>}
                        {salary.bonus > 0 && <><span className="text-slate-300 mx-0.5">•</span> <span className="text-slate-600">{compensationLabel(salary.bonus)}</span> Bonus</>}
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
