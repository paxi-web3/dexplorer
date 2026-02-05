import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Divider,
  HStack,
  Heading,
  Icon,
  Link,
  Table,
  TableContainer,
  Tag,
  TagLabel,
  TagLeftIcon,
  Tbody,
  Td,
  Text,
  Tr,
  useToast,
} from '@chakra-ui/react'
import { FiChevronRight, FiHome, FiCheck, FiX } from 'react-icons/fi'
import NextLink from 'next/link'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { selectTmClient } from '@/store/connectSlice'
import { getTx, getBlock } from '@/rpc/query'
import { IndexedTx, Block, Coin } from '@cosmjs/stargate'
import { Tx } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import {
  timeFromNow,
  displayDate,
  isBech32Address,
  getTypeMsg,
} from '@/utils/helper'
import { decodeMsg, DecodeMsg } from '@/encoding'
import CodeBlock from '@/components/CodeBlock'

export default function DetailBlock() {
  const router = useRouter()
  const toast = useToast()
  const { hash } = router.query
  const tmClient = useSelector(selectTmClient)
  const [tx, setTx] = useState<IndexedTx | null>(null)
  const [txData, setTxData] = useState<Tx | null>(null)
  const [block, setBlock] = useState<Block | null>(null)
  const [msgs, setMsgs] = useState<DecodeMsg[]>([])

  // Reset state when hash changes
  useEffect(() => {
    setTx(null)
    setTxData(null)
    setBlock(null)
    setMsgs([])
  }, [hash])

  useEffect(() => {
    if (tmClient && hash) {
      getTx(tmClient, hash as string)
        .then(setTx)
        .catch(showError)
    }
  }, [tmClient, hash])

  useEffect(() => {
    if (tmClient && tx?.height) {
      getBlock(tmClient, tx?.height).then(setBlock).catch(showError)
    }
  }, [tmClient, tx])

  useEffect(() => {
    if (tx?.tx) {
      const data = Tx.decode(tx?.tx)
      setTxData(data)
    }
  }, [tx])

  useEffect(() => {
    if (txData?.body?.messages.length && !msgs.length) {
      for (const message of txData?.body?.messages) {
        const msg = decodeMsg(message.typeUrl, message.value)
        setMsgs((prevMsgs) => [...prevMsgs, msg])
      }
    }
  }, [txData])

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

  const showMsgData = (msgData: any) => {
    if (msgData) {
      if (Array.isArray(msgData)) {
        const data = JSON.stringify(msgData, null, 2)
        return (
          <CodeBlock language="json" codeString={data} highContrast></CodeBlock>
        )
      }

      if (!Array.isArray(msgData) && msgData.length) {
        if (isBech32Address(msgData)) {
          return (
            <Link
              as={NextLink}
              href={'/accounts/' + msgData}
              style={{ textDecoration: 'none' }}
              _focus={{ boxShadow: 'none' }}
            >
              <Text color="#b385f7">{msgData}</Text>
            </Link>
          )
        } else {
          return String(msgData)
        }
      }
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
        <title>Detail Transaction | Paxi Explorer</title>
        <meta name="description" content="Txs | Paxi Explorer" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <HStack h="24px">
          <Heading size={'md'}>Transaction</Heading>
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
          <Link
            as={NextLink}
            href={'/blocks'}
            style={{ textDecoration: 'none' }}
            _focus={{ boxShadow: 'none' }}
          >
            <Text color="whiteAlpha.600">Blocks</Text>
          </Link>
          <Icon fontSize="16" as={FiChevronRight} color="whiteAlpha.400" />
          <Text color="whiteAlpha.600">Tx</Text>
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
            Information
          </Heading>
          <Divider borderColor="rgba(179, 133, 247, 0.12)" mb={4} />
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
                    <b>Tx Hash</b>
                  </Td>
                  <Td>{tx?.hash}</Td>
                </Tr>
                <Tr>
                  <Td pl={0} width={150}>
                    <b>Status</b>
                  </Td>
                  <Td>
                    {tx?.code == 0 ? (
                      <Tag
                        bg="rgba(72, 187, 120, 0.15)"
                        color="#48BB78"
                        border="1px solid rgba(72, 187, 120, 0.3)"
                      >
                        <TagLeftIcon as={FiCheck} />
                        <TagLabel>Success</TagLabel>
                      </Tag>
                    ) : (
                      <Tag
                        bg="rgba(245, 101, 101, 0.15)"
                        color="#F56565"
                        border="1px solid rgba(245, 101, 101, 0.3)"
                      >
                        <TagLeftIcon as={FiX} />
                        <TagLabel>Error</TagLabel>
                      </Tag>
                    )}
                  </Td>
                </Tr>
                <Tr>
                  <Td pl={0} width={150}>
                    <b>Height</b>
                  </Td>
                  <Td>
                    <Link
                      as={NextLink}
                      href={'/blocks/' + tx?.height}
                      style={{ textDecoration: 'none' }}
                      _focus={{ boxShadow: 'none' }}
                    >
                      <Text color="#b385f7">{tx?.height}</Text>
                    </Link>
                  </Td>
                </Tr>
                <Tr>
                  <Td pl={0} width={150}>
                    <b>Time</b>
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
                    <b>Fee</b>
                  </Td>
                  <Td>{getFee(txData?.authInfo?.fee?.amount)}</Td>
                </Tr>
                <Tr>
                  <Td pl={0} width={150}>
                    <b>Gas (used / wanted)</b>
                  </Td>
                  <Td>
                    {tx?.gasUsed ? `${tx.gasUsed} / ${tx.gasWanted}` : ''}
                  </Td>
                </Tr>
                <Tr>
                  <Td pl={0} width={150}>
                    <b>Memo</b>
                  </Td>
                  <Td>{txData?.body?.memo}</Td>
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
            Messages
          </Heading>

          {msgs.map((msg, index) => (
            <Card
              variant={'outline'}
              key={index}
              mb={8}
              borderColor="rgba(179, 133, 247, 0.12)"
              bg="rgba(10, 13, 22, 0.55)"
              shadow="0 8px 20px rgba(7, 10, 18, 0.45)"
              color="whiteAlpha.900"
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
              <CardHeader>
                <Heading size="sm" color="white">
                  {getTypeMsg(msg.typeUrl)}
                </Heading>
              </CardHeader>
              <Divider borderColor="rgba(179, 133, 247, 0.12)" />
              <CardBody>
                <TableContainer>
                  <Table variant="unstyled" size={'sm'}>
                    <Tbody>
                      <Tr>
                        <Td pl={0} width={150}>
                          <b>typeUrl</b>
                        </Td>
                        <Td color="whiteAlpha.900">{msg.typeUrl}</Td>
                      </Tr>
                      {Object.keys(msg.data ?? {}).map((key) => (
                        <Tr key={key}>
                          <Td pl={0} width={150}>
                            <b>{key}</b>
                          </Td>
                          <Td>
                            {showMsgData(
                              msg.data ? msg.data[key as keyof {}] : ''
                            )}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </CardBody>
            </Card>
          ))}
        </Box>
      </main>
    </>
  )
}
