import { JSONObject } from '@lumino/coreutils';
import { ISignal, Signal } from '@lumino/signaling';

import * as Blockly from 'blockly';

import BlocklyPy from 'blockly/python';
import * as En from 'blockly/msg/en';

import { IBlocklyManager } from './token';
import { TOOLBOX } from './utils';

export class BlocklyManager implements IBlocklyManager {
  private _toolbox: JSONObject;
  private _activeGenerator: Blockly.Generator;
  private _generators: Map<string, Blockly.Generator>;
  private _language: string;
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
    this._language = 'En'; // By default we choose English.
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

  set language(language: string) {
    this._language = language;
  }

  get language(): string {
    return this._language;
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

  setlanguage(language: string): void {
    this.language = language;
    Private.importLanguageModule(language);
  }
}

namespace Private {
  export async function importLanguageModule(language: string) {
    let module: Promise<any>;
    switch (language) {
      case 'En':
        module = import('blockly/msg/en');
        break;
      case 'Es':
        module = import('blockly/msg/es');
        break;
      case 'Fr':
        module = import('blockly/msg/fr');
        break;
      case 'Sa' || 'Ar':
        module = import('blockly/msg/ar');
        break;
      case 'Cz':
        module = import('blockly/msg/cs');
        break;
      case 'Dk':
        module = import('blockly/msg/da');
        break;
      case 'De':
        module = import('blockly/msg/de');
        break;
      case 'Gr':
        module = import('blockly/msg/el');
        break;
      case 'Ee':
        module = import('blockly/msg/et');
        break;
      case 'Fi':
        module = import('blockly/msg/fi');
        break;
      case 'Il':
        module = import('blockly/msg/he');
        break;
      case 'Hu':
        module = import('blockly/msg/hu');
        break;
      case 'Am':
        module = import('blockly/msg/hy');
        break;
      case 'Id':
        module = import('blockly/msg/id');
        break;
      case 'It':
        module = import('blockly/msg/it');
        break;
      case 'Jp':
        module = import('blockly/msg/ja');
        break;
      case 'Kr':
        module = import('blockly/msg/ko');
        break;
      case 'Lt':
        module = import('blockly/msg/lt');
        break;
      case 'Nl':
        module = import('blockly/msg/nl');
        break;
      case 'Pl':
        module = import('blockly/msg/pl');
        break;
      case 'Br':
        module = import('blockly/msg/pt');
        break;
      case 'Ro':
        module = import('blockly/msg/ro');
        break;
      case 'Ru':
        module = import('blockly/msg/ru');
        break;
      case 'Lk':
        module = import('blockly/msg/si');
        break;
      case 'Tr':
        module = import('blockly/msg/tr');
        break;
      case 'Ua':
        module = import('blockly/msg/uk');
        break;
      case 'Vn':
        module = import('blockly/msg/vi');
        break;
      case 'Tw':
        module = import('blockly/msg/zh-hant');
        break;
      case 'Cn':
        module = import('blockly/msg/zh-hans');
        break;
      // Complete with all the cases taken from: (last updates June 2022)
      // List of languages in blockly: https://github.com/google/blockly/tree/master/msg/js
      // List of languages in Lab: https://github.com/jupyterlab/language-packs/tree/master/language-packs
      default:
        console.warn('Language not found. Loading english');
        module = Promise.resolve(En);
        break;
    }

    module.then(lang => {
      // @ts-ignore
      Blockly.setLocale(lang);
    });
  }
}
