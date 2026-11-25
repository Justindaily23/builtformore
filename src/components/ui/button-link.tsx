const styles = {
  gold: "bg-gold text-plum-950 hover:bg-gold-light",
  plum: "bg-plum text-ivory hover:bg-plum-950",
  outline: "border border-current hover:bg-ivory/10",
};

export function ButtonLink({
  href,
  variant = "gold",
  children,
}: {
  href: string;
  variant?: keyof typeof styles;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className={`inline-flex min-h-12 items-center justify-center rounded-full px-7 py-3 text-center font-semibold transition-colors ${styles[variant]}`}
    >
      {children}
    </a>
  );
}
