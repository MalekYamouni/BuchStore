import React from "react";

type Props = {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  variant?: "default";
  icon?: React.ReactNode;
};

export default function SectionHeader({ title, subtitle, right, variant = "default", icon }: Props) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    const id = setTimeout(() => setMounted(true), 20);
    return () => clearTimeout(id);
  }, []);

  const containerAnim = mounted
    ? "opacity-100 translate-y-0"
    : "opacity-0 -translate-y-2";

  return (
    <div className="w-full mb-6">
      {subtitle ? (
        <div className="text-sm text-muted-foreground mb-2">{subtitle}</div>
      ) : null}

      <div
        className={`relative w-full flex items-center bg-white/95 backdrop-blur-md border border-gray-200/80 rounded-2xl shadow-md overflow-hidden dark:bg-slate-800/70 dark:border-slate-700/40 transform transition-all duration-500 ${containerAnim}`}
      >
  <div className="h-full w-2 section-accent" />

        <div className={`flex-1 px-6 py-4 flex items-center gap-4 ${variant === "default" ? "py-3" : "py-4"}`}>
          {variant === "default" && icon ? (
            <div className="flex items-center justify-center w-10 h-10 bg-white rounded-lg shadow-sm dark:bg-slate-700" style={{ boxShadow: 'inset 0 0 0 2px var(--subtle-purple-ghost)' }}>
              {icon}
            </div>
          ) : null}
          <h3 className="text-2xl sm:text-3xl font-medium text-slate-900 dark:text-slate-100 leading-tight">{title}</h3>
        </div>

        {right ? (
          <div className="pr-4">
            <div className="section-right-pill inline-flex items-center px-3 py-1.5 bg-white shadow-sm rounded-full text-sm font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-100">
              {right}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
