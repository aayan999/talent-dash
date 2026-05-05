import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { compensationLabel, displayCompany } from "@/lib/salary";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function salaryOptionLabel(salary: any) {
  return `${displayCompany(salary.company)} ${salary.level} (${compensationLabel(salary.total_compensation)})`;
}

// Pseudo-random generator for consistent mock data
const pseudoRandom = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
};

const getWlb = (id: string) => (3.2 + (pseudoRandom(id) % 15) / 10).toFixed(1);
const getCareer = (id: string) => (3.0 + (pseudoRandom(id + "c") % 20) / 10).toFixed(1);
const getBenefits = (id: string) => 4 + (pseudoRandom(id + "b") % 8);

export default async function ComparePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const s1 = firstParam(params?.s1)?.trim() ?? "";
  const s2 = firstParam(params?.s2)?.trim() ?? "";
  const s3 = firstParam(params?.s3)?.trim() ?? "";

  const allSalaries = await prisma.salary.findMany({
    orderBy: [{ company: "asc" }, { total_compensation: "desc" }],
  });

  const selectedIds = [s1, s2, s3].filter(Boolean);
  
  const selectedSalaries = selectedIds.length > 0 
    ? await prisma.salary.findMany({ where: { id: { in: selectedIds } } })
    : [];

  // Order them as they were selected
  const salaries = [s1, s2, s3].map(id => selectedSalaries.find(s => s.id === id)).filter(Boolean) as any[];

  // Find Best Values
  const maxBase = Math.max(0, ...salaries.map(s => s.base_salary));
  const maxStock = Math.max(0, ...salaries.map(s => s.stock));
  const maxBonus = Math.max(0, ...salaries.map(s => s.bonus));
  const maxTotal = Math.max(0, ...salaries.map(s => s.total_compensation));
  const maxWlb = Math.max(0, ...salaries.map(s => parseFloat(getWlb(s.id))));
  const maxCareer = Math.max(0, ...salaries.map(s => parseFloat(getCareer(s.id))));
  const maxBenefits = Math.max(0, ...salaries.map(s => getBenefits(s.id)));

  const isCompareReady = salaries.length >= 2;

  return (
    <main className="min-h-screen bg-[#fafafa] text-slate-900 font-sans selection:bg-violet-200 pb-24">
      {/* Premium Navbar */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-black text-2xl tracking-tighter text-slate-900 group">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-rose-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-violet-600/20 group-hover:scale-105 transition-transform">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
          </div>
          PaySight<span className="text-violet-600">.</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500">
          <Link href="/" className="hover:text-slate-900 transition-colors">Benchmarks</Link>
          <Link href="/compare" className="text-slate-900 transition-colors relative after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-violet-600 after:rounded-full">Compare Tool</Link>
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

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 text-violet-600 font-bold text-xs uppercase tracking-widest mb-4">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            Side-by-Side Comparison
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tighter mb-4">
            Compare Compensation <br className="hidden sm:block" /> Across Top Tiers
          </h1>
          <p className="text-slate-500 font-medium">Select up to 3 salaries to compare base, equity, and AI-estimated perks.</p>
        </div>

        {/* Selection Form */}
        <form className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm mb-12 flex flex-col md:flex-row items-end gap-4">
          <div className="flex-1 w-full space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Offer 1</label>
            <div className="relative group">
              <select name="s1" defaultValue={s1} className="w-full h-12 appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-900 outline-none transition-all hover:border-violet-300 focus:border-violet-500 focus:bg-white cursor-pointer">
                <option value="">Select a role...</option>
                {allSalaries.map(s => <option key={s.id} value={s.id}>{salaryOptionLabel(s)}</option>)}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path></svg></div>
            </div>
          </div>
          <div className="flex-1 w-full space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Offer 2</label>
            <div className="relative group">
              <select name="s2" defaultValue={s2} className="w-full h-12 appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-900 outline-none transition-all hover:border-violet-300 focus:border-violet-500 focus:bg-white cursor-pointer">
                <option value="">Select a role...</option>
                {allSalaries.map(s => <option key={s.id} value={s.id}>{salaryOptionLabel(s)}</option>)}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path></svg></div>
            </div>
          </div>
          <div className="flex-1 w-full space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Offer 3 (Optional)</label>
            <div className="relative group">
              <select name="s3" defaultValue={s3} className="w-full h-12 appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-900 outline-none transition-all hover:border-violet-300 focus:border-violet-500 focus:bg-white cursor-pointer">
                <option value="">Select a role...</option>
                {allSalaries.map(s => <option key={s.id} value={s.id}>{salaryOptionLabel(s)}</option>)}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path></svg></div>
            </div>
          </div>
          <button type="submit" className="w-full md:w-auto h-12 px-8 bg-slate-900 text-white font-bold rounded-2xl shadow-lg hover:bg-violet-600 transition-all">
            Compare
          </button>
        </form>

        {!isCompareReady && (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200/60 rounded-3xl shadow-sm text-center border-dashed">
            <div className="w-20 h-20 bg-violet-50 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Select at least 2 roles</h3>
            <p className="text-slate-500 font-medium">Choose from the dropdowns above to see a detailed side-by-side comparison.</p>
          </div>
        )}

        {isCompareReady && (
          <div className="bg-white rounded-3xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] border-collapse text-left">
                <thead>
                  <tr>
                    <th className="bg-slate-50 px-8 py-6 border-b border-slate-100 text-xs font-bold uppercase tracking-widest text-slate-400 w-1/4">
                      Component
                    </th>
                    {salaries.map((s, idx) => {
                      const colors = ['bg-blue-600', 'bg-emerald-500', 'bg-amber-500'];
                      const shadowColors = ['shadow-blue-600/30', 'shadow-emerald-500/30', 'shadow-amber-500/30'];
                      return (
                        <th key={s.id} className="bg-white px-8 py-6 border-b border-slate-100 border-l border-slate-50 w-1/4 relative">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl ${colors[idx % 3]} text-white flex items-center justify-center font-black text-lg shadow-lg ${shadowColors[idx % 3]}`}>
                              {displayCompany(s.company).charAt(0)}
                            </div>
                            <div>
                              <div className="text-base font-black text-slate-900">{displayCompany(s.company)} {s.level}</div>
                              <div className="text-xs font-bold text-slate-400 mt-0.5">{s.role}</div>
                            </div>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {/* Total Comp */}
                  <tr className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6 text-[11px] font-bold uppercase tracking-widest text-slate-500">Total Comp</td>
                    {salaries.map(s => (
                      <td key={s.id} className="px-8 py-6 border-l border-slate-50">
                        <div className="flex items-center gap-2">
                          <span className={`text-xl font-black ${s.total_compensation === maxTotal ? 'text-violet-600' : 'text-slate-900'}`}>
                            {compensationLabel(s.total_compensation)}
                          </span>
                          {s.total_compensation === maxTotal && (
                            <span className="text-[10px] font-bold bg-violet-100 text-violet-700 px-2 py-0.5 rounded uppercase tracking-wider">Best</span>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Base Salary */}
                  <tr className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6 text-[11px] font-bold uppercase tracking-widest text-slate-500">Base Salary</td>
                    {salaries.map(s => (
                      <td key={s.id} className="px-8 py-6 border-l border-slate-50">
                        <div className="flex items-center gap-2">
                          <span className={`text-base font-bold ${s.base_salary === maxBase ? 'text-emerald-600' : 'text-slate-700'}`}>
                            {compensationLabel(s.base_salary)}
                          </span>
                          {s.base_salary === maxBase && (
                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Best</span>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Annual RSU */}
                  <tr className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6 text-[11px] font-bold uppercase tracking-widest text-slate-500">Annual RSU</td>
                    {salaries.map(s => (
                      <td key={s.id} className="px-8 py-6 border-l border-slate-50">
                        <div className="flex items-center gap-2">
                          <span className={`text-base font-bold ${s.stock === maxStock && s.stock > 0 ? 'text-emerald-600' : 'text-slate-700'}`}>
                            {s.stock > 0 ? compensationLabel(s.stock) : '—'}
                          </span>
                          {s.stock === maxStock && s.stock > 0 && (
                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Best</span>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Target Bonus */}
                  <tr className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6 text-[11px] font-bold uppercase tracking-widest text-slate-500">Target Bonus</td>
                    {salaries.map(s => (
                      <td key={s.id} className="px-8 py-6 border-l border-slate-50">
                        <div className="flex items-center gap-2">
                          <span className={`text-base font-bold ${s.bonus === maxBonus && s.bonus > 0 ? 'text-emerald-600' : 'text-slate-700'}`}>
                            {s.bonus > 0 ? compensationLabel(s.bonus) : '—'}
                          </span>
                          {s.bonus === maxBonus && s.bonus > 0 && (
                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Best</span>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* WLB Score */}
                  <tr className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6 text-[11px] font-bold uppercase tracking-widest text-slate-500">WLB Score</td>
                    {salaries.map(s => {
                      const wlb = parseFloat(getWlb(s.id));
                      return (
                        <td key={s.id} className="px-8 py-6 border-l border-slate-50">
                          <div className="flex items-center gap-2">
                            <span className={`text-base font-bold ${wlb === maxWlb ? 'text-emerald-600' : 'text-slate-700'} flex items-center gap-1`}>
                              {wlb} <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                            </span>
                            {wlb === maxWlb && (
                              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Best</span>
                            )}
                          </div>
                        </td>
                      )
                    })}
                  </tr>

                  {/* Vest Cliff */}
                  <tr className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6 text-[11px] font-bold uppercase tracking-widest text-slate-500">RSU Vest Cliff</td>
                    {salaries.map(s => (
                      <td key={s.id} className="px-8 py-6 border-l border-slate-50">
                        <span className="text-sm font-semibold text-slate-600">12 months</span>
                      </td>
                    ))}
                  </tr>

                  {/* Career Growth */}
                  <tr className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6 text-[11px] font-bold uppercase tracking-widest text-slate-500">Career Growth</td>
                    {salaries.map(s => {
                      const career = parseFloat(getCareer(s.id));
                      return (
                        <td key={s.id} className="px-8 py-6 border-l border-slate-50">
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${career === maxCareer ? 'bg-violet-500' : 'bg-slate-400'}`} style={{ width: `${(career / 5) * 100}%` }}></div>
                            </div>
                            <span className="text-sm font-bold text-slate-700">{career}</span>
                          </div>
                        </td>
                      )
                    })}
                  </tr>

                  {/* Benefits Value */}
                  <tr className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6 text-[11px] font-bold uppercase tracking-widest text-slate-500">Benefits Value</td>
                    {salaries.map(s => {
                      const benefits = getBenefits(s.id);
                      return (
                        <td key={s.id} className="px-8 py-6 border-l border-slate-50">
                          <div className="flex items-center gap-2">
                            <span className={`text-base font-bold ${benefits === maxBenefits ? 'text-emerald-600' : 'text-slate-700'}`}>
                              ~₹{benefits}L
                            </span>
                            {benefits === maxBenefits && (
                              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Best</span>
                            )}
                          </div>
                        </td>
                      )
                    })}
                  </tr>

                </tbody>
              </table>
            </div>

            {/* AI Smart Summary */}
            <div className="bg-gradient-to-r from-violet-50 via-white to-rose-50 p-8 border-t border-slate-200/60">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                <h3 className="text-[11px] font-black uppercase tracking-widest text-violet-600">AI Smart Summary</h3>
              </div>
              <p className="text-slate-700 font-medium leading-relaxed max-w-4xl">
                {salaries[0] && salaries[1] ? (
                  <>
                    <strong className="text-slate-900">{displayCompany(salaries[0].company)}</strong> leads on base compensation, but <strong className="text-slate-900">{displayCompany(salaries[1].company)}</strong> pulls ahead in Work-Life Balance and potential long-term RSU growth. If maximizing Year-1 liquidity is the priority, {salaries[0].total_compensation > salaries[1].total_compensation ? displayCompany(salaries[0].company) : displayCompany(salaries[1].company)} is the clear winner. However, if a Staff promotion within 3 years is the goal, the trajectory at {salaries.sort((a,b) => parseFloat(getCareer(b.id)) - parseFloat(getCareer(a.id)))[0].company} creates materially higher career capital.
                  </>
                ) : (
                  "Select at least two offers above to generate an AI-powered compensation strategy and negotiation leverage summary."
                )}
              </p>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
