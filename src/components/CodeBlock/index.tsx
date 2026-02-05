import { Box, useColorMode } from '@chakra-ui/react'
import {
  atomOneLight,
  atomOneDark,
} from 'react-syntax-highlighter/dist/cjs/styles/hljs'
import dynamic from 'next/dynamic'
const SyntaxHighlighter = dynamic(
  () => import('react-syntax-highlighter/dist/esm/prism'),
  { ssr: false }
)

const CodeBlock = ({
  language,
  codeString,
  highContrast,
}: {
  language: string
  codeString: string
  highContrast?: boolean
}) => {
  const { colorMode } = useColorMode()
  return (
    <Box
      as="pre"
      bg="rgba(12, 15, 25, 0.85)"
      borderRadius="xl"
      p={4}
      border={'1px'}
      borderColor="rgba(179, 133, 247, 0.12)"
      boxShadow="0 10px 24px rgba(7, 10, 18, 0.55)"
      overflowX="auto"
      position="relative"
      sx={
        highContrast
          ? {
              'code, code span': {
                filter: 'brightness(1.25)',
              },
            }
          : undefined
      }
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '1px',
        background:
          'linear-gradient(90deg, transparent, rgba(179, 133, 247, 0.4), transparent)',
      }}
    >
      <SyntaxHighlighter
        language={language}
        style={colorMode === 'dark' ? atomOneDark : atomOneLight}
        customStyle={{
          background: 'none',
          color: highContrast ? '#f8fafc' : undefined,
        }}
        codeTagProps={
          highContrast
            ? {
                style: {
                  color: '#f8fafc',
                },
              }
            : undefined
        }
      >
        {codeString}
      </SyntaxHighlighter>
    </Box>
  )
}

export default CodeBlock
