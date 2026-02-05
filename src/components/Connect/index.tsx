import { FormEvent, ChangeEvent, useState, useEffect } from 'react'
import {
  Stack,
  FormControl,
  Input,
  Button,
  Heading,
  Text,
  Container,
  Flex,
  Box,
  IconButton,
  Icon,
  VStack,
} from '@chakra-ui/react'
import { CheckIcon } from '@chakra-ui/icons'
import { useDispatch } from 'react-redux'
import {
  setConnectState,
  setTmClient,
  setRPCAddress,
} from '@/store/connectSlice'
import Head from 'next/head'
import { LS_RPC_ADDRESS, LS_RPC_ADDRESS_LIST } from '@/utils/constant'
import { validateConnection, connectWebsocketClient } from '@/rpc/client'
import { removeTrailingSlash } from '@/utils/helper'
import { FiZap, FiGlobe, FiServer, FiCpu } from 'react-icons/fi'

const chainList = [
  {
    name: 'Paxi Mainnet',
    rpc: 'https://mainnet-rpc.paxinet.io',
    icon: FiGlobe,
  },
  {
    name: 'Paxi Testnet',
    rpc: 'https://testnet-rpc.paxinet.io',
    icon: FiServer,
  },
  {
    name: 'Local Testnet',
    rpc: 'http://127.0.0.1:26657',
    icon: FiCpu,
  },
]

export default function Connect() {
  const [address, setAddress] = useState('')
  const [state, setState] = useState<'initial' | 'submitting' | 'success'>(
    'initial'
  )
  const [error, setError] = useState(false)
  const [connected, setConnected] = useState(false)

  const dispatch = useDispatch()

  useEffect(() => {
    // Init the RPC address list from localStorage
    const storedList = localStorage.getItem(LS_RPC_ADDRESS_LIST)
    const storedRpcs = storedList ? JSON.parse(storedList) : []

    const combined = [...storedRpcs, ...chainList.map((c) => c.rpc)]

    // Remove duplicates and save back to localStorage
    const deduplicated = Array.from(new Set(combined))
    localStorage.setItem(LS_RPC_ADDRESS_LIST, JSON.stringify(deduplicated))

    if (!connected) {
      const saved = localStorage.getItem(LS_RPC_ADDRESS)
      const defaultRpc = saved || 'https://mainnet-rpc.paxinet.io'
      setAddress(defaultRpc)
      connectClient(defaultRpc)
      setConnected(true)
    }
  }, [connected])

  const submitForm = async (e: FormEvent) => {
    e.preventDefault()
    const addr = removeTrailingSlash(address)
    await connectClient(addr)
  }

  const connectClient = async (rpcAddress: string) => {
    try {
      setError(false)
      setState('submitting')

      if (!rpcAddress) {
        setError(true)
        setState('initial')
        return
      }

      const isValid = await validateConnection(rpcAddress)
      if (!isValid) {
        setError(true)
        setState('initial')
        return
      }

      const tmClient = await connectWebsocketClient(rpcAddress)

      if (!tmClient) {
        setError(true)
        setState('initial')
        return
      }

      dispatch(setConnectState(true))
      dispatch(setTmClient(tmClient))
      dispatch(setRPCAddress(rpcAddress))
      setState('success')

      window.localStorage.setItem(LS_RPC_ADDRESS, rpcAddress)
      // Remove duplicates and save back to localStorage
      const deduplicated = Array.from(
        new Set([
          rpcAddress,
          ...JSON.parse(
            window.localStorage.getItem(LS_RPC_ADDRESS_LIST) || '[]'
          ),
        ])
      )
      window.localStorage.setItem(
        LS_RPC_ADDRESS_LIST,
        JSON.stringify(deduplicated)
      )
    } catch (err) {
      console.error(err)
      setError(true)
      setState('initial')
      return
    }
  }

  const selectChain = (rpcAddress: string) => {
    setAddress(rpcAddress)
    connectClient(rpcAddress)
  }

  return (
    <>
      <Head>
        <title>Paxi Explorer | Connect</title>
        <meta
          name="description"
          content="Paxi Explorer | Connect to RPC Address"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Flex
        minH={'100vh'}
        align={'center'}
        justify={'center'}
        flexDirection={'column'}
        gap={12}
        px={4}
      >
        {/* Logo and Branding */}
        <VStack spacing={4}>
          <Box position="relative">
            <Box
              as="img"
              src="/icon_transparent.png"
              alt="Paxi Explorer logo"
              boxSize="64px"
              position="relative"
              zIndex={1}
            />
            <Box
              position="absolute"
              inset="-16px"
              background="radial-gradient(circle, rgba(179, 133, 247, 0.4) 0%, transparent 70%)"
              borderRadius="full"
              filter="blur(16px)"
            />
          </Box>
          <Heading
            fontSize={{ base: '2xl', sm: '3xl' }}
            fontWeight="700"
            letterSpacing="-0.02em"
            bgGradient="linear(to-r, white, whiteAlpha.800)"
            bgClip="text"
          >
            Paxi Explorer
          </Heading>
          <Text fontSize="sm" color="whiteAlpha.600" textAlign="center">
            Cosmos SDK Chain Explorer
          </Text>
        </VStack>

        {/* Connect Form */}
        <Container
          maxW={'lg'}
          position="relative"
          overflow="hidden"
          bg="rgba(12, 15, 25, 0.85)"
          backdropFilter="blur(20px)"
          border="1px solid"
          borderColor="rgba(179, 133, 247, 0.15)"
          boxShadow="0 4px 32px rgba(0, 0, 0, 0.4), 0 0 24px rgba(179, 133, 247, 0.1)"
          rounded={'16px'}
          p={6}
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
          <Text
            fontSize="11px"
            fontWeight="600"
            textTransform="uppercase"
            letterSpacing="0.08em"
            color="whiteAlpha.500"
            mb={4}
          >
            Custom RPC Connection
          </Text>
          <Stack
            direction={{ base: 'column', md: 'row' }}
            as={'form'}
            spacing={'12px'}
            onSubmit={submitForm}
          >
            <FormControl>
              <Input
                variant={'outline'}
                borderWidth={1}
                color={'whiteAlpha.900'}
                _placeholder={{
                  color: 'whiteAlpha.400',
                }}
                borderColor="rgba(179, 133, 247, 0.2)"
                _focus={{
                  borderColor: '#b385f7',
                  boxShadow:
                    '0 0 0 1px rgba(179, 133, 247, 0.3), 0 0 16px rgba(179, 133, 247, 0.15)',
                }}
                id={'address'}
                type={'url'}
                required
                placeholder={'RPC Address'}
                aria-label={'RPC Address'}
                value={address}
                disabled={state !== 'initial'}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setAddress(e.target.value)
                }
              />
            </FormControl>
            <FormControl w={{ base: '100%', md: '40%' }}>
              <Button
                isLoading={state === 'submitting'}
                w="100%"
                type={state === 'success' ? 'button' : 'submit'}
              >
                {state === 'success' ? <CheckIcon /> : 'Connect'}
              </Button>
            </FormControl>
          </Stack>
          <Text
            mt={3}
            textAlign={'center'}
            fontSize="sm"
            color={error ? 'red.400' : 'transparent'}
            minH="20px"
          >
            {error ? 'Cannot connect to websocket client' : ''}
          </Text>
        </Container>

        {/* Network Selection */}
        <Container maxW="lg" p={0}>
          <Text
            fontSize="11px"
            fontWeight="600"
            textTransform="uppercase"
            letterSpacing="0.08em"
            color="whiteAlpha.500"
            textAlign="center"
            mb={4}
          >
            Quick Connect
          </Text>
          <VStack spacing={3}>
            {chainList.map((chain) => {
              return (
                <Flex
                  key={chain.name}
                  w="full"
                  maxW="lg"
                  position="relative"
                  overflow="hidden"
                  bg="rgba(12, 15, 25, 0.75)"
                  backdropFilter="blur(12px)"
                  border="1px solid"
                  borderColor="rgba(179, 133, 247, 0.1)"
                  rounded="12px"
                  px={5}
                  py={4}
                  justifyContent="space-between"
                  alignItems="center"
                  transition="all 0.2s ease"
                  cursor="pointer"
                  onClick={() => selectChain(chain.rpc)}
                  _hover={{
                    bg: 'rgba(179, 133, 247, 0.08)',
                    borderColor: 'rgba(179, 133, 247, 0.25)',
                    transform: 'translateY(-1px)',
                  }}
                  role="group"
                >
                  <Flex align="center" gap={4}>
                    <Flex
                      align="center"
                      justify="center"
                      w="38px"
                      h="38px"
                      borderRadius="10px"
                      bg="rgba(179, 133, 247, 0.1)"
                      border="1px solid"
                      borderColor="rgba(179, 133, 247, 0.2)"
                      transition="all 0.2s ease"
                      _groupHover={{
                        bg: 'rgba(179, 133, 247, 0.15)',
                        borderColor: 'rgba(179, 133, 247, 0.35)',
                      }}
                    >
                      <Icon as={chain.icon} fontSize="18px" color="#b385f7" />
                    </Flex>
                    <Box>
                      <Heading
                        size="sm"
                        fontWeight="600"
                        color="whiteAlpha.900"
                        letterSpacing="-0.01em"
                      >
                        {chain.name}
                      </Heading>
                      <Text
                        fontSize="xs"
                        color="whiteAlpha.500"
                        fontFamily="mono"
                        mt={0.5}
                      >
                        {chain.rpc}
                      </Text>
                    </Box>
                  </Flex>
                  <IconButton
                    aria-label="Connect RPC"
                    size="sm"
                    fontSize="18"
                    icon={<FiZap />}
                    onClick={(e) => {
                      e.stopPropagation()
                      selectChain(chain.rpc)
                    }}
                  />
                </Flex>
              )
            })}
          </VStack>
        </Container>
      </Flex>
    </>
  )
}
