import Head from 'next/head'
import {
  Box,
  Divider,
  HStack,
  Heading,
  Icon,
  Link,
  Text,
  Table,
  TableContainer,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Image,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  SimpleGrid,
  Spinner,
  Tag,
} from '@chakra-ui/react'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/router'
import NextLink from 'next/link'
import {
  FiChevronRight,
  FiHome,
  FiCheckCircle,
  FiExternalLink,
} from 'react-icons/fi'

interface Contract {
  id: number
  contract_address: string
  name: string
  symbol: string
  decimals: number
  total_supply: number
  logo: string
  desc: string
  project: string
  marketing: string
  minter_address: string
  minting_disabled: boolean
  official_verified: boolean
  holders: number
  created_at: string
  reserve_paxi: number
  reserve_prc20: number
  price_change: number
  txs_count: number
  volume: number
  is_pump: boolean
  sells: number
  buys: number
}

interface Holder {
  id: number
  contract_address: string
  address: string
  frozen: boolean
  balance: number
  update_needed: boolean
  updated_at: string
}

export default function PRC20Detail() {
  const router = useRouter()
  const { address } = router.query
  const [contract, setContract] = useState<Contract | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [holders, setHolders] = useState<Holder[]>([])
  const [isFetchingHolders, setIsFetchingHolders] = useState(false)
  const [hasMoreHolders, setHasMoreHolders] = useState(true)
  const holdersLoaderRef = useRef<HTMLDivElement>(null)
  const holdersPageRef = useRef(0)
  const currentAddressRef = useRef<string | null>(null)

  const getLogoUrl = (logo: string) => {
    if (!logo) return '/placeholder-token.png'
    if (logo.startsWith('ipfs://')) {
      return logo.replace('ipfs://', 'https://ipfs.io/ipfs/')
    }
    return logo
  }

  const formatSupply = (supply: number, decimals: number) => {
    const value = supply / Math.pow(10, decimals)
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 })
  }

  const formatVolume = (volume: number) => {
    return volume.toLocaleString(undefined, { maximumFractionDigits: 2 })
  }

  const formatBalance = (balance: number, decimals: number) => {
    const value = balance / Math.pow(10, decimals)
    if (value >= 1_000_000_000) {
      return (value / 1_000_000_000).toFixed(2) + 'B'
    } else if (value >= 1_000_000) {
      return (value / 1_000_000).toFixed(2) + 'M'
    } else if (value >= 1_000) {
      return (value / 1_000).toFixed(2) + 'K'
    }
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 })
  }

  const fetchHolders = async (contractAddress: string, page: number) => {
    setIsFetchingHolders(true)
    try {
      const response = await fetch(
        `/api/prc20/holders?contract_address=${encodeURIComponent(
          contractAddress
        )}&page=${page}`
      )
      const data = await response.json()

      if (data.accounts && data.accounts.length > 0) {
        setHolders((prev) => [...prev, ...data.accounts])
        holdersPageRef.current = page + 1
      } else {
        setHasMoreHolders(false)
      }
    } catch (err) {
      console.error('Failed to fetch holders:', err)
    } finally {
      setIsFetchingHolders(false)
    }
  }

  const fetchContract = useCallback(async () => {
    if (!address) return

    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(
        `/api/prc20/contract?address=${encodeURIComponent(address as string)}`
      )
      const data = await response.json()

      if (data.contract) {
        setContract(data.contract)
      } else if (data.error) {
        setError(data.error)
      } else {
        setError('Contract not found')
      }
    } catch (err) {
      console.error('Failed to fetch contract:', err)
      setError('Failed to fetch contract details')
    } finally {
      setIsLoading(false)
    }
  }, [address])

  useEffect(() => {
    if (address && address !== currentAddressRef.current) {
      currentAddressRef.current = address as string
      fetchContract()
      setHolders([])
      setHasMoreHolders(true)
      holdersPageRef.current = 0
      fetchHolders(address as string, 0)
    }
  }, [address, fetchContract])

  // Infinite scroll for holders
  useEffect(() => {
    const currentAddress = address as string

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMoreHolders &&
          holders.length > 0 &&
          !isFetchingHolders
        ) {
          fetchHolders(currentAddress, holdersPageRef.current)
        }
      },
      { threshold: 0.1 }
    )

    if (holdersLoaderRef.current) {
      observer.observe(holdersLoaderRef.current)
    }

    return () => observer.disconnect()
  }, [address, hasMoreHolders, holders.length, isFetchingHolders])

  if (isLoading) {
    return (
      <Box textAlign="center" py={20}>
        <Spinner size="xl" color="#a855f7" />
        <Text mt={4} color="gray.400">
          Loading contract details...
        </Text>
      </Box>
    )
  }

  if (error || !contract) {
    return (
      <Box textAlign="center" py={20}>
        <Text color="red.500">{error || 'Contract not found'}</Text>
      </Box>
    )
  }

  return (
    <>
      <Head>
        <title>
          {contract.name} ({contract.symbol}) | Paxi Explorer
        </title>
        <meta
          name="description"
          content={`${contract.name} PRC-20 Token | Paxi Explorer`}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <HStack h="24px">
          <Heading size={'md'}>PRC-20 Token</Heading>
          <Divider borderColor={'gray'} size="10px" orientation="vertical" />
          <Link
            as={NextLink}
            href={'/'}
            style={{ textDecoration: 'none' }}
            _focus={{ boxShadow: 'none' }}
            display="flex"
            justifyContent="center"
          >
            <Icon fontSize="16" color="#06b6d4" as={FiHome} />
          </Link>
          <Icon fontSize="16" as={FiChevronRight} />
          <Link
            as={NextLink}
            href={'/prc20'}
            style={{ textDecoration: 'none' }}
            _focus={{ boxShadow: 'none' }}
          >
            <Text color="#06b6d4">PRC-20</Text>
          </Link>
          <Icon fontSize="16" as={FiChevronRight} />
          <Text>Detail</Text>
        </HStack>

        <Box
          mt={8}
          bg="rgba(30, 41, 59, 0.4)"
          backdropFilter="blur(10px)"
          border="1px solid rgba(255, 255, 255, 0.08)"
          shadow={'base'}
          borderRadius="xl"
          p={4}
        >
          <HStack spacing={4} mb={4}>
            <Image
              src={getLogoUrl(contract.logo)}
              alt={contract.name}
              boxSize="64px"
              borderRadius="full"
              fallbackSrc="https://via.placeholder.com/64"
            />
            <Box>
              <HStack spacing={2}>
                <Heading size="lg">{contract.name}</Heading>
                {contract.official_verified && (
                  <Icon as={FiCheckCircle} color="green.500" boxSize={5} />
                )}
                {contract.is_pump && <Badge colorScheme="purple">PUMP</Badge>}
              </HStack>
              <HStack spacing={2} mt={1}>
                <Tag
                  size="md"
                  bg="rgba(147, 51, 234, 0.2)"
                  color="#d8b4fe"
                  border="1px solid rgba(147, 51, 234, 0.5)"
                >
                  {contract.symbol}
                </Tag>
                {contract.minting_disabled && (
                  <Tag size="sm" bg="rgba(255, 255, 255, 0.1)" color="gray.400">
                    Minting Disabled
                  </Tag>
                )}
              </HStack>
            </Box>
          </HStack>
          {contract.desc && (
            <Text color="gray.500" mb={4}>
              {contract.desc}
            </Text>
          )}
          <Divider borderColor={'rgba(255, 255, 255, 0.08)'} mb={4} />

          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
            <Stat>
              <StatLabel>Total Supply</StatLabel>
              <StatNumber fontSize="lg">
                {formatSupply(contract.total_supply, contract.decimals)}
              </StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Holders</StatLabel>
              <StatNumber fontSize="lg">
                {contract.holders.toLocaleString()}
              </StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Transactions</StatLabel>
              <StatNumber fontSize="lg">
                {contract.txs_count.toLocaleString()}
              </StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Volume</StatLabel>
              <StatNumber fontSize="lg">
                {formatVolume(contract.volume)} PAXI
              </StatNumber>
            </Stat>
          </SimpleGrid>

          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
            <Stat>
              <StatLabel>Price Change</StatLabel>
              <StatNumber
                fontSize="lg"
                color={contract.price_change >= 0 ? 'green.500' : 'red.500'}
              >
                {contract.price_change >= 0 ? '+' : ''}
                {(contract.price_change * 100).toFixed(2)}%
              </StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Buys</StatLabel>
              <StatNumber fontSize="lg" color="green.500">
                {contract.buys.toLocaleString()}
              </StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Sells</StatLabel>
              <StatNumber fontSize="lg" color="red.500">
                {contract.sells.toLocaleString()}
              </StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Decimals</StatLabel>
              <StatNumber fontSize="lg">{contract.decimals}</StatNumber>
            </Stat>
          </SimpleGrid>
        </Box>

        <Box
          mt={8}
          bg="rgba(30, 41, 59, 0.4)"
          backdropFilter="blur(10px)"
          border="1px solid rgba(255, 255, 255, 0.08)"
          shadow={'base'}
          borderRadius="xl"
          p={4}
        >
          <Heading size={'md'} mb={4}>
            Contract Details
          </Heading>
          <Divider borderColor={'rgba(255, 255, 255, 0.08)'} mb={4} />
          <TableContainer>
            <Table variant="unstyled" size={'sm'}>
              <Tbody>
                <Tr>
                  <Td pl={0} width={200}>
                    <b>Contract Address</b>
                  </Td>
                  <Td>
                    <Link
                      as={NextLink}
                      href={'/accounts/' + contract.contract_address}
                      style={{ textDecoration: 'none' }}
                      _focus={{ boxShadow: 'none' }}
                    >
                      <Text color="#06b6d4" wordBreak="break-all">
                        {contract.contract_address}
                      </Text>
                    </Link>
                  </Td>
                </Tr>
                {contract.marketing && (
                  <Tr>
                    <Td pl={0} width={200}>
                      <b>Marketing</b>
                    </Td>
                    <Td>
                      <Link
                        as={NextLink}
                        href={'/accounts/' + contract.marketing}
                        style={{ textDecoration: 'none' }}
                        _focus={{ boxShadow: 'none' }}
                      >
                        <Text color="#06b6d4" wordBreak="break-all">
                          {contract.marketing}
                        </Text>
                      </Link>
                    </Td>
                  </Tr>
                )}
                {contract.project && (
                  <Tr>
                    <Td pl={0} width={200}>
                      <b>Project Website</b>
                    </Td>
                    <Td>
                      <Link href={contract.project} isExternal color="#06b6d4">
                        {contract.project} <Icon as={FiExternalLink} mx="2px" />
                      </Link>
                    </Td>
                  </Tr>
                )}
                <Tr>
                  <Td pl={0} width={200}>
                    <b>Created At</b>
                  </Td>
                  <Td>{new Date(contract.created_at).toLocaleString()}</Td>
                </Tr>
                <Tr>
                  <Td pl={0} width={200}>
                    <b>Reserve PAXI</b>
                  </Td>
                  <Td>
                    {(contract.reserve_paxi / 1000000).toLocaleString(
                      undefined,
                      { maximumFractionDigits: 2 }
                    )}{' '}
                    PAXI
                  </Td>
                </Tr>
                <Tr>
                  <Td pl={0} width={200}>
                    <b>Reserve {contract.symbol}</b>
                  </Td>
                  <Td>
                    {formatSupply(contract.reserve_prc20, contract.decimals)}{' '}
                    {contract.symbol}
                  </Td>
                </Tr>
              </Tbody>
            </Table>
          </TableContainer>
        </Box>

        <Box
          mt={8}
          bg="rgba(30, 41, 59, 0.4)"
          backdropFilter="blur(10px)"
          border="1px solid rgba(255, 255, 255, 0.08)"
          shadow={'base'}
          borderRadius="xl"
          p={4}
        >
          <Heading size={'md'} mb={4}>
            Holders
          </Heading>
          <Divider borderColor={'rgba(255, 255, 255, 0.08)'} mb={4} />
          <TableContainer>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Rank</Th>
                  <Th>Address</Th>
                  <Th isNumeric>Balance</Th>
                  <Th isNumeric>Percentage</Th>
                </Tr>
              </Thead>
              <Tbody>
                {holders.map((holder, index) => (
                  <Tr key={holder.address}>
                    <Td>{index + 1}</Td>
                    <Td>
                      <HStack spacing={2}>
                        <Link
                          as={NextLink}
                          href={'/accounts/' + holder.address}
                          style={{ textDecoration: 'none' }}
                          _focus={{ boxShadow: 'none' }}
                        >
                          <Text color="#06b6d4" isTruncated maxW="300px">
                            {holder.address}
                          </Text>
                        </Link>
                        {holder.address ===
                          'paxi1mfru9azs5nua2wxcd4sq64g5nt7nn4n80r745t' && (
                          <Badge colorScheme="blue" fontSize="xs">
                            POOL
                          </Badge>
                        )}
                      </HStack>
                    </Td>
                    <Td isNumeric>
                      {contract &&
                        formatBalance(holder.balance, contract.decimals)}{' '}
                      {contract?.symbol}
                    </Td>
                    <Td isNumeric>
                      {contract &&
                        (
                          (holder.balance / contract.total_supply) *
                          100
                        ).toFixed(2)}
                      %
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
          <Box ref={holdersLoaderRef} textAlign="center" py={4}>
            {isFetchingHolders && <Spinner color="#a855f7" />}
            {!hasMoreHolders && holders.length > 0 && (
              <Text color="gray.500">No more holders to load</Text>
            )}
          </Box>
        </Box>
      </main>
    </>
  )
}
