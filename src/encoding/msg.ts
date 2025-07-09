import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx'
import { MsgWithdrawDelegatorReward } from 'cosmjs-types/cosmos/distribution/v1beta1/tx'
import { MsgDelegate } from 'cosmjs-types/cosmos/staking/v1beta1/tx'
import { MsgUpdateClient } from 'cosmjs-types/ibc/core/client/v1/tx'
import {
  MsgExecuteContract,
  MsgInstantiateContract,
  MsgStoreCode,
  MsgMigrateContract,
} from 'cosmjs-types/cosmwasm/wasm/v1/tx'
import {
  MsgAcknowledgement,
  MsgRecvPacket,
} from 'cosmjs-types/ibc/core/channel/v1/tx'
import {
  MsgExec,
  MsgGrant,
  MsgRevoke,
} from 'cosmjs-types/cosmos/authz/v1beta1/tx'
import { MsgTransfer } from 'cosmjs-types/ibc/applications/transfer/v1/tx'
import { fromUtf8 } from '@cosmjs/encoding'
import { MsgProvideLiquidity, MsgSwap, MsgWithdrawLiquidity } from '@/ts_proto/x/swap/types/tx'

const TYPE = {
  MsgSend: '/cosmos.bank.v1beta1.MsgSend',
  MsgWithdrawDelegatorReward:
    '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward',
  MsgDelegate: '/cosmos.staking.v1beta1.MsgDelegate',
  MsgUpdateClient: '/ibc.core.client.v1.MsgUpdateClient',
  MsgAcknowledgement: '/ibc.core.channel.v1.MsgAcknowledgement',
  MsgRecvPacket: '/ibc.core.channel.v1.MsgRecvPacket',
  MsgExec: '/cosmos.authz.v1beta1.MsgExec',
  MsgGrant: '/cosmos.authz.v1beta1.MsgGrant',
  MsgRevoke: '/cosmos.authz.v1beta1.MsgRevoke',
  MsgTransfer: '/ibc.applications.transfer.v1.MsgTransfer',
  MsgExecuteContract: '/cosmwasm.wasm.v1.MsgExecuteContract',
  MsgInstantiateContract: '/cosmwasm.wasm.v1.MsgInstantiateContract',
  MsgStoreCode: '/cosmwasm.wasm.v1.MsgStoreCode',
  MsgMigrateContract: '/cosmwasm.wasm.v1.MsgMigrateContract',
  MsgProvideLiquidity: '/x.swap.types.MsgProvideLiquidity',
  MsgWithdrawLiquidity: '/x.swap.types.MsgWithdrawLiquidity',
  MsgSwap: '/x.swap.types.MsgSwap',
}

export interface DecodeMsg {
  typeUrl: string
  data: Object | null
}

export const decodeMsg = (typeUrl: string, value: Uint8Array): DecodeMsg => {
  let data = null
  let decoded = null
  switch (typeUrl) {
    case TYPE.MsgSend:
      data = MsgSend.decode(value)
      break
    case TYPE.MsgWithdrawDelegatorReward:
      data = MsgWithdrawDelegatorReward.decode(value)
      break
    case TYPE.MsgDelegate:
      data = MsgDelegate.decode(value)
      break
    case TYPE.MsgUpdateClient:
      data = MsgUpdateClient.decode(value)
      break
    case TYPE.MsgAcknowledgement:
      data = MsgAcknowledgement.decode(value)
      break
    case TYPE.MsgRecvPacket:
      data = MsgRecvPacket.decode(value)
      break
    case TYPE.MsgExec:
      data = MsgExec.decode(value)
      break
    case TYPE.MsgGrant:
      data = MsgGrant.decode(value)
      break
    case TYPE.MsgRevoke:
      data = MsgRevoke.decode(value)
      break
    case TYPE.MsgTransfer:
      data = MsgTransfer.decode(value)
      break
    case TYPE.MsgExecuteContract:
      decoded = MsgExecuteContract.decode(value)
      data = MsgExecuteContract.toJSON(decoded) as any
      if (decoded?.msg) {
        try {
          const readableMsg = [JSON.parse(fromUtf8(decoded.msg))]
          data.msg = readableMsg
        } catch (e) {
          console.error('Failed to parse msg:', e)
        }
      }
      break
    case TYPE.MsgInstantiateContract:
      decoded = MsgInstantiateContract.decode(value)
      data = MsgInstantiateContract.toJSON(decoded) as any
      if (decoded?.msg) {
        try {
          const readableMsg = [JSON.parse(fromUtf8(decoded.msg))]
          data.msg = readableMsg
        } catch (e) {
          console.error('Failed to parse msg:', e)
        }
      }
      break
    case TYPE.MsgStoreCode:
      data = MsgStoreCode.decode(value)
      break
    case TYPE.MsgMigrateContract:
      decoded = MsgMigrateContract.decode(value)
      data = MsgMigrateContract.toJSON(decoded) as any
      if (decoded?.msg) {
        try {
          const readableMsg = [JSON.parse(fromUtf8(decoded.msg))]
          data.msg = readableMsg
        } catch (e) {
          console.error('Failed to parse msg:', e)
        }
      }
      break
    case TYPE.MsgProvideLiquidity:
      data = MsgProvideLiquidity.decode(value)
      break
    case TYPE.MsgWithdrawLiquidity:
      data = MsgWithdrawLiquidity.decode(value)
      break
    case TYPE.MsgSwap:
      data = MsgSwap.decode(value)
      break
    default:
      break
  }

  return {
    typeUrl,
    data,
  }
}
