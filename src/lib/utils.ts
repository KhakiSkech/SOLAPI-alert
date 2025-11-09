/**
 * Utility functions for webhook handling
 */

import type { NextApiRequest } from 'next';

/**
 * Get raw body from Next.js API request
 * Required for webhook signature verification
 */
export async function getRawBody(req: NextApiRequest): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';

    req.on('data', (chunk) => {
      data += chunk.toString();
    });

    req.on('end', () => {
      resolve(data);
    });

    req.on('error', (error) => {
      reject(error);
    });
  });
}
