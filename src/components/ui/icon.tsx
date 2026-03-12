import { cn } from "@/lib/utils";

type IconProps = {
  /** Material Symbols Outlined icon name, e.g. "home", "barcode_scanner" */
  name: string;
  /** Tailwind text-size class, e.g. "text-2xl" */
  size?: string;
  /** Whether to use the filled variant */
  filled?: boolean;
  className?: string;
};

/**
 * Thin wrapper around Material Symbols Outlined.
 *
 * Usage:
 *   <Icon name="home" />
 *   <Icon name="settings" filled size="text-3xl" />
 */
export function Icon({ name, size, filled, className }: IconProps) {
  return (
    <span
      className={cn(
        "material-symbols-outlined",
        filled && "icon-filled",
        size,
        className,
      )}
    >
      {name}
    </span>
  );
}
