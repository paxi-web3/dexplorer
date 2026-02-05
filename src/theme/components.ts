const primaryGlow =
  '0 0 20px rgba(179, 133, 247, 0.3), 0 0 40px rgba(179, 133, 247, 0.1)'
const subtleGlow =
  '0 0 0 1px rgba(179, 133, 247, 0.3), 0 0 16px rgba(179, 133, 247, 0.15)'
const hoverGlow =
  '0 0 0 1px rgba(179, 133, 247, 0.5), 0 0 24px rgba(179, 133, 247, 0.25)'
const cardShadow =
  '0 4px 24px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(179, 133, 247, 0.08)'

export const components = {
  Heading: {
    baseStyle: {
      letterSpacing: '0.02em',
      fontWeight: '600',
    },
  },
  Button: {
    baseStyle: {
      borderRadius: '10px',
      fontWeight: '600',
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    variants: {
      solid: {
        bg: 'linear-gradient(135deg, #b385f7 0%, #9333ea 100%)',
        color: 'white',
        boxShadow: subtleGlow,
        _hover: {
          bg: 'linear-gradient(135deg, #c79bff 0%, #a855f7 100%)',
          boxShadow: hoverGlow,
          transform: 'translateY(-1px)',
        },
        _active: {
          bg: 'linear-gradient(135deg, #a06df0 0%, #7e22ce 100%)',
          transform: 'translateY(0)',
        },
      },
      outline: {
        borderColor: 'rgba(179, 133, 247, 0.5)',
        borderWidth: '1px',
        color: 'light-theme',
        background: 'rgba(179, 133, 247, 0.05)',
        _hover: {
          background: 'rgba(179, 133, 247, 0.12)',
          borderColor: 'light-theme',
          boxShadow: subtleGlow,
          transform: 'translateY(-1px)',
        },
        _active: {
          background: 'rgba(179, 133, 247, 0.18)',
        },
      },
      ghost: {
        color: 'light-theme',
        _hover: {
          background: 'rgba(179, 133, 247, 0.1)',
          boxShadow: '0 0 16px rgba(179, 133, 247, 0.1)',
        },
      },
    },
  },
  Input: {
    variants: {
      outline: {
        field: {
          bg: 'rgba(10, 13, 22, 0.7)',
          borderColor: 'rgba(179, 133, 247, 0.2)',
          borderRadius: '10px',
          borderWidth: '1px',
          transition: 'all 0.2s ease',
          _hover: {
            borderColor: 'rgba(179, 133, 247, 0.4)',
          },
          _focus: {
            borderColor: 'light-theme',
            boxShadow: subtleGlow,
            bg: 'rgba(10, 13, 22, 0.85)',
          },
          _placeholder: {
            color: 'whiteAlpha.400',
          },
        },
      },
    },
  },
  NumberInput: {
    variants: {
      outline: {
        field: {
          bg: 'rgba(10, 13, 22, 0.7)',
          borderColor: 'rgba(179, 133, 247, 0.2)',
          borderRadius: '10px',
          _hover: {
            borderColor: 'rgba(179, 133, 247, 0.4)',
          },
          _focus: {
            borderColor: 'light-theme',
            boxShadow: subtleGlow,
          },
        },
      },
    },
  },
  Textarea: {
    variants: {
      outline: {
        bg: 'rgba(10, 13, 22, 0.7)',
        borderColor: 'rgba(179, 133, 247, 0.2)',
        borderRadius: '10px',
        _hover: {
          borderColor: 'rgba(179, 133, 247, 0.4)',
        },
        _focus: {
          borderColor: 'light-theme',
          boxShadow: subtleGlow,
        },
      },
    },
  },
  Select: {
    variants: {
      outline: {
        field: {
          bg: 'rgba(10, 13, 22, 0.7)',
          borderColor: 'rgba(179, 133, 247, 0.2)',
          borderRadius: '10px',
          _hover: {
            borderColor: 'rgba(179, 133, 247, 0.4)',
          },
          _focus: {
            borderColor: 'light-theme',
            boxShadow: subtleGlow,
          },
        },
      },
    },
  },
  Modal: {
    baseStyle: {
      dialog: {
        bg: 'rgba(12, 15, 25, 0.95)',
        borderRadius: '16px',
        border: '1px solid',
        borderColor: 'rgba(179, 133, 247, 0.15)',
        boxShadow: `${cardShadow}, ${primaryGlow}`,
        backdropFilter: 'blur(20px)',
      },
      overlay: {
        bg: 'rgba(5, 8, 16, 0.85)',
        backdropFilter: 'blur(8px)',
      },
    },
  },
  Drawer: {
    baseStyle: {
      dialog: {
        bg: 'rgba(12, 15, 25, 0.98)',
        borderLeft: '1px solid',
        borderColor: 'rgba(179, 133, 247, 0.15)',
        backdropFilter: 'blur(20px)',
      },
    },
  },
  Table: {
    baseStyle: {
      tbody: {
        tr: {
          borderBottom: '1px solid',
          borderColor: 'rgba(179, 133, 247, 0.08)',
          transition: 'all 0.15s ease',
          _hover: {
            bg: 'rgba(179, 133, 247, 0.05)',
          },
          _last: {
            borderBottom: 'none',
          },
        },
      },
      th: {
        borderColor: 'rgba(179, 133, 247, 0.12)',
        color: 'whiteAlpha.600',
        fontWeight: '600',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        fontSize: '11px',
      },
      td: {
        borderColor: 'rgba(179, 133, 247, 0.06)',
      },
    },
  },
  Tabs: {
    baseStyle: {
      tab: {
        fontWeight: '500',
        transition: 'all 0.2s ease',
        _selected: {
          color: 'light-theme',
          borderColor: 'light-theme',
          boxShadow: '0 2px 0 0 rgba(179, 133, 247, 0.7)',
        },
        _hover: {
          color: 'light-theme',
        },
      },
    },
    variants: {
      pageTabs: {
        tablist: {
          display: 'inline-flex',
          gap: '6px',
          padding: '6px',
          borderRadius: '12px',
          border: '1px solid',
          borderColor: 'rgba(179, 133, 247, 0.18)',
          background: 'rgba(10, 13, 22, 0.5)',
          boxShadow: 'inset 0 0 0 1px rgba(179, 133, 247, 0.08)',
        },
        tab: {
          borderRadius: '10px',
          px: 4,
          py: 2,
          fontSize: 'sm',
          color: 'whiteAlpha.700',
          background: 'transparent',
          _selected: {
            color: 'white',
            background:
              'linear-gradient(135deg, rgba(179, 133, 247, 0.35) 0%, rgba(147, 51, 234, 0.35) 100%)',
            boxShadow: '0 6px 18px rgba(179, 133, 247, 0.18)',
          },
          _hover: {
            color: 'white',
            background: 'rgba(179, 133, 247, 0.12)',
          },
        },
        tabpanel: {
          px: 0,
        },
      },
    },
  },
  Badge: {
    baseStyle: {
      borderRadius: '6px',
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      fontWeight: '600',
      fontSize: '10px',
      px: '2',
      py: '0.5',
    },
  },
  Link: {
    baseStyle: {
      transition: 'all 0.15s ease',
      _hover: {
        textDecoration: 'none',
        color: 'light-theme',
      },
    },
  },
  Skeleton: {
    baseStyle: {
      borderRadius: '8px',
      startColor: 'rgba(179, 133, 247, 0.08)',
      endColor: 'rgba(179, 133, 247, 0.15)',
    },
  },
  Tooltip: {
    baseStyle: {
      bg: 'rgba(12, 15, 25, 0.95)',
      color: 'whiteAlpha.900',
      borderRadius: '8px',
      border: '1px solid',
      borderColor: 'rgba(179, 133, 247, 0.2)',
      boxShadow: cardShadow,
      px: '3',
      py: '2',
    },
  },
}
