import React, { ReactNode, useEffect, useState } from 'react'
import {
  IconButton,
  Box,
  CloseButton,
  Flex,
  Icon,
  Link,
  Drawer,
  DrawerContent,
  Text,
  useDisclosure,
  BoxProps,
  FlexProps,
  Button,
  Heading,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Input,
  useToast,
  useColorModeValue,
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
  FiUsers,
  FiDollarSign,
} from 'react-icons/fi'
import { IconType } from 'react-icons'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { selectSubsNewBlock, selectSubsTxEvent } from '@/store/streamSlice'
import { useSelector } from 'react-redux'
import { LS_RPC_ADDRESS, LS_RPC_ADDRESS_LIST } from '@/utils/constant'
import { FiSearch } from 'react-icons/fi'

const heightRegex = /^\d+$/
const txhashRegex = /^[A-Z\d]{64}$/
const addrRegex = /^[a-z\d]+1[a-z\d]{38,58}$/
const prc20ContractRegex = /^paxi1[a-z\d]{59,}$/

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
  { name: 'Holders', icon: FiUsers, route: '/holders' },
  { name: 'PRC-20', icon: FiDollarSign, route: '/prc20' },
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
    } else if (prc20ContractRegex.test(inputSearch)) {
      router.push('/prc20/' + inputSearch)
    } else if (addrRegex.test(inputSearch)) {
      router.push('/accounts/' + inputSearch)
    } else {
      toast({
        title: 'Invalid Height, Transaction, Account or PRC-20 Address!',
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
    <Box minH="100vh" bg={useColorModeValue('light-bg', 'dark-bg')}>
      <SidebarContent
        onClose={onClose}
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
        <ModalContent
          bg={useColorModeValue('light-container', 'dark-container')}
        >
          <ModalHeader>Search</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              width={400}
              type={'text'}
              borderColor={useColorModeValue(
                'whiteAlpha.200',
                'whiteAlpha.200'
              )}
              _focus={{
                borderColor: useColorModeValue('light-theme', 'dark-theme'),
                boxShadow: `0 0 0 1px ${useColorModeValue(
                  'colors.light-theme',
                  'colors.dark-theme'
                )}`,
              }}
              placeholder="Height/Tx/Account/PRC-20"
              onChange={handleInputSearch}
            />
          </ModalBody>

          <ModalFooter>
            <Button
              bg={useColorModeValue('light-theme', 'dark-theme')}
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
      borderRightColor={useColorModeValue('whiteAlpha.200', 'whiteAlpha.200')}
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
            <Flex align="center" gap="3">
              <Box
                as="img"
                src="/icon_transparent.png"
                alt="Paxi Explorer logo"
                boxSize="28px"
              />
              <Text fontSize="20px" fontWeight="bold">
                Paxi Explorer
              </Text>
            </Flex>
            <CloseButton
              display={{ base: 'flex', md: 'none' }}
              onClick={onClose}
            />
          </Flex>
          {LinkItems.map((link) => (
            <NavItem
              key={link.name}
              icon={link.icon}
              route={link.route}
              onClick={onClose}
            >
              {link.name}
            </NavItem>
          ))}
          <Heading
            mt="6"
            p="4"
            mx="4"
            size={'xs'}
            textTransform="uppercase"
            textColor="whiteAlpha.500"
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
              onClick={onClose}
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
  onClick?: () => void
}
const NavItem = ({
  icon,
  children,
  route,
  isBlank,
  onClick,
  ...rest
}: NavItemProps) => {
  const router = useRouter()
  const [isSelected, setIsSelected] = useState(false)
  const selectedColor = useColorModeValue('light-theme', 'dark-theme')
  const hoverBg = useColorModeValue(
    'rgba(179, 133, 247, 0.08)',
    'rgba(179, 133, 247, 0.08)'
  )

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
      onClick={onClick}
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
            ? useColorModeValue(
                'rgba(179, 133, 247, 0.16)',
                'rgba(179, 133, 247, 0.16)'
              )
            : 'transparent'
        }
        color={isSelected ? selectedColor : 'inherit'}
        _hover={{
          bg: hoverBg,
        }}
        {...rest}
      >
        {icon && (
          <Icon
            mr="4"
            fontSize="16"
            _groupHover={{
              color: selectedColor,
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
  return (
    <Flex
      ml={{ base: 0, md: 60 }}
      px={{ base: 4, md: 24 }}
      height="20"
      alignItems="center"
      bg={useColorModeValue('light-container', 'dark-container')}
      borderBottomWidth="1px"
      borderBottomColor={useColorModeValue('whiteAlpha.200', 'whiteAlpha.200')}
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

        <Flex align="center" ml="6" gap="3">
          <Box
            as="img"
            src="/icon_transparent.png"
            alt="Paxi Explorer logo"
            boxSize="28px"
          />
          <Text fontSize="2xl" fontWeight="bold">
            Paxi Explorer
          </Text>
        </Flex>
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
      </Flex>
    </Flex>
  )
}
