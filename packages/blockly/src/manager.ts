import { ISessionContext } from '@jupyterlab/apputils';
import { IEditorMimeTypeService } from '@jupyterlab/codeeditor';
import { KernelSpec, KernelConnection } from '@jupyterlab/services';
import { IChangedArgs } from '@jupyterlab/coreutils';

import { ISignal, Signal } from '@lumino/signaling';

import * as Blockly from 'blockly';

import { BlocklyRegistry } from './registry';
import {
  BlockInfo,
  DynamicCategoryInfo,
  StaticCategoryInfo,
  ToolboxDefinition,
  ToolboxInfo,
  ToolboxItemInfo
} from 'blockly/core/utils/toolbox';

/**
 * BlocklyManager the manager for each document
 * to select the toolbox and the generator that the
 * user wants to use on a specific document.
 */
export class BlocklyManager {
  private _toolbox: string;
  private _allowedBlocks: string[];
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
    this._filterToolbox();
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
      this._filterToolbox();
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
   * Get the list of allowed blocks. If undefined, all blocks are allowed.
   *
   * @returns The list of allowed blocks.
   */
  getAllowedBlocks() {
    return this._allowedBlocks;
  }

  /**
   * Set the list of allowed blocks. If undefined, all blocks are allowed.
   *
   * @param allowedBlocks The list of allowed blocks.
   */
  setAllowedBlocks(allowedBlocks: string[]) {
    this._allowedBlocks = allowedBlocks;
    this._filterToolbox();
    this._changed.emit('toolbox');
  }

  private _filterToolbox() {
    const toolbox = this._registry.toolboxes.get(this._toolbox) as ToolboxInfo;
    if (toolbox) {
      this._filterContents(toolbox.contents);
    }
  }

  private _filterContents(contents: ToolboxItemInfo[]): number {
    let visible = 0;
    contents.forEach(itemInfo => {
      if ('kind' in itemInfo) {
        if (itemInfo.kind.toUpperCase() === 'CATEGORY') {
          if ('contents' in itemInfo) {
            const categoryInfo = itemInfo as StaticCategoryInfo;
            if (this._filterContents(categoryInfo.contents) > 0) {
              visible++;
              categoryInfo.hidden = 'false';
            } else {
              categoryInfo.hidden = 'true';
            }
          } else if ('custom' in itemInfo) {
            const categoryInfo = itemInfo as DynamicCategoryInfo;
            if (
              this._allowedBlocks === undefined ||
              this._allowedBlocks.includes(categoryInfo.custom.toLowerCase())
            ) {
              categoryInfo.hidden = 'false';
              visible++;
              console.log(`Category ${categoryInfo.custom} is allowed`);
            } else {
              categoryInfo.hidden = 'true';
              console.log(`Category ${categoryInfo.custom} is not allowed`);
            }
          }
        } else if (itemInfo.kind.toUpperCase() === 'BLOCK') {
          const blockInfo = itemInfo as BlockInfo;
          if (
            this._allowedBlocks === undefined ||
            this._allowedBlocks.includes(blockInfo.type.toLowerCase())
          ) {
            blockInfo.disabled = false;
            blockInfo.disabledReasons = [];
            visible++;
          } else {
            blockInfo.disabled = true;
            blockInfo.disabledReasons = ['This block is not allowed'];
          }
        }
      }
    });
    return visible;
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
