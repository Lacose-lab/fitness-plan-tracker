import type { ReactNode } from "react";

export function Icon({ children }: { children: ReactNode }) {
  return <span className="icon" aria-hidden="true">{children}</span>;
}

export function IWeight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 7a5 5 0 0 1 10 0" />
      <path d="M6 7h12l1.5 14H4.5L6 7Z" />
      <path d="M12 12v2" />
    </svg>
  );
}

export function ISteps() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 20c2.5-2 2.5-6 0-8" />
      <path d="M12 20c2.5-2 2.5-6 0-8" />
      <path d="M17 20c2.5-2 2.5-6 0-8" />
      <path d="M7 12c1.3-1.2 2.7-2 5-2s3.7.8 5 2" />
    </svg>
  );
}

export function IFlame() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22c4 0 7-2.8 7-7 0-3.8-2.5-6.2-4.5-8.6-.6 2.3-2 3.9-3.5 5.2-.4-1.8-1.4-3.7-3.5-5.6C6 8.6 5 10.7 5 14.7 5 19.2 8 22 12 22Z" />
    </svg>
  );
}

export function IProtein() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 21c2-1 3-3 3-5s-1-4-3-5" />
      <path d="M16 3c-2 1-3 3-3 5s1 4 3 5" />
      <path d="M7 16c2 0 3.5-1 5-3s3-3 5-3" />
    </svg>
  );
}

export function IToday() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2v3M16 2v3" />
      <path d="M3.5 9h17" />
      <path d="M5 5h14a2 2 0 0 1 2 2v14H3V7a2 2 0 0 1 2-2Z" />
      <path d="M8 13h3" />
    </svg>
  );
}

export function ILog() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 7h10" />
      <path d="M7 12h10" />
      <path d="M7 17h7" />
      <path d="M5 3h14a2 2 0 0 1 2 2v16H3V5a2 2 0 0 1 2-2Z" />
    </svg>
  );
}

export function IPlan() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 6h13" />
      <path d="M8 12h13" />
      <path d="M8 18h13" />
      <path d="M3 6h1" />
      <path d="M3 12h1" />
      <path d="M3 18h1" />
    </svg>
  );
}

export function IProgress() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="M8 15l3-3 3 2 4-6" />
    </svg>
  );
}

export function ISettings() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
      <path d="M19.4 15a8 8 0 0 0 .1-1l2-1.2-2-3.4-2.3.6a7.7 7.7 0 0 0-1.7-1L15 6h-6l-.6 2.4a7.7 7.7 0 0 0-1.7 1l-2.3-.6-2 3.4L4.6 14a8 8 0 0 0 .1 1 8 8 0 0 0-.1 1L2.6 17.2l2 3.4 2.3-.6c.5.4 1.1.7 1.7 1L9 24h6l.6-2.4c.6-.3 1.2-.6 1.7-1l2.3.6 2-3.4-2-1.2a8 8 0 0 0-.1-1Z" />
    </svg>
  );
}
