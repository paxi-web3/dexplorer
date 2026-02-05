import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useSelector } from 'react-redux'
import { selectTmClient, selectRPCAddress } from '@/store/connectSlice'
import {
  Box,
  Heading,
  Text,
  HStack,
  Icon,
  IconButton,
  Input,
  Skeleton,
  Button,
  useDisclosure,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Flex,
  Stack,
  FormControl,
} from '@chakra-ui/react'
import {
  FiRadio,
  FiSearch,
  FiRefreshCcw,
  FiZap,
  FiTrash2,
} from 'react-icons/fi'
import { selectNewBlock } from '@/store/streamSlice'
import { CheckIcon } from '@chakra-ui/icons'
import { StatusResponse } from '@cosmjs/tendermint-rpc'
import { connectWebsocketClient, validateConnection } from '@/rpc/client'
import { LS_RPC_ADDRESS, LS_RPC_ADDRESS_LIST } from '@/utils/constant'
import { removeTrailingSlash } from '@/utils/helper'

const heightRegex = /^\d+$/
const txhashRegex = /^[A-Z\d]{64}$/
const addrRegex = /^[a-z\d]+1[a-z\d]{38,58}$/

export default function Navbar() {
  const router = useRouter()
  const tmClient = useSelector(selectTmClient)
  const address = useSelector(selectRPCAddress)
  const newBlock = useSelector(selectNewBlock)
  const toast = useToast()
  const [status, setStatus] = useState<StatusResponse | null>()

  const [state, setState] = useState<'initial' | 'submitting' | 'success'>(
    'initial'
  )
  const [newAddress, setNewAddress] = useState('')
  const [error, setError] = useState(false)

  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    isOpen: isOpenRPCs,
    onOpen: onOpenRPCs,
    onClose: onCloseRPCs,
  } = useDisclosure()

  const [inputSearch, setInputSearch] = useState('')
  const [isLoadedSkeleton, setIsLoadedSkeleton] = useState(false)
  const [rpcList, setRPCList] = useState<string[]>([])

  useEffect(() => {
    if (tmClient) {
      tmClient.status().then((response) => setStatus(response))
    }
  }, [tmClient])

  useEffect(() => {
    if (newBlock || status) {
      setIsLoadedSkeleton(true)
    }
  }, [tmClient, newBlock, status])

  const handleInputSearch = (event: any) => {
    setInputSearch(event.target.value as string)
  }

  const handleSearch = () => {
    if (!inputSearch) {
      toast({
        title: 'Please enter a value!',
        status: 'warning',
        isClosable: true,
      })
      return
    }

    if (heightRegex.test(inputSearch)) {
      router.push('/blocks/' + inputSearch)
    } else if (txhashRegex.test(inputSearch)) {
      router.push('/txs/' + inputSearch)
    } else if (addrRegex.test(inputSearch)) {
      router.push('/accounts/' + inputSearch)
    } else {
      toast({
        title: 'Invalid Height, Transaction or Account Address!',
        status: 'error',
        isClosable: true,
      })
      return
    }
    setTimeout(() => {
      onClose()
    }, 500)
  }

  const submitForm = async (e: FormEvent) => {
    e.preventDefault()
    const rpcAddresses = getRPCList()
    const addr = removeTrailingSlash(newAddress)
    if (rpcAddresses.includes(addr)) {
      toast({
        title: 'This RPC Address is already in the list!',
        status: 'warning',
        isClosable: true,
      })
      return
    }
    await connectClient(addr)
    window.localStorage.setItem(
      LS_RPC_ADDRESS_LIST,
      JSON.stringify([addr, ...rpcAddresses])
    )
    setRPCList(getRPCList())
  }

  const connectClient = async (rpcAddress: string) => {
    try {
      setError(false)
      setState('submitting')

      if (!rpcAddress) {
        setError(true)
        setState('initial')
        return
      }

      const isValid = await validateConnection(rpcAddress)
      if (!isValid) {
        setError(true)
        setState('initial')
        return
      }

      const tc = await connectWebsocketClient(rpcAddress)

      if (!tc) {
        setError(true)
        setState('initial')
        return
      }

      window.localStorage.setItem(LS_RPC_ADDRESS, rpcAddress)
      window.location.reload()
      setState('success')
    } catch (err) {
      console.error(err)
      setError(true)
      setState('initial')
      return
    }
  }

  const getRPCList = () => {
    const rpcAddresses = JSON.parse(
      window.localStorage.getItem(LS_RPC_ADDRESS_LIST) || '[]'
    )
    return rpcAddresses
  }

  const onChangeRPC = () => {
    setRPCList(getRPCList())
    setState('initial')
    setNewAddress('')
    setError(false)
    onOpenRPCs()
  }

  const selectChain = (rpcAddress: string) => {
    connectClient(rpcAddress)
  }

  const removeChain = (rpcAddress: string) => {
    const rpcList = getRPCList()
    const updatedList = rpcList.filter((rpc: string) => rpc !== rpcAddress)
    window.localStorage.setItem(
      LS_RPC_ADDRESS_LIST,
      JSON.stringify(updatedList)
    )
    setRPCList(getRPCList())
  }

  return (
    <>
      <Box
        position="relative"
        overflow="hidden"
        bg="rgba(12, 15, 25, 0.85)"
        backdropFilter="blur(12px)"
        border="1px solid"
        borderColor="rgba(179, 133, 247, 0.12)"
        w="100%"
        p={4}
        borderRadius="14px"
        marginBottom={4}
        display={'flex'}
        justifyContent={'space-between'}
        transition="all 0.3s ease"
        _hover={{
          borderColor: 'rgba(179, 133, 247, 0.2)',
        }}
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
        <HStack spacing={4}>
          <Flex
            align="center"
            justify="center"
            w="40px"
            h="40px"
            borderRadius="10px"
            bg="rgba(179, 133, 247, 0.1)"
            border="1px solid"
            borderColor="rgba(179, 133, 247, 0.2)"
          >
            <Icon fontSize="20" color="#b385f7" as={FiRadio} />
          </Flex>
          <Flex
            flexDirection="row"
            gap="3"
            align="center"
            border="1px"
            borderColor="rgba(179, 133, 247, 0.12)"
            borderRadius="10px"
            p={3}
            bg="rgba(10, 13, 22, 0.5)"
          >
            <Box>
              <Skeleton isLoaded={isLoadedSkeleton} borderRadius="6px">
                <Heading size="xs" fontWeight="600" color="whiteAlpha.900">
                  {newBlock?.header.chainId
                    ? newBlock?.header.chainId
                    : status?.nodeInfo.network}
                </Heading>
              </Skeleton>
              <Skeleton isLoaded={isLoadedSkeleton} mt={1} borderRadius="6px">
                <Text fontSize="xs" color="whiteAlpha.500" fontFamily="mono">
                  {address}
                </Text>
              </Skeleton>
            </Box>
            <IconButton
              variant="ghost"
              aria-label="Change RPC"
              size="sm"
              fontSize="16"
              icon={<FiRefreshCcw />}
              onClick={onChangeRPC}
              color="whiteAlpha.700"
              _hover={{
                bg: 'rgba(179, 133, 247, 0.1)',
                color: '#b385f7',
              }}
            />
          </Flex>
        </HStack>
        <HStack>
          <IconButton
            variant="ghost"
            aria-label="Search"
            size="md"
            fontSize="20"
            icon={<FiSearch />}
            onClick={onOpen}
            display={{ base: 'none', md: 'flex' }}
            color="whiteAlpha.700"
            _hover={{
              bg: 'rgba(179, 133, 247, 0.1)',
              color: '#b385f7',
            }}
          />
        </HStack>
      </Box>

      {/* Search Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay bg="rgba(5, 8, 16, 0.85)" backdropFilter="blur(8px)" />
        <ModalContent
          bg="rgba(12, 15, 25, 0.95)"
          border="1px solid"
          borderColor="rgba(179, 133, 247, 0.15)"
          boxShadow="0 4px 24px rgba(0, 0, 0, 0.4), 0 0 20px rgba(179, 133, 247, 0.15)"
        >
          <ModalHeader fontWeight="600">Search</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              width="100%"
              type={'text'}
              borderColor="rgba(179, 133, 247, 0.2)"
              _focus={{
                borderColor: '#b385f7',
                boxShadow:
                  '0 0 0 1px rgba(179, 133, 247, 0.3), 0 0 16px rgba(179, 133, 247, 0.15)',
              }}
              placeholder="Height/Transaction/Account Address"
              onChange={handleInputSearch}
            />
          </ModalBody>

          <ModalFooter>
            <Button w="full" onClick={handleSearch}>
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Change RPC Modal */}
      <Modal isOpen={isOpenRPCs} onClose={onCloseRPCs}>
        <ModalOverlay bg="rgba(5, 8, 16, 0.85)" backdropFilter="blur(8px)" />
        <ModalContent
          bg="rgba(12, 15, 25, 0.95)"
          border="1px solid"
          borderColor="rgba(179, 133, 247, 0.15)"
          boxShadow="0 4px 24px rgba(0, 0, 0, 0.4), 0 0 20px rgba(179, 133, 247, 0.15)"
        >
          <ModalHeader fontWeight="600">Change Connection</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack
              direction={{ base: 'column', md: 'row' }}
              as={'form'}
              spacing={'12px'}
              onSubmit={submitForm}
            >
              <FormControl>
                <Input
                  variant={'outline'}
                  borderWidth={1}
                  color="whiteAlpha.900"
                  _placeholder={{
                    color: 'whiteAlpha.400',
                  }}
                  borderColor="rgba(179, 133, 247, 0.2)"
                  _focus={{
                    borderColor: '#b385f7',
                    boxShadow:
                      '0 0 0 1px rgba(179, 133, 247, 0.3), 0 0 16px rgba(179, 133, 247, 0.15)',
                  }}
                  id={'newAddress'}
                  type={'url'}
                  required
                  placeholder={'Connect to new RPC Address'}
                  aria-label={'Connect to new RPC Address'}
                  value={newAddress}
                  disabled={state !== 'initial'}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setNewAddress(e.target.value)
                  }
                />
              </FormControl>
              <FormControl w={{ base: '100%', md: '40%' }}>
                <Button
                  isLoading={state === 'submitting'}
                  w="100%"
                  type={state === 'success' ? 'button' : 'submit'}
                >
                  {state === 'success' ? <CheckIcon /> : 'Connect'}
                </Button>
              </FormControl>
            </Stack>
            <Text
              mt={2}
              textAlign={'center'}
              fontSize="sm"
              color={error ? 'red.400' : 'whiteAlpha.500'}
            >
              {error ? 'Cannot connect to websocket client' : ''}
            </Text>
            <Text
              mt={4}
              mb={2}
              textAlign={'center'}
              fontSize="11px"
              fontWeight="600"
              textTransform="uppercase"
              letterSpacing="0.08em"
              color="whiteAlpha.500"
            >
              Available RPCs
            </Text>
            <Stack spacing={2} mb="4">
              {rpcList.map((rpc) => (
                <Flex
                  w="full"
                  border="1px"
                  borderRadius="10px"
                  borderColor="rgba(179, 133, 247, 0.12)"
                  bg="rgba(10, 13, 22, 0.5)"
                  p={3}
                  justifyContent="space-between"
                  alignItems="center"
                  key={rpc}
                  transition="all 0.2s ease"
                  _hover={{
                    bg: 'rgba(179, 133, 247, 0.06)',
                    borderColor: 'rgba(179, 133, 247, 0.2)',
                  }}
                >
                  <Box>
                    <Text
                      fontSize="sm"
                      wordBreak="break-all"
                      color="whiteAlpha.800"
                    >
                      {rpc}
                    </Text>
                  </Box>
                  {rpc !== address ? (
                    <Stack direction="row" spacing={2}>
                      <IconButton
                        onClick={() => selectChain(rpc)}
                        aria-label="Connect RPC"
                        size="sm"
                        fontSize="16"
                        icon={<FiZap />}
                      />
                      <IconButton
                        onClick={() => removeChain(rpc)}
                        bg="rgba(239, 68, 68, 0.15)"
                        color="#ef4444"
                        borderWidth="1px"
                        borderColor="rgba(239, 68, 68, 0.3)"
                        _hover={{
                          bg: 'rgba(239, 68, 68, 0.25)',
                          borderColor: 'rgba(239, 68, 68, 0.5)',
                        }}
                        aria-label="Remove RPC"
                        size="sm"
                        fontSize="16"
                        icon={<FiTrash2 />}
                      />
                    </Stack>
                  ) : (
                    <Flex
                      align="center"
                      px={3}
                      py={1}
                      borderRadius="6px"
                      bg="rgba(179, 133, 247, 0.15)"
                      border="1px solid"
                      borderColor="rgba(179, 133, 247, 0.3)"
                    >
                      <Text
                        fontSize="xs"
                        fontWeight="600"
                        color="#b385f7"
                        textTransform="uppercase"
                        letterSpacing="0.04em"
                      >
                        Connected
                      </Text>
                    </Flex>
                  )}
                </Flex>
              ))}
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}
