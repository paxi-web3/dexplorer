import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { address } = req.query

  if (!address) {
    res.status(400).json({ error: 'Address parameter is required' })
    return
  }

  try {
    const response = await fetch(
      `https://mainnet-api.paxinet.io/prc20/get_contract?address=${encodeURIComponent(
        address as string
      )}`
    )
    const data = await response.json()
    res.status(200).json(data)
  } catch (error) {
    console.error('Failed to fetch PRC-20 contract:', error)
    res.status(500).json({ error: 'Failed to fetch contract' })
  }
}
