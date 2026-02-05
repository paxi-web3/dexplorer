import Head from 'next/head'
import {
  Box,
  Divider,
  HStack,
  Heading,
  Icon,
  Link,
  useColorModeValue,
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
  Stat,
  StatLabel,
  StatNumber,
  SimpleGrid,
} from '@chakra-ui/react'
import { useEffect, useState, useCallback, useRef } from 'react'
import NextLink from 'next/link'
import { FiChevronRight, FiHome } from 'react-icons/fi'

interface Holder {
  address: string
  balance: number
  type: string
}

interface PaxiStatus {
  circulating_supply: number
  locked_vesting: number
  total_staked: number
  total_accounts: number
}

export default function Holders() {
  const [holders, setHolders] = useState<Holder[]>([])
  const [status, setStatus] = useState<PaxiStatus | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [isFetching, setIsFetching] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const loaderRef = useRef<HTMLDivElement>(null)

  const formatNum = (num: number) => {
    return new Intl.NumberFormat().format(Math.floor(num))
  }

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/status')
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      console.error('Failed to fetch status:', error)
    }
  }, [])

  const fetchHolders = useCallback(async () => {
    if (isFetching || !hasMore) return

    setIsFetching(true)
    try {
      const response = await fetch(`/api/holders?page=${currentPage}`)
      const data = await response.json()

      if (data.holders && data.holders.length > 0) {
        setHolders((prev) => [...prev, ...data.holders])
        setCurrentPage((prev) => prev + 1)
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error('Failed to fetch holders:', error)
    } finally {
      setTimeout(() => {
        setIsFetching(false)
      }, 500)
    }
  }, [currentPage, isFetching, hasMore])

  useEffect(() => {
    fetchStatus()
    fetchHolders()
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetching && hasMore) {
          fetchHolders()
        }
      },
      { threshold: 0.1 }
    )

    if (loaderRef.current) {
      observer.observe(loaderRef.current)
    }

    return () => observer.disconnect()
  }, [fetchHolders, isFetching, hasMore])

  return (
    <>
      <Head>
        <title>Holders | Paxi Explorer</title>
        <meta name="description" content="Holders | Paxi Explorer" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <HStack h="24px">
          <Heading size={'md'}>Holders</Heading>
          <Divider borderColor={'gray'} size="10px" orientation="vertical" />
          <Link
            as={NextLink}
            href={'/'}
            style={{ textDecoration: 'none' }}
            _focus={{ boxShadow: 'none' }}
            display="flex"
            justifyContent="center"
          >
            <Icon
              fontSize="16"
              color={useColorModeValue('light-theme', 'dark-theme')}
              as={FiHome}
            />
          </Link>
          <Icon fontSize="16" as={FiChevronRight} />
          <Text>Holders</Text>
        </HStack>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mt={8}>
          <Box
            bg={useColorModeValue('light-container', 'dark-container')}
            shadow={'base'}
            borderRadius={4}
            p={4}
          >
            <Stat>
              <StatLabel>Total Supply</StatLabel>
              <StatNumber>
                {status
                  ? formatNum(status.circulating_supply + status.locked_vesting)
                  : '-'}
              </StatNumber>
            </Stat>
          </Box>
          <Box
            bg={useColorModeValue('light-container', 'dark-container')}
            shadow={'base'}
            borderRadius={4}
            p={4}
          >
            <Stat>
              <StatLabel>Locked Vesting</StatLabel>
              <StatNumber>
                {status ? formatNum(status.locked_vesting) : '-'}
              </StatNumber>
            </Stat>
          </Box>
          <Box
            bg={useColorModeValue('light-container', 'dark-container')}
            shadow={'base'}
            borderRadius={4}
            p={4}
          >
            <Stat>
              <StatLabel>Total Staked</StatLabel>
              <StatNumber>
                {status ? formatNum(status.total_staked) : '-'}
              </StatNumber>
            </Stat>
          </Box>
          <Box
            bg={useColorModeValue('light-container', 'dark-container')}
            shadow={'base'}
            borderRadius={4}
            p={4}
          >
            <Stat>
              <StatLabel>Total Accounts</StatLabel>
              <StatNumber>
                {status ? status.total_accounts.toLocaleString() : '-'}
              </StatNumber>
            </Stat>
          </Box>
        </SimpleGrid>

        <Box
          mt={8}
          bg={useColorModeValue('light-container', 'dark-container')}
          shadow={'base'}
          borderRadius={4}
          p={4}
        >
          <Heading size={'md'} mb={4}>
            Top Holders
          </Heading>
          <Divider borderColor={'gray'} mb={4} />
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th width="80px">Rank</Th>
                  <Th>Address</Th>
                  <Th isNumeric>Balance</Th>
                </Tr>
              </Thead>
              <Tbody>
                {holders.map((holder, index) => (
                  <Tr key={`${holder.address}-${index}`}>
                    <Td>#{index + 1}</Td>
                    <Td>
                      <HStack spacing={2}>
                        <Link
                          as={NextLink}
                          href={'/accounts/' + holder.address}
                          style={{ textDecoration: 'none' }}
                          _focus={{ boxShadow: 'none' }}
                        >
                          <Text
                            color={useColorModeValue(
                              'light-theme',
                              'dark-theme'
                            )}
                            fontSize={{ base: 'xs', md: 'md' }}
                            isTruncated
                            maxW={{ base: '150px', md: '400px', lg: 'full' }}
                          >
                            {holder.address}
                          </Text>
                        </Link>
                        <Tag size="sm" colorScheme="cyan">
                          {holder.type.toUpperCase()}
                        </Tag>
                      </HStack>
                    </Td>
                    <Td isNumeric>
                      {holder.balance.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>

          <Box ref={loaderRef} textAlign="center" py={4}>
            {isFetching && <Spinner color="cyan.500" />}
            {!hasMore && holders.length > 0 && (
              <Text color="gray.500">No more holders to load</Text>
            )}
          </Box>
        </Box>
      </main>
    </>
  )
}
