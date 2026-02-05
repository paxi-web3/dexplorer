import { Box, useColorMode, useColorModeValue } from '@chakra-ui/react'
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
}: {
  language: string
  codeString: string
}) => {
  const { colorMode } = useColorMode()
  const bgColor = useColorModeValue('light-container', 'dark-container')
  return (
    <Box
      as="pre"
      bg={bgColor}
      borderRadius="xl"
      p={4}
      border={'1px'}
      borderColor={useColorModeValue('whiteAlpha.200', 'whiteAlpha.200')}
      boxShadow="0 10px 24px rgba(7, 10, 18, 0.55)"
      overflowX="auto"
    >
      <SyntaxHighlighter
        language={language}
        style={colorMode === 'dark' ? atomOneDark : atomOneLight}
        customStyle={{ background: 'none' }}
      >
        {codeString}
      </SyntaxHighlighter>
    </Box>
  )
}

export default CodeBlock
