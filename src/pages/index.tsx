import Head from 'next/head'
import {
  useColorModeValue,
  FlexProps,
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
          <Divider borderColor="gray.600" size="1px" orientation="vertical" />
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
          <Text>Home</Text>
        </HStack>
        <Box mt={8}>
          <SimpleGrid minChildWidth="200px" spacing="40px">
            <Skeleton isLoaded={isLoaded}>
              <BoxInfo
                colorScheme="accent1"
                icon={FiBox}
                name="Latest Block Height"
                value={
                  newBlock?.header.height
                    ? newBlock?.header.height
                    : status?.syncInfo.latestBlockHeight
                }
              />
            </Skeleton>
            <Skeleton isLoaded={isLoaded}>
              <BoxInfo
                colorScheme="accent2"
                icon={FiClock}
                name="Latest Block Time"
                value={
                  newBlock?.header.time
                    ? displayDate(newBlock?.header.time?.toISOString())
                    : status?.syncInfo.latestBlockTime
                    ? displayDate(
                        status?.syncInfo.latestBlockTime.toISOString()
                      )
                    : ''
                }
              />
            </Skeleton>

            <Skeleton isLoaded={isLoaded}>
              <BoxInfo
                colorScheme="accent3"
                icon={FiCpu}
                name="Network"
                value={
                  newBlock?.header.chainId
                    ? newBlock?.header.chainId
                    : status?.nodeInfo.network
                }
              />
            </Skeleton>

            <Skeleton isLoaded={isLoaded}>
              <BoxInfo
                colorScheme="accent4"
                icon={FiUsers}
                name="Validators"
                value={validators}
              />
            </Skeleton>

            <Skeleton isLoaded={isLoaded}>
              <BoxInfo
                colorScheme="accent5"
                icon={FiDollarSign}
                name="Circulating Supply"
                value={
                  circulatingSupply?.amount
                    ? Math.ceil(
                        parseFloat(circulatingSupply?.amount.amount) / 1000000
                      ).toLocaleString() + ' PAXI'
                    : 'N/A'
                }
              />
            </Skeleton>

            <Skeleton isLoaded={isLoaded}>
              <BoxInfo
                colorScheme="accent6"
                icon={FiLock}
                name="Locked Vesting"
                value={
                  lockedVesting?.amount
                    ? Math.ceil(
                        parseFloat(lockedVesting?.amount.amount) / 1000000
                      ).toLocaleString() + ' PAXI'
                    : 'N/A'
                }
              />
            </Skeleton>
          </SimpleGrid>
        </Box>
      </main>
    </>
  )
}

interface BoxInfoProps extends FlexProps {
  colorScheme: string
  icon: IconType
  name: string
  value: string | number | undefined
}
const BoxInfo = ({ colorScheme, icon, name, value, ...rest }: BoxInfoProps) => {
  const bgColor = useColorModeValue(`${colorScheme}.100`, `${colorScheme}.600`)
  const color = useColorModeValue(`${colorScheme}.600`, `${colorScheme}.100`)
  return (
    <VStack
      bg={useColorModeValue('light-container', 'dark-container')}
      backdropFilter="blur(10px)"
      border="1px solid"
      borderColor={useColorModeValue('whiteAlpha.200', 'whiteAlpha.200')}
      shadow={'0 12px 30px rgba(7, 10, 18, 0.55)'}
      borderRadius="xl"
      p={4}
      height="150px"
    >
      <Box
        backgroundColor={bgColor}
        padding={2}
        height="40px"
        width="40px"
        borderRadius={'full'}
        display={'flex'}
        justifyContent={'center'}
        alignItems={'center'}
        mb={2}
      >
        <Icon fontSize="20" color={color} as={icon} />
      </Box>
      <Heading size={'md'}>{value}</Heading>
      <Text size={'sm'} color="whiteAlpha.700">
        {name}
      </Text>
    </VStack>
  )
}
