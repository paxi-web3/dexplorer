import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { NewBlockEvent, TxEvent } from '@cosmjs/tendermint-rpc'
import {
  Box,
  Divider,
  HStack,
  Heading,
  Icon,
  Link,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Tag,
  TagLeftIcon,
  TagLabel,
} from '@chakra-ui/react'
import NextLink from 'next/link'
import { FiChevronRight, FiHome, FiCheck, FiX } from 'react-icons/fi'
import { selectNewBlock, selectTxEvent } from '@/store/streamSlice'
import { toHex } from '@cosmjs/encoding'
import { TxBody, TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { timeFromNow, trimHash, getTypeMsg } from '@/utils/helper'

const MAX_ROWS = 20

interface Tx {
  TxEvent: TxEvent
  Timestamp: Date
}

export default function Blocks() {
  const newBlock = useSelector(selectNewBlock)
  const txEvent = useSelector(selectTxEvent)
  const [blocks, setBlocks] = useState<NewBlockEvent[]>([])

  const [txs, setTxs] = useState<Tx[]>([])

  useEffect(() => {
    if (newBlock) {
      updateBlocks(newBlock)
    }
  }, [newBlock])

  useEffect(() => {
    if (txEvent) {
      updateTxs(txEvent)
    }
  }, [txEvent])

  const updateBlocks = (block: NewBlockEvent) => {
    if (blocks.length) {
      if (block.header.height > blocks[0].header.height) {
        setBlocks((prevBlocks) => [block, ...prevBlocks.slice(0, MAX_ROWS - 1)])
      }
    } else {
      setBlocks([block])
    }
  }

  const updateTxs = (txEvent: TxEvent) => {
    const hash = toHex(txEvent.hash)
    setTxs((prevTxs) => {
      if (prevTxs.find((tx) => toHex(tx.TxEvent.hash) === hash)) {
        return prevTxs
      }
      return [
        { TxEvent: txEvent, Timestamp: new Date() },
        ...prevTxs.slice(0, MAX_ROWS - 1),
      ]
    })
  }

  const renderMessages = (messages: any) => {
    if (!messages || !Array.isArray(messages)) {
      return ''
    } else if (messages.length == 1) {
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
  }

  return (
    <>
      <Head>
        <title>Blocks | Paxi Explorer</title>
        <meta name="description" content="Blocks | Paxi Explorer" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <HStack h="24px">
          <Heading size={'md'}>Blocks</Heading>
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
          <Text color="whiteAlpha.600">Blocks</Text>
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
          <Tabs variant="pageTabs">
            <TabList>
              <Tab>Blocks</Tab>
              <Tab>Transactions</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <TableContainer>
                  <Table variant="unstyled">
                    <Thead>
                      <Tr>
                        <Th>Height</Th>
                        <Th>App Hash</Th>
                        <Th>Txs</Th>
                        <Th>Time</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {blocks.map((block) => (
                        <Tr key={block.header.height}>
                          <Td>
                            <Link
                              as={NextLink}
                              href={'/blocks/' + block.header.height}
                              style={{ textDecoration: 'none' }}
                              _focus={{ boxShadow: 'none' }}
                            >
                              <Text color="#b385f7">{block.header.height}</Text>
                            </Link>
                          </Td>
                          <Td noOfLines={1}>{toHex(block.header.appHash)}</Td>
                          <Td>{block.txs.length}</Td>
                          <Td>
                            {timeFromNow(block.header.time.toISOString())}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </TabPanel>
              <TabPanel>
                <TableContainer>
                  <Table variant="unstyled">
                    <Thead>
                      <Tr>
                        <Th>Tx Hash</Th>
                        <Th>Result</Th>
                        <Th>Messages</Th>
                        <Th>Height</Th>
                        <Th>Time</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {txs.map((tx) => (
                        <Tr key={toHex(tx.TxEvent.hash)}>
                          <Td>
                            <Link
                              as={NextLink}
                              href={
                                '/txs/' + toHex(tx.TxEvent.hash).toUpperCase()
                              }
                              style={{ textDecoration: 'none' }}
                              _focus={{ boxShadow: 'none' }}
                            >
                              <Text color="#b385f7">
                                {trimHash(tx.TxEvent.hash)}
                              </Text>
                            </Link>
                          </Td>
                          <Td>
                            {tx.TxEvent.result.code == 0 ? (
                              <Tag
                                bg="rgba(16, 185, 129, 0.15)"
                                color="#10b981"
                                border="1px solid rgba(16, 185, 129, 0.3)"
                              >
                                <TagLeftIcon as={FiCheck} />
                                <TagLabel>Success</TagLabel>
                              </Tag>
                            ) : (
                              <Tag
                                bg="rgba(239, 68, 68, 0.15)"
                                color="#ef4444"
                                border="1px solid rgba(239, 68, 68, 0.3)"
                              >
                                <TagLeftIcon as={FiX} />
                                <TagLabel>Error</TagLabel>
                              </Tag>
                            )}
                          </Td>
                          <Td>
                            {renderMessages(
                              TxBody.decode(
                                TxRaw.decode(tx.TxEvent.tx).bodyBytes
                              ).messages
                            )}
                          </Td>
                          <Td>{tx.TxEvent.height}</Td>
                          <Td>{timeFromNow(tx.Timestamp.toISOString())}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </main>
    </>
  )
}
