"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

type NavItem = { href: string; label: string };

export function MobileNav({
  items,
  brand = "Menu",
}: {
  items: NavItem[];
  brand?: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const panelId = React.useId();

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);


  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <nav aria-label="Primary" className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium shadow-sm"
      >
        <span className="sr-only">Toggle navigation</span>

        <Menu />


        <span className="select-none">{brand}</span>
      </button>

      <div
        id={panelId}
        hidden={!open}
        className="absolute left-0 mt-2 w-56 rounded-2xl border p-2 shadow-lg"
      >
        <ul className="flex flex-col">
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={[
                    "block rounded-xl px-3 py-2 text-sm",
                    active ? "font-semibold" : "opacity-90",
                    "hover:opacity-100",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}