import Link from "next/link";

export default function StampCardButton() {
  return (
    <Link
      href="/card"
      className="fixed bottom-[10.5rem] right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 group"
      style={{ backgroundColor: "#D4A017" }}
      aria-label="Ver mi tarjeta de sellos"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-7 h-7">
        <path d="M4 4.75A2.75 2.75 0 016.75 2h10.5A2.75 2.75 0 0120 4.75v14.5A2.75 2.75 0 0117.25 22H6.75A2.75 2.75 0 014 19.25V4.75zM6.75 4a.75.75 0 00-.75.75v14.5c0 .414.336.75.75.75h10.5a.75.75 0 00.75-.75V4.75a.75.75 0 00-.75-.75H6.75z" />
        <path d="M8 7.5A1.5 1.5 0 019.5 6h5A1.5 1.5 0 0116 7.5v1A1.5 1.5 0 0114.5 10h-5A1.5 1.5 0 018 8.5v-1zM8 13a1 1 0 011-1h.01a1 1 0 010 2H9a1 1 0 01-1-1zM11 13a1 1 0 011-1h.01a1 1 0 010 2H12a1 1 0 01-1-1zM14 13a1 1 0 011-1h.01a1 1 0 010 2H15a1 1 0 01-1-1zM8 17a1 1 0 011-1h.01a1 1 0 010 2H9a1 1 0 01-1-1zM11 17a1 1 0 011-1h.01a1 1 0 010 2H12a1 1 0 01-1-1zM14 17a1 1 0 011-1h.01a1 1 0 010 2H15a1 1 0 01-1-1z" />
      </svg>
      <span className="absolute right-16 bg-black text-white text-xs px-3 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        Mi Tarjeta
      </span>
    </Link>
  );
}
