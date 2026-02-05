import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const response = await fetch(
      'https://mainnet-api.paxinet.io/validator/paxi_status'
    )
    const data = await response.json()
    res.status(200).json(data)
  } catch (error) {
    console.error('Failed to fetch status:', error)
    res.status(500).json({ error: 'Failed to fetch status' })
  }
}
