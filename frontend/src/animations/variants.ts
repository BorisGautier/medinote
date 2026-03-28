import { Variants } from 'framer-motion';

// ─── Page Transitions ───────────────────────────────────
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.25 } },
};

// ─── Fade In Up ─────────────────────────────────────────
export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
};

// ─── Fade In ────────────────────────────────────────────
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
};

// ─── Scale In ───────────────────────────────────────────
export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: [0.34, 1.56, 0.64, 1] } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

// ─── Slide in from Right (Tunnel de réservation) ────────
export const slideInRight: Variants = {
  initial: { opacity: 0, x: 60 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, x: -40, transition: { duration: 0.25 } },
};

export const slideInLeft: Variants = {
  initial: { opacity: 0, x: -60 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, x: 40, transition: { duration: 0.25 } },
};

// ─── Stagger Container ──────────────────────────────────
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

// ─── Stagger Item ───────────────────────────────────────
export const staggerItem: Variants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] } },
};

// ─── Card Hover ─────────────────────────────────────────
export const cardHover = {
  rest: { scale: 1, boxShadow: '0 4px 16px rgba(0,0,0,0.3)' },
  hover: {
    scale: 1.02,
    boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
    transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
  },
};

// ─── Drawer / Sheet ─────────────────────────────────────
export const drawerVariants: Variants = {
  initial: { x: '100%' },
  animate: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  exit: { x: '100%', transition: { duration: 0.25, ease: 'easeIn' } },
};

// ─── Modal Overlay ──────────────────────────────────────
export const overlayVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

// ─── Notification Toast ─────────────────────────────────
export const toastVariants: Variants = {
  initial: { opacity: 0, x: 100, scale: 0.9 },
  animate: { opacity: 1, x: 0, scale: 1, transition: { type: 'spring', stiffness: 400, damping: 25 } },
  exit: { opacity: 0, x: 100, scale: 0.9, transition: { duration: 0.2 } },
};

// ─── Hero Stats Counter ─────────────────────────────────
export const countUp: Variants = {
  initial: { opacity: 0, scale: 0.5 },
  animate: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 500, damping: 20 } },
};

// ─── Floating Background Blobs ──────────────────────────
export const blobFloat = (delay = 0) => ({
  animate: {
    y: [0, -20, 0],
    x: [0, 10, 0],
    scale: [1, 1.05, 1],
    transition: { duration: 6 + delay, repeat: Infinity, ease: 'easeInOut', delay },
  },
});
