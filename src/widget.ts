import {
    DocumentRegistry,
    DocumentWidget,
    DocumentModel
  } from '@jupyterlab/docregistry';
  
  import { Widget } from '@lumino/widgets';
  
  import { Signal } from '@lumino/signaling';
  
  import { BlocklyLayout } from './layout';
  
  /**
   * DocumentWidget: widget that represents the view or editor for a file type.
   */
  export class BlocklyEditor extends DocumentWidget<BlocklyPanel, DocumentModel> {
    constructor(options: DocumentWidget.IOptions<BlocklyPanel, DocumentModel>) {
      super(options);
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
  export class BlocklyPanel extends Widget {
    private _context: DocumentRegistry.IContext<DocumentModel>;
  
    /**
     * Construct a `ExamplePanel`.
     *
     * @param context - The documents context.
     */
    constructor(context: DocumentRegistry.IContext<DocumentModel>) {
      super();
      this.addClass('jp-BlocklyPanel');
      this._context = context;
  
      this.layout = new BlocklyLayout();
  
      this._context.ready.then(() => {
        // TODO: load the content into the blockly editor
        const content = this._context.model.toJSON();
        console.debug('[BlocklyPanel] Loading:', content);
        (this.layout as BlocklyLayout).workspace = content;
      });
  
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
  
    private _onSave(
      sender: DocumentRegistry.IContext<DocumentModel>,
      state: DocumentRegistry.SaveState
    ): void {
      if (state === 'started') {
        const workspace = (this.layout as BlocklyLayout).workspace;
        console.debug('[BlocklyPanel] Saving:', workspace);
        this._context.model.fromJSON(workspace);
      }
    }
  }