import {
  DocumentRegistry,
  DocumentWidget,
  DocumentModel
} from '@jupyterlab/docregistry';
import { IRenderMimeRegistry } from '@jupyterlab/rendermime';

import { Panel, Widget } from '@lumino/widgets';
import { Signal } from '@lumino/signaling';

import { BlocklyLayout } from './layout';
import { BlocklyManager } from './manager';

/**
 * DocumentWidget: widget that represents the view or editor for a file type.
 */
export class BlocklyEditor extends DocumentWidget<BlocklyPanel, DocumentModel> {
  constructor(options: DocumentWidget.IOptions<BlocklyPanel, DocumentModel>) {
    super(options);

    // Create and add a button to the toolbar to execute
    // the code.
    // Example: https://github.com/jupyterlab/extension-examples/blob/9c35013ce5da125f1b5865b3f7cbb301970d5970/toolbar-button/src/index.ts#L44-L52
    // (this.content.layout as BlocklyLayout).run();
    // this.toolbar.addItem('run', button);
  }

  /**
   * Dispose of the resources held by the widget.
   */
  dispose(): void {
    this.content.dispose();
    super.dispose();
  }
}

/**
 * Widget that contains the main view of the DocumentWidget.
 */
export class BlocklyPanel extends Panel {
  private _context: DocumentRegistry.IContext<DocumentModel>;

  /**
   * Construct a `ExamplePanel`.
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

    // Load the content of the file when the context is ready
    this._context.ready.then(() => this._load());
    // Connect to the save signal
    this._context.saveState.connect(this._onSave, this);
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
    const content = this._context.model.toJSON();
    (this.layout as BlocklyLayout).workspace = content;
  }

  private _onSave(
    sender: DocumentRegistry.IContext<DocumentModel>,
    state: DocumentRegistry.SaveState
  ): void {
    if (state === 'started') {
      const workspace = (this.layout as BlocklyLayout).workspace;
      this._context.model.fromJSON(workspace);
    }
  }
}
