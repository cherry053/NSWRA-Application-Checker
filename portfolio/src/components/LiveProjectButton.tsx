import { ArrowUpRight } from 'lucide-react';

type LiveProjectButtonProps = {
  label?: string;
  href?: string;
  className?: string;
};

export default function LiveProjectButton({
  label = 'Live Project',
  href,
  className = '',
}: LiveProjectButtonProps) {
  const classes = `inline-flex shrink-0 items-center gap-2 rounded-full border-2 border-[#D7E2EA] px-8 py-3 text-sm font-medium uppercase tracking-widest text-[#D7E2EA] transition-colors duration-200 hover:bg-[#D7E2EA]/10 sm:px-10 sm:py-3.5 sm:text-base ${className}`;

  // No link to offer — render nothing rather than a dead-looking button.
  if (!href) return null;

  return (
    <a className={classes} href={href} target="_blank" rel="noreferrer noopener">
      {label}
      <ArrowUpRight size={18} strokeWidth={2.5} />
    </a>
  );
}
