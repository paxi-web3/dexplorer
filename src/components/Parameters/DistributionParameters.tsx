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
  selectDistributionParams,
  setDistributionParams,
} from '@/store/paramsSlice'
import { queryDistributionParams } from '@/rpc/abci'
import { convertRateToPercent } from '@/utils/helper'

export default function DistributionParameters() {
  const [isHidden, setIsHidden] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const dispatch = useDispatch()
  const tmClient = useSelector(selectTmClient)
  const params = useSelector(selectDistributionParams)

  useEffect(() => {
    if (tmClient && !params && !isLoaded) {
      queryDistributionParams(tmClient)
        .then((response) => {
          if (response.params) {
            dispatch(setDistributionParams(response.params))
          }
          setIsLoaded(true)
        })
        .catch((err) => {
          console.error(err)
          setIsHidden(true)
        })
    }

    if (params) {
      setIsLoaded(true)
    }
  }, [tmClient, params, isLoaded])

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
          label="These are values of parameters when a validator proposes a block."
          fontSize="sm"
        >
          <InfoOutlineIcon
            boxSize={5}
            justifyItems={'center'}
            color="#b385f7"
          />
        </Tooltip>
        <Heading size={'md'} fontWeight={'medium'}>
          Distribution Parameters
        </Heading>
      </Flex>
      <SimpleGrid minChildWidth="200px" spacing="40px" pl={4}>
        <Skeleton isLoaded={isLoaded}>
          <Box>
            <Heading size="xs" fontWeight={'normal'}>
              Community Tax
            </Heading>
            <Text pt="2" fontSize="lg" fontWeight={'medium'}>
              {convertRateToPercent(params?.communityTax)}
            </Text>
          </Box>
        </Skeleton>
        <Skeleton isLoaded={isLoaded}>
          <Box>
            <Heading size="xs" fontWeight={'normal'}>
              Withdraw Addr Enabled
            </Heading>
            <Text pt="2" fontSize="lg" fontWeight={'medium'}>
              {params?.withdrawAddrEnabled ? 'True' : 'False'}
            </Text>
          </Box>
        </Skeleton>
      </SimpleGrid>
    </Box>
  )
}
