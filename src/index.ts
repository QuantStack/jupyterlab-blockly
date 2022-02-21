import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  ILayoutRestorer
} from '@jupyterlab/application';

// import {
//   ICommandPalette,
//   MainAreaWidget,
//   WidgetTracker
// } from '@jupyterlab/apputils';

// import { Widget } from '@lumino/widgets';

import { WidgetTracker } from '@jupyterlab/apputils';

// import * as Blockly from 'blockly';

import { BlocklyEditorFactory } from './factory';

// namespace CommandIDs {
//   export const open = 'jupyterlab-blocky:open-editor';
// }

import { BlocklyEditor } from './widget';

// const TOOLBOX = {
//   kind: 'flyoutToolbox',
//   contents : [
//     {
//       kind : 'block',
//       type : 'controls_if'
//     },
//     {
//       kind : 'block',
//       type : 'controls_ifelse'
//     },
//     {
//       kind : 'block',
//       type : 'logic_compare'
//     },
//     {
//       kind : 'block',
//       type : 'logic_operation'
//     },
//     {
//       kind : 'block',
//       type : 'logic_boolean'
//     },
//     {
//       kind : 'block',
//       type : 'controls_whileUntil'
//     },
//     {
//       kind : 'block',
//       type : 'controls_repeat_ext'
//     },
//     {
//       kind : 'block',
//       type : 'controls_for'
//     },
//     {
//       kind : 'block',
//       type : 'math_number'
//     },
//     {
//       kind : 'block',
//       type : 'math_arithmetic'
//     }
//   ]
// };

/**
 * The name of the factory that creates the editor widgets.
 */
 const FACTORY = 'Blockly editor';

/**
 * Initialization data for the jupyterlab-blocky extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-blocky:plugin',
  autoStart: true,
  // requires: [ICommandPalette, ILayoutRestorer],
  // activate: (
  //   app: JupyterFrontEnd,
  //   palette: ICommandPalette,
  //   restorer: ILayoutRestorer
  // ) => {
    requires: [ILayoutRestorer],
    activate: (app: JupyterFrontEnd, restorer: ILayoutRestorer) => {
    console.log('JupyterLab extension jupyterlab-blocky is activated!');

    // let editorPanel: MainAreaWidget | null = null;

    // // Namespace for the tracker
    // const namespace = 'documents-example';
    const namespace = 'jupyterlab-blocky';
    // Creating the tracker for the document
    // const tracker = new WidgetTracker<MainAreaWidget>({ namespace });
    const tracker = new WidgetTracker<BlocklyEditor>({ namespace });

    // Handle state restoration.
    if (restorer) {
      // When restoring the app, if the document was open, reopen it
      restorer.restore(tracker, {
        // command: CommandIDs.open,
        // name: widget => ''
        command: 'docmanager:open',
        args: widget => ({ path: widget.context.path, factory: FACTORY }),
        name: widget => widget.context.path
      });
    }

    // app.commands.addCommand(CommandIDs.open, {
    //   label: 'Open Blockly Editor',
    //   caption: 'Open Blockly Editor',
    //   isEnabled: () => true,
    //   execute: () => {
    //     const content = new Widget();
    //     content.id = 'jp-Blockly-container';
    //     editorPanel = new MainAreaWidget({ content });
    //     editorPanel.title.label = 'Blockly Editor';

    //     editorPanel.disposed.connect(() => {
    //       editorPanel = null;
    //       workspace.dispose();
    //     });

    //     app.shell.add(editorPanel, 'main');

    //     const workspace = Blockly.inject(content.node, {
    //       toolbox: TOOLBOX
    //     });
    //     console.debug('Blockly:', workspace);
    //   }
    // Creating the widget factory to register it so the document manager knows about
    // our new DocumentWidget
      const widgetFactory = new BlocklyEditorFactory({
        name: FACTORY,
        modelName: 'text',
        fileTypes: ['json']
    });

    // if (palette) {
    //   palette.addItem({
    //     command: CommandIDs.open,
    //     category: 'Blockly Editor'
      // Add the widget to the tracker when it's created
    widgetFactory.widgetCreated.connect((sender, widget) => {
      // Notify the instance tracker if restore data needs to update.
      widget.context.pathChanged.connect(() => {
        tracker.save(widget);
      });
    // }
      tracker.add(widget);
      });
      // Registering the widget factory
      app.docRegistry.addWidgetFactory(widgetFactory);
  }
};

export default plugin;
