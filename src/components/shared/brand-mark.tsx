import { cn } from "@/lib/utils/cn";

const sizeClasses = {
  sm: "h-7 w-7 rounded-[8px]",
  md: "h-8 w-8 rounded-[9px]",
  lg: "h-10 w-10 rounded-xl",
};

export function BrandMark({
  size = "md",
  className,
}: {
  size?: keyof typeof sizeClasses;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-grid shrink-0 place-items-center bg-primary text-white",
        sizeClasses[size],
        className,
      )}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-[62%] w-[62%]"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      >
        <path d="M6.5 7.5h8.5M6.5 12h5.5M6.5 16.5H15" />
        <circle cx="17.5" cy="12" r="2" fill="currentColor" stroke="none" />
      </svg>
    </span>
  );
}
