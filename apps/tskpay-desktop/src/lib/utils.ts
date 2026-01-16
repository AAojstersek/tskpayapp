// Simple className utility - can be replaced with clsx + tailwind-merge later
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(' ')
}
