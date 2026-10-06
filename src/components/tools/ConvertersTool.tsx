import React, { useState } from 'react';
import { ArrowRightLeft, DollarSign, Scale, RefreshCw } from 'lucide-react';

export const ConvertersTool: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'currency' | 'unit'>('currency');

  // Currency Converter State
  const [currencyAmount, setCurrencyAmount] = useState<number>(100);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('INR');

  // Baseline exchange rates relative to 1 USD
  const ratesToUSD: Record<string, number> = {
    USD: 1.0,
    EUR: 0.92,
    GBP: 0.79,
    INR: 86.85,
    JPY: 154.2,
    CAD: 1.39,
    AUD: 1.54,
    CHF: 0.88,
    CNY: 7.24,
    SGD: 1.34,
    AED: 3.67,
    SAR: 3.75,
  };

  const convertedCurrency = ((currencyAmount / ratesToUSD[fromCurrency]) * ratesToUSD[toCurrency]).toFixed(2);

  // Unit Converter State
  const [unitCategory, setUnitCategory] = useState<'length' | 'mass' | 'temperature' | 'speed' | 'data'>('length');
  const [unitAmount, setUnitAmount] = useState<number>(1);
  const [fromUnit, setFromUnit] = useState('meter');
  const [toUnit, setToUnit] = useState('feet');

  const unitFactors: Record<string, Record<string, number>> = {
    length: {
      meter: 1,
      kilometer: 1000,
      centimeter: 0.01,
      millimeter: 0.001,
      mile: 1609.34,
      yard: 0.9144,
      feet: 0.3048,
      inch: 0.0254,
    },
    mass: {
      kilogram: 1,
      gram: 0.001,
      milligram: 0.000001,
      pound: 0.453592,
      ounce: 0.0283495,
      ton: 1000,
    },
    speed: {
      'm/s': 1,
      'km/h': 0.277778,
      'mph': 0.44704,
      'knot': 0.514444,
    },
    data: {
      Byte: 1,
      Kilobyte: 1024,
      Megabyte: 1024 * 1024,
      Gigabyte: 1024 * 1024 * 1024,
      Terabyte: 1024 * 1024 * 1024 * 1024,
    },
  };

  let convertedUnitResult = 0;
  if (unitCategory === 'temperature') {
    // Temperature special conversion
    if (fromUnit === toUnit) convertedUnitResult = unitAmount;
    else if (fromUnit === 'Celsius' && toUnit === 'Fahrenheit') convertedUnitResult = (unitAmount * 9) / 5 + 32;
    else if (fromUnit === 'Celsius' && toUnit === 'Kelvin') convertedUnitResult = unitAmount + 273.15;
    else if (fromUnit === 'Fahrenheit' && toUnit === 'Celsius') convertedUnitResult = ((unitAmount - 32) * 5) / 9;
    else if (fromUnit === 'Fahrenheit' && toUnit === 'Kelvin') convertedUnitResult = ((unitAmount - 32) * 5) / 9 + 273.15;
    else if (fromUnit === 'Kelvin' && toUnit === 'Celsius') convertedUnitResult = unitAmount - 273.15;
    else if (fromUnit === 'Kelvin' && toUnit === 'Fahrenheit') convertedUnitResult = ((unitAmount - 273.15) * 9) / 5 + 32;
  } else {
    const base = unitAmount * (unitFactors[unitCategory]?.[fromUnit] || 1);
    convertedUnitResult = base / (unitFactors[unitCategory]?.[toUnit] || 1);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">Universal Converters</h2>
            <p className="text-xs text-slate-400">Real-time global currency exchange rates & physical metric conversions</p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex p-1 rounded-xl bg-slate-900 border border-white/10 text-xs">
          <button
            onClick={() => setActiveSubTab('currency')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeSubTab === 'currency' ? 'bg-cyan-500 text-black font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Currency
          </button>
          <button
            onClick={() => setActiveSubTab('unit')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeSubTab === 'unit' ? 'bg-cyan-500 text-black font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Units & Physics
          </button>
        </div>
      </div>

      {/* CURRENCY CONVERTER */}
      {activeSubTab === 'currency' ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-7 bg-slate-900/60 p-5 rounded-2xl border border-white/10 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Exchange Parameters</span>
              <span className="text-[11px] font-mono text-cyan-400">Market Benchmark 2026</span>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Amount</label>
              <input
                type="number"
                min="0"
                step="any"
                value={currencyAmount}
                onChange={(e) => setCurrencyAmount(Number(e.target.value))}
                className="w-full rounded-xl bg-slate-950 border border-white/10 p-3 text-lg font-mono text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            <div className="grid grid-cols-5 gap-2 items-center">
              <div className="col-span-2">
                <label className="block text-xs text-slate-400 mb-1">From</label>
                <select
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-white/10 p-2.5 text-xs sm:text-sm text-white focus:outline-none"
                >
                  {Object.keys(ratesToUSD).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-1 flex justify-center pt-5">
                <button
                  onClick={() => {
                    const temp = fromCurrency;
                    setFromCurrency(toCurrency);
                    setToCurrency(temp);
                  }}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 transition-colors"
                  title="Swap Currencies"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                </button>
              </div>

              <div className="col-span-2">
                <label className="block text-xs text-slate-400 mb-1">To</label>
                <select
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-white/10 p-2.5 text-xs sm:text-sm text-white focus:outline-none"
                >
                  {Object.keys(ratesToUSD).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#05070B] border border-cyan-500/20 text-center space-y-1 sonvex-glow-cyan">
              <div className="text-xs text-slate-400 font-mono">
                {currencyAmount} {fromCurrency} =
              </div>
              <div className="text-3xl sm:text-4xl font-mono font-bold text-cyan-400">
                {convertedCurrency} <span className="text-sm font-sans font-normal text-slate-400">{toCurrency}</span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono pt-1">
                1 {fromCurrency} = {((1 / ratesToUSD[fromCurrency]) * ratesToUSD[toCurrency]).toFixed(4)} {toCurrency}
              </div>
            </div>
          </div>

          <div className="md:col-span-5 bg-slate-900/30 p-5 rounded-2xl border border-white/10 space-y-3">
            <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Major Benchmark Rates (vs USD)
            </div>
            <div className="space-y-1.5 text-xs font-mono">
              {['EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AED'].map((curr) => (
                <div key={curr} className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-white/5">
                  <span className="text-slate-300 font-sans">USD / {curr}</span>
                  <span className="text-cyan-400 font-bold">{ratesToUSD[curr]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* UNIT CONVERTER */
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-white/10 space-y-5 shadow-xl">
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {(['length', 'mass', 'temperature', 'speed', 'data'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setUnitCategory(cat);
                  if (cat === 'temperature') {
                    setFromUnit('Celsius');
                    setToUnit('Fahrenheit');
                  } else {
                    const keys = Object.keys(unitFactors[cat]);
                    setFromUnit(keys[0]);
                    setToUnit(keys[1] || keys[0]);
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                  unitCategory === cat
                    ? 'bg-cyan-500 text-black shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Value</label>
              <input
                type="number"
                step="any"
                value={unitAmount}
                onChange={(e) => setUnitAmount(Number(e.target.value))}
                className="w-full rounded-xl bg-slate-950 border border-white/10 p-3 text-lg font-mono text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">From Unit</label>
              <select
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-white/10 p-3 text-sm text-white focus:outline-none"
              >
                {unitCategory === 'temperature'
                  ? ['Celsius', 'Fahrenheit', 'Kelvin'].map((u) => <option key={u} value={u}>{u}</option>)
                  : Object.keys(unitFactors[unitCategory] || {}).map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">To Unit</label>
              <select
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-white/10 p-3 text-sm text-white focus:outline-none"
              >
                {unitCategory === 'temperature'
                  ? ['Celsius', 'Fahrenheit', 'Kelvin'].map((u) => <option key={u} value={u}>{u}</option>)
                  : Object.keys(unitFactors[unitCategory] || {}).map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#05070B] border border-cyan-500/30 text-center space-y-1">
            <div className="text-xs text-slate-400 font-mono">
              {unitAmount} {fromUnit} =
            </div>
            <div className="text-3xl sm:text-4xl font-mono font-bold text-cyan-400">
              {convertedUnitResult.toLocaleString(undefined, { maximumFractionDigits: 6 })}{' '}
              <span className="text-sm font-sans font-normal text-slate-400">{toUnit}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
