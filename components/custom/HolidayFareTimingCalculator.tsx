'use client'

// Illustrative fare-timing model based on published fare studies (Google Flights /
// Expedia Air Hacks data): fares are near their floor 32-73 days before a holiday
// and rise sharply inside 21 days; flying a mid-week day trims a further ~8-14%.

import { useState, useMemo } from 'react'
import AnimatedNumber from './AnimatedNumber'

function money(v: number): string {
  return '$' + Math.round(v).toLocaleString('en-US')
}

function multiplierFor(daysOut: number): number {
  if (daysOut >= 32) return 1.0
  if (daysOut >= 21) return 1.08
  if (daysOut >= 14) return 1.18
  if (daysOut >= 7) return 1.3
  return 1.4
}

export default function HolidayFareTimingCalculator() {
  const [baseFare, setBaseFare] = useState(300)
  const [travelers, setTravelers] = useState(2)
  const [daysBeforeHoliday, setDaysBeforeHoliday] = useState(30)
  const [flyOnPeakDay, setFlyOnPeakDay] = useState(true)

  const { perTicket, total } = useMemo(() => {
    const timing = multiplierFor(daysBeforeHoliday)
    const peakSurcharge = flyOnPeakDay ? 1.08 : 1.0
    const perTicket = baseFare * timing * peakSurcharge
    return { perTicket, total: perTicket * travelers }
  }, [baseFare, travelers, daysBeforeHoliday, flyOnPeakDay])

  return (
    <div className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-400 mb-1">
        Interactive · estimate your holiday flight budget
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        How much does booking timing actually cost you?
      </p>

      <div className="space-y-5 mb-6">
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Typical fare on this route, booked early</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(baseFare)}</b>
          </div>
          <input
            type="range" min={50} max={2000} step={10} value={baseFare}
            onChange={e => setBaseFare(+e.target.value)}
            className="w-full accent-emerald-600"
          />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Travelers</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{travelers}</b>
          </div>
          <input
            type="range" min={1} max={10} step={1} value={travelers}
            onChange={e => setTravelers(+e.target.value)}
            className="w-full accent-emerald-600"
          />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Days before the holiday you book</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{daysBeforeHoliday} days</b>
          </div>
          <input
            type="range" min={1} max={120} step={1} value={daysBeforeHoliday}
            onChange={e => setDaysBeforeHoliday(+e.target.value)}
            className="w-full accent-emerald-600"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <input
            type="checkbox" checked={flyOnPeakDay}
            onChange={e => setFlyOnPeakDay(e.target.checked)}
            className="accent-emerald-600"
          />
          Flying on the peak day (Sunday) instead of a cheaper mid-week day
        </label>
      </div>

      <div className="pt-5 border-t border-dashed border-gray-200 dark:border-gray-700">
        <p className="font-serif text-lg sm:text-xl leading-snug mb-4 text-gray-900 dark:text-white">
          At {daysBeforeHoliday} days out for {travelers} traveler{travelers === 1 ? '' : 's'}, estimated total:{' '}
          <strong className="text-emerald-600 dark:text-emerald-400">{money(total)}</strong>
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="font-mono text-[11px] uppercase tracking-widest text-gray-400 mb-1">Per ticket</p>
            <AnimatedNumber
              value={perTicket}
              format={v => money(v)}
              startFromZero
              className="font-serif text-2xl font-bold text-gray-900 dark:text-white"
            />
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="font-mono text-[11px] uppercase tracking-widest text-gray-400 mb-1">Estimated total</p>
            <AnimatedNumber
              value={total}
              format={v => money(v)}
              startFromZero
              className="font-serif text-2xl font-bold text-emerald-600 dark:text-emerald-400"
            />
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-4">
          Illustrative multipliers from published fare studies, not live prices — check Google Flights for your actual route.
        </p>

        <div className="overflow-x-auto mt-5 rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="min-w-full text-sm">
            <caption className="sr-only">Holiday fare timing — data table</caption>
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-300">Days out</th>
                <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-300">Est. fare per ticket</th>
              </tr>
            </thead>
            <tbody>
              {[60, 45, 30, 14].map((d) => (
                <tr key={d} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{d}</td>
                  <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">
                    {money(baseFare * multiplierFor(d) * (flyOnPeakDay ? 1.08 : 1.0))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
