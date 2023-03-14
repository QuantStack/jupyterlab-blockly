import { Token } from '@lumino/coreutils';

import * as Blockly from 'blockly';
import type { BlockDefinition } from 'blockly/core/blocks';
import type { ToolboxDefinition } from 'blockly/core/utils/toolbox';

/**
 * The registry token.
 */
export const IBlocklyRegistry = new Token<IBlocklyRegistry>(
  'jupyterlab-blockly/registry'
);

/**
 * BlocklyRegistry is the class that JupyterLab-Blockly exposes
 * to other plugins. This registry allows other plugins to register
 * new Toolboxes, Blocks and Generators that users can use in the
 * Blockly editor.
 */
export interface IBlocklyRegistry {
  /**
   * Register a toolbox for the editor.
   *
   * @argument name Name of the toolbox.
   *
   * @argument value Toolbox to register.
   */
  registerToolbox(name: string, value: ToolboxDefinition): void;

  /**
   * Register new blocks.
   *
   * @argument name Name of the toolbox.
   *
   * @argument value Toolbox to register.
   */
  registerBlocks(blocks: BlockDefinition[]): void;

  /**
   * Register new generators.
   *
   * @argument name Name of the toolbox.
   *
   * @argument value Toolbox to register.
   *
   * #### Notes
   * When registering a generator, the name should correspond to the language
   * used by a kernel.
   *
   * If you register a generator for an existing language this will be overwritten.
   */
  registerGenerator(name: string, generator: Blockly.Generator): void;
}
