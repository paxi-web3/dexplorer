import { useColorModeValue, Flex, Spinner } from '@chakra-ui/react'
import Head from 'next/head'

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
        w="100"
        bg={useColorModeValue('light-bg', 'dark-bg')}
      >
        <Spinner
          size="xl"
          color={useColorModeValue('light-theme', 'dark-theme')}
        />
      </Flex>
    </>
  )
}
