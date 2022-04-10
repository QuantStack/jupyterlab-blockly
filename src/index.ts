import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  ILayoutRestorer
} from '@jupyterlab/application';
import { WidgetTracker } from '@jupyterlab/apputils';
import { IRenderMimeRegistry } from '@jupyterlab/rendermime';

import { BlocklyEditorFactory } from './factory';
import { IBlocklyManager } from './token';
import { BlocklyEditor } from './widget';

import {blockly_icon} from './icons';
/**
 * The name of the factory that creates the editor widgets.
 */
const FACTORY = 'Blockly editor';

/**
 * Initialization data for the jupyterlab-blocky extension.
 */
const plugin: JupyterFrontEndPlugin<IBlocklyManager> = {
  id: 'jupyterlab-blocky:plugin',
  autoStart: true,
  requires: [ILayoutRestorer, IRenderMimeRegistry],
  provides: IBlocklyManager,
  activate: (
    app: JupyterFrontEnd,
    restorer: ILayoutRestorer,
    rendermime: IRenderMimeRegistry
  ): IBlocklyManager => {
    console.log('JupyterLab extension jupyterlab-blocky is activated!');

    // Namespace for the tracker
    const namespace = 'jupyterlab-blocky';

    // Creating the tracker for the document
    const tracker = new WidgetTracker<BlocklyEditor>({ namespace });

    // Handle state restoration.
    if (restorer) {
      // When restoring the app, if the document was open, reopen it
      restorer.restore(tracker, {
        command: 'docmanager:open',
        args: widget => ({ path: widget.context.path, factory: FACTORY }),
        name: widget => widget.context.path
      });
    }

    // Creating the widget factory to register it so the document manager knows about
    // our new DocumentWidget
    const widgetFactory = new BlocklyEditorFactory({
      name: FACTORY,
      modelName: 'text',
      fileTypes: ['json'],
      defaultFor: ['json'],

      // Kernel options, in this case we need to execute the code generated
      // in the blockly editor. The best way would be to use kernels, for
      // that reason, we tell the widget factory to start a kernel session
      // when opening the editor, and close the session when closing the editor.
      canStartKernel: true,
      preferKernel: true,
      shutdownOnClose: true,

      // The rendermime instance, necessary to render the outputs
      // after a code execution.
      rendermime: rendermime
    });

    // Add the widget to the tracker when it's created
    widgetFactory.widgetCreated.connect((sender, widget) => {
      // Adding the Blockly icon next to the file name.
      widget.title.icon = blockly_icon; 

      // Notify the instance tracker if restore data needs to update.
      widget.context.pathChanged.connect(() => {
        tracker.save(widget);
      });
      tracker.add(widget);
    });


    // Registering the widget factory
    app.docRegistry.addWidgetFactory(widgetFactory);

    return widgetFactory.manager;
  }
};

export default plugin;
