import { INode } from 'libs/nodes';
import { StaticNetworkIds } from './network';
import { StaticNodesState, CustomNodesState } from 'reducers/config/nodes';

interface CustomNodeConfig {
  id: string;
  isCustom: true;
  name: string;
  lib: INode;
  service: 'your custom node';
  url: string;
  network: string;
  auth?: {
    username: string;
    password: string;
  };
}

interface StaticNodeConfig {
  isCustom: false;
  network: StaticNetworkIds;
  lib: INode;
  service: string;
  estimateGas?: boolean;
  hidden?: boolean;
}

declare enum StaticNodeId {
  FTM_AUTO = 'ftm',
  FTM = 'ftm'
}

type StaticNodeConfigs = { [key in StaticNodeId]: StaticNodeConfig } & { web3?: StaticNodeConfig };

type NodeConfig = StaticNodesState[StaticNodeId] | CustomNodesState[string];
