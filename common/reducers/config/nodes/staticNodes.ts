import { TypeKeys, NodeAction } from 'actions/config';
import { shepherdProvider } from 'libs/nodes';
import { StaticNodesState } from './types';

export const INITIAL_STATE: StaticNodesState = {

  ftm: {
    network: 'FTM',
    isCustom: false,
    lib: shepherdProvider,
    service: 'MyCrypto',
    estimateGas: true
  }
};

const staticNodes = (state: StaticNodesState = INITIAL_STATE, action: NodeAction) => {
  switch (action.type) {
    case TypeKeys.CONFIG_NODE_WEB3_SET:
      return { ...state, [action.payload.id]: action.payload.config };
    case TypeKeys.CONFIG_NODE_WEB3_UNSET:
      const stateCopy = { ...state };
      Reflect.deleteProperty(stateCopy, 'web3');
      return stateCopy;
    default:
      return state;
  }
};

export { StaticNodesState, staticNodes };
