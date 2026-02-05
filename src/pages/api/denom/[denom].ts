import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { denom } = req.query

  if (!denom) {
    res.status(400).json({ error: 'Denom parameter is required' })
    return
  }

  try {
    const response = await fetch(
      `https://lcd.paxinet.io/cosmos/bank/v1beta1/denoms_metadata/${encodeURIComponent(
        denom as string
      )}`
    )
    const data = await response.json()
    res.status(200).json(data)
  } catch (error) {
    console.error('Failed to fetch denom metadata:', error)
    res.status(500).json({ error: 'Failed to fetch denom metadata' })
  }
}
