export function SectionHeader({ eyebrow, title, action, subtitle }) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
      <div className="flex-1 min-w-[300px]">
        {eyebrow && <div className="section-eyebrow text-brand-700 dark:text-brand-300 font-bold">{eyebrow}</div>}
        <h2 className="mt-3 text-[34px] font-semibold leading-tight text-slate-950 dark:text-white md:text-[56px]">{title}</h2>
        {subtitle && <p className="mt-5 max-w-3xl text-[17px] leading-8 text-slate-600 dark:text-slate-400">{subtitle}</p>}
      </div>
      <div className="shrink-0">
        {action}
      </div>
    </div>
  )
}
