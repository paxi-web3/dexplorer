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
import { BinaryReader } from '@bufbuild/protobuf/wire'

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
  MsgPaxiBurnToken: '/x.paxi.types.MsgBurnToken',
  MsgPaxiUpdateParams: '/x.paxi.types.MsgUpdateParams',
  MsgSwapUpdateParams: '/x.swap.types.MsgUpdateParams',
  MsgProvideLiquidity: '/x.swap.types.MsgProvideLiquidity',
  MsgWithdrawLiquidity: '/x.swap.types.MsgWithdrawLiquidity',
  MsgSwap: '/x.swap.types.MsgSwap',
  MsgCustommintUpdateParams: '/x.custommint.types.MsgUpdateParams',
  MsgMintUUSDT: '/x.custommint.types.MsgMintUUSDT',
  MsgBurnUUSDT: '/x.custommint.types.MsgBurnUUSDT',
  MsgCustomwasmUpdateParams: '/x.customwasm.types.MsgUpdateParams',
  MsgPredictionUpdateParams: '/x.prediction.types.MsgUpdateParams',
  MsgCreateMarket: '/x.prediction.types.MsgCreateMarket',
  MsgPlaceOrder: '/x.prediction.types.MsgPlaceOrder',
  MsgCancelOrder: '/x.prediction.types.MsgCancelOrder',
  MsgSplitPosition: '/x.prediction.types.MsgSplitPosition',
  MsgMergePosition: '/x.prediction.types.MsgMergePosition',
  MsgApplyTradeBatch: '/x.prediction.types.MsgApplyTradeBatch',
  MsgResolveMarket: '/x.prediction.types.MsgResolveMarket',
  MsgRequestResolve: '/x.prediction.types.MsgRequestResolve',
  MsgVoidMarket: '/x.prediction.types.MsgVoidMarket',
  MsgClaimPayout: '/x.prediction.types.MsgClaimPayout',
  MsgClaimVoidRefund: '/x.prediction.types.MsgClaimVoidRefund',
}

export interface DecodeMsg {
  typeUrl: string
  data: Object | null
}

type Decoder<T> = (input: BinaryReader | Uint8Array, length?: number) => T

type ScalarFieldKind = 'string' | 'uint64' | 'int64' | 'enum'

type ScalarField<T> = {
  fieldNo: number
  name: keyof T & string
  kind: ScalarFieldKind
  repeated?: boolean
  enumValues?: Record<number, string>
}

type MessageField<T> = {
  fieldNo: number
  name: keyof T & string
  kind: 'message'
  repeated?: boolean
  decode: Decoder<unknown>
}

type FieldSchema<T> = ScalarField<T> | MessageField<T>

type MessageSchema<T extends Record<string, unknown>> = {
  create: () => T
  fields: Array<FieldSchema<T>>
}

const PREDICTION_COLLATERAL_TYPE = {
  0: 'COLLATERAL_TYPE_UNSPECIFIED',
  1: 'COLLATERAL_TYPE_NATIVE',
  2: 'COLLATERAL_TYPE_PRC20',
}

const PREDICTION_ORDER_SIDE = {
  0: 'ORDER_SIDE_UNSPECIFIED',
  1: 'ORDER_SIDE_BUY_YES',
  2: 'ORDER_SIDE_BUY_NO',
  3: 'ORDER_SIDE_SELL_YES',
  4: 'ORDER_SIDE_SELL_NO',
}

const PREDICTION_ORDER_TYPE = {
  0: 'ORDER_TYPE_UNSPECIFIED',
  1: 'ORDER_TYPE_LIMIT',
  2: 'ORDER_TYPE_MARKET',
}

const PREDICTION_OUTCOME = {
  0: 'OUTCOME_UNSPECIFIED',
  1: 'OUTCOME_YES',
  2: 'OUTCOME_NO',
}

function decodeBySchema<T extends Record<string, unknown>>(
  input: BinaryReader | Uint8Array,
  schema: MessageSchema<T>,
  length?: number
): T {
  const reader = input instanceof BinaryReader ? input : new BinaryReader(input)
  const end = length === undefined ? reader.len : reader.pos + length
  const message = schema.create() as Record<string, unknown>

  while (reader.pos < end) {
    const tag = reader.uint32()
    const fieldNo = tag >>> 3
    const field = schema.fields.find((item) => item.fieldNo === fieldNo)

    if (!field) {
      if ((tag & 7) === 4 || tag === 0) {
        break
      }
      reader.skip(tag & 7)
      continue
    }

    let value: unknown
    switch (field.kind) {
      case 'string':
        value = reader.string()
        break
      case 'uint64':
        value = reader.uint64().toString()
        break
      case 'int64':
        value = reader.int64().toString()
        break
      case 'enum': {
        const raw = reader.int32()
        value = field.enumValues?.[raw] ?? raw.toString()
        break
      }
      case 'message':
        value = field.decode(reader, reader.uint32())
        break
    }

    if (field.repeated) {
      const current = message[field.name]
      if (Array.isArray(current)) {
        current.push(value)
      } else {
        message[field.name] = [value]
      }
    } else {
      message[field.name] = value
    }
  }

  return message as T
}

const decodePaxiParamsInput = (
  input: BinaryReader | Uint8Array,
  length?: number
) =>
  decodeBySchema(
    input,
    {
      create: () => ({
        extraGasPerNewAccount: '0',
      }),
      fields: [
        {
          fieldNo: 1,
          name: 'extraGasPerNewAccount',
          kind: 'uint64',
        },
      ],
    },
    length
  )

const decodeCoin = (input: BinaryReader | Uint8Array, length?: number) =>
  decodeBySchema(
    input,
    {
      create: () => ({
        denom: '',
        amount: '',
      }),
      fields: [
        { fieldNo: 1, name: 'denom', kind: 'string' },
        { fieldNo: 2, name: 'amount', kind: 'string' },
      ],
    },
    length
  )

const decodePaxiMsgBurnToken = (
  input: BinaryReader | Uint8Array,
  length?: number
) =>
  decodeBySchema(
    input,
    {
      create: () => ({
        sender: '',
        amount: [] as unknown[],
      }),
      fields: [
        { fieldNo: 1, name: 'sender', kind: 'string' },
        {
          fieldNo: 2,
          name: 'amount',
          kind: 'message',
          repeated: true,
          decode: decodeCoin,
        },
      ],
    },
    length
  )

const decodePaxiMsgUpdateParams = (
  input: BinaryReader | Uint8Array,
  length?: number
) =>
  decodeBySchema(
    input,
    {
      create: () => ({
        authority: '',
        params: undefined as unknown,
      }),
      fields: [
        { fieldNo: 1, name: 'authority', kind: 'string' },
        {
          fieldNo: 2,
          name: 'params',
          kind: 'message',
          decode: decodePaxiParamsInput,
        },
      ],
    },
    length
  )

const decodeSwapParamsInput = (
  input: BinaryReader | Uint8Array,
  length?: number
) =>
  decodeBySchema(
    input,
    {
      create: () => ({
        codeId: '0',
        swapFeeBps: '0',
        minLiquidity: '0',
      }),
      fields: [
        { fieldNo: 1, name: 'codeId', kind: 'uint64' },
        { fieldNo: 2, name: 'swapFeeBps', kind: 'uint64' },
        { fieldNo: 3, name: 'minLiquidity', kind: 'uint64' },
      ],
    },
    length
  )

const decodeSwapMsgUpdateParams = (
  input: BinaryReader | Uint8Array,
  length?: number
) =>
  decodeBySchema(
    input,
    {
      create: () => ({
        authority: '',
        params: undefined as unknown,
      }),
      fields: [
        { fieldNo: 1, name: 'authority', kind: 'string' },
        {
          fieldNo: 2,
          name: 'params',
          kind: 'message',
          decode: decodeSwapParamsInput,
        },
      ],
    },
    length
  )

const decodeMsgProvideLiquidity = (
  input: BinaryReader | Uint8Array,
  length?: number
) =>
  decodeBySchema(
    input,
    {
      create: () => ({
        creator: '',
        prc20: '',
        paxiAmount: '',
        prc20Amount: '',
      }),
      fields: [
        { fieldNo: 1, name: 'creator', kind: 'string' },
        { fieldNo: 2, name: 'prc20', kind: 'string' },
        { fieldNo: 3, name: 'paxiAmount', kind: 'string' },
        { fieldNo: 4, name: 'prc20Amount', kind: 'string' },
      ],
    },
    length
  )

const decodeMsgWithdrawLiquidity = (
  input: BinaryReader | Uint8Array,
  length?: number
) =>
  decodeBySchema(
    input,
    {
      create: () => ({
        creator: '',
        prc20: '',
        lpAmount: '',
      }),
      fields: [
        { fieldNo: 1, name: 'creator', kind: 'string' },
        { fieldNo: 2, name: 'prc20', kind: 'string' },
        { fieldNo: 3, name: 'lpAmount', kind: 'string' },
      ],
    },
    length
  )

const decodeMsgSwap = (input: BinaryReader | Uint8Array, length?: number) =>
  decodeBySchema(
    input,
    {
      create: () => ({
        creator: '',
        prc20: '',
        offerDenom: '',
        offerAmount: '',
        minReceive: '',
      }),
      fields: [
        { fieldNo: 1, name: 'creator', kind: 'string' },
        { fieldNo: 2, name: 'prc20', kind: 'string' },
        { fieldNo: 3, name: 'offerDenom', kind: 'string' },
        { fieldNo: 4, name: 'offerAmount', kind: 'string' },
        { fieldNo: 5, name: 'minReceive', kind: 'string' },
      ],
    },
    length
  )

const decodeCustommintParamsInput = (
  input: BinaryReader | Uint8Array,
  length?: number
) =>
  decodeBySchema(
    input,
    {
      create: () => ({
        burnThreshold: '',
        burnRatio: '',
        blocksPerYear: '0',
        firstYearInflation: '',
        secondYearInflation: '',
        otherYearInflation: '',
        uusdtAuthority: '',
      }),
      fields: [
        { fieldNo: 1, name: 'burnThreshold', kind: 'string' },
        { fieldNo: 2, name: 'burnRatio', kind: 'string' },
        { fieldNo: 3, name: 'blocksPerYear', kind: 'int64' },
        { fieldNo: 4, name: 'firstYearInflation', kind: 'string' },
        { fieldNo: 5, name: 'secondYearInflation', kind: 'string' },
        { fieldNo: 6, name: 'otherYearInflation', kind: 'string' },
        { fieldNo: 7, name: 'uusdtAuthority', kind: 'string' },
      ],
    },
    length
  )

const decodeCustommintMsgUpdateParams = (
  input: BinaryReader | Uint8Array,
  length?: number
) =>
  decodeBySchema(
    input,
    {
      create: () => ({
        authority: '',
        params: undefined as unknown,
      }),
      fields: [
        { fieldNo: 1, name: 'authority', kind: 'string' },
        {
          fieldNo: 2,
          name: 'params',
          kind: 'message',
          decode: decodeCustommintParamsInput,
        },
      ],
    },
    length
  )

const decodeMsgMintUUSDT = (
  input: BinaryReader | Uint8Array,
  length?: number
) =>
  decodeBySchema(
    input,
    {
      create: () => ({
        authority: '',
        toAddress: '',
        amount: '',
      }),
      fields: [
        { fieldNo: 1, name: 'authority', kind: 'string' },
        { fieldNo: 2, name: 'toAddress', kind: 'string' },
        { fieldNo: 3, name: 'amount', kind: 'string' },
      ],
    },
    length
  )

const decodeMsgBurnUUSDT = (
  input: BinaryReader | Uint8Array,
  length?: number
) =>
  decodeBySchema(
    input,
    {
      create: () => ({
        authority: '',
        fromAddress: '',
        amount: '',
      }),
      fields: [
        { fieldNo: 1, name: 'authority', kind: 'string' },
        { fieldNo: 2, name: 'fromAddress', kind: 'string' },
        { fieldNo: 3, name: 'amount', kind: 'string' },
      ],
    },
    length
  )

const decodeCustomwasmParamsInput = (
  input: BinaryReader | Uint8Array,
  length?: number
) =>
  decodeBySchema(
    input,
    {
      create: () => ({
        storeCodeBaseGas: '0',
        storeCodeMultiplier: '0',
        instBaseGas: '0',
        instMultiplier: '0',
      }),
      fields: [
        { fieldNo: 1, name: 'storeCodeBaseGas', kind: 'uint64' },
        { fieldNo: 2, name: 'storeCodeMultiplier', kind: 'uint64' },
        { fieldNo: 3, name: 'instBaseGas', kind: 'uint64' },
        { fieldNo: 4, name: 'instMultiplier', kind: 'uint64' },
      ],
    },
    length
  )

const decodeCustomwasmMsgUpdateParams = (
  input: BinaryReader | Uint8Array,
  length?: number
) =>
  decodeBySchema(
    input,
    {
      create: () => ({
        authority: '',
        params: undefined as unknown,
      }),
      fields: [
        { fieldNo: 1, name: 'authority', kind: 'string' },
        {
          fieldNo: 2,
          name: 'params',
          kind: 'message',
          decode: decodeCustomwasmParamsInput,
        },
      ],
    },
    length
  )

const decodePredictionParamsInput = (
  input: BinaryReader | Uint8Array,
  length?: number
) =>
  decodeBySchema(
    input,
    {
      create: () => ({
        maxBatchSize: '0',
        createMarketBond: '',
        createMarketBondDenom: '',
        marketFeeBps: '0',
        resolverFeeSharePercent: '0',
        maxOrderLifetimeBh: '0',
        maxOpenOrdersPerUser: '0',
        maxOpenOrdersPerMarket: '0',
        orderPruneIntervalBh: '0',
        orderPruneRetainBh: '0',
        orderPruneScanLimit: '0',
        orderPruneDeleteLimit: '0',
      }),
      fields: [
        { fieldNo: 1, name: 'maxBatchSize', kind: 'uint64' },
        { fieldNo: 2, name: 'createMarketBond', kind: 'string' },
        { fieldNo: 3, name: 'createMarketBondDenom', kind: 'string' },
        { fieldNo: 4, name: 'marketFeeBps', kind: 'uint64' },
        { fieldNo: 5, name: 'resolverFeeSharePercent', kind: 'uint64' },
        { fieldNo: 6, name: 'maxOrderLifetimeBh', kind: 'uint64' },
        { fieldNo: 7, name: 'maxOpenOrdersPerUser', kind: 'uint64' },
        { fieldNo: 8, name: 'maxOpenOrdersPerMarket', kind: 'uint64' },
        { fieldNo: 9, name: 'orderPruneIntervalBh', kind: 'uint64' },
        { fieldNo: 10, name: 'orderPruneRetainBh', kind: 'uint64' },
        { fieldNo: 11, name: 'orderPruneScanLimit', kind: 'uint64' },
        { fieldNo: 12, name: 'orderPruneDeleteLimit', kind: 'uint64' },
      ],
    },
    length
  )

const decodeTradeMatch = (input: BinaryReader | Uint8Array, length?: number) =>
  decodeBySchema(
    input,
    {
      create: () => ({
        tradeId: '',
        orderAId: '0',
        orderBId: '0',
        matchAmount: '',
        yesExecutionPrice: '',
        noExecutionPrice: '',
      }),
      fields: [
        { fieldNo: 1, name: 'tradeId', kind: 'string' },
        { fieldNo: 2, name: 'orderAId', kind: 'uint64' },
        { fieldNo: 3, name: 'orderBId', kind: 'uint64' },
        { fieldNo: 4, name: 'matchAmount', kind: 'string' },
        { fieldNo: 6, name: 'yesExecutionPrice', kind: 'string' },
        { fieldNo: 7, name: 'noExecutionPrice', kind: 'string' },
      ],
    },
    length
  )

const decodePredictionMsgUpdateParams = (
  input: BinaryReader | Uint8Array,
  length?: number
) =>
  decodeBySchema(
    input,
    {
      create: () => ({
        authority: '',
        params: undefined as unknown,
      }),
      fields: [
        { fieldNo: 1, name: 'authority', kind: 'string' },
        {
          fieldNo: 2,
          name: 'params',
          kind: 'message',
          decode: decodePredictionParamsInput,
        },
      ],
    },
    length
  )

const decodeMsgCreateMarket = (
  input: BinaryReader | Uint8Array,
  length?: number
) =>
  decodeBySchema(
    input,
    {
      create: () => ({
        creator: '',
        resolver: '',
        title: '',
        description: '',
        rule: '',
        resolutionSource: '',
        outcomeType: '',
        outcomes: [] as unknown[],
        collateralType: PREDICTION_COLLATERAL_TYPE[0],
        collateralDenom: '',
        collateralContractAddr: '',
        openTime: '0',
        closeTime: '0',
        resolveTime: '0',
        feeBps: '0',
      }),
      fields: [
        { fieldNo: 1, name: 'creator', kind: 'string' },
        { fieldNo: 2, name: 'resolver', kind: 'string' },
        { fieldNo: 3, name: 'title', kind: 'string' },
        { fieldNo: 4, name: 'description', kind: 'string' },
        { fieldNo: 5, name: 'rule', kind: 'string' },
        { fieldNo: 6, name: 'resolutionSource', kind: 'string' },
        { fieldNo: 7, name: 'outcomeType', kind: 'string' },
        { fieldNo: 8, name: 'outcomes', kind: 'string', repeated: true },
        {
          fieldNo: 9,
          name: 'collateralType',
          kind: 'enum',
          enumValues: PREDICTION_COLLATERAL_TYPE,
        },
        { fieldNo: 10, name: 'collateralDenom', kind: 'string' },
        { fieldNo: 11, name: 'collateralContractAddr', kind: 'string' },
        { fieldNo: 12, name: 'openTime', kind: 'int64' },
        { fieldNo: 13, name: 'closeTime', kind: 'int64' },
        { fieldNo: 14, name: 'resolveTime', kind: 'int64' },
        { fieldNo: 16, name: 'feeBps', kind: 'uint64' },
      ],
    },
    length
  )

const decodeMsgPlaceOrder = (
  input: BinaryReader | Uint8Array,
  length?: number
) =>
  decodeBySchema(
    input,
    {
      create: () => ({
        trader: '',
        marketId: '0',
        side: PREDICTION_ORDER_SIDE[0],
        orderType: PREDICTION_ORDER_TYPE[0],
        amount: '',
        limitPrice: '',
        worstPrice: '',
        expireBh: '0',
      }),
      fields: [
        { fieldNo: 1, name: 'trader', kind: 'string' },
        { fieldNo: 2, name: 'marketId', kind: 'uint64' },
        {
          fieldNo: 3,
          name: 'side',
          kind: 'enum',
          enumValues: PREDICTION_ORDER_SIDE,
        },
        {
          fieldNo: 4,
          name: 'orderType',
          kind: 'enum',
          enumValues: PREDICTION_ORDER_TYPE,
        },
        { fieldNo: 5, name: 'amount', kind: 'string' },
        { fieldNo: 6, name: 'limitPrice', kind: 'string' },
        { fieldNo: 7, name: 'worstPrice', kind: 'string' },
        { fieldNo: 8, name: 'expireBh', kind: 'int64' },
      ],
    },
    length
  )

const decodeMsgCancelOrder = (
  input: BinaryReader | Uint8Array,
  length?: number
) =>
  decodeBySchema(
    input,
    {
      create: () => ({
        trader: '',
        marketId: '0',
        orderId: '0',
      }),
      fields: [
        { fieldNo: 1, name: 'trader', kind: 'string' },
        { fieldNo: 2, name: 'marketId', kind: 'uint64' },
        { fieldNo: 3, name: 'orderId', kind: 'uint64' },
      ],
    },
    length
  )

const decodeMsgSplitPosition = (
  input: BinaryReader | Uint8Array,
  length?: number
) =>
  decodeBySchema(
    input,
    {
      create: () => ({
        trader: '',
        marketId: '0',
        amount: '',
      }),
      fields: [
        { fieldNo: 1, name: 'trader', kind: 'string' },
        { fieldNo: 2, name: 'marketId', kind: 'uint64' },
        { fieldNo: 3, name: 'amount', kind: 'string' },
      ],
    },
    length
  )

const decodeMsgMergePosition = (
  input: BinaryReader | Uint8Array,
  length?: number
) =>
  decodeBySchema(
    input,
    {
      create: () => ({
        trader: '',
        marketId: '0',
        amount: '',
      }),
      fields: [
        { fieldNo: 1, name: 'trader', kind: 'string' },
        { fieldNo: 2, name: 'marketId', kind: 'uint64' },
        { fieldNo: 3, name: 'amount', kind: 'string' },
      ],
    },
    length
  )

const decodeMsgApplyTradeBatch = (
  input: BinaryReader | Uint8Array,
  length?: number
) =>
  decodeBySchema(
    input,
    {
      create: () => ({
        sender: '',
        marketId: '0',
        batchId: '',
        trades: [] as unknown[],
      }),
      fields: [
        { fieldNo: 1, name: 'sender', kind: 'string' },
        { fieldNo: 2, name: 'marketId', kind: 'uint64' },
        { fieldNo: 3, name: 'batchId', kind: 'string' },
        {
          fieldNo: 4,
          name: 'trades',
          kind: 'message',
          repeated: true,
          decode: decodeTradeMatch,
        },
      ],
    },
    length
  )

const decodeMsgResolveMarket = (
  input: BinaryReader | Uint8Array,
  length?: number
) =>
  decodeBySchema(
    input,
    {
      create: () => ({
        resolver: '',
        marketId: '0',
        winningOutcome: PREDICTION_OUTCOME[0],
        resolutionSource: '',
      }),
      fields: [
        { fieldNo: 1, name: 'resolver', kind: 'string' },
        { fieldNo: 2, name: 'marketId', kind: 'uint64' },
        {
          fieldNo: 3,
          name: 'winningOutcome',
          kind: 'enum',
          enumValues: PREDICTION_OUTCOME,
        },
        { fieldNo: 4, name: 'resolutionSource', kind: 'string' },
      ],
    },
    length
  )

const decodeMsgRequestResolve = (
  input: BinaryReader | Uint8Array,
  length?: number
) =>
  decodeBySchema(
    input,
    {
      create: () => ({
        creator: '',
        marketId: '0',
        requestedOutcome: PREDICTION_OUTCOME[0],
        requestedSource: '',
      }),
      fields: [
        { fieldNo: 1, name: 'creator', kind: 'string' },
        { fieldNo: 2, name: 'marketId', kind: 'uint64' },
        {
          fieldNo: 3,
          name: 'requestedOutcome',
          kind: 'enum',
          enumValues: PREDICTION_OUTCOME,
        },
        { fieldNo: 4, name: 'requestedSource', kind: 'string' },
      ],
    },
    length
  )

const decodeMsgVoidMarket = (
  input: BinaryReader | Uint8Array,
  length?: number
) =>
  decodeBySchema(
    input,
    {
      create: () => ({
        resolver: '',
        marketId: '0',
        reason: '',
      }),
      fields: [
        { fieldNo: 1, name: 'resolver', kind: 'string' },
        { fieldNo: 2, name: 'marketId', kind: 'uint64' },
        { fieldNo: 3, name: 'reason', kind: 'string' },
      ],
    },
    length
  )

const decodeMsgClaimPayout = (
  input: BinaryReader | Uint8Array,
  length?: number
) =>
  decodeBySchema(
    input,
    {
      create: () => ({
        creator: '',
        marketId: '0',
      }),
      fields: [
        { fieldNo: 1, name: 'creator', kind: 'string' },
        { fieldNo: 2, name: 'marketId', kind: 'uint64' },
      ],
    },
    length
  )

const decodeMsgClaimVoidRefund = (
  input: BinaryReader | Uint8Array,
  length?: number
) =>
  decodeBySchema(
    input,
    {
      create: () => ({
        creator: '',
        marketId: '0',
      }),
      fields: [
        { fieldNo: 1, name: 'creator', kind: 'string' },
        { fieldNo: 2, name: 'marketId', kind: 'uint64' },
      ],
    },
    length
  )

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
    case TYPE.MsgPaxiBurnToken:
      data = decodePaxiMsgBurnToken(value)
      break
    case TYPE.MsgPaxiUpdateParams:
      data = decodePaxiMsgUpdateParams(value)
      break
    case TYPE.MsgSwapUpdateParams:
      data = decodeSwapMsgUpdateParams(value)
      break
    case TYPE.MsgProvideLiquidity:
      data = decodeMsgProvideLiquidity(value)
      break
    case TYPE.MsgWithdrawLiquidity:
      data = decodeMsgWithdrawLiquidity(value)
      break
    case TYPE.MsgSwap:
      data = decodeMsgSwap(value)
      break
    case TYPE.MsgCustommintUpdateParams:
      data = decodeCustommintMsgUpdateParams(value)
      break
    case TYPE.MsgMintUUSDT:
      data = decodeMsgMintUUSDT(value)
      break
    case TYPE.MsgBurnUUSDT:
      data = decodeMsgBurnUUSDT(value)
      break
    case TYPE.MsgCustomwasmUpdateParams:
      data = decodeCustomwasmMsgUpdateParams(value)
      break
    case TYPE.MsgPredictionUpdateParams:
      data = decodePredictionMsgUpdateParams(value)
      break
    case TYPE.MsgCreateMarket:
      data = decodeMsgCreateMarket(value)
      break
    case TYPE.MsgPlaceOrder:
      data = decodeMsgPlaceOrder(value)
      break
    case TYPE.MsgCancelOrder:
      data = decodeMsgCancelOrder(value)
      break
    case TYPE.MsgSplitPosition:
      data = decodeMsgSplitPosition(value)
      break
    case TYPE.MsgMergePosition:
      data = decodeMsgMergePosition(value)
      break
    case TYPE.MsgApplyTradeBatch:
      data = decodeMsgApplyTradeBatch(value)
      break
    case TYPE.MsgResolveMarket:
      data = decodeMsgResolveMarket(value)
      break
    case TYPE.MsgRequestResolve:
      data = decodeMsgRequestResolve(value)
      break
    case TYPE.MsgVoidMarket:
      data = decodeMsgVoidMarket(value)
      break
    case TYPE.MsgClaimPayout:
      data = decodeMsgClaimPayout(value)
      break
    case TYPE.MsgClaimVoidRefund:
      data = decodeMsgClaimVoidRefund(value)
      break
    default:
      break
  }

  return {
    typeUrl,
    data,
  }
}
