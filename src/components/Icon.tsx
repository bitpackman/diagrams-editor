import type { ReactElement } from 'react';
import type { IconName } from '../types';

const PATHS: Record<IconName, ReactElement> = {
  play: <path d="M8 5.5v13l11-6.5z" fill="currentColor" stroke="none" />,
  check: <path d="M20 6L9 17l-5-5" />,
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c.5-4 4-6 8-6s7.5 2 8 6" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </>
  ),
  send: (
    <>
      <path d="M22 2L11 13" />
      <path d="M22 2l-7 20-4-9-9-4z" />
    </>
  ),
  help: (
    <>
      <path d="M9.1 9a3 3 0 1 1 4.7 2.5c-1 .7-1.8 1.3-1.8 2.5" />
      <path d="M12 17.5h.01" />
    </>
  ),
  database: (
    <>
      <ellipse cx="12" cy="5.5" rx="8" ry="2.8" />
      <path d="M4 5.5v13c0 1.5 3.6 2.8 8 2.8s8-1.3 8-2.8v-13" />
      <path d="M4 12c0 1.5 3.6 2.8 8 2.8s8-1.3 8-2.8" />
    </>
  ),
  table: (
    <>
      <rect x="3" y="5" width="18" height="15" rx="2" />
      <path d="M3 10h18" />
      <path d="M10 10v10" />
    </>
  ),
  document: (
    <>
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6z" />
      <path d="M14 3v6h6" />
    </>
  ),
  cloud: <path d="M17.5 19H7a4.5 4.5 0 1 1 .9-8.9A6 6 0 0 1 19.6 12 3.5 3.5 0 0 1 17.5 19z" />,
  bot: (
    <>
      <rect x="4" y="9" width="16" height="11" rx="3" />
      <path d="M12 9V5" />
      <circle cx="12" cy="4" r="1" fill="currentColor" stroke="none" />
      <circle cx="9" cy="14.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="14.5" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  webhook: (
    <>
      <circle cx="18" cy="5" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="19" r="2.5" />
      <path d="M8.2 10.9l7.6-4.5" />
      <path d="M8.2 13.1l7.6 4.5" />
    </>
  ),
  note: (
    <>
      <path d="M6 3h12a2 2 0 0 1 2 2v9l-7 7H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
      <path d="M13 21v-5a2 2 0 0 1 2-2h5" />
    </>
  ),
  merge: (
    <>
      <circle cx="7" cy="6" r="2.3" />
      <circle cx="7" cy="18" r="2.3" />
      <circle cx="17" cy="12" r="2.3" />
      <path d="M7 8.3v7.4" />
      <path d="M7 9c0 3.5 4 3 7.7 3" />
    </>
  ),
  box: <rect x="4" y="6" width="16" height="12" rx="2" />,
  refresh: (
    <>
      <path d="M21 12a9 9 0 1 1-2.6-6.4L21 8" />
      <path d="M21 3v5h-5" />
    </>
  ),
  flag: (
    <>
      <path d="M5 21V4" />
      <path d="M5 4c4-2 7 2 14 0v10c-7 2-10-2-14 0" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="M21 15l-4.5-4.5L7 19" />
    </>
  ),
};

export function Icon({ name, size = 16 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {PATHS[name]}
    </svg>
  );
}
