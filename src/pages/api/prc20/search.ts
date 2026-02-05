import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { name } = req.query

  if (!name) {
    res.status(400).json({ error: 'Name parameter is required' })
    return
  }

  try {
    const response = await fetch(
      `https://mainnet-api.paxinet.io/prc20/get_contracts_by_name?name=${encodeURIComponent(
        name as string
      )}`
    )
    const data = await response.json()
    res.status(200).json(data)
  } catch (error) {
    console.error('Failed to search PRC-20 contracts:', error)
    res.status(500).json({ error: 'Failed to search contracts' })
  }
}
