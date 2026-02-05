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
  useColorModeValue,
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

  const navbarBg = useColorModeValue(
    'rgba(12, 16, 28, 0.78)',
    'rgba(12, 16, 28, 0.78)'
  )
  const borderColor = useColorModeValue('whiteAlpha.200', 'whiteAlpha.200')
  const themeColor = useColorModeValue('light-theme', 'dark-theme')

  return (
    <>
      <Box
        bg={navbarBg}
        backdropFilter="blur(10px)"
        border="1px solid"
        borderColor={borderColor}
        w="100%"
        p={4}
        shadow={'base'}
        borderRadius="xl"
        marginBottom={4}
        display={'flex'}
        justifyContent={'space-between'}
      >
        <HStack>
          <Icon mr="4" fontSize="32" color={themeColor} as={FiRadio} />
          <Flex
            flexDirection="row"
            gap="4"
            border="1px"
            borderColor={borderColor}
            borderRadius="xl"
            p={3}
            bg="rgba(10, 13, 22, 0.35)"
          >
            <Box>
              <Skeleton isLoaded={isLoadedSkeleton}>
                <Heading size="xs">
                  {newBlock?.header.chainId
                    ? newBlock?.header.chainId
                    : status?.nodeInfo.network}
                </Heading>
              </Skeleton>
              <Skeleton isLoaded={isLoadedSkeleton}>
                <Text fontSize="sm" color="whiteAlpha.600">
                  {address}
                </Text>
              </Skeleton>
            </Box>
            <IconButton
              variant="solid"
              aria-label="Change RPC"
              size="md"
              fontSize="20"
              icon={<FiRefreshCcw />}
              onClick={onChangeRPC}
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
          />
        </HStack>
      </Box>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent
          bg={useColorModeValue('light-container', 'dark-container')}
        >
          <ModalHeader>Search</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              width={400}
              type={'text'}
              borderColor={borderColor}
              _focus={{
                borderColor: themeColor,
                boxShadow: `0 0 0 1px ${themeColor}`,
              }}
              placeholder="Height/Transaction/Account Address"
              onChange={handleInputSearch}
            />
          </ModalBody>

          <ModalFooter>
            <Button
              bg={themeColor}
              _hover={{
                bg: useColorModeValue('purple.500', 'purple.500'),
              }}
              color="white"
              w="full"
              textTransform="uppercase"
              onClick={handleSearch}
            >
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isOpenRPCs} onClose={onCloseRPCs}>
        <ModalOverlay />
        <ModalContent
          bg={useColorModeValue('light-container', 'dark-container')}
        >
          <ModalHeader>Change Connection</ModalHeader>
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
                  variant={'solid'}
                  borderWidth={1}
                  color={useColorModeValue('gray.800', 'white')}
                  _placeholder={{
                    color: 'gray.400',
                  }}
                  borderColor={borderColor}
                  _focus={{
                    borderColor: themeColor,
                    boxShadow: `0 0 0 1px ${themeColor}`,
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
                  backgroundColor={themeColor}
                  color={'white'}
                  _hover={{
                    backgroundColor: useColorModeValue(
                      'purple.500',
                      'purple.500'
                    ),
                  }}
                  isLoading={state === 'submitting'}
                  w="100%"
                  type={state === 'success' ? 'button' : 'submit'}
                >
                  {state === 'success' ? <CheckIcon /> : 'Connect'}
                </Button>
              </FormControl>
            </Stack>
            <Text
              textAlign={'center'}
              color={error ? 'red.500' : 'whiteAlpha.600'}
            >
              {error ? 'Oh no, cannot connect to websocket client! 😢' : '‎'}
            </Text>
            <Text
              m={2}
              textAlign={'center'}
              fontWeight="semibold"
              color={useColorModeValue('whiteAlpha.600', 'whiteAlpha.600')}
            >
              Available RPCs
            </Text>
            <Stack spacing={4} mb="4">
              {rpcList.map((rpc) => (
                <Flex
                  w="full"
                  border="1px"
                  borderRadius="md"
                  borderColor={borderColor}
                  p={2}
                  justifyContent="space-between"
                  alignItems="center"
                  key={rpc}
                  _hover={{
                    bg: useColorModeValue(
                      'rgba(179, 133, 247, 0.08)',
                      'rgba(179, 133, 247, 0.08)'
                    ),
                  }}
                >
                  <Box>
                    <Text fontSize="sm" wordBreak="break-all">
                      {rpc}
                    </Text>
                  </Box>
                  {rpc !== address ? (
                    <Stack direction="row">
                      <IconButton
                        onClick={() => selectChain(rpc)}
                        backgroundColor={themeColor}
                        color={'white'}
                        _hover={{
                          backgroundColor: useColorModeValue(
                            'purple.500',
                            'purple.300'
                          ),
                        }}
                        aria-label="Connect RPC"
                        size="sm"
                        fontSize="20"
                        icon={<FiZap />}
                      />
                      <IconButton
                        onClick={() => removeChain(rpc)}
                        backgroundColor={'red.400'}
                        color={'white'}
                        _hover={{
                          backgroundColor: 'red.500',
                        }}
                        aria-label="Remove RPC"
                        size="sm"
                        fontSize="20"
                        icon={<FiTrash2 />}
                      />
                    </Stack>
                  ) : (
                    <Text
                      fontSize="sm"
                      fontWeight="semibold"
                      color={themeColor}
                    >
                      Connected
                    </Text>
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
