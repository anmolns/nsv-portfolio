export function Footer() {
  return (
    <footer className="bg-navy border-t border-white/10 py-5" aria-label="Site footer">
      <p className="text-center text-white/35 text-[11px] font-light px-5">
        © {new Date().getFullYear()} NS Ventures. All rights reserved.
      </p>
    </footer>
  )
}
