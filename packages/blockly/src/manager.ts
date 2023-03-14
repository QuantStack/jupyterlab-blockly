import { ISessionContext } from '@jupyterlab/apputils';
import { IEditorMimeTypeService } from '@jupyterlab/codeeditor';
import { KernelSpec, KernelConnection } from '@jupyterlab/services';
import { IChangedArgs } from '@jupyterlab/coreutils';

import { ISignal, Signal } from '@lumino/signaling';

import * as Blockly from 'blockly';

import { BlocklyRegistry } from './registry';
import { ToolboxDefinition } from 'blockly/core/utils/toolbox';

/**
 * BlocklyManager the manager for each document
 * to select the toolbox and the generator that the
 * user wants to use on a specific document.
 */
export class BlocklyManager {
  private _toolbox: string;
  private _generator: Blockly.Generator;
  private _registry: BlocklyRegistry;
  private _selectedKernel: KernelSpec.ISpecModel;
  private _sessionContext: ISessionContext;
  private _mimetypeService: IEditorMimeTypeService;
  private _changed: Signal<this, BlocklyManager.Change>;

  /**
   * Constructor of BlocklyManager.
   */
  constructor(
    registry: BlocklyRegistry,
    sessionContext: ISessionContext,
    mimetypeService: IEditorMimeTypeService
  ) {
    this._registry = registry;
    this._sessionContext = sessionContext;
    this._mimetypeService = mimetypeService;

    this._toolbox = 'default';
    this._generator = this._registry.generators.get('python');

    this._changed = new Signal<this, BlocklyManager.Change>(this);
    this._sessionContext.kernelChanged.connect(this._onKernelChanged, this);
  }

  /**
   * Returns the selected toolbox.
   */
  get toolbox(): ToolboxDefinition {
    return this._registry.toolboxes.get(this._toolbox);
  }

  /**
   * Returns the mimeType for the selected kernel.
   *
   * Note: We need the mimeType for the syntax highlighting
   * when rendering the code.
   */
  get mimeType(): string {
    if (this._selectedKernel) {
      return this._mimetypeService.getMimeTypeByLanguage({
        name: this._selectedKernel.language
      });
    } else {
      return 'text/plain';
    }
  }

  /**
   * Returns the name of the selected kernel.
   */
  get kernel(): string | undefined {
    return this._selectedKernel?.name || 'No kernel';
  }

  /**
   * Returns the selected generator.
   */
  get generator(): Blockly.Generator {
    return this._generator;
  }

  /**
   * Signal triggered when the manager changes.
   */
  get changed(): ISignal<this, BlocklyManager.Change> {
    return this._changed;
  }

  /**
   * Dispose.
   */
  dispose(): void {
    this._sessionContext.kernelChanged.disconnect(this._onKernelChanged, this);
  }

  /**
   * Get the selected toolbox's name.
   *
   * @returns The name of the toolbox.
   */
  getToolbox() {
    return this._toolbox;
  }

  /**
   * Set the selected toolbox.
   *
   * @argument name The name of the toolbox.
   */
  setToolbox(name: string) {
    if (this._toolbox !== name) {
      const toolbox = this._registry.toolboxes.get(name);
      this._toolbox = toolbox ? name : 'default';
      this._changed.emit('toolbox');
    }
  }

  /**
   * List the available toolboxes.
   *
   * @returns the list of available toolboxes for Blockly
   */
  listToolboxes(): { label: string; value: string }[] {
    const list: { label: string; value: string }[] = [];
    this._registry.toolboxes.forEach((toolbox, name) => {
      list.push({ label: name, value: name });
    });
    return list;
  }

  /**
   * Set the selected kernel.
   *
   * @argument name The name of the kernel.
   */
  selectKernel(name: string) {
    this._sessionContext.changeKernel({ name });
  }

  /**
   * List the available kernels.
   *
   * @returns the list of available kernels for Blockly
   */
  listKernels(): { label: string; value: string }[] {
    const specs = this._sessionContext.specsManager.specs.kernelspecs;
    const list: { label: string; value: string }[] = [];
    Object.keys(specs).forEach(key => {
      const language = specs[key].language;
      if (this._registry.generators.has(language)) {
        list.push({ label: specs[key].display_name, value: specs[key].name });
      }
    });
    return list;
  }

  private _onKernelChanged(
    sender: ISessionContext,
    args: IChangedArgs<KernelConnection, KernelConnection, 'kernel'>
  ): void {
    const specs = this._sessionContext.specsManager.specs.kernelspecs;
    if (args.newValue && specs[args.newValue.name] !== undefined) {
      this._selectedKernel = specs[args.newValue.name];
      const language = specs[args.newValue.name].language;
      this._generator = this._registry.generators.get(language);
      this._changed.emit('kernel');
    }
  }
}

/**
 * BlocklyManager the manager for each document
 * to select the toolbox and the generator that the
 * user wants to use on a specific document.
 */
export namespace BlocklyManager {
  /**
   * The argument of the signal manager changed.
   */
  export type Change = 'toolbox' | 'kernel';
}
