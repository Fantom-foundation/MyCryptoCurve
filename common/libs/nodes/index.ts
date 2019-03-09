import { shepherd, redux } from 'mycrypto-shepherd';
import { INode } from '.';
import { tokenBalanceHandler } from './tokenBalanceProxy';
import { IProviderConfig } from 'mycrypto-shepherd/dist/lib/ducks/providerConfigs';

type DeepPartial<T> = Partial<{ [key in keyof T]: Partial<T[key]> }>;
const { selectors, store } = redux;
const { providerBalancerSelectors: { balancerConfigSelectors } } = selectors;

export const makeProviderConfig = (options: DeepPartial<IProviderConfig> = {}): IProviderConfig => {
  const defaultConfig: IProviderConfig = {
    concurrency: 2,
    network: 'FTM',
    requestFailureThreshold: 3,
    supportedMethods: {
      getNetVersion: true,
      ping: true,
      sendCallRequest: true,
      sendCallRequests: true,
      getBalance: true,
      estimateGas: true,
      getTransactionCount: true,
      getCurrentBlock: true,
      sendRawTx: true,

      getTransactionByHash: true,
      getTransactionReceipt: true,

      /*web3 methods*/
      signMessage: true,
      sendTransaction: true
    },
    timeoutThresholdMs: 5000
  };

  return {
    ...defaultConfig,
    ...options,
    supportedMethods: {
      ...defaultConfig.supportedMethods,
      ...(options.supportedMethods ? options.supportedMethods : {})
    }
  };
};

let shepherdProvider: INode;
shepherd
  .init()
  .then(
    provider => (shepherdProvider = (new Proxy(provider, tokenBalanceHandler) as any) as INode)
  );

export const getShepherdManualMode = () => balancerConfigSelectors.getManualMode(store.getState());

export const getShepherdOffline = () => balancerConfigSelectors.isOffline(store.getState());

export const getShepherdNetwork = () => balancerConfigSelectors.getNetwork(store.getState());

export const getShepherdPending = () =>
  balancerConfigSelectors.isSwitchingNetworks(store.getState());

export const makeWeb3Network = (network: string) => `WEB3_${network}`;
export const stripWeb3Network = (network: string) => network.replace('WEB3_', '');
export const isAutoNode = (nodeName: string) => nodeName.endsWith('_auto') || nodeName === 'web3';

const regFtmConf = makeProviderConfig({ network: 'FTM' });
shepherd.useProvider('rpc', 'ftm', regFtmConf, 'http://3.16.83.59:8545/');

/**
 * Pseudo-networks to support metamask / web3 interaction
 */
const web3EthConf = makeProviderConfig({
  network: makeWeb3Network('FTM'),
  supportedMethods: {
    sendRawTx: false,
    sendTransaction: false,
    signMessage: false,
    getNetVersion: false
  }
});

export { shepherdProvider, shepherd };
export * from './INode';
