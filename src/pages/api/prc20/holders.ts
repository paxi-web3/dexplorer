import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { contract_address, page = '0' } = req.query

  if (!contract_address) {
    res.status(400).json({ error: 'Contract address is required' })
    return
  }

  try {
    const response = await fetch(
      `https://mainnet-api.paxinet.io/prc20/holders?contract_address=${encodeURIComponent(
        contract_address as string
      )}&page=${page}`
    )
    const data = await response.json()
    res.status(200).json(data)
  } catch (error) {
    console.error('Failed to fetch holders:', error)
    res.status(500).json({ error: 'Failed to fetch holders' })
  }
}
