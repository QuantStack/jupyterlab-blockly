import {
  DocumentRegistry,
  DocumentWidget,
  DocumentModel
} from '@jupyterlab/docregistry';
import { IRenderMimeRegistry } from '@jupyterlab/rendermime';
import { runIcon } from '@jupyterlab/ui-components';

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
  private _rendermime: IRenderMimeRegistry;

  /**
   * Construct a `BlocklyPanel`.
   *
   * @param context - The documents context.
   */
  constructor(
    context: DocumentRegistry.IContext<DocumentModel>,
    manager: BlocklyManager,
    rendermime: IRenderMimeRegistry
  ) {
    super({
      layout: new BlocklyLayout(manager, context.sessionContext, rendermime)
    });
    this.addClass('jp-BlocklyPanel');
    this._context = context;
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
    // Loading the content of the document into the workspace
    const content = this._context.model.toJSON() as any as Blockly.Workspace;
    (this.layout as BlocklyLayout).workspace = content;
  }

  private _onSave(
    sender: DocumentRegistry.IContext<DocumentModel>,
    state: DocumentRegistry.SaveState
  ): void {
    if (state === 'started') {
      const workspace = (this.layout as BlocklyLayout).workspace;
      this._context.model.fromJSON(workspace as any);
    }
  }
}
