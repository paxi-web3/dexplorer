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
  SimpleGrid,
  Flex,
  VStack,
} from '@chakra-ui/react'
import { useEffect, useState, useCallback, useRef } from 'react'
import NextLink from 'next/link'
import {
  FiChevronRight,
  FiHome,
  FiDollarSign,
  FiLock,
  FiUsers,
  FiTrendingUp,
} from 'react-icons/fi'
import { IconType } from 'react-icons'

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

const StatCard = ({
  icon,
  label,
  value,
  accentColor,
}: {
  icon: IconType
  label: string
  value: string
  accentColor: string
}) => (
  <Box
    position="relative"
    overflow="hidden"
    bg="rgba(12, 15, 25, 0.85)"
    backdropFilter="blur(12px)"
    border="1px solid"
    borderColor="rgba(179, 133, 247, 0.12)"
    borderRadius="14px"
    p={5}
    transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
    _hover={{
      borderColor: 'rgba(179, 133, 247, 0.3)',
      transform: 'translateY(-2px)',
    }}
    _before={{
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '1px',
      background: `linear-gradient(90deg, transparent, ${accentColor}40, transparent)`,
    }}
  >
    <VStack align="flex-start" spacing={3}>
      <Flex
        align="center"
        justify="center"
        w="40px"
        h="40px"
        borderRadius="10px"
        bg={`${accentColor}15`}
        border="1px solid"
        borderColor={`${accentColor}30`}
      >
        <Icon as={icon} fontSize="18px" color={accentColor} />
      </Flex>
      <Box>
        <Text
          fontSize="11px"
          fontWeight="600"
          color="whiteAlpha.500"
          textTransform="uppercase"
          letterSpacing="0.08em"
          mb={1}
        >
          {label}
        </Text>
        <Heading size="md" fontWeight="700" color="whiteAlpha.900">
          {value}
        </Heading>
      </Box>
    </VStack>
  </Box>
)

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
          <Text color="whiteAlpha.600">Holders</Text>
        </HStack>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mt={8}>
          <StatCard
            icon={FiDollarSign}
            label="Total Supply"
            value={
              status
                ? formatNum(status.circulating_supply + status.locked_vesting)
                : '-'
            }
            accentColor="#b385f7"
          />
          <StatCard
            icon={FiLock}
            label="Locked Vesting"
            value={status ? formatNum(status.locked_vesting) : '-'}
            accentColor="#a78bfa"
          />
          <StatCard
            icon={FiTrendingUp}
            label="Total Staked"
            value={status ? formatNum(status.total_staked) : '-'}
            accentColor="#38bdf8"
          />
          <StatCard
            icon={FiUsers}
            label="Total Accounts"
            value={status ? status.total_accounts.toLocaleString() : '-'}
            accentColor="#34d399"
          />
        </SimpleGrid>

        <Box
          mt={8}
          position="relative"
          overflow="hidden"
          bg="rgba(12, 15, 25, 0.85)"
          backdropFilter="blur(12px)"
          border="1px solid"
          borderColor="rgba(179, 133, 247, 0.12)"
          borderRadius="16px"
          p={5}
          _before={{
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background:
              'linear-gradient(90deg, transparent, rgba(179, 133, 247, 0.3), transparent)',
          }}
        >
          <Heading size={'md'} mb={4}>
            Top Holders
          </Heading>
          <Divider borderColor="rgba(179, 133, 247, 0.12)" mb={4} />
          <TableContainer>
            <Table variant="unstyled">
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
                    <Td fontWeight="600" color="whiteAlpha.600">
                      #{index + 1}
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <Link
                          as={NextLink}
                          href={'/accounts/' + holder.address}
                          style={{ textDecoration: 'none' }}
                          _focus={{ boxShadow: 'none' }}
                        >
                          <Text
                            color="#b385f7"
                            fontSize={{ base: 'xs', md: 'md' }}
                            isTruncated
                            maxW={{ base: '150px', md: '400px', lg: 'full' }}
                            _hover={{ color: '#c79bff' }}
                          >
                            {holder.address}
                          </Text>
                        </Link>
                        <Tag
                          size="sm"
                          bg="rgba(179, 133, 247, 0.15)"
                          color="#b385f7"
                          border="1px solid rgba(179, 133, 247, 0.3)"
                        >
                          {holder.type.toUpperCase()}
                        </Tag>
                      </HStack>
                    </Td>
                    <Td isNumeric fontFamily="mono">
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
            {isFetching && <Spinner color="#b385f7" />}
            {!hasMore && holders.length > 0 && (
              <Text color="whiteAlpha.500" fontSize="sm">
                No more holders to load
              </Text>
            )}
          </Box>
        </Box>
      </main>
    </>
  )
}
