import {
  Box,
  Divider,
  HStack,
  Heading,
  Icon,
  Link,
  Table,
  TableContainer,
  Tag,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useToast,
} from '@chakra-ui/react'
import { FiChevronRight, FiHome } from 'react-icons/fi'
import NextLink from 'next/link'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { getBlock } from '@/rpc/query'
import { selectTmClient } from '@/store/connectSlice'
import { Block, Coin } from '@cosmjs/stargate'
import { Tx as TxData } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { sha256 } from '@cosmjs/crypto'
import { toHex } from '@cosmjs/encoding'
import { timeFromNow, trimHash, displayDate, getTypeMsg } from '@/utils/helper'

export default function DetailBlock() {
  const router = useRouter()
  const toast = useToast()
  const { height } = router.query
  const tmClient = useSelector(selectTmClient)
  const [block, setBlock] = useState<Block | null>(null)

  interface Tx {
    data: TxData
    hash: Uint8Array
  }
  const [txs, setTxs] = useState<Tx[]>([])

  useEffect(() => {
    if (tmClient && height) {
      getBlock(tmClient, parseInt(height as string, 10))
        .then(setBlock)
        .catch(showError)
    }
  }, [tmClient, height])

  useEffect(() => {
    if (block?.txs.length) {
      const newTxs = block.txs.map((rawTx) => {
        return {
          data: TxData.decode(rawTx),
          hash: sha256(rawTx),
        }
      })
      setTxs(newTxs)
    }
  }, [block])

  const renderMessages = (messages: any) => {
    if (messages.length == 1) {
      return (
        <HStack>
          <Tag
            bg="rgba(179, 133, 247, 0.15)"
            color="#b385f7"
            border="1px solid rgba(179, 133, 247, 0.3)"
          >
            {getTypeMsg(messages[0].typeUrl)}
          </Tag>
        </HStack>
      )
    } else if (messages.length > 1) {
      return (
        <HStack>
          <Tag
            bg="rgba(179, 133, 247, 0.15)"
            color="#b385f7"
            border="1px solid rgba(179, 133, 247, 0.3)"
          >
            {getTypeMsg(messages[0].typeUrl)}
          </Tag>
          <Text textColor="whiteAlpha.700">+{messages.length - 1}</Text>
        </HStack>
      )
    }

    return ''
  }

  const getFee = (fees: Coin[] | undefined) => {
    if (fees && fees.length) {
      return (
        <HStack>
          <Text>{fees[0].amount}</Text>
          <Text textColor="whiteAlpha.600">{fees[0].denom}</Text>
        </HStack>
      )
    }
    return ''
  }

  const showError = (err: Error) => {
    const errMsg = err.message
    let error = null
    try {
      error = JSON.parse(errMsg)
    } catch (e) {
      error = {
        message: 'Invalid',
        data: errMsg,
      }
    }

    toast({
      title: error.message,
      description: error.data,
      status: 'error',
      duration: 5000,
      isClosable: true,
    })
  }

  return (
    <>
      <Head>
        <title>Detail Block | Paxi Explorer</title>
        <meta name="description" content="Block | Paxi Explorer" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <HStack h="24px">
          <Heading size={'md'}>Block</Heading>
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
          <Icon fontSize="16" color="whiteAlpha.400" as={FiChevronRight} />
          <Link
            as={NextLink}
            href={'/blocks'}
            style={{ textDecoration: 'none' }}
            _focus={{ boxShadow: 'none' }}
          >
            <Text color="#b385f7">Blocks</Text>
          </Link>
          <Icon fontSize="16" color="whiteAlpha.400" as={FiChevronRight} />
          <Text color="whiteAlpha.600">Block #{height}</Text>
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
              'linear-gradient(90deg, transparent, rgba(179, 133, 247, 0.3), transparent)',
          }}
        >
          <Heading size={'md'} mb={4}>
            Header
          </Heading>
          <Divider borderColor="rgba(179, 133, 247, 0.2)" mb={4} />
          <TableContainer>
            <Table variant="unstyled" size={'sm'}>
              <Tbody>
                <Tr>
                  <Td pl={0} width={150}>
                    <b>Chain Id</b>
                  </Td>
                  <Td>{block?.header.chainId}</Td>
                </Tr>
                <Tr>
                  <Td pl={0} width={150}>
                    <b>Height</b>
                  </Td>
                  <Td>{block?.header.height}</Td>
                </Tr>
                <Tr>
                  <Td pl={0} width={150}>
                    <b>Block Time</b>
                  </Td>
                  <Td>
                    {block?.header.time
                      ? `${timeFromNow(block?.header.time)} ( ${displayDate(
                          block?.header.time
                        )} )`
                      : ''}
                  </Td>
                </Tr>
                <Tr>
                  <Td pl={0} width={150}>
                    <b>Block Hash</b>
                  </Td>
                  <Td>{block?.id}</Td>
                </Tr>
                <Tr>
                  <Td pl={0} width={150}>
                    <b>Number of Tx</b>
                  </Td>
                  <Td>{block?.txs.length}</Td>
                </Tr>
              </Tbody>
            </Table>
          </TableContainer>
        </Box>

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
              'linear-gradient(90deg, transparent, rgba(179, 133, 247, 0.3), transparent)',
          }}
        >
          <Heading size={'md'} mb={4}>
            Transactions
          </Heading>
          <Divider borderColor="rgba(179, 133, 247, 0.2)" mb={4} />
          <TableContainer>
            <Table
              variant="simple"
              sx={{
                'tbody tr': {
                  boxShadow: 'inset 0 -1px 0 0 var(--chakra-colors-gray-800)',
                },
                'tbody tr td': {
                  borderBottom: 'none',
                },
                'tbody tr:last-of-type': {
                  boxShadow: 'none',
                },
              }}
            >
              <Thead>
                <Tr>
                  <Th>Tx Hash</Th>
                  <Th>Messages</Th>
                  <Th>Fee</Th>
                  <Th>Height</Th>
                  <Th>Time</Th>
                </Tr>
              </Thead>
              <Tbody>
                {txs.map((tx) => (
                  <Tr key={toHex(tx.hash)}>
                    <Td>
                      <Link
                        as={NextLink}
                        href={'/txs/' + toHex(tx.hash).toUpperCase()}
                        style={{ textDecoration: 'none' }}
                        _focus={{ boxShadow: 'none' }}
                      >
                        <Text color="#b385f7">{trimHash(tx.hash)}</Text>
                      </Link>
                    </Td>
                    <Td>{renderMessages(tx.data.body?.messages)}</Td>
                    <Td>{getFee(tx.data.authInfo?.fee?.amount)}</Td>
                    <Td>{height}</Td>
                    <Td>
                      {block?.header.time
                        ? timeFromNow(block?.header.time)
                        : ''}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
      </main>
    </>
  )
}
