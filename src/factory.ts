import {
  ABCWidgetFactory,
  DocumentRegistry,
  DocumentModel
} from '@jupyterlab/docregistry';
import { IRenderMimeRegistry } from '@jupyterlab/rendermime';
// import { ITranslator } from '@jupyterlab/translation';

import { BlocklyEditor, BlocklyPanel } from './widget';
import { BlocklyManager } from './manager';

/**
 * A widget factory to create new instances of BlocklyEditor.
 */
export class BlocklyEditorFactory extends ABCWidgetFactory<
  BlocklyEditor,
  DocumentModel
> {
  private _manager: BlocklyManager;
  private _rendermime: IRenderMimeRegistry;
  private _language: string;
  // private _translator: ITranslator;

  /**
   * Constructor of BlocklyEditorFactory.
   *
   * @param options Constructor options
   */
  constructor(options: BlocklyEditorFactory.IOptions) {
    super(options);
    this._manager = new BlocklyManager();
    this._rendermime = options.rendermime;
    this._language = this._manager.language;
    // this._translator = options.translator;
  }

  get manager(): BlocklyManager {
    return this._manager;
  }

  /**
   * Create a new widget given a context.
   *
   * @param context Contains the information of the file
   * @returns The widget
   */
  protected createNewWidget(
    context: DocumentRegistry.IContext<DocumentModel>
  ): BlocklyEditor {
    return new BlocklyEditor({
      context,
      content: new BlocklyPanel(
        context,
        this._manager,
        this._rendermime,
        this._language
      )
    });
  }
}

export namespace BlocklyEditorFactory {
  export interface IOptions extends DocumentRegistry.IWidgetFactoryOptions {
    /*
     * A rendermime instance.
     */
    rendermime: IRenderMimeRegistry;
  }
}
