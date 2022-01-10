import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  ILayoutRestorer
} from '@jupyterlab/application';

import {
  ICommandPalette,
  MainAreaWidget,
  WidgetTracker
} from '@jupyterlab/apputils';

import { Widget } from '@lumino/widgets';

import * as Blockly from 'blockly';

namespace CommandIDs {
  export const open = 'jupyterlab-blocky:open-editor';
}

const TOOLBOX = {
  kind: 'flyoutToolbox',
  contents: [
    {
      kind: 'block',
      type: 'controls_if'
    },
    {
      kind: 'block',
      type: 'controls_whileUntil'
    }
  ]
};

/**
 * Initialization data for the jupyterlab-blocky extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-blocky:plugin',
  autoStart: true,
  requires: [ICommandPalette, ILayoutRestorer],
  activate: (
    app: JupyterFrontEnd,
    palette: ICommandPalette,
    restorer: ILayoutRestorer
  ) => {
    console.log('JupyterLab extension jupyterlab-blocky is activated!');

    let editorPanel: MainAreaWidget | null = null;

    // Namespace for the tracker
    const namespace = 'documents-example';
    // Creating the tracker for the document
    const tracker = new WidgetTracker<MainAreaWidget>({ namespace });

    // Handle state restoration.
    if (restorer) {
      // When restoring the app, if the document was open, reopen it
      restorer.restore(tracker, {
        command: CommandIDs.open,
        name: widget => ''
      });
    }

    app.commands.addCommand(CommandIDs.open, {
      label: 'Open Blockly Editor',
      caption: 'Open Blockly Editor',
      isEnabled: () => true,
      execute: () => {
        const content = new Widget();
        content.id = 'jp-Blockly-container';
        editorPanel = new MainAreaWidget({ content });
        editorPanel.title.label = 'Blockly Editor';

        const workspace = Blockly.inject(content.node, {
          toolbox: TOOLBOX
        });
        console.debug('Blockly:', workspace);

        editorPanel.disposed.connect(() => {
          editorPanel = null;
          workspace.dispose();
        });

        app.shell.add(editorPanel, 'main');
      }
    });

    if (palette) {
      palette.addItem({
        command: CommandIDs.open,
        category: 'Blockly Editor'
      });
    }
  }
};

export default plugin;
