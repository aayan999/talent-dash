import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import {
  calculateLevelDistribution,
  calculateMedianTotalCompensation,
  compensationLabel,
  displayCompany,
  normalizeCompany,
} from "@/lib/salary";

type PageProps = {
  params: Promise<{
    name: string;
  }>;
};

export default async function CompanyPage({ params }: PageProps) {
  const { name } = await params;
  const company = normalizeCompany(decodeURIComponent(name));

  if (!company) {
    notFound();
  }

  const salaries = await prisma.salary.findMany({
    where: { company },
    orderBy: { total_compensation: "desc" },
  });

  if (salaries.length === 0) {
    notFound();
  }

  const medianCompensation = calculateMedianTotalCompensation(salaries);
  const levelDistribution = calculateLevelDistribution(salaries);

  return (
    <main className="min-h-screen bg-[#fafafa] text-slate-900 font-sans selection:bg-violet-200 pb-20">
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

      {/* Company Header */}
      <div className="bg-white border-b border-slate-100 pt-12 pb-0 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-violet-400/5 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-violet-600 mb-8 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Benchmarks
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-3xl bg-white border border-slate-100 flex items-center justify-center font-black text-5xl text-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.06)] shrink-0">
                {displayCompany(company).charAt(0)}
              </div>
              <div>
                <h1 className="text-5xl font-black text-slate-900 tracking-tighter flex items-center gap-4 mb-2">
                  {displayCompany(company)}
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-100">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    Verified Data
                  </span>
                </h1>
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 font-medium">Tech • Global</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  <span className="text-slate-500 font-bold text-sm bg-slate-100 px-2 py-0.5 rounded">{salaries.length} entries</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="px-6 py-3 text-sm font-bold text-slate-700 bg-white border border-slate-200/80 rounded-2xl hover:bg-slate-50 shadow-sm transition-all flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                Watch
              </button>
            </div>
          </div>

          <div className="flex items-center gap-8 border-b border-slate-200/80">
            <button className="pb-4 text-sm font-black text-slate-900 border-b-2 border-slate-900 px-1">Overview</button>
            <button className="pb-4 text-sm font-bold text-slate-500 hover:text-slate-900 px-1 transition-colors">By Level</button>
            <button className="pb-4 text-sm font-bold text-slate-500 hover:text-slate-900 px-1 transition-colors">Reviews</button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/60 backdrop-blur-xl p-8 rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-center relative overflow-hidden group hover:-translate-y-1 transition-transform cursor-default">
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-violet-400/10 rounded-full blur-2xl group-hover:bg-violet-400/20 transition-colors"></div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Median Total Comp</div>
            <div className="text-5xl font-black text-slate-900 tracking-tighter">{compensationLabel(medianCompensation)}</div>
            <div className="text-xs font-bold text-emerald-500 mt-4 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              +9.2% vs last year
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-xl p-8 rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-center hover:-translate-y-1 transition-transform cursor-default">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Company Rating</div>
            <div className="text-5xl font-black text-slate-900 tracking-tighter flex items-end gap-2">
              4.3 <span className="text-lg text-slate-400 font-bold mb-1.5">/ 5</span>
            </div>
            <div className="text-xs font-bold text-slate-400 mt-4 flex items-center gap-1.5">
              Based on thousands of reviews
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-xl p-8 rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-center hover:-translate-y-1 transition-transform cursor-default">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Avg Base vs RSU</div>
            <div className="text-5xl font-black text-slate-900 tracking-tighter">72<span className="text-3xl text-slate-300">/28</span></div>
            <div className="text-xs font-bold text-slate-400 mt-4 flex items-center gap-1.5">
              High equity compensation
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-violet-500"></span>
              Recent Salaries
            </h2>
          </div>
          <div className="divide-y divide-slate-100">
            {salaries.map((salary) => (
              <div key={salary.id} className="p-8 flex flex-col lg:flex-row lg:items-center justify-between hover:bg-slate-50/50 transition-colors group">
                <div className="flex items-center gap-6 mb-6 lg:mb-0">
                  <div className="w-14 h-14 bg-white border border-slate-100 text-slate-800 font-black text-lg rounded-2xl flex items-center justify-center shadow-sm group-hover:border-violet-200 group-hover:text-violet-600 transition-colors">
                    {salary.level}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-xl flex items-center gap-2 mb-1 tracking-tight">
                      {salary.role}
                    </h3>
                    <p className="text-sm font-semibold text-slate-500 flex items-center gap-2">
                      {salary.experience_years} yrs exp <span className="w-1 h-1 rounded-full bg-slate-300"></span> {salary.location}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8 items-center text-left lg:text-right w-full lg:w-auto">
                  <div className="flex flex-col lg:items-end">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Base Pay</div>
                    <div className="text-lg font-black text-slate-900">{compensationLabel(salary.base_salary)}</div>
                  </div>
                  <div className="flex flex-col lg:items-end">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Stock / Bonus</div>
                    <div className="text-lg font-black text-slate-900">
                      {salary.stock > 0 || salary.bonus > 0 
                        ? `${compensationLabel(salary.stock + salary.bonus)}` 
                        : '—'}
                    </div>
                    {(salary.stock > 0 || salary.bonus > 0) && (
                      <div className="h-1.5 w-full lg:w-24 bg-slate-100 rounded-full mt-2 overflow-hidden flex">
                        {salary.stock > 0 && <div className="h-full bg-violet-500" style={{ width: `${(salary.stock / (salary.stock + salary.bonus)) * 100}%` }}></div>}
                        {salary.bonus > 0 && <div className="h-full bg-amber-400" style={{ width: `${(salary.bonus / (salary.stock + salary.bonus)) * 100}%` }}></div>}
                      </div>
                    )}
                  </div>
                  <div className="col-span-2 md:col-span-1 mt-4 md:mt-0 flex flex-col lg:items-end bg-slate-50 lg:bg-transparent p-4 lg:p-0 rounded-2xl lg:rounded-none">
                    <div className="text-[11px] font-bold text-violet-600 uppercase tracking-widest mb-1">Total Compensation</div>
                    <div className="text-3xl font-black text-slate-900 tracking-tighter">
                      {compensationLabel(salary.total_compensation)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
