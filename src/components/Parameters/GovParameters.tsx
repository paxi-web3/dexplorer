import { InfoOutlineIcon } from '@chakra-ui/icons'
import {
  Box,
  Flex,
  Heading,
  SimpleGrid,
  Skeleton,
  Text,
  Tooltip,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { selectTmClient } from '@/store/connectSlice'
import {
  selectGovVotingParams,
  selectGovDepositParams,
  selectGovTallyParams,
  setGovVotingParams,
  setGovDepositParams,
  setGovTallyParams,
} from '@/store/paramsSlice'
import { queryGovParams } from '@/rpc/abci'
import {
  displayDurationSeconds,
  convertRateToPercent,
  displayCoin,
  toDisplayPercent,
} from '@/utils/helper'
import { fromUtf8 } from '@cosmjs/encoding'
import { GOV_PARAMS_TYPE } from '@/utils/constant'

export default function GovParameters() {
  const [isHidden, setIsHidden] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const dispatch = useDispatch()
  const tmClient = useSelector(selectTmClient)
  const votingParams = useSelector(selectGovVotingParams)
  const depositParams = useSelector(selectGovDepositParams)
  const tallyParams = useSelector(selectGovTallyParams)

  useEffect(() => {
    if (
      tmClient &&
      !votingParams &&
      !depositParams &&
      !tallyParams &&
      !isLoaded
    ) {
      Promise.all([
        queryGovParams(tmClient, GOV_PARAMS_TYPE.VOTING),
        queryGovParams(tmClient, GOV_PARAMS_TYPE.DEPOSIT),
        queryGovParams(tmClient, GOV_PARAMS_TYPE.TALLY),
      ])
        .then((responses) => {
          if (responses[0].params) {
            dispatch(setGovVotingParams(responses[0].params))
          }
          if (responses[1].params) {
            dispatch(setGovDepositParams(responses[1].params))
          }
          if (responses[2].params) {
            dispatch(setGovTallyParams(responses[2].params))
          }
          setIsLoaded(true)
        })
        .catch((err) => {
          console.error(err)
          setIsHidden(true)
        })
    }

    if (votingParams && depositParams && tallyParams) {
      setIsLoaded(true)
    }
  }, [tmClient, votingParams, depositParams, tallyParams, isLoaded])

  return (
    <Box
      mt={6}
      bg="rgba(12, 15, 25, 0.85)"
      shadow={'0 12px 30px rgba(7, 10, 18, 0.55)'}
      borderRadius="xl"
      border="1px solid"
      borderColor="rgba(179, 133, 247, 0.12)"
      p={6}
      hidden={isHidden}
      position="relative"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '1px',
        background:
          'linear-gradient(90deg, transparent, rgba(179, 133, 247, 0.4), transparent)',
        borderRadius: 'xl',
      }}
    >
      <Flex mb={8} alignItems={'center'} gap={2}>
        <Tooltip
          label="These are values of parameters for governance proposal."
          fontSize="sm"
        >
          <InfoOutlineIcon
            boxSize={5}
            justifyItems={'center'}
            color="#b385f7"
          />
        </Tooltip>
        <Heading size={'md'} fontWeight={'medium'}>
          Governance Parameters
        </Heading>
      </Flex>
      <SimpleGrid minChildWidth="200px" spacing="40px" pl={4}>
        <Skeleton isLoaded={isLoaded}>
          <Box>
            <Heading size="xs" fontWeight={'normal'}>
              Min Deposit
            </Heading>
            <Text pt="2" fontSize="lg" fontWeight={'medium'}>
              {depositParams?.minDeposit.length
                ? displayCoin(depositParams?.minDeposit[0])
                : ''}
            </Text>
          </Box>
        </Skeleton>
        <Skeleton isLoaded={isLoaded}>
          <Box>
            <Heading size="xs" fontWeight={'normal'}>
              Max Deposit Period
            </Heading>
            <Text pt="2" fontSize="lg" fontWeight={'medium'}>
              {displayDurationSeconds(
                Number(depositParams?.maxDepositPeriod?.seconds)
              )}
            </Text>
          </Box>
        </Skeleton>
        <Skeleton isLoaded={isLoaded}>
          <Box>
            <Heading size="xs" fontWeight={'normal'}>
              Voting Period
            </Heading>
            <Text pt="2" fontSize="lg" fontWeight={'medium'}>
              {displayDurationSeconds(
                Number(votingParams?.votingPeriod?.seconds)
              )}
            </Text>
          </Box>
        </Skeleton>
        <Skeleton isLoaded={isLoaded}>
          <Box>
            <Heading size="xs" fontWeight={'normal'}>
              Quorum
            </Heading>
            <Text pt="2" fontSize="lg" fontWeight={'medium'}>
              {toDisplayPercent(tallyParams?.quorum)}
            </Text>
          </Box>
        </Skeleton>
        <Skeleton isLoaded={isLoaded}>
          <Box>
            <Heading size="xs" fontWeight={'normal'}>
              Threshold
            </Heading>
            <Text pt="2" fontSize="lg" fontWeight={'medium'}>
              {toDisplayPercent(tallyParams?.threshold)}
            </Text>
          </Box>
        </Skeleton>
        <Skeleton isLoaded={isLoaded}>
          <Box>
            <Heading size="xs" fontWeight={'normal'}>
              Veto Threshold
            </Heading>
            <Text pt="2" fontSize="lg" fontWeight={'medium'}>
              {toDisplayPercent(tallyParams?.vetoThreshold)}
            </Text>
          </Box>
        </Skeleton>
      </SimpleGrid>
    </Box>
  )
}
