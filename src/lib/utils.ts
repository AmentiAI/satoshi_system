import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateAddress(addr: string, chars = 6): string {
  if (!addr) return "";
  return `${addr.slice(0, chars)}...${addr.slice(-chars)}`;
}

export function satsToBtc(sats: number | string): number {
  return Number(sats) / 100_000_000;
}

export function btcToSats(btc: number): number {
  return Math.round(btc * 100_000_000);
}

export function formatSatsDisplay(sats: string | number): string {
  const n = Number(sats);
  if (n >= 100_000_000) {
    return `${(n / 100_000_000).toFixed(4)} BTC`;
  }
  if (n >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(2)}M sats`;
  }
  if (n >= 1_000) {
    return `${(n / 1_000).toFixed(1)}k sats`;
  }
  return `${n.toLocaleString()} sats`;
}

export function formatBlockNumber(block: number): string {
  return `#${block.toLocaleString()}`;
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
