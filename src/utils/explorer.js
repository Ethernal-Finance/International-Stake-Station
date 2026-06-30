import { EXPLORER_URL } from '../constants/network';

export function getAddressUrl(address) {
  return `${EXPLORER_URL}/address/${address}`;
}

export function getTxUrl(txHash) {
  return `${EXPLORER_URL}/tx/${txHash}`;
}
