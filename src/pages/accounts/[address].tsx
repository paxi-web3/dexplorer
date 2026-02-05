import {
  Box,
  Button,
  Divider,
  HStack,
  Heading,
  Icon,
  Link,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Table,
  TableContainer,
  Tabs,
  Tag,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useToast,
  Spinner,
  Image,
  Badge,
} from '@chakra-ui/react'
import { FiChevronRight, FiHome, FiCheckCircle } from 'react-icons/fi'
import NextLink from 'next/link'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useSelector } from 'react-redux'
import {
  getAccount,
  getAllBalances,
  getAllSpendableBalances,
  getBalanceStaked,
  getTxsBySender,
  getDenomMetadata,
} from '@/rpc/query'
import { selectTmClient } from '@/store/connectSlice'
import { Account, Coin } from '@cosmjs/stargate'
import { toHex } from '@cosmjs/encoding'
import { TxBody, TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { trimHash, getTypeMsg } from '@/utils/helper'

interface PRC20Contract {
  id: number
  contract_address: string
  name: string
  symbol: string
  decimals: number
  total_supply: number
  logo: string
  official_verified: boolean
  is_pump: boolean
}

interface PRC20Account {
  id: number
  contract_address: string
  address: string
  frozen: boolean
  balance: number
  update_needed: boolean
  updated_at: string
}

interface PRC20Asset {
  contract: PRC20Contract
  account: PRC20Account
}

export default function DetailAccount() {
  const router = useRouter()
  const toast = useToast()
  const { address } = router.query
  const tmClient = useSelector(selectTmClient)
  const [account, setAccount] = useState<Account | null>(null)
  const [allBalances, setAllBalances] = useState<readonly Coin[]>([])
  const [balanceStaked, setBalanceStaked] = useState<Coin | null>(null)

  interface Tx {
    data: TxBody
    height: number
    hash: Uint8Array
  }
  const [txs, setTxs] = useState<Tx[]>([])
  const [denomNames, setDenomNames] = useState<Record<string, string>>({})
  const [txPage, setTxPage] = useState(1)
  const [isFetchingTxs, setIsFetchingTxs] = useState(false)
  const [hasMoreTxs, setHasMoreTxs] = useState(true)
  const txLoaderRef = useRef<HTMLDivElement>(null)

  // PRC-20 Assets state
  const [prc20Assets, setPrc20Assets] = useState<PRC20Asset[]>([])
  const [isFetchingPrc20, setIsFetchingPrc20] = useState(false)
  const [hasMorePrc20, setHasMorePrc20] = useState(true)
  const prc20PageRef = useRef(0)
  const currentAddressRef = useRef<string | null>(null)

  const getLogoUrl = (logo: string) => {
    if (!logo) return '/placeholder-token.png'
    if (logo.startsWith('ipfs://')) {
      return logo.replace('ipfs://', 'https://ipfs.io/ipfs/')
    }
    return logo
  }

  const formatBalance = (balance: number, decimals: number) => {
    const value = balance / Math.pow(10, decimals)
    if (value >= 1_000_000_000) {
      return (value / 1_000_000_000).toFixed(2) + 'B'
    } else if (value >= 1_000_000) {
      return (value / 1_000_000).toFixed(2) + 'M'
    } else if (value >= 1_000) {
      return (value / 1_000).toFixed(2) + 'K'
    }
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 })
  }

  const fetchPrc20Assets = async (accountAddress: string, page: number) => {
    setIsFetchingPrc20(true)
    try {
      const response = await fetch(
        `/api/prc20/my_contract_accounts?address=${encodeURIComponent(
          accountAddress
        )}&page=${page}`
      )
      const data = await response.json()

      if (data.accounts && data.accounts.length > 0) {
        setPrc20Assets((prev) => [...prev, ...data.accounts])
        prc20PageRef.current = page + 1
      } else {
        setHasMorePrc20(false)
      }
    } catch (err) {
      console.error('Failed to fetch PRC-20 assets:', err)
    } finally {
      setIsFetchingPrc20(false)
    }
  }

  const fetchDenomName = useCallback(
    async (denom: string) => {
      if (denomNames[denom] || !tmClient) return
      if (denom === 'upaxi') {
        setDenomNames((prev) => ({ ...prev, [denom]: 'PAXI' }))
        return
      }
      try {
        const metadata = await getDenomMetadata(tmClient, denom)
        if (metadata?.display) {
          setDenomNames((prev) => ({
            ...prev,
            [denom]: metadata.display.toUpperCase(),
          }))
        } else if (metadata?.symbol) {
          setDenomNames((prev) => ({ ...prev, [denom]: metadata.symbol }))
        } else {
          if (denom.startsWith('ibc/')) {
            setDenomNames((prev) => ({
              ...prev,
              [denom]: `IBC/${denom.slice(4, 12)}...`,
            }))
          } else {
            setDenomNames((prev) => ({ ...prev, [denom]: denom }))
          }
        }
      } catch (error) {
        console.error('Failed to fetch denom metadata:', error)
        if (denom.startsWith('ibc/')) {
          setDenomNames((prev) => ({
            ...prev,
            [denom]: `IBC/${denom.slice(4, 12)}...`,
          }))
        } else {
          setDenomNames((prev) => ({ ...prev, [denom]: denom }))
        }
      }
    },
    [denomNames, tmClient]
  )

  const fetchTransactions = useCallback(
    async (page: number) => {
      if (!tmClient || !address || isFetchingTxs) return

      setIsFetchingTxs(true)
      try {
        const perPage = 30
        const txSearchResult = await getTxsBySender(
          tmClient,
          address as string,
          page,
          perPage
        )

        if (txSearchResult?.txs.length) {
          const newTxs: Tx[] = []
          for (const rawTx of txSearchResult.txs) {
            const txRaw = TxRaw.decode(rawTx.tx)
            if (txRaw.bodyBytes) {
              const data = TxBody.decode(txRaw.bodyBytes)
              newTxs.push({
                data,
                hash: rawTx.hash,
                height: rawTx.height,
              })
            }
          }

          setTxs((prevTxs) => [...prevTxs, ...newTxs])
          setTxPage(page + 1)

          if (txSearchResult.txs.length < perPage) {
            setHasMoreTxs(false)
          }
        } else {
          setHasMoreTxs(false)
        }
      } catch (error) {
        showError(error as Error)
      } finally {
        setIsFetchingTxs(false)
      }
    },
    [tmClient, address, isFetchingTxs]
  )

  // Reset state when address changes
  useEffect(() => {
    setAccount(null)
    setAllBalances([])
    setBalanceStaked(null)
    setTxs([])
    setDenomNames({})
    setTxPage(1)
    setIsFetchingTxs(false)
    setHasMoreTxs(true)
    // Reset PRC-20 assets
    setPrc20Assets([])
    setHasMorePrc20(true)
    prc20PageRef.current = 0
  }, [address])

  // Fetch PRC-20 assets when address changes
  useEffect(() => {
    if (address && address !== currentAddressRef.current) {
      currentAddressRef.current = address as string
      fetchPrc20Assets(address as string, 0)
    }
  }, [address])

  const handleLoadMorePrc20 = () => {
    if (address && hasMorePrc20 && !isFetchingPrc20) {
      fetchPrc20Assets(address as string, prc20PageRef.current)
    }
  }

  // Fetch denom names when balances are loaded
  useEffect(() => {
    if (allBalances.length > 0) {
      allBalances.forEach((balance) => {
        fetchDenomName(balance.denom)
      })
    }
  }, [allBalances])

  useEffect(() => {
    if (tmClient && address) {
      getAccount(tmClient, address as string)
        .then(setAccount)
        .catch(showError)

      getAllSpendableBalances(tmClient, address as string)
        .then(setAllBalances)
        .catch(showError)

      getBalanceStaked(tmClient, address as string)
        .then(setBalanceStaked)
        .catch(showError)

      fetchTransactions(1)
    }
  }, [tmClient, address])

  // Infinite scroll for transactions
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !isFetchingTxs &&
          hasMoreTxs &&
          txs.length > 0
        ) {
          fetchTransactions(txPage)
        }
      },
      { threshold: 0.1 }
    )

    if (txLoaderRef.current) {
      observer.observe(txLoaderRef.current)
    }

    return () => observer.disconnect()
  }, [fetchTransactions, isFetchingTxs, hasMoreTxs, txPage, txs.length])

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

  const renderMessages = (messages: any) => {
    if (messages.length == 1) {
      return (
        <HStack>
          <Tag colorScheme="cyan">{getTypeMsg(messages[0].typeUrl)}</Tag>
        </HStack>
      )
    } else if (messages.length > 1) {
      return (
        <HStack>
          <Tag colorScheme="cyan">{getTypeMsg(messages[0].typeUrl)}</Tag>
          <Text textColor="cyan.800">+{messages.length - 1}</Text>
        </HStack>
      )
    }

    return ''
  }

  return (
    <>
      <Head>
        <title>Detail Account | Paxi Explorer</title>
        <meta name="description" content="Account | Paxi Explorer" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <HStack h="24px">
          <Heading size={'md'}>Account</Heading>
          <Divider borderColor={'gray'} size="10px" orientation="vertical" />
          <Link
            as={NextLink}
            href={'/'}
            style={{ textDecoration: 'none' }}
            _focus={{ boxShadow: 'none' }}
            display="flex"
            justifyContent="center"
          >
            <Icon fontSize="16" color="#06b6d4" as={FiHome} />
          </Link>
          <Icon fontSize="16" as={FiChevronRight} />
          <Text>Accounts</Text>
          <Icon fontSize="16" as={FiChevronRight} />
          <Text>Detail</Text>
        </HStack>
        <Box
          mt={8}
          bg="rgba(30, 41, 59, 0.4)"
          backdropFilter="blur(10px)"
          border="1px solid rgba(255, 255, 255, 0.08)"
          shadow={'base'}
          borderRadius="xl"
          p={4}
        >
          <Heading size={'md'} mb={4}>
            Profile
          </Heading>
          <Divider borderColor={'rgba(255, 255, 255, 0.08)'} mb={4} />
          <TableContainer>
            <Table variant="unstyled" size={'sm'}>
              <Tbody>
                <Tr>
                  <Td pl={0} width={150}>
                    <b>Address</b>
                  </Td>
                  <Td>{address}</Td>
                </Tr>
                <Tr>
                  <Td pl={0} width={150}>
                    <b>Pub Key</b>
                  </Td>
                  <Td>
                    <Tabs>
                      <TabList>
                        <Tab>@Type</Tab>
                        <Tab>Key</Tab>
                      </TabList>
                      <TabPanels>
                        <TabPanel>
                          <p>{account?.pubkey?.type}</p>
                        </TabPanel>
                        <TabPanel>
                          <p>{account?.pubkey?.value}</p>
                        </TabPanel>
                      </TabPanels>
                    </Tabs>
                  </Td>
                </Tr>
                <Tr>
                  <Td pl={0} width={150}>
                    <b>Account Number</b>
                  </Td>
                  <Td>{account?.accountNumber}</Td>
                </Tr>
                <Tr>
                  <Td pl={0} width={150}>
                    <b>Sequence</b>
                  </Td>
                  <Td>{account?.sequence}</Td>
                </Tr>
              </Tbody>
            </Table>
          </TableContainer>
        </Box>

        <Box
          mt={8}
          bg="rgba(30, 41, 59, 0.4)"
          backdropFilter="blur(10px)"
          border="1px solid rgba(255, 255, 255, 0.08)"
          shadow={'base'}
          borderRadius="xl"
          p={4}
        >
          <Heading size={'md'} mb={4}>
            Balances
          </Heading>
          <Heading size={'sm'} mb={4}></Heading>
          <Tabs size="md" variant="soft-rounded" colorScheme="purple">
            <TabList>
              <Tab>Available</Tab>
              <Tab>Delegated</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Denom</Th>
                        <Th>Amount</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {allBalances.map((item, index) => (
                        <Tr key={index}>
                          <Td>
                            <HStack spacing={2}>
                              {item.denom === 'upaxi' && (
                                <Image
                                  src="/icon_black_bg.png"
                                  alt="PAXI"
                                  boxSize="20px"
                                  borderRadius="full"
                                />
                              )}
                              <Text color="gray.200">
                                {denomNames[item.denom] || item.denom}
                              </Text>
                            </HStack>
                          </Td>
                          <Td>
                            {(
                              parseFloat(item.amount) / 1000000
                            ).toLocaleString()}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </TabPanel>
              <TabPanel>
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Denom</Th>
                        <Th>Amount</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      <Tr>
                        <Td>
                          <HStack spacing={2}>
                            <Image
                              src="/icon_black_bg.png"
                              alt="PAXI"
                              boxSize="20px"
                              borderRadius="full"
                            />
                            <Text>PAXI</Text>
                          </HStack>
                        </Td>
                        <Td>
                          {balanceStaked?.amount
                            ? (
                                parseFloat(balanceStaked?.amount) / 1000000
                              ).toLocaleString()
                            : 0.0}
                        </Td>
                      </Tr>
                    </Tbody>
                  </Table>
                </TableContainer>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>

        <Box
          mt={8}
          bg="rgba(30, 41, 59, 0.4)"
          backdropFilter="blur(10px)"
          border="1px solid rgba(255, 255, 255, 0.08)"
          shadow={'base'}
          borderRadius="xl"
          p={4}
        >
          <Heading size={'md'} mb={4}>
            PRC-20 Assets
          </Heading>
          <Divider borderColor={'rgba(255, 255, 255, 0.08)'} mb={4} />
          <TableContainer>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Token</Th>
                  <Th isNumeric>Balance</Th>
                </Tr>
              </Thead>
              <Tbody>
                {prc20Assets.map((asset) => (
                  <Tr key={asset.contract.contract_address}>
                    <Td>
                      <HStack spacing={3}>
                        <Image
                          src={getLogoUrl(asset.contract.logo)}
                          alt={asset.contract.name}
                          boxSize="32px"
                          borderRadius="full"
                          fallbackSrc="https://via.placeholder.com/32"
                        />
                        <Link
                          as={NextLink}
                          href={'/prc20/' + asset.contract.contract_address}
                          style={{ textDecoration: 'none' }}
                          _focus={{ boxShadow: 'none' }}
                        >
                          <HStack spacing={2}>
                            <Text color="#06b6d4">{asset.contract.name}</Text>
                            {asset.contract.official_verified && (
                              <Icon
                                as={FiCheckCircle}
                                color="green.500"
                                boxSize={4}
                              />
                            )}
                            {asset.contract.is_pump && (
                              <Badge colorScheme="purple" fontSize="xs">
                                PUMP
                              </Badge>
                            )}
                          </HStack>
                          <Text fontSize="sm" color="gray.500">
                            {asset.contract.symbol}
                          </Text>
                        </Link>
                      </HStack>
                    </Td>
                    <Td isNumeric>
                      {formatBalance(
                        asset.account.balance,
                        asset.contract.decimals
                      )}{' '}
                      {asset.contract.symbol}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
          {prc20Assets.length === 0 && !isFetchingPrc20 && (
            <Text color="gray.500" textAlign="center" py={4}>
              No PRC-20 assets found
            </Text>
          )}
          <Box textAlign="center" py={4}>
            {isFetchingPrc20 && <Spinner color="#a855f7" />}
            {hasMorePrc20 && prc20Assets.length > 0 && !isFetchingPrc20 && (
              <Button
                colorScheme="purple"
                variant="outline"
                size="sm"
                onClick={handleLoadMorePrc20}
                _hover={{ bg: 'rgba(147, 51, 234, 0.1)' }}
              >
                Load More
              </Button>
            )}
            {!hasMorePrc20 && prc20Assets.length > 0 && (
              <Text color="gray.500">No more assets to load</Text>
            )}
          </Box>
        </Box>

        <Box
          mt={8}
          bg="rgba(30, 41, 59, 0.4)"
          backdropFilter="blur(10px)"
          border="1px solid rgba(255, 255, 255, 0.08)"
          shadow={'base'}
          borderRadius="xl"
          p={4}
        >
          <Heading size={'md'} mb={4}>
            Transactions
          </Heading>
          <Divider borderColor={'rgba(255, 255, 255, 0.08)'} mb={4} />
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Tx Hash</Th>
                  <Th>Messages</Th>
                  <Th>Memo</Th>
                  <Th>Height</Th>
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
                        <Text color="#06b6d4">{trimHash(tx.hash)}</Text>
                      </Link>
                    </Td>
                    <Td>{renderMessages(tx.data.messages)}</Td>
                    <Td>{tx.data.memo}</Td>
                    <Td>
                      <Link
                        as={NextLink}
                        href={'/blocks/' + tx.height}
                        style={{ textDecoration: 'none' }}
                        _focus={{ boxShadow: 'none' }}
                      >
                        <Text color="#06b6d4">{tx.height}</Text>
                      </Link>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
          <Box ref={txLoaderRef} textAlign="center" py={4}>
            {isFetchingTxs && <Spinner color="#a855f7" />}
            {!hasMoreTxs && txs.length > 0 && (
              <Text color="gray.500">No more transactions to load</Text>
            )}
          </Box>
        </Box>
      </main>
    </>
  )
}
