import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { page = 0 } = req.query

  try {
    const response = await fetch(
      `https://mainnet-api.paxinet.io/prc20/all_contracts?page=${page}`
    )
    const data = await response.json()
    res.status(200).json(data)
  } catch (error) {
    console.error('Failed to fetch PRC-20 contracts:', error)
    res.status(500).json({ error: 'Failed to fetch contracts' })
  }
}
