import {
  DocumentRegistry,
  DocumentWidget,
  DocumentModel
} from '@jupyterlab/docregistry';

import { Widget } from '@lumino/widgets';

import { Signal } from '@lumino/signaling';

import { Message } from '@lumino/messaging';

import * as Blockly from 'blockly';

import { TOOLBOX } from './utils';

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
  /**
   * Construct a `ExamplePanel`.
   *
   * @param context - The documents context.
   */
  constructor(context: DocumentRegistry.IContext<DocumentModel>) {
    super();
    this.addClass('jp-BlocklyPanel');
    this._context = context;
    //this._context.model.contentChanged.connect(this._onContentChanged, this);
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
	
  protected onAfterShow(msg: Message): void {
    this._workspace = Blockly.inject(this.node, {
      toolbox: TOOLBOX
    });
    console.debug('Blockly:', this._workspace, TOOLBOX);

    this._workspace.addChangeListener(event => {
      if (
        event.type === Blockly.Events.BLOCK_CHANGE &&
        event.oldValue !== event.newValue
      ) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const content = Blockly.serialization.workspaces.save(this._workspace);
        console.debug('Saving:', content);
        this._context.model.fromJSON(content);
      }
    });

    if (this._context.isReady) {
      const content = this._context.model.toJSON();
      console.debug('Loading show:', content);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      Blockly.serialization.workspaces.load(content, this._workspace);
    }
  }

  protected onBeforeHide(msg: Message): void {
    this._workspace.dispose();
    this._workspace = null;
  }

  /* private _onContentChanged(sender: DocumentModel): void {
    const content = this._context.model.toJSON();
    console.debug('Loading:', content);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    Blockly.serialization.workspaces.load(content, this._workspace);
  } */

  private _context: DocumentRegistry.IContext<DocumentModel>;
  private _workspace: Blockly.WorkspaceSvg | null;
}
