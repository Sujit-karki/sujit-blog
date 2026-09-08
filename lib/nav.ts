// The main navigation, in one place so the desktop header and the mobile
// drawer cannot drift apart. They previously held separate hard-coded copies,
// which is how /research — the hub for every original-data post — ended up
// reachable only by typing the URL.

export interface NavLink {
  label: string;
  href: string;
}

export const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Research", href: "/research" },
  { label: "Tools", href: "/tools" },
  { label: "About", href: "/about" },
  { label: "Work With Me", href: "/work-with-me" },
  { label: "Contact", href: "/contact" },
];
