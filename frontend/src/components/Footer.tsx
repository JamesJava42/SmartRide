export function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-surface">
      <div className="mx-auto flex w-full max-w-[1220px] flex-col gap-2 px-4 py-4 text-xs text-muted sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <p className="font-semibold text-ink">RideConnect</p>
          <div className="mt-1 flex flex-wrap gap-3">
            <a href="#" className="transition hover:text-ink">
              Help Center
            </a>
            <a href="#" className="transition hover:text-ink">
              Contact Support
            </a>
          </div>
        </div>
        <p>&copy; 2024 RideConnect. All Rights Reserved</p>
      </div>
    </footer>
  );
}
