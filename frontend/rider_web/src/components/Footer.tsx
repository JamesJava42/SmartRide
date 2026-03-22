export function Footer({ flush = false }: { flush?: boolean }) {
  return (
    <footer className={`${flush ? "mt-0 bg-white" : "mt-auto border-t border-line bg-surface"}`}>
      <div className={`${flush ? "w-full px-4 py-5" : "mx-auto w-full max-w-[1220px] px-4 py-4 sm:px-6 lg:px-8"} flex flex-col gap-2 text-xs text-muted lg:flex-row lg:items-center lg:justify-between`}>
        <div>
          <p className="text-sm font-semibold text-ink">RideConnect</p>
          <div className="mt-1 flex flex-wrap gap-4">
            <a href="#" className="transition hover:text-ink">
              Help Center
            </a>
            <a href="#" className="transition hover:text-ink">
              Contact Support
            </a>
          </div>
        </div>
        <p className="text-[12px]">&copy; 2024 RideConnect. All Rights Reserved</p>
      </div>
    </footer>
  );
}
