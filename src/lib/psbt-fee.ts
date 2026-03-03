/**
 * Server-only: injects a platform fee output into a Magisat buying PSBT
 * before the buyer signs it.
 *
 * Strategy:
 *  1. Parse the PSBT from Magisat (it has seller signatures already)
 *  2. Find the buyer's change output (any output going to buyerAddress)
 *  3. Reduce change by feeSats
 *  4. Add new output → PLATFORM_FEE_ADDRESS for feeSats
 *  5. Return modified PSBT as base64
 *
 * If no change output is found (edge case), the fee is still added and
 * reduces the miner fee proportionally (fine when miner fee >> $3).
 *
 * NOTE: bitcoinjs-lib v7 uses BigInt for output values.
 */
import * as bitcoin from "bitcoinjs-lib";

const NETWORK = bitcoin.networks.bitcoin;
export const PLATFORM_FEE_ADDRESS = "bc1qcvr75grjxtty40pzvj5p0fxsy0zgg9p2zatyr2";
const DUST_LIMIT = BigInt(546);

// bitcoinjs-lib v7 uses bigint values on outputs
type RawOut = { script: Uint8Array; value: bigint };

function getRawOuts(psbt: bitcoin.Psbt): RawOut[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cache = (psbt as any).__CACHE as { __TX: bitcoin.Transaction };
  return cache.__TX.outs as unknown as RawOut[];
}

function addrToScript(address: string): Uint8Array | null {
  try {
    return bitcoin.address.toOutputScript(address, NETWORK);
  } catch {
    return null;
  }
}

function uint8Equals(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

export function injectPlatformFee(
  psbtBase64: string,
  buyerPaymentAddress: string,
  feeSats: number
): string {
  const psbt = bitcoin.Psbt.fromBase64(psbtBase64);
  const outs = getRawOuts(psbt);
  const feeBig = BigInt(feeSats);

  // Find the buyer's change output to reduce
  const buyerScript = addrToScript(buyerPaymentAddress);
  let changeIdx = -1;

  if (buyerScript) {
    for (let i = 0; i < outs.length; i++) {
      if (
        uint8Equals(outs[i].script, buyerScript) &&
        outs[i].value >= feeBig + DUST_LIMIT
      ) {
        changeIdx = i;
        break;
      }
    }
  }

  if (changeIdx !== -1) {
    // Reduce buyer's change output by fee amount
    outs[changeIdx].value -= feeBig;
  }
  // If no suitable change output found: the fee reduces the implicit
  // miner fee (acceptable when network fee headroom > $3 worth of sats)

  // Add platform fee output
  // addOutput accepts number value in older typings, cast via unknown
  (psbt.addOutput as unknown as (o: { address: string; value: bigint }) => void)({
    address: PLATFORM_FEE_ADDRESS,
    value: feeBig,
  });

  return psbt.toBase64();
}

/**
 * Broadcast a fully-signed PSBT directly to the Bitcoin network
 * via mempool.space. Used when we've modified the PSBT and want to
 * bypass Magisat's broadcast endpoint.
 */
export async function broadcastRawTx(signedPsbtBase64: string): Promise<string> {
  const psbt = bitcoin.Psbt.fromBase64(signedPsbtBase64);

  try {
    psbt.finalizeAllInputs();
  } catch {
    // Some inputs may already be finalized — continue
  }

  const rawHex = psbt.extractTransaction().toHex();

  const res = await fetch("https://mempool.space/api/tx", {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: rawHex,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Broadcast failed: ${err}`);
  }

  return res.text(); // Returns the txid
}
