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
import { selectSlashingParams, setSlashingParams } from '@/store/paramsSlice'
import { querySlashingParams } from '@/rpc/abci'
import { displayDurationSeconds, convertRateToPercent } from '@/utils/helper'
import { fromUtf8 } from '@cosmjs/encoding'

export default function SlashingParameters() {
  const [isHidden, setIsHidden] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const dispatch = useDispatch()
  const tmClient = useSelector(selectTmClient)
  const params = useSelector(selectSlashingParams)

  useEffect(() => {
    if (tmClient && !params && !isLoaded) {
      querySlashingParams(tmClient)
        .then((response) => {
          if (response.params) {
            dispatch(setSlashingParams(response.params))
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
          label="These are values of parameters for slashing decided by the foundation."
          fontSize="sm"
        >
          <InfoOutlineIcon
            boxSize={5}
            justifyItems={'center'}
            color="#b385f7"
          />
        </Tooltip>
        <Heading size={'md'} fontWeight={'medium'}>
          Slashing Parameters
        </Heading>
      </Flex>
      <SimpleGrid minChildWidth="200px" spacing="40px" pl={4}>
        <Skeleton isLoaded={isLoaded}>
          <Box>
            <Heading size="xs" fontWeight={'normal'}>
              Signed Blocks Window
            </Heading>
            <Text pt="2" fontSize="lg" fontWeight={'medium'}>
              {params?.signedBlocksWindow
                ? Number(params?.signedBlocksWindow)
                : ''}
            </Text>
          </Box>
        </Skeleton>
        <Skeleton isLoaded={isLoaded}>
          <Box>
            <Heading size="xs" fontWeight={'normal'}>
              Min Signed Per Window
            </Heading>
            <Text pt="2" fontSize="lg" fontWeight={'medium'}>
              {convertRateToPercent(
                fromUtf8(params?.minSignedPerWindow ?? new Uint8Array())
              )}
            </Text>
          </Box>
        </Skeleton>
        <Skeleton isLoaded={isLoaded}>
          <Box>
            <Heading size="xs" fontWeight={'normal'}>
              Downtime Jail Duration
            </Heading>
            <Text pt="2" fontSize="lg" fontWeight={'medium'}>
              {displayDurationSeconds(
                Number(params?.downtimeJailDuration?.seconds)
              )}
            </Text>
          </Box>
        </Skeleton>
        <Skeleton isLoaded={isLoaded}>
          <Box>
            <Heading size="xs" fontWeight={'normal'}>
              Slash Fraction Doublesign
            </Heading>
            <Text pt="2" fontSize="lg" fontWeight={'medium'}>
              {convertRateToPercent(
                fromUtf8(params?.slashFractionDoubleSign ?? new Uint8Array())
              )}
            </Text>
          </Box>
        </Skeleton>
        <Skeleton isLoaded={isLoaded}>
          <Box>
            <Heading size="xs" fontWeight={'normal'}>
              Slash Fraction Downtime
            </Heading>
            <Text pt="2" fontSize="lg" fontWeight={'medium'}>
              {convertRateToPercent(
                fromUtf8(params?.slashFractionDowntime ?? new Uint8Array())
              )}
            </Text>
          </Box>
        </Skeleton>
      </SimpleGrid>
    </Box>
  )
}
