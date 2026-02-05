import { Colors } from '@chakra-ui/react'

export const colors: Colors = {
  // Base backgrounds
  'light-container': 'rgba(12, 15, 25, 0.85)',
  'light-bg': '#050810',
  'light-theme': '#b385f7',
  'dark-container': 'rgba(12, 15, 25, 0.9)',
  'dark-bg': '#050810',
  'dark-theme': '#b385f7',

  // Glass containers
  'glass-bg': 'rgba(15, 18, 30, 0.75)',
  'glass-border': 'rgba(179, 133, 247, 0.15)',
  'glass-hover': 'rgba(179, 133, 247, 0.08)',

  // Primary purple scale
  purple: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#b385f7',
    600: '#a855f7',
    700: '#9333ea',
    800: '#7e22ce',
    900: '#581c87',
  },

  // Card accent colors with gradients support
  accent1: {
    100: '#f3e8ff',
    200: '#e9d5ff',
    400: '#c084fc',
    500: '#b385f7',
    600: '#a855f7',
    gradient: 'linear-gradient(135deg, #b385f7 0%, #9333ea 100%)',
  },
  accent2: {
    100: '#ede9fe',
    200: '#ddd6fe',
    400: '#a78bfa',
    500: '#9D6BFF',
    600: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
  },
  accent3: {
    100: '#fce7f3',
    200: '#fbcfe8',
    400: '#f472b6',
    500: '#ec4899',
    600: '#db2777',
    gradient: 'linear-gradient(135deg, #f472b6 0%, #db2777 100%)',
  },
  accent4: {
    100: '#e0f2fe',
    200: '#bae6fd',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    gradient: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
  },
  accent5: {
    100: '#ccfbf1',
    200: '#99f6e4',
    400: '#2dd4bf',
    500: '#14b8a6',
    600: '#0d9488',
    gradient: 'linear-gradient(135deg, #2dd4bf 0%, #0d9488 100%)',
  },
  accent6: {
    100: '#d1fae5',
    200: '#a7f3d0',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    gradient: 'linear-gradient(135deg, #34d399 0%, #059669 100%)',
  },

  // Status colors
  success: {
    500: '#10b981',
    600: '#059669',
  },
  warning: {
    500: '#f59e0b',
    600: '#d97706',
  },
  error: {
    500: '#ef4444',
    600: '#dc2626',
  },
}
