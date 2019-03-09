import {
  ethPlorer,
  ETHTokenExplorer,
  gasPriceDefaults,
  InsecureWalletName,
  SecureWalletName
} from 'config/data';
import {
  ETH_DEFAULT,
  ETH_LEDGER,
  ETH_TESTNET
} from 'config/dpaths';
import { ConfigAction } from 'actions/config';
import { makeExplorer } from 'utils/helpers';
import { StaticNetworksState as State } from './types';

const testnetDefaultGasPrice = {
  min: 0.1,
  max: 40,
  initial: 4
};

export const INITIAL_STATE: State = {
  FTM: {
    name: 'FTM',
    unit: 'FTM',
    chainId: 1313,
    isCustom: false,
    color: '#6d2eae',
    blockExplorer: makeExplorer({
      name: 'Fantom Explorer',
      origin: 'https://blockscout.fantom.network',
      addressPath: 'address',
      blockPath: 'block'
    }),
    tokens: require('config/tokens/eth.json'),
    contracts: require('config/contracts/eth.json'),
    dPathFormats: {
      [SecureWalletName.LEDGER_NANO_S]: ETH_LEDGER,
      [InsecureWalletName.MNEMONIC_PHRASE]: ETH_DEFAULT
    },
    gasPriceSettings: gasPriceDefaults,
    shouldEstimateGasPrice: true
  },
};

export const staticNetworks = (state: State = INITIAL_STATE, action: ConfigAction) => {
  switch (action.type) {
    default:
      return state;
  }
};
