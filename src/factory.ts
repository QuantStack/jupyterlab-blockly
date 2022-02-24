import {
  ABCWidgetFactory,
  DocumentRegistry,
  DocumentModel
} from '@jupyterlab/docregistry';

import { BlocklyEditor, BlocklyPanel } from './widget';

/**
 * A widget factory to create new instances of ExampleDocWidget.
 */
export class BlocklyEditorFactory extends ABCWidgetFactory<
  BlocklyEditor,
  DocumentModel
> {
  /**
   * Constructor of ExampleWidgetFactory.
   *
   * @param options Constructor options
   */
  constructor(options: DocumentRegistry.IWidgetFactoryOptions) {
    super(options);
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
      content: new BlocklyPanel(context)
    });
  }
}
