import React, { useState } from 'react';
import { Calculator, Sparkles, Delete, RotateCcw, Check, Copy, Loader2, ArrowRight } from 'lucide-react';
import { solveMathEquation } from '../../services/api';

export const CalculatorTool: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [aiProblem, setAiProblem] = useState('');
  const [aiSolution, setAiSolution] = useState<{
    finalAnswer: string;
    steps: string[];
    formulaUsed?: string;
    verification?: string;
    practicalApplication?: string;
  } | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [copied, setCopied] = useState(false);

  // Scientific calculator keypad click
  const handleKey = (val: string) => {
    if (val === 'C') {
      setDisplay('0');
      setEquation('');
      return;
    }
    if (val === 'DEL') {
      setDisplay((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
      return;
    }
    if (val === '=') {
      try {
        // Safe evaluation for standard math expressions
        const sanitized = display
          .replace(/×/g, '*')
          .replace(/÷/g, '/')
          .replace(/π/g, 'Math.PI')
          .replace(/e/g, 'Math.E')
          .replace(/sin\(/g, 'Math.sin(')
          .replace(/cos\(/g, 'Math.cos(')
          .replace(/tan\(/g, 'Math.tan(')
          .replace(/sqrt\(/g, 'Math.sqrt(')
          .replace(/\^/g, '**');

        // Execute safe math
        const result = Function(`'use strict'; return (${sanitized})`)();
        setEquation(`${display} =`);
        setDisplay(String(Number(result.toFixed(8))));
      } catch (err) {
        setDisplay('Error');
      }
      return;
    }

    setDisplay((prev) => {
      if (prev === '0' || prev === 'Error') {
        return val;
      }
      return prev + val;
    });
  };

  const handleSolveAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiProblem.trim() || loadingAi) return;

    setLoadingAi(true);
    try {
      const res = await solveMathEquation(aiProblem.trim());
      setAiSolution(res);
    } catch (err: any) {
      alert(err.message || 'Math solver error');
    } finally {
      setLoadingAi(false);
    }
  };

  const keys = [
    ['sin(', 'cos(', 'tan(', 'sqrt(', 'C'],
    ['(', ')', '^', '÷', 'DEL'],
    ['7', '8', '9', '×', 'π'],
    ['4', '5', '6', '-', 'e'],
    ['1', '2', '3', '+', '='],
    ['0', '.', '%', '00'],
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <Calculator className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white">Scientific Calculator & Math Engine</h2>
          <p className="text-xs text-slate-400">Instant scientific evaluation plus AI step-by-step rigorous derivations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Keypad */}
        <div className="lg:col-span-5 bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-white/10 flex flex-col justify-between space-y-4 shadow-xl">
          {/* LCD Screen */}
          <div className="p-4 rounded-xl bg-[#04060A] border border-white/10 text-right space-y-1">
            <div className="text-xs font-mono text-slate-500 h-4 truncate">{equation}</div>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-emerald-400 truncate tracking-tight">
              {display}
            </div>
          </div>

          {/* Keypad Grid */}
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2 text-xs sm:text-sm font-mono">
            {keys.flat().map((k, i) => {
              const isOperator = ['÷', '×', '-', '+', '='].includes(k);
              const isClear = ['C', 'DEL'].includes(k);
              const isEquals = k === '=';

              return (
                <button
                  key={i}
                  onClick={() => handleKey(k)}
                  className={`p-2.5 sm:p-3 rounded-xl transition-all active:scale-95 flex items-center justify-center font-medium ${
                    isEquals
                      ? 'col-span-1 bg-emerald-500 hover:bg-emerald-400 text-black font-bold shadow-md shadow-emerald-500/20'
                      : isOperator
                      ? 'bg-slate-800 text-cyan-400 hover:bg-slate-700'
                      : isClear
                      ? 'bg-rose-950/40 text-rose-300 hover:bg-rose-900/50 border border-rose-500/20'
                      : 'bg-slate-950/80 text-white hover:bg-slate-800 border border-white/5'
                  }`}
                >
                  {k}
                </button>
              );
            })}
          </div>
        </div>

        {/* AI Step-by-Step Solver */}
        <div className="lg:col-span-7 bg-slate-900/40 p-4 sm:p-5 rounded-2xl border border-white/10 flex flex-col space-y-4">
          <div>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              AI Step-by-Step Math & Physics Derivation
            </span>
            <form onSubmit={handleSolveAI} className="flex gap-2">
              <input
                type="text"
                value={aiProblem}
                onChange={(e) => setAiProblem(e.target.value)}
                placeholder="e.g. Find derivative of ln(x^2 + 1) or calculate orbital decay..."
                className="flex-1 rounded-xl bg-slate-950/80 border border-white/10 px-3 py-2 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50"
              />
              <button
                type="submit"
                disabled={loadingAi || !aiProblem.trim()}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs sm:text-sm transition-all disabled:opacity-50"
              >
                {loadingAi ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Solve'}
              </button>
            </form>
          </div>

          {/* Solution display */}
          <div className="flex-1 overflow-y-auto min-h-[220px]">
            {aiSolution ? (
              <div className="space-y-3 p-4 rounded-xl bg-[#06080F] border border-white/10 text-xs text-slate-200">
                <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider block">
                      Final Verified Answer
                    </span>
                    <span className="text-base sm:text-lg font-mono font-bold text-white">
                      {aiSolution.finalAnswer}
                    </span>
                  </div>
                  {aiSolution.formulaUsed && (
                    <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded border border-white/5">
                      {aiSolution.formulaUsed}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 pt-2">
                  <span className="font-semibold text-slate-400 uppercase tracking-wider text-[11px]">
                    Step-by-Step Proof:
                  </span>
                  {aiSolution.steps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-2 rounded bg-slate-900/60 border border-white/5">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono text-[10px] flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="font-sans leading-relaxed">{step}</span>
                    </div>
                  ))}
                </div>

                {aiSolution.practicalApplication && (
                  <div className="text-[11px] text-slate-400 pt-2 border-t border-white/5 italic">
                    Application: {aiSolution.practicalApplication}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500 text-xs">
                <Calculator className="w-8 h-8 mb-2 opacity-30 text-emerald-400" />
                <span>Enter any equation or calculus problem above for full mathematical reasoning.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
