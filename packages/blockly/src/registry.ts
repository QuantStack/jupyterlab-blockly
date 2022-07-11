import { JSONObject } from '@lumino/coreutils';

import * as Blockly from 'blockly';

import BlocklyPy from 'blockly/python';
import BlocklyJS from 'blockly/javascript';
import BlocklyLua from 'blockly/lua';

import En from 'blockly/msg/en';

import { IBlocklyRegisty } from './token';
import { TOOLBOX } from './utils';

/**
 * BlocklyRegistry is the class that JupyterLab-Blockly exposes
 * to other plugins. This registry allows other plugins to register
 * new Toolboxes, Blocks and Generators that users can use in the
 * Blockly editor.
 */
export class BlocklyRegistry implements IBlocklyRegisty {
  private _toolboxes: Map<string, JSONObject>;
  private _generators: Map<string, Blockly.Generator>;

  /**
   * Constructor of BlocklyRegistry.
   */
  constructor() {
    this._toolboxes = new Map<string, JSONObject>();
    this._toolboxes.set('default', TOOLBOX);

    this._generators = new Map<string, Blockly.Generator>();
    this._generators.set('python', BlocklyPy);
    this._generators.set('javascript', BlocklyJS);
    this._generators.set('lua', BlocklyLua);
  }

  /**
   * Returns a map with all the toolboxes.
   */
  get toolboxes(): Map<string, JSONObject> {
    return this._toolboxes;
  }

  /**
   * Returns a map with all the generators.
   */
  get generators(): Map<string, Blockly.Generator> {
    return this._generators;
  }

  /**
   * Register a toolbox for the editor.
   *
   * @argument name Name of the toolbox.
   *
   * @argument value Toolbox to register.
   */
  registerToolbox(name: string, value: JSONObject): void {
    this._toolboxes.set(name, value);
  }

  /**
   * Register new blocks.
   *
   * @argument name Name of the toolbox.
   *
   * @argument value Toolbox to register.
   */
  registerBlocks(blocks: JSONObject[]): void {
    Blockly.defineBlocksWithJsonArray(blocks);
  }

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
  registerGenerator(name: string, generator: Blockly.Generator): void {
    this._generators.set(name, generator);
  }

  setlanguage(language: string): void {
    Private.importLanguageModule(language);
  }
}

namespace Private {
  // Dynamically importing the language modules needed for each respective
  // user, in order to change the Blockly language in accordance to the
  // JL one.
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
      default:
        // Complete with all the cases taken from: (last updates June 2022)
        // List of languages in blockly: https://github.com/google/blockly/tree/master/msg/js
        // List of languages in Lab: https://github.com/jupyterlab/language-packs/tree/master/language-packs
        console.warn('Language not found. Loading english');
        module = Promise.resolve(En);
        break;
    }

    // Setting the current language in Blockly.
    module.then(lang => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      Blockly.setLocale(lang);
    });
  }
}
