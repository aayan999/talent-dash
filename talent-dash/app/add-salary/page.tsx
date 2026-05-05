"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

const LEVEL_OPTIONS = ["L3", "L4", "L5"] as const;

type FormState = {
  company: string;
  role: string;
  level: string;
  location: string;
  experienceYears: string;
  baseSalary: string;
  bonus: string;
  stock: string;
  confidenceScore: string;
};

const INITIAL_STATE: FormState = {
  company: "",
  role: "",
  level: "",
  location: "",
  experienceYears: "",
  baseSalary: "",
  bonus: "",
  stock: "",
  confidenceScore: "0.75",
};

function isNonNegativeNumber(value: string) {
  if (!value.trim()) {
    return false;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0;
}

export default function AddSalaryPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isSubmitDisabled = useMemo(() => {
    return submitting;
  }, [submitting]);

  function updateForm<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function validate() {
    if (!form.company.trim()) return "Company is required.";
    if (!form.role.trim()) return "Role is required.";
    if (!form.level.trim()) return "Level is required.";
    if (!form.location.trim()) return "Location is required.";
    if (!isNonNegativeNumber(form.experienceYears)) return "Experience years must be a non-negative number.";
    if (!isNonNegativeNumber(form.baseSalary)) return "Base salary must be a non-negative number.";
    if (form.bonus.trim() && !isNonNegativeNumber(form.bonus)) return "Bonus must be a non-negative number.";
    if (form.stock.trim() && !isNonNegativeNumber(form.stock)) return "Stock must be a non-negative number.";
    if (!form.confidenceScore.trim()) return "Confidence score is required.";

    const confidence = Number(form.confidenceScore);
    if (!Number.isFinite(confidence) || confidence < 0 || confidence > 1) {
      return "Confidence score must be between 0 and 1.";
    }

    return "";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/ingest-salary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company: form.company.trim(),
          role: form.role.trim(),
          level: form.level,
          location: form.location.trim(),
          experience_years: Number(form.experienceYears),
          base_salary: Number(form.baseSalary),
          bonus: form.bonus.trim() ? Number(form.bonus) : 0,
          stock: form.stock.trim() ? Number(form.stock) : 0,
          confidence_score: Number(form.confidenceScore),
        }),
      });

      const data: { error?: string } = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Failed to submit salary.");
        return;
      }

      router.push("/");
    } catch {
      setError("Something went wrong while submitting. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fafafa] text-slate-900 font-sans selection:bg-violet-200">
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-black text-2xl tracking-tighter text-slate-900 group">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-rose-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-violet-600/20 group-hover:scale-105 transition-transform">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
          </div>
          PaySight<span className="text-violet-600">.</span>
        </Link>
        <Link href="/" className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">
          Back to Benchmarks
        </Link>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-14">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-50 text-violet-600 text-xs font-bold uppercase tracking-widest mb-4">
            Add Compensation
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-slate-900 mb-3">Add Salary</h1>
          <p className="text-slate-500 font-medium">
            Submit compensation details to help improve benchmark accuracy.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label htmlFor="company" className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Company</label>
              <input
                id="company"
                value={form.company}
                onChange={(event) => updateForm("company", event.target.value)}
                className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-900 outline-none transition-all focus:border-violet-500 focus:bg-white"
                placeholder="Google"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="role" className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Role</label>
              <input
                id="role"
                value={form.role}
                onChange={(event) => updateForm("role", event.target.value)}
                className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-900 outline-none transition-all focus:border-violet-500 focus:bg-white"
                placeholder="Software Engineer"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="level" className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Level</label>
              <select
                id="level"
                value={form.level}
                onChange={(event) => updateForm("level", event.target.value)}
                className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-900 outline-none transition-all focus:border-violet-500 focus:bg-white"
              >
                <option value="">Select level</option>
                {LEVEL_OPTIONS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="location" className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Location</label>
              <input
                id="location"
                value={form.location}
                onChange={(event) => updateForm("location", event.target.value)}
                className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-900 outline-none transition-all focus:border-violet-500 focus:bg-white"
                placeholder="Bangalore"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="experienceYears" className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Experience (years)</label>
              <input
                id="experienceYears"
                type="number"
                min="0"
                step="0.1"
                value={form.experienceYears}
                onChange={(event) => updateForm("experienceYears", event.target.value)}
                className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-900 outline-none transition-all focus:border-violet-500 focus:bg-white"
                placeholder="3"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="baseSalary" className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Base Salary</label>
              <input
                id="baseSalary"
                type="number"
                min="0"
                value={form.baseSalary}
                onChange={(event) => updateForm("baseSalary", event.target.value)}
                className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-900 outline-none transition-all focus:border-violet-500 focus:bg-white"
                placeholder="3200000"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="bonus" className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Bonus (optional)</label>
              <input
                id="bonus"
                type="number"
                min="0"
                value={form.bonus}
                onChange={(event) => updateForm("bonus", event.target.value)}
                className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-900 outline-none transition-all focus:border-violet-500 focus:bg-white"
                placeholder="400000"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="stock" className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Stock (optional)</label>
              <input
                id="stock"
                type="number"
                min="0"
                value={form.stock}
                onChange={(event) => updateForm("stock", event.target.value)}
                className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-900 outline-none transition-all focus:border-violet-500 focus:bg-white"
                placeholder="600000"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="confidenceScore" className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Confidence Score (0 to 1)</label>
              <input
                id="confidenceScore"
                type="number"
                min="0"
                max="1"
                step="0.01"
                value={form.confidenceScore}
                onChange={(event) => updateForm("confidenceScore", event.target.value)}
                className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-900 outline-none transition-all focus:border-violet-500 focus:bg-white"
              />
            </div>
          </div>

          {error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="w-full h-12 rounded-2xl bg-slate-900 px-5 text-sm font-black text-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all hover:-translate-y-0.5 active:translate-y-0 hover:bg-violet-600 hover:shadow-violet-600/30 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {submitting ? "Submitting..." : "Submit Salary"}
          </button>
        </form>
      </div>
    </main>
  );
}
