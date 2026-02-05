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
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Tag,
  Spinner,
  Image,
  Badge,
  Input,
  InputGroup,
  InputLeftElement,
  IconButton,
} from '@chakra-ui/react'
import { useEffect, useState, useCallback, useRef } from 'react'
import NextLink from 'next/link'
import {
  FiChevronRight,
  FiHome,
  FiCheckCircle,
  FiSearch,
  FiX,
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

export default function PRC20() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [searchResults, setSearchResults] = useState<Contract[]>([])
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [isFetching, setIsFetching] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const loaderRef = useRef<HTMLDivElement>(null)

  const formatSupply = (supply: number, decimals: number) => {
    const value = supply / Math.pow(10, decimals)
    if (value >= 1_000_000_000) {
      return (value / 1_000_000_000).toFixed(2) + 'B'
    } else if (value >= 1_000_000) {
      return (value / 1_000_000).toFixed(2) + 'M'
    } else if (value >= 1_000) {
      return (value / 1_000).toFixed(2) + 'K'
    }
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 })
  }

  const formatVolume = (volume: number) => {
    if (volume >= 1_000_000) {
      return (volume / 1_000_000).toFixed(2) + 'M'
    } else if (volume >= 1_000) {
      return (volume / 1_000).toFixed(2) + 'K'
    }
    return volume.toLocaleString(undefined, { maximumFractionDigits: 2 })
  }

  const getLogoUrl = (logo: string) => {
    if (!logo) return '/placeholder-token.png'
    if (logo.startsWith('ipfs://')) {
      return logo.replace('ipfs://', 'https://ipfs.io/ipfs/')
    }
    return logo
  }

  const fetchContracts = useCallback(async () => {
    if (isFetching || !hasMore) return

    setIsFetching(true)
    try {
      const response = await fetch(`/api/prc20/contracts?page=${currentPage}`)
      const data = await response.json()

      if (data.total) {
        setTotal(data.total)
      }

      if (data.contracts && data.contracts.length > 0) {
        setContracts((prev) => [...prev, ...data.contracts])
        setCurrentPage((prev) => prev + 1)
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error('Failed to fetch contracts:', error)
    } finally {
      setTimeout(() => {
        setIsFetching(false)
      }, 500)
    }
  }, [currentPage, isFetching, hasMore])

  const searchContracts = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(
        `/api/prc20/search?name=${encodeURIComponent(query)}`
      )
      const data = await response.json()

      if (data.contracts) {
        setSearchResults(data.contracts)
      } else if (Array.isArray(data)) {
        setSearchResults(data)
      } else {
        setSearchResults([])
      }
    } catch (error) {
      console.error('Failed to search contracts:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    if (value.trim()) {
      searchContracts(value)
    } else {
      setSearchResults([])
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSearchResults([])
  }

  useEffect(() => {
    fetchContracts()
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetching && hasMore) {
          fetchContracts()
        }
      },
      { threshold: 0.1 }
    )

    if (loaderRef.current) {
      observer.observe(loaderRef.current)
    }

    return () => observer.disconnect()
  }, [fetchContracts, isFetching, hasMore])

  return (
    <>
      <Head>
        <title>PRC-20 Assets | Paxi Explorer</title>
        <meta name="description" content="PRC-20 Assets | Paxi Explorer" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <HStack h="24px">
          <Heading size={'md'}>PRC-20 Assets</Heading>
          <Divider
            borderColor="rgba(179, 133, 247, 0.2)"
            size="10px"
            orientation="vertical"
          />
          <Link
            as={NextLink}
            href={'/'}
            style={{ textDecoration: 'none' }}
            _focus={{ boxShadow: 'none' }}
            display="flex"
            justifyContent="center"
          >
            <Icon fontSize="16" color="#b385f7" as={FiHome} />
          </Link>
          <Icon fontSize="16" as={FiChevronRight} color="whiteAlpha.400" />
          <Text color="whiteAlpha.600">PRC-20</Text>
        </HStack>

        <Box
          mt={8}
          bg="rgba(12, 15, 25, 0.85)"
          backdropFilter="blur(10px)"
          border="1px solid"
          borderColor="rgba(179, 133, 247, 0.12)"
          shadow={'0 12px 30px rgba(7, 10, 18, 0.55)'}
          borderRadius="xl"
          p={4}
          position="relative"
          overflow="hidden"
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
          <HStack justifyContent="space-between" mb={4} flexWrap="wrap" gap={2}>
            <Heading size={'md'}>Token List</Heading>
            <HStack spacing={2} alignItems="center">
              <InputGroup size="sm" maxW="300px">
                <InputLeftElement>
                  <Icon as={FiSearch} color="whiteAlpha.500" />
                </InputLeftElement>
                <Input
                  placeholder="Search by name or address"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  borderColor="rgba(179, 133, 247, 0.12)"
                  color="whiteAlpha.900"
                  bg="rgba(10, 13, 22, 0.5)"
                />
                {searchQuery && (
                  <IconButton
                    aria-label="Clear search"
                    icon={<FiX />}
                    size="sm"
                    variant="ghost"
                    position="absolute"
                    right={1}
                    onClick={clearSearch}
                  />
                )}
              </InputGroup>
              <Box
                bg="rgba(179, 133, 247, 0.14)"
                color="#b385f7"
                border="1px solid"
                borderColor="rgba(179, 133, 247, 0.4)"
                px={3}
                py={1}
                borderRadius="md"
                fontSize="sm"
                fontWeight="medium"
                whiteSpace="nowrap"
              >
                {total} Tokens
              </Box>
            </HStack>
          </HStack>
          <Divider borderColor="rgba(179, 133, 247, 0.12)" mb={4} />
          {isSearching && (
            <Box textAlign="center" py={4}>
              <Spinner color="#b385f7" size="sm" />
              <Text
                fontSize="sm"
                color="whiteAlpha.600"
                ml={2}
                display="inline"
              >
                Searching...
              </Text>
            </Box>
          )}
          <TableContainer>
            <Table variant="unstyled" size="sm">
              <Thead>
                <Tr>
                  <Th>Token</Th>
                  <Th>Symbol</Th>
                  <Th isNumeric>Total Supply</Th>
                  <Th isNumeric>Holders</Th>
                  <Th isNumeric>Price Change</Th>
                  <Th isNumeric>Volume</Th>
                  <Th isNumeric>Buys/Sells</Th>
                </Tr>
              </Thead>
              <Tbody>
                {(searchQuery ? searchResults : contracts).map((contract) => (
                  <Tr key={contract.id}>
                    <Td>
                      <HStack spacing={3}>
                        <Image
                          src={getLogoUrl(contract.logo)}
                          alt={contract.name}
                          boxSize="32px"
                          borderRadius="full"
                          fallbackSrc="https://via.placeholder.com/32"
                        />
                        <Box>
                          <HStack spacing={1}>
                            <Text fontWeight="medium" fontSize="sm">
                              {contract.name}
                            </Text>
                            {contract.official_verified && (
                              <Icon
                                as={FiCheckCircle}
                                color="green.500"
                                boxSize={3}
                              />
                            )}
                            {contract.is_pump && (
                              <Badge colorScheme="purple" fontSize="xs">
                                PUMP
                              </Badge>
                            )}
                          </HStack>
                          <Link
                            as={NextLink}
                            href={'/prc20/' + contract.contract_address}
                            style={{ textDecoration: 'none' }}
                            _focus={{ boxShadow: 'none' }}
                          >
                            <Text
                              fontSize="xs"
                              color="whiteAlpha.600"
                              isTruncated
                              maxW="180px"
                              _hover={{
                                color: '#b385f7',
                              }}
                            >
                              {contract.contract_address}
                            </Text>
                          </Link>
                        </Box>
                      </HStack>
                    </Td>
                    <Td>
                      <Tag
                        size="sm"
                        bg="rgba(179, 133, 247, 0.14)"
                        color="#b385f7"
                        border="1px solid rgba(179, 133, 247, 0.4)"
                      >
                        {contract.symbol}
                      </Tag>
                    </Td>
                    <Td isNumeric>
                      {formatSupply(contract.total_supply, contract.decimals)}
                    </Td>
                    <Td isNumeric>{contract.holders.toLocaleString()}</Td>
                    <Td isNumeric>
                      <Text
                        color={
                          contract.price_change >= 0 ? 'green.500' : 'red.500'
                        }
                      >
                        {contract.price_change >= 0 ? '+' : ''}
                        {(contract.price_change * 100).toFixed(2)}%
                      </Text>
                    </Td>
                    <Td isNumeric>{formatVolume(contract.volume)} PAXI</Td>
                    <Td isNumeric>
                      <HStack spacing={1} justifyContent="flex-end">
                        <Text color="green.500" fontSize="sm">
                          {contract.buys}
                        </Text>
                        <Text color="whiteAlpha.600">/</Text>
                        <Text color="red.500" fontSize="sm">
                          {contract.sells}
                        </Text>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>

          {searchQuery ? (
            <Box textAlign="center" py={4}>
              {!isSearching && searchResults.length === 0 && (
                <Text color="whiteAlpha.600">
                  No tokens found for &quot;{searchQuery}&quot;
                </Text>
              )}
            </Box>
          ) : (
            <Box ref={loaderRef} textAlign="center" py={4}>
              {isFetching && <Spinner color="#b385f7" />}
              {!hasMore && contracts.length > 0 && (
                <Text color="whiteAlpha.600">No more tokens to load</Text>
              )}
            </Box>
          )}
        </Box>
      </main>
    </>
  )
}
