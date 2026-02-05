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
        <DrawerContent bg="rgba(12, 15, 25, 0.98)" backdropFilter="blur(20px)">
          <SidebarContent onClose={onClose} />
        </DrawerContent>
      </Drawer>

      <Modal isOpen={isSearchOpen} onClose={onCloseSearch}>
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
                borderColor: 'light-theme',
                boxShadow:
                  '0 0 0 1px rgba(179, 133, 247, 0.3), 0 0 16px rgba(179, 133, 247, 0.15)',
              }}
              placeholder="Height/Tx/Account/PRC-20"
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
      bg="rgba(12, 15, 25, 0.9)"
      backdropFilter="blur(20px)"
      borderRight="1px"
      borderRightColor="rgba(179, 133, 247, 0.1)"
      w={{ base: 'full', md: 60 }}
      pos="fixed"
      h="full"
      {...rest}
    >
      {/* Gradient accent line */}
      <Box
        position="absolute"
        top={0}
        right={0}
        bottom={0}
        width="1px"
        background="linear-gradient(180deg, rgba(179, 133, 247, 0.3) 0%, rgba(179, 133, 247, 0.05) 50%, rgba(179, 133, 247, 0.3) 100%)"
      />

      <Flex flexDirection="column" h="full" justifyContent="space-between">
        <Box>
          <Flex
            h="20"
            alignItems="center"
            mx="6"
            justifyContent="space-between"
          >
            <Flex align="center" gap="3">
              <Box position="relative" boxSize="32px">
                <Box
                  as="img"
                  src="/icon_transparent.png"
                  alt="Paxi Explorer logo"
                  boxSize="32px"
                  position="relative"
                  zIndex={1}
                />
                <Box
                  position="absolute"
                  inset="-4px"
                  background="radial-gradient(circle, rgba(179, 133, 247, 0.3) 0%, transparent 70%)"
                  borderRadius="full"
                  filter="blur(8px)"
                />
              </Box>
              <Text
                fontSize="18px"
                fontWeight="700"
                letterSpacing="-0.01em"
                bgGradient="linear(to-r, white, whiteAlpha.800)"
                bgClip="text"
              >
                Paxi Explorer
              </Text>
            </Flex>
            <CloseButton
              display={{ base: 'flex', md: 'none' }}
              onClick={onClose}
            />
          </Flex>

          <Box px={3} mt={2}>
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
          </Box>

          <Box px={3} mt={6}>
            <Text
              px={4}
              mb={2}
              fontSize="10px"
              fontWeight="600"
              textTransform="uppercase"
              letterSpacing="0.1em"
              color="whiteAlpha.400"
            >
              External Links
            </Text>
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
        </Box>

        <Flex justifyContent="center" mb="6" px={4}>
          <Button
            leftIcon={<FiLogOut />}
            variant="outline"
            size="sm"
            w="full"
            borderColor="rgba(239, 68, 68, 0.4)"
            color="#ef4444"
            _hover={{
              bg: 'rgba(239, 68, 68, 0.1)',
              borderColor: 'rgba(239, 68, 68, 0.6)',
            }}
            onClick={handleDisconnect}
          >
            Disconnect
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
        px="4"
        py="2.5"
        my="1"
        borderRadius="10px"
        role="group"
        cursor="pointer"
        position="relative"
        overflow="hidden"
        transition="all 0.2s ease"
        bg={isSelected ? 'rgba(179, 133, 247, 0.12)' : 'transparent'}
        color={isSelected ? '#b385f7' : 'whiteAlpha.700'}
        fontWeight={isSelected ? '600' : '500'}
        fontSize="14px"
        _hover={{
          bg: 'rgba(179, 133, 247, 0.08)',
          color: '#b385f7',
        }}
        _before={
          isSelected
            ? {
                content: '""',
                position: 'absolute',
                left: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                width: '3px',
                height: '60%',
                borderRadius: '0 4px 4px 0',
                background: 'linear-gradient(180deg, #b385f7, #9333ea)',
                boxShadow: '0 0 8px rgba(179, 133, 247, 0.5)',
              }
            : {}
        }
        {...rest}
      >
        {icon && (
          <Icon
            mr="3"
            fontSize="16"
            transition="all 0.2s ease"
            _groupHover={{
              color: '#b385f7',
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
      height="16"
      alignItems="center"
      bg="rgba(12, 15, 25, 0.9)"
      backdropFilter="blur(20px)"
      borderBottomWidth="1px"
      borderBottomColor="rgba(179, 133, 247, 0.1)"
      justifyContent="space-between"
      position="relative"
      _after={{
        content: '""',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '1px',
        background:
          'linear-gradient(90deg, transparent, rgba(179, 133, 247, 0.3), transparent)',
      }}
      {...rest}
    >
      <Flex align="center">
        <IconButton
          variant="ghost"
          onClick={onOpen}
          aria-label="open menu"
          icon={<FiMenu />}
          color="whiteAlpha.800"
          _hover={{
            bg: 'rgba(179, 133, 247, 0.1)',
            color: '#b385f7',
          }}
        />

        <Flex align="center" ml="4" gap="3">
          <Box position="relative" boxSize="28px">
            <Box
              as="img"
              src="/icon_transparent.png"
              alt="Paxi Explorer logo"
              boxSize="28px"
            />
          </Box>
          <Text fontSize="lg" fontWeight="700" letterSpacing="-0.01em">
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
          color="whiteAlpha.800"
          _hover={{
            bg: 'rgba(179, 133, 247, 0.1)',
            color: '#b385f7',
          }}
        />
      </Flex>
    </Flex>
  )
}
