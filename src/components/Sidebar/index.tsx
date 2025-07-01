import React, { ReactNode, useEffect, useState } from 'react'
import {
  IconButton,
  Box,
  CloseButton,
  Flex,
  Icon,
  useColorModeValue,
  Link,
  Drawer,
  DrawerContent,
  Text,
  useDisclosure,
  BoxProps,
  FlexProps,
  Button,
  Heading,
  useColorMode,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Input,
  useToast,
} from '@chakra-ui/react'
import {
  FiHome,
  FiBox,
  FiCompass,
  FiStar,
  FiSliders,
  FiMenu,
  FiLogOut,
  FiGithub,
  FiAlertCircle,
  FiCloud,
} from 'react-icons/fi'
import { IconType } from 'react-icons'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { selectSubsNewBlock, selectSubsTxEvent } from '@/store/streamSlice'
import { useSelector } from 'react-redux'
import { LS_RPC_ADDRESS, LS_RPC_ADDRESS_LIST } from '@/utils/constant'
import { FiSearch } from 'react-icons/fi'
import { MoonIcon, SunIcon } from '@chakra-ui/icons'

const heightRegex = /^\d+$/
const txhashRegex = /^[A-Z\d]{64}$/
const addrRegex = /^[a-z\d]+1[a-z\d]{38,58}$/

interface LinkItemProps {
  name: string
  icon: IconType
  route: string
  isBlank?: boolean
}
const LinkItems: Array<LinkItemProps> = [
  { name: 'Home', icon: FiHome, route: '/' },
  { name: 'Blocks', icon: FiBox, route: '/blocks' },
  { name: 'Validators', icon: FiCompass, route: '/validators' },
  { name: 'Proposals', icon: FiStar, route: '/proposals' },
  { name: 'Parameters', icon: FiSliders, route: '/parameters' },
]
const RefLinkItems: Array<LinkItemProps> = [
  {
    name: 'Official Website',
    icon: FiCloud,
    route: 'https://paxinet.io',
    isBlank: true,
  },
  {
    name: 'Github',
    icon: FiGithub,
    route: 'https://github.com/paxi-web3/dexplorer',
    isBlank: true,
  },
  {
    name: 'Report Issues',
    icon: FiAlertCircle,
    route: 'https://github.com/paxi-web3/dexplorer/issues',
    isBlank: true,
  },
]

export default function Sidebar({ children }: { children: ReactNode }) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    isOpen: isSearchOpen,
    onOpen: onOpenSearch,
    onClose: onCloseSearch,
  } = useDisclosure()

  const toast = useToast()
  const router = useRouter()
  const [inputSearch, setInputSearch] = useState('')

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
      onCloseSearch()
    }, 500)
  }

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.100', 'gray.900')}>
      <SidebarContent
        onClose={() => onClose}
        display={{ base: 'none', md: 'block' }}
      />
      <Drawer
        autoFocus={false}
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="full"
      >
        <DrawerContent>
          <SidebarContent onClose={onClose} />
        </DrawerContent>
      </Drawer>

      <Modal isOpen={isSearchOpen} onClose={onCloseSearch}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Search</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              width={400}
              type={'text'}
              borderColor={useColorModeValue('light-theme', 'dark-theme')}
              placeholder="Height/Transaction/Account Address"
              onChange={handleInputSearch}
            />
          </ModalBody>

          <ModalFooter>
            <Button
              bg={useColorModeValue('light-theme', 'dark-theme')}
              _hover={{
                opacity: 0.8,
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

      {/* mobilenav */}
      <MobileNav
        display={{ base: 'flex', md: 'none' }}
        onOpen={onOpen}
        onOpenSearch={onOpenSearch}
      />
      <Box ml={{ base: 0, md: 60 }} p="4">
        {children}
      </Box>
    </Box>
  )
}

interface SidebarProps extends BoxProps {
  onClose: () => void
}

const SidebarContent = ({ onClose, ...rest }: SidebarProps) => {
  const subsNewBlock = useSelector(selectSubsNewBlock)
  const subsTxEvent = useSelector(selectSubsTxEvent)

  const handleDisconnect = () => {
    subsNewBlock?.unsubscribe()
    subsTxEvent?.unsubscribe()
    window.localStorage.removeItem(LS_RPC_ADDRESS)
    window.localStorage.removeItem(LS_RPC_ADDRESS_LIST)
    window.location.replace('/')
  }

  return (
    <Box
      bg={useColorModeValue('light-container', 'dark-container')}
      borderRight="1px"
      borderRightColor={useColorModeValue('gray.200', 'gray.700')}
      w={{ base: 'full', md: 60 }}
      pos="fixed"
      h="full"
      {...rest}
    >
      <Flex flexDirection="column" h="full" justifyContent="space-between">
        <Box>
          <Flex
            h="20"
            alignItems="center"
            mx="8"
            justifyContent="space-between"
          >
            <Text fontSize="20px" fontWeight="bold">
              Paxi Explorer
            </Text>
            <CloseButton
              display={{ base: 'flex', md: 'none' }}
              onClick={onClose}
            />
          </Flex>
          {LinkItems.map((link) => (
            <NavItem key={link.name} icon={link.icon} route={link.route}>
              {link.name}
            </NavItem>
          ))}
          <Heading
            mt="6"
            p="4"
            mx="4"
            size={'xs'}
            textTransform="uppercase"
            textColor={useColorModeValue('gray.500', 'gray.100')}
            fontWeight="medium"
          >
            Links
          </Heading>
          {RefLinkItems.map((link) => (
            <NavItem
              key={link.name}
              icon={link.icon}
              route={link.route}
              isBlank={link.isBlank}
            >
              {link.name}
            </NavItem>
          ))}
        </Box>
        <Flex justifyContent="center" mb="4">
          <Button
            leftIcon={<FiLogOut />}
            colorScheme="red"
            variant="outline"
            onClick={handleDisconnect}
          >
            Disconnect All
          </Button>
        </Flex>
      </Flex>
    </Box>
  )
}

interface NavItemProps extends FlexProps {
  icon: IconType
  children: string | number
  route: string
  isBlank?: boolean
}
const NavItem = ({ icon, children, route, isBlank, ...rest }: NavItemProps) => {
  const router = useRouter()
  const [isSelected, setIsSelected] = useState(false)

  useEffect(() => {
    if (route === '/') {
      setIsSelected(router.route === route)
    } else {
      setIsSelected(router.route.includes(route))
    }
  }, [router])

  return (
    <Link
      as={NextLink}
      href={route}
      style={{ textDecoration: 'none' }}
      _focus={{ boxShadow: 'none' }}
      target={isBlank ? '_blank' : '_self'}
    >
      <Flex
        align="center"
        p="4"
        mx="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        bg={
          isSelected
            ? useColorModeValue('light-theme', 'dark-theme')
            : 'transparent'
        }
        color={isSelected ? 'white' : useColorModeValue('black', 'white')}
        _hover={{
          color: isSelected
            ? 'white'
            : useColorModeValue('light-theme', 'dark-theme'),
        }}
        {...rest}
      >
        {icon && (
          <Icon
            mr="4"
            fontSize="16"
            _groupHover={{
              color: isSelected
                ? 'white'
                : useColorModeValue('light-theme', 'dark-theme'),
            }}
            as={icon}
          />
        )}
        {children}
      </Flex>
    </Link>
  )
}

interface MobileProps extends FlexProps {
  onOpen: () => void
  onOpenSearch: () => void
}
const MobileNav = ({ onOpen, onOpenSearch, ...rest }: MobileProps) => {
  const { colorMode, toggleColorMode } = useColorMode()

  return (
    <Flex
      ml={{ base: 0, md: 60 }}
      px={{ base: 4, md: 24 }}
      height="20"
      alignItems="center"
      bg={useColorModeValue('light-container', 'dark-container')}
      borderBottomWidth="1px"
      borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
      justifyContent="space-between"
      {...rest}
    >
      <Flex align="center">
        <IconButton
          variant="ghost"
          onClick={onOpen}
          aria-label="open menu"
          icon={<FiMenu />}
        />

        <Text fontSize="2xl" ml="8" fontWeight="bold">
          Paxi Explorer
        </Text>
      </Flex>

      <Flex align="center" gap={2}>
        <IconButton
          variant="ghost"
          aria-label="Search"
          size="md"
          fontSize="20"
          icon={<FiSearch />}
          onClick={onOpenSearch}
        />

        <IconButton
          variant="ghost"
          aria-label="Toggle Theme"
          size="md"
          fontSize="20"
          icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
          onClick={toggleColorMode}
        />
      </Flex>
    </Flex>
  )
}
