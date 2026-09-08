'use client'

// Defaults anchored to real, dated figures cited in the post:
// - Gas price default: EIA national average regular gasoline, $4.096/gal,
//   week ending 07/27/2026 (most recent weekly report as of publish date).
// - Electricity price default: 18.83 cents/kWh, national residential average,
//   April 2026 (EIA, via Electric Choice) — same figure used in the site's
//   electric-bill post for consistency.
// - Maintenance + insurance add-on defaults derived from AAA's Your Driving
//   Costs 2025 study (medium sedan: 11.91 cents/mi maintenance + ~10.5
//   cents/mi insurance-equivalent; EV category runs slightly higher on
//   insurance). Both are rough, user-editable estimates, not precise figures.

import { useState, useMemo } from 'react'
import AnimatedNumber from './AnimatedNumber'

function money(v: number): string {
  return '$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function cents(v: number): string {
  return v.toFixed(1) + '¢'
}

type VehicleType = 'gas' | 'ev'

export default function TrueCostOfDrivingCalculator() {
  const [vehicle, setVehicle] = useState<VehicleType>('gas')
  const [milesPerWeek, setMilesPerWeek] = useState(150)
  const [mpg, setMpg] = useState(28)
  const [gasPrice, setGasPrice] = useState(4.1)
  const [kwhPer100, setKwhPer100] = useState(30)
  const [elecPrice, setElecPrice] = useState(18.83)
  const [addOn, setAddOn] = useState(vehicle === 'gas' ? 22 : 24)

  function switchVehicle(v: VehicleType) {
    setVehicle(v)
    setAddOn(v === 'gas' ? 22 : 24)
  }

  const { fuelCostPerMile, totalCostPerMile, monthlyCost, annualCost } = useMemo(() => {
    const fuel =
      vehicle === 'gas' ? gasPrice / mpg : (kwhPer100 / 100) * (elecPrice / 100)
    const total = fuel + addOn / 100
    const weekly = total * milesPerWeek
    return {
      fuelCostPerMile: fuel,
      totalCostPerMile: total,
      monthlyCost: weekly * 4.345,
      annualCost: weekly * 52,
    }
  }, [vehicle, milesPerWeek, mpg, gasPrice, kwhPer100, elecPrice, addOn])

  return (
    <div className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-500 dark:text-gray-400 mb-1">
        Interactive · your actual cost per mile
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        What does your driving really cost?
      </p>

      <div className="flex gap-2 mb-5">
        <button
          type="button"
          onClick={() => switchVehicle('gas')}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
            vehicle === 'gas'
              ? 'bg-emerald-600 border-emerald-600 text-white'
              : 'bg-transparent border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300'
          }`}
        >
          Gas car
        </button>
        <button
          type="button"
          onClick={() => switchVehicle('ev')}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
            vehicle === 'ev'
              ? 'bg-emerald-600 border-emerald-600 text-white'
              : 'bg-transparent border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300'
          }`}
        >
          EV
        </button>
      </div>

      <div className="space-y-5 mb-6">
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <span>Miles driven per week</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{milesPerWeek}</b>
          </div>
          <input
            type="range" min={20} max={500} step={10} value={milesPerWeek}
            onChange={e => setMilesPerWeek(+e.target.value)}
            className="w-full accent-emerald-600"
          />
        </div>

        {vehicle === 'gas' ? (
          <>
            <div>
              <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                <span>Fuel economy</span>
                <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{mpg} MPG</b>
              </div>
              <input
                type="range" min={15} max={55} step={1} value={mpg}
                onChange={e => setMpg(+e.target.value)}
                className="w-full accent-emerald-600"
              />
            </div>
            <div>
              <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                <span>Local gas price ($/gal)</span>
                <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">${gasPrice.toFixed(2)}</b>
              </div>
              <input
                type="range" min={2.5} max={6.5} step={0.01} value={gasPrice}
                onChange={e => setGasPrice(+e.target.value)}
                className="w-full accent-emerald-600"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Defaulted to the EIA national average, $4.10/gal (week of 7/27/26) — edit to your local pump price.
              </p>
            </div>
          </>
        ) : (
          <>
            <div>
              <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                <span>EV efficiency</span>
                <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{kwhPer100} kWh/100mi</b>
              </div>
              <input
                type="range" min={20} max={45} step={1} value={kwhPer100}
                onChange={e => setKwhPer100(+e.target.value)}
                className="w-full accent-emerald-600"
              />
            </div>
            <div>
              <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                <span>Electricity price (¢/kWh)</span>
                <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{elecPrice.toFixed(2)}¢</b>
              </div>
              <input
                type="range" min={8} max={40} step={0.1} value={elecPrice}
                onChange={e => setElecPrice(+e.target.value)}
                className="w-full accent-emerald-600"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Defaulted to the national residential average, 18.83¢/kWh (April 2026, EIA) — edit to your utility rate.
              </p>
            </div>
          </>
        )}

        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <span>Maintenance + insurance add-on (¢/mile)</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{addOn}¢</b>
          </div>
          <input
            type="range" min={5} max={40} step={1} value={addOn}
            onChange={e => setAddOn(+e.target.value)}
            className="w-full accent-emerald-600"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Rough AAA-based default (maintenance + insurance, excluding depreciation and financing) — highly dependent on your vehicle and driving record.
          </p>
        </div>
      </div>

      <div className="pt-5 border-t border-dashed border-gray-200 dark:border-gray-700">
        <p className="font-serif text-lg sm:text-xl leading-snug mb-4 text-gray-900 dark:text-white">
          At {milesPerWeek} miles/week, your {vehicle === 'gas' ? 'gas car' : 'EV'} costs about{' '}
          <strong className="text-emerald-700 dark:text-emerald-400">{cents(totalCostPerMile * 100)}/mile</strong> to
          drive — roughly <strong>{money(monthlyCost)}/month</strong>.
        </p>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="font-mono text-[11px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">Cost per mile</p>
            <p className="font-serif text-2xl font-bold text-gray-900 dark:text-white">{cents(totalCostPerMile * 100)}</p>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="font-mono text-[11px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">Monthly cost</p>
            <AnimatedNumber
              value={monthlyCost}
              format={v => money(v)}
              startFromZero
              className="font-serif text-2xl font-bold text-gray-900 dark:text-white"
            />
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="font-mono text-[11px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">Annual cost</p>
            <AnimatedNumber
              value={annualCost}
              format={v => money(v)}
              startFromZero
              className="font-serif text-2xl font-bold text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">Estimate only — not financial or tax advice.</p>

        <div className="overflow-x-auto mt-5 rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="min-w-full text-sm">
            <caption className="sr-only">True cost of driving — data table</caption>
            <tbody>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">Vehicle type</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{vehicle === 'gas' ? 'Gas car' : 'EV'}</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">Miles per week</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{milesPerWeek}</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">
                  {vehicle === 'gas' ? 'Fuel economy' : 'EV efficiency'}
                </td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">
                  {vehicle === 'gas' ? `${mpg} MPG` : `${kwhPer100} kWh/100mi`}
                </td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">
                  {vehicle === 'gas' ? 'Gas price' : 'Electricity price'}
                </td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">
                  {vehicle === 'gas' ? `$${gasPrice.toFixed(2)}/gal` : `${elecPrice.toFixed(2)}¢/kWh`}
                </td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">Fuel/energy cost per mile</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{cents(fuelCostPerMile * 100)}</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">Maintenance + insurance add-on</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{addOn}¢/mile</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">Total cost per mile</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{cents(totalCostPerMile * 100)}</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">Monthly cost</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{money(monthlyCost)}</td>
              </tr>
              <tr>
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">Annual cost</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{money(annualCost)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
