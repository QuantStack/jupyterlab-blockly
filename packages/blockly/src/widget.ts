import {
  DocumentRegistry,
  DocumentWidget,
  DocumentModel
} from '@jupyterlab/docregistry';
import { IRenderMimeRegistry } from '@jupyterlab/rendermime';
import { runIcon } from '@jupyterlab/ui-components';
import { showErrorMessage } from '@jupyterlab/apputils';

import { PartialJSONObject } from '@lumino/coreutils';
import { SplitPanel } from '@lumino/widgets';
import { Signal } from '@lumino/signaling';

import type Blockly from 'blockly';

import { BlocklyLayout } from './layout';
import { BlocklyManager } from './manager';
import {
  BlocklyButton,
  SelectGenerator,
  SelectToolbox,
  Spacer
} from './toolbar';
import { CodeCell } from '@jupyterlab/cells';
import { IEditorFactoryService } from '@jupyterlab/codeeditor';

/**
 * DocumentWidget: widget that represents the view or editor for a file type.
 */
export class BlocklyEditor extends DocumentWidget<BlocklyPanel, DocumentModel> {
  constructor(options: BlocklyEditor.IOptions) {
    super(options);

    // Loading the ITranslator
    // const trans = this.translator.load('jupyterlab');

    // Create and add a button to the toolbar to execute
    // the code.
    const button = new BlocklyButton({
      label: '',
      icon: runIcon,
      className: 'jp-blockly-runButton',
      onClick: () => (this.content.layout as BlocklyLayout).run(),
      tooltip: 'Run Code'
    });
    this.toolbar.addItem('run', button);
    this.toolbar.addItem('spacer', new Spacer());
    this.toolbar.addItem(
      'toolbox',
      new SelectToolbox({
        label: 'Toolbox',
        tooltip: 'Select tollbox',
        manager: options.manager
      })
    );
    this.toolbar.addItem(
      'generator',
      new SelectGenerator({
        label: 'Kernel',
        tooltip: 'Select kernel',
        manager: options.manager
      })
    );
  }

  /**
   * Dispose of the resources held by the widget.
   */
  dispose(): void {
    this.content.dispose();
    super.dispose();
  }
}

export namespace BlocklyEditor {
  export interface IOptions
    extends DocumentWidget.IOptions<BlocklyPanel, DocumentModel> {
    manager: BlocklyManager;
  }
}

/**
 * Widget that contains the main view of the DocumentWidget.
 */
export class BlocklyPanel extends SplitPanel {
  private _context: DocumentRegistry.IContext<DocumentModel>;
  private _manager: BlocklyManager;
  private _rendermime: IRenderMimeRegistry;

  /**
   * Construct a `BlocklyPanel`.
   *
   * @param context - The documents context.
   */
  constructor(
    context: DocumentRegistry.IContext<DocumentModel>,
    manager: BlocklyManager,
    rendermime: IRenderMimeRegistry,
    factoryService: IEditorFactoryService
  ) {
    super({
      layout: new BlocklyLayout(
        manager,
        context.sessionContext,
        rendermime,
        factoryService
      )
    });
    this.addClass('jp-BlocklyPanel');
    this._context = context;
    this._manager = manager;
    this._rendermime = rendermime;

    // Load the content of the file when the context is ready
    this._context.ready.then(() => this._load());
    // Connect to the save signal
    this._context.saveState.connect(this._onSave, this);
  }

  /*
   * The code cell.
   */
  get cell(): CodeCell {
    return (this.layout as BlocklyLayout).cell;
  }

  /*
   * The rendermime instance used in the code cell.
   */
  get rendermime(): IRenderMimeRegistry {
    return this._rendermime;
  }

  /**
   * Dispose of the resources held by the widget.
   */
  dispose(): void {
    if (this.isDisposed) {
      return;
    }
    Signal.clearData(this);
    super.dispose();
  }

  private _load(): void {
    const fileContent = this._context.model.toJSON();
    const fileFormat = fileContent['format'];
    // Check if format is set or if we have legacy content
    if (fileFormat === undefined && fileContent['blocks']) {
      // Load legacy content
      (this.layout as BlocklyLayout).workspace =
        fileContent as any as Blockly.Workspace;
    } else if (fileFormat === 2) {
      // Load the content from the "workspace" key
      const workspace = fileContent['workspace'] as any as Blockly.Workspace;
      (this.layout as BlocklyLayout).workspace = workspace;
      const metadata = fileContent['metadata'];
      if (metadata) {
        if (metadata['toolbox']) {
          const toolbox = metadata['toolbox'];
          if (
            this._manager.listToolboxes().find(value => value.value === toolbox)
          ) {
            this._manager.setToolbox(metadata['toolbox']);
          } else {
            // Unknown toolbox
            showErrorMessage(
              'Unknown toolbox',
              `The toolbox '${toolbox}' is not available. Using default toolbox.`
            );
          }
        }
        if (metadata['kernel'] && metadata['kernel'] !== 'No kernel') {
          const kernel = metadata['kernel'];
          if (
            this._manager.listKernels().find(value => value.value === kernel)
          ) {
            this._manager.selectKernel(metadata['kernel']);
          } else {
            // Unknown kernel
            console.warn(`Unknown kernel in blockly file: ${kernel}`);
          }
        }
        if (metadata['allowed_blocks']) {
          this._manager.setAllowedBlocks(metadata['allowed_blocks']);
        }
      }
    } else {
      // Unsupported format
      showErrorMessage(
        'Unsupported file format',
        `The file format '${fileFormat}' is not supported by the Blockly editor.`
      );
    }
  }

  private _onSave(
    sender: DocumentRegistry.IContext<DocumentModel>,
    state: DocumentRegistry.SaveState
  ): void {
    if (state === 'started') {
      const workspace = (this.layout as BlocklyLayout).workspace;
      const fileContent: PartialJSONObject = {
        format: 2,
        workspace: workspace as any,
        metadata: {
          toolbox: this._manager.getToolbox(),
          allowed_blocks: this._manager.getAllowedBlocks(),
          kernel: this._manager.kernel
        }
      };
      this._context.model.fromJSON(fileContent);
    }
  }
}
