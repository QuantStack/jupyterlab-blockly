import { Token } from '@lumino/coreutils';
import { JSONObject } from '@lumino/coreutils';

import * as Blockly from 'blockly';

/**
 * The manager token.
 */
export const IBlocklyManager = new Token<IBlocklyManager>(
  'jupyterlab-blockly/manager'
);

export interface IBlocklyManager {
  registerToolbox(value: JSONObject): void;
  registerBlocks(blocks: JSONObject[]): void;
  registerGenerator(kernel: string, generator: Blockly.Generator): void;
}
