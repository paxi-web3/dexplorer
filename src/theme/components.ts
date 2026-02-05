const glow =
  '0 0 0 1px rgba(179, 133, 247, 0.35), 0 0 24px rgba(179, 133, 247, 0.2)'

export const components = {
  Heading: {
    baseStyle: {
      letterSpacing: '0.02em',
    },
  },
  Button: {
    baseStyle: {
      borderRadius: '12px',
      fontWeight: '600',
      letterSpacing: '0.03em',
      textTransform: 'uppercase',
    },
    variants: {
      solid: {
        bg: 'light-theme',
        color: '#0a0d16',
        boxShadow: glow,
        _hover: {
          bg: '#c79bff',
          boxShadow:
            '0 0 0 1px rgba(179, 133, 247, 0.45), 0 0 32px rgba(179, 133, 247, 0.3)',
        },
        _active: {
          bg: '#a974f2',
        },
      },
      outline: {
        borderColor: 'light-theme',
        color: 'light-theme',
        background: 'rgba(179, 133, 247, 0.06)',
        _hover: {
          background: 'rgba(179, 133, 247, 0.14)',
          boxShadow: glow,
        },
      },
      ghost: {
        color: 'light-theme',
        _hover: {
          background: 'rgba(179, 133, 247, 0.12)',
        },
      },
    },
  },
  Input: {
    variants: {
      outline: {
        field: {
          bg: 'rgba(10, 13, 22, 0.6)',
          borderColor: 'whiteAlpha.200',
          borderRadius: '12px',
          _hover: {
            borderColor: 'whiteAlpha.400',
          },
          _focus: {
            borderColor: 'light-theme',
            boxShadow: glow,
          },
        },
      },
    },
  },
  NumberInput: {
    variants: {
      outline: {
        field: {
          bg: 'rgba(10, 13, 22, 0.6)',
          borderColor: 'gray.600',
          borderRadius: '12px',
          _hover: {
            borderColor: 'gray.500',
          },
          _focus: {
            borderColor: 'light-theme',
            boxShadow: glow,
          },
        },
      },
    },
  },
  Textarea: {
    variants: {
      outline: {
        bg: 'rgba(10, 13, 22, 0.6)',
        borderColor: 'whiteAlpha.200',
        borderRadius: '12px',
        _hover: {
          borderColor: 'whiteAlpha.400',
        },
        _focus: {
          borderColor: 'light-theme',
          boxShadow: glow,
        },
      },
    },
  },
  Select: {
    variants: {
      outline: {
        field: {
          bg: 'rgba(10, 13, 22, 0.6)',
          borderColor: 'gray.600',
          borderRadius: '12px',
          _hover: {
            borderColor: 'gray.500',
          },
          _focus: {
            borderColor: 'light-theme',
            boxShadow: glow,
          },
        },
      },
    },
  },
  Modal: {
    baseStyle: {
      dialog: {
        borderRadius: '16px',
        border: '1px solid',
        borderColor: 'whiteAlpha.200',
        boxShadow: '0 12px 40px rgba(7, 10, 18, 0.8)',
        backdropFilter: 'blur(12px)',
      },
    },
  },
  Drawer: {
    baseStyle: {
      dialog: {
        borderLeft: '1px solid',
        borderColor: 'whiteAlpha.200',
        backdropFilter: 'blur(10px)',
      },
    },
  },
  Table: {
    baseStyle: {
      tbody: {
        tr: {
          borderBottom: '2px solid',
          borderColor: 'gray.800',
          _last: {
            borderBottom: 'none',
          },
        },
      },
      th: {
        borderColor: 'whiteAlpha.200',
        color: 'whiteAlpha.700',
        fontWeight: '600',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
      },
      td: {
        borderColor: 'whiteAlpha.100',
      },
    },
  },
  Tabs: {
    baseStyle: {
      tab: {
        _selected: {
          color: 'light-theme',
          borderColor: 'light-theme',
          boxShadow: '0 2px 0 0 rgba(179, 133, 247, 0.6)',
        },
      },
    },
  },
  Badge: {
    baseStyle: {
      borderRadius: '999px',
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
    },
  },
  Link: {
    baseStyle: {
      _hover: {
        textDecoration: 'none',
        color: 'light-theme',
      },
    },
  },
}
