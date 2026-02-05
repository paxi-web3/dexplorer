import { Flex, Box, Image, keyframes } from '@chakra-ui/react'
import Head from 'next/head'

const pulseGlow = keyframes`
  0%, 100% {
    box-shadow: 0 0 20px rgba(179, 133, 247, 0.4), 0 0 40px rgba(179, 133, 247, 0.2), 0 0 60px rgba(179, 133, 247, 0.1);
  }
  50% {
    box-shadow: 0 0 30px rgba(179, 133, 247, 0.6), 0 0 60px rgba(179, 133, 247, 0.4), 0 0 90px rgba(179, 133, 247, 0.2);
  }
`

export default function LoadingPage() {
  return (
    <>
      <Head>
        <title>Paxi Explorer</title>
        <meta name="description" content="Paxi Explorer" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Flex
        minH={'100vh'}
        align={'center'}
        justify={'center'}
        w="100%"
        bg="linear-gradient(180deg, rgba(10, 13, 22, 1) 0%, rgba(15, 18, 30, 1) 100%)"
      >
        <Box
          position="relative"
          borderRadius="full"
          p={4}
          animation={`${pulseGlow} 2s ease-in-out infinite`}
        >
          <Image
            src="/paxi_logo.png"
            alt="Paxi Logo"
            boxSize="80px"
            objectFit="contain"
          />
        </Box>
      </Flex>
    </>
  )
}
