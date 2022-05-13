import { JSONObject } from '@lumino/coreutils';
import { ISignal, Signal } from '@lumino/signaling';

import * as Blockly from 'blockly/core';

import BlocklyPy from 'blockly/python';
import * as En from 'blockly/msg/en';
// import * as Fr from 'blockly/msg/fr';

import { IBlocklyManager } from './token';
import { TOOLBOX } from './utils';

export class BlocklyManager implements IBlocklyManager {
  private _toolbox: JSONObject;
  private _activeGenerator: Blockly.Generator;
  private _generators: Map<string, Blockly.Generator>;
  private _language: String;
  private _changed: Signal<BlocklyManager, void>;

  /**
   * Constructor of BlocklyEditorFactory.
   *
   * @param options Constructor options
   */
  constructor() {
    this._toolbox = TOOLBOX;
    this._activeGenerator = BlocklyPy;
    this._generators = new Map<string, Blockly.Generator>();
    this._language = En; // just for now
    
    this._changed = new Signal<BlocklyManager, void>(this);
  }

  get toolbox(): JSONObject {
    return this._toolbox;
  }

  set activeGenerator(name: string) {
    this._activeGenerator = this._generators.get(name);
  }

  get generator(): Blockly.Generator {
    return this._activeGenerator;
  }

  get changed(): ISignal<BlocklyManager, void> {
    return this._changed;
  }

  registerToolbox(value: JSONObject): void {
    this._toolbox = value;
  }

  registerBlocks(blocks: JSONObject[]): void {
    Blockly.defineBlocksWithJsonArray(blocks);
  }

  registerGenerator(kernel: string, generator: Blockly.Generator): void {
    this._generators.set(kernel, generator);
  }

  language(language: string): void {
    if (language == 'En') {
      // @ts-ignore
      Blockly.setLocale(En);
    }
    this._changed.emit(void 0);
  }
}
