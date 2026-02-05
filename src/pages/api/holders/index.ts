import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { page = 0 } = req.query

  try {
    const response = await fetch(
      `https://mainnet-api.paxinet.io/account/holders?page=${page}`
    )
    const data = await response.json()
    res.status(200).json(data)
  } catch (error) {
    console.error('Failed to fetch holders:', error)
    res.status(500).json({ error: 'Failed to fetch holders' })
  }
}
