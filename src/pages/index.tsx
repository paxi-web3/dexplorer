import Head from 'next/head'
import {
  useColorModeValue,
  Heading,
  Divider,
  HStack,
  Icon,
  Link,
  Text,
  SimpleGrid,
  Box,
  VStack,
  Skeleton,
  Flex,
} from '@chakra-ui/react'
import {
  FiHome,
  FiChevronRight,
  FiBox,
  FiClock,
  FiCpu,
  FiUsers,
  FiLock,
  FiDollarSign,
} from 'react-icons/fi'
import { IconType } from 'react-icons'
import NextLink from 'next/link'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { getValidators } from '@/rpc/query'
import { selectTmClient } from '@/store/connectSlice'
import { selectNewBlock } from '@/store/streamSlice'
import { displayDate } from '@/utils/helper'
import { StatusResponse } from '@cosmjs/tendermint-rpc'
import {
  getCirculatingSupply,
  getTotalSupply,
  getLockedVesting,
} from '@/rpc/abci'
import {
  QueryCirculatingSupplyResponse,
  QueryTotalSupplyResponse,
  QueryLockedVestingResponse,
} from '@/ts_proto/x/paxi/types/query'

export default function Home() {
  const tmClient = useSelector(selectTmClient)
  const newBlock = useSelector(selectNewBlock)
  const [validators, setValidators] = useState<number>()
  const [isLoaded, setIsLoaded] = useState(false)
  const [status, setStatus] = useState<StatusResponse | null>()
  const [circulatingSupply, setCirculatingSupply] =
    useState<QueryCirculatingSupplyResponse>()
  const [lockedVesting, setLockedVesting] =
    useState<QueryLockedVestingResponse>()

  useEffect(() => {
    if (tmClient) {
      tmClient.status().then((response) => setStatus(response))
      getValidators(tmClient).then((response) => setValidators(response.total))
      getCirculatingSupply(tmClient)
        .then((response) => setCirculatingSupply(response))
        .catch((error) =>
          console.error('Error fetching circulating supply:', error)
        )
      getTotalSupply(tmClient)
      getLockedVesting(tmClient)
        .then((response) => setLockedVesting(response))
        .catch((error) =>
          console.error('Error fetching locked vesting:', error)
        )
    }
  }, [tmClient])

  useEffect(() => {
    if ((!isLoaded && newBlock) || (!isLoaded && status)) {
      setIsLoaded(true)
    }
  }, [isLoaded, newBlock, status])

  return (
    <>
      <Head>
        <title>Home | Paxi Explorer</title>
        <meta name="description" content="Home | Paxi Explorer" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <HStack h="24px">
          <Heading size={'md'}>Home</Heading>
          <Divider
            borderColor="rgba(179, 133, 247, 0.2)"
            size="1px"
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
            <Icon
              fontSize="16"
              color={useColorModeValue('light-theme', 'dark-theme')}
              as={FiHome}
            />
          </Link>
          <Icon fontSize="16" as={FiChevronRight} color="whiteAlpha.400" />
          <Text color="whiteAlpha.600">Home</Text>
        </HStack>
        <Box mt={8}>
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing="20px">
            <Skeleton isLoaded={isLoaded} borderRadius="16px">
              <StatCard
                icon={FiBox}
                label="Latest Block Height"
                value={
                  newBlock?.header.height
                    ? newBlock?.header.height.toString()
                    : status?.syncInfo.latestBlockHeight?.toString() || '-'
                }
                accentColor="#b385f7"
              />
            </Skeleton>
            <Skeleton isLoaded={isLoaded} borderRadius="16px">
              <StatCard
                icon={FiClock}
                label="Latest Block Time"
                value={
                  newBlock?.header.time
                    ? displayDate(newBlock?.header.time?.toISOString())
                    : status?.syncInfo.latestBlockTime
                    ? displayDate(
                        status?.syncInfo.latestBlockTime.toISOString()
                      )
                    : '-'
                }
                accentColor="#a78bfa"
              />
            </Skeleton>

            <Skeleton isLoaded={isLoaded} borderRadius="16px">
              <StatCard
                icon={FiCpu}
                label="Network"
                value={
                  newBlock?.header.chainId
                    ? newBlock?.header.chainId
                    : status?.nodeInfo.network || '-'
                }
                accentColor="#f472b6"
              />
            </Skeleton>

            <Skeleton isLoaded={isLoaded} borderRadius="16px">
              <StatCard
                icon={FiUsers}
                label="Validators"
                value={validators?.toString() || '-'}
                accentColor="#38bdf8"
              />
            </Skeleton>

            <Skeleton isLoaded={isLoaded} borderRadius="16px">
              <StatCard
                icon={FiDollarSign}
                label="Circulating Supply"
                value={
                  circulatingSupply?.amount
                    ? Math.ceil(
                        parseFloat(circulatingSupply?.amount.amount) / 1000000
                      ).toLocaleString() + ' PAXI'
                    : 'N/A'
                }
                accentColor="#2dd4bf"
              />
            </Skeleton>

            <Skeleton isLoaded={isLoaded} borderRadius="16px">
              <StatCard
                icon={FiLock}
                label="Locked Vesting"
                value={
                  lockedVesting?.amount
                    ? Math.ceil(
                        parseFloat(lockedVesting?.amount.amount) / 1000000
                      ).toLocaleString() + ' PAXI'
                    : 'N/A'
                }
                accentColor="#34d399"
              />
            </Skeleton>
          </SimpleGrid>
        </Box>
      </main>
    </>
  )
}

interface StatCardProps {
  icon: IconType
  label: string
  value: string
  accentColor: string
}

const StatCard = ({ icon, label, value, accentColor }: StatCardProps) => {
  return (
    <Box
      position="relative"
      overflow="hidden"
      bg="rgba(12, 15, 25, 0.85)"
      backdropFilter="blur(12px)"
      border="1px solid"
      borderColor="rgba(179, 133, 247, 0.12)"
      borderRadius="16px"
      p={5}
      minH="140px"
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      _hover={{
        borderColor: 'rgba(179, 133, 247, 0.3)',
        transform: 'translateY(-2px)',
        boxShadow: `0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(179, 133, 247, 0.15), 0 0 24px ${accentColor}20`,
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
      <Box
        position="absolute"
        top="-30%"
        right="-10%"
        width="120px"
        height="120px"
        background={`radial-gradient(circle, ${accentColor}15 0%, transparent 70%)`}
        borderRadius="full"
        filter="blur(20px)"
        pointerEvents="none"
      />

      <VStack align="flex-start" spacing={3} position="relative">
        <Flex
          align="center"
          justify="center"
          w="42px"
          h="42px"
          borderRadius="10px"
          bg={`${accentColor}15`}
          border="1px solid"
          borderColor={`${accentColor}30`}
        >
          <Icon as={icon} fontSize="20px" color={accentColor} />
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
          <Heading
            size="md"
            fontWeight="700"
            color="whiteAlpha.900"
            letterSpacing="-0.01em"
          >
            {value}
          </Heading>
        </Box>
      </VStack>
    </Box>
  )
}
