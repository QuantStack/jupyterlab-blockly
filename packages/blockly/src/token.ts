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
   * @argument name The name of the toolbox.
   *
   * @argument toolbox The toolbox to register.
   */
  registerToolbox(name: string, toobox: ToolboxDefinition): void;

  /**
   * Register block definitions.
   *
   * @argument blocks A list of block definitions to register.
   */
  registerBlocks(blocks: BlockDefinition[]): void;

  /**
   * Register a language generator.
   *
   * @argument language The language output by the generator.
   *
   * @argument generator The generator to register.
   *
   * #### Notes
   * If a generator already exists for the given language it is overwritten.
   */
  registerGenerator(language: string, generator: Blockly.Generator): void;
}
