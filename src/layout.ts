import { IRenderMimeRegistry } from '@jupyterlab/rendermime';
import { ISessionContext, showErrorMessage } from '@jupyterlab/apputils';
import { CodeCell, CodeCellModel } from '@jupyterlab/cells';

import { Message } from '@lumino/messaging';
import { PartialJSONValue } from '@lumino/coreutils';
import { PanelLayout, Widget } from '@lumino/widgets';
import { IIterator, ArrayIterator } from '@lumino/algorithm';
import { Signal } from '@lumino/signaling';

import * as Blockly from 'blockly';

import { BlocklyManager } from './manager';
import { THEME } from './utils';

/**
 * A blockly layout to host the Blockly editor.
 */
export class BlocklyLayout extends PanelLayout {
  private _host: HTMLElement;
  private _manager: BlocklyManager;
  private _workspace: Blockly.WorkspaceSvg;
  private _sessionContext: ISessionContext;
  private _cell: CodeCell;

  /**
   * Construct a `BlocklyLayout`.
   *
   */
  constructor(
    manager: BlocklyManager,
    sessionContext: ISessionContext,
    rendermime: IRenderMimeRegistry
  ) {
    super();
    this._manager = manager;
    this._sessionContext = sessionContext;

    // Creating the container for the Blockly editor
    // and the output area to render the execution replies.
    this._host = document.createElement('div');

    // Creating a CodeCell widget to render the code and
    // outputs from the execution reply.
    this._cell = new CodeCell({
      model: new CodeCellModel({}),
      rendermime
    });
    // Trust the outputs and set the mimeType for the code
    this._cell.readOnly = true;
    this._cell.model.trusted = true;
    this._cell.model.mimeType = this._manager.mimeType;

    this._manager.changed.connect(this._onManagerChanged, this);
  }

  get workspace(): PartialJSONValue {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return Blockly.serialization.workspaces.save(this._workspace);
  }

  set workspace(workspace: PartialJSONValue) {
    const data = workspace === null ? { variables: [] } : workspace;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    Blockly.serialization.workspaces.load(data, this._workspace);
  }

  /**
   * Dispose of the resources held by the widget.
   */
  dispose(): void {
    this._manager.changed.disconnect(this._resizeWorkspace, this);
    Signal.clearData(this);
    this._workspace.dispose();
    super.dispose();
  }

  /**
   * Init the blockly layout
   */
  init(): void {
    super.init();
    // Add the blockly container into the DOM
    this.addWidget(new Widget({ node: this._host }));
  }

  /**
   * Create an iterator over the widgets in the layout.
   */
  iter(): IIterator<Widget> {
    return new ArrayIterator([]);
  }

  /**
   * Remove a widget from the layout.
   *
   * @param widget - The `widget` to remove.
   */
  removeWidget(widget: Widget): void {
    return;
  }

  run(): void {
    // Serializing our workspace into the chosen language generator.
    const code = this._manager.generator.workspaceToCode(this._workspace);
    this._cell.model.sharedModel.setSource(code);
    this.addWidget(this._cell);
    this._resizeWorkspace();

    // Execute the code using the kernel, by using a static method from the
    // same class to make an execution request.
    if (this._sessionContext.hasNoKernel) {
      // Check whether there is a kernel
      showErrorMessage(
        'Select a valid kernel',
        `There is not a valid kernel selected, select one from the dropdown menu in the toolbar.
        If there isn't a valid kernel please install 'xeus-python' from Pypi.org or using mamba.
        `
      );
    } else {
      CodeCell.execute(this._cell, this._sessionContext)
        .then(() => this._resizeWorkspace())
        .catch(e => console.error(e));
    }
  }

  /**
   * Handle `update-request` messages sent to the widget.
   */
  protected onUpdateRequest(msg: Message): void {
    this._resizeWorkspace();
  }

  /**
   * Handle `resize-request` messages sent to the widget.
   */
  protected onResize(msg: Message): void {
    this._resizeWorkspace();
  }

  /**
   * Handle `fit-request` messages sent to the widget.
   */
  protected onFitRequest(msg: Message): void {
    this._resizeWorkspace();
  }

  /**
   * Handle `after-attach` messages sent to the widget.
   */
  protected onAfterAttach(msg: Message): void {
    //inject Blockly with appropiate JupyterLab theme.
    this._workspace = Blockly.inject(this._host, {
      toolbox: this._manager.toolbox,
      theme: THEME
    });
  }

  private _resizeWorkspace(): void {
    //Resize logic.
    const rect = this.parent.node.getBoundingClientRect();
    const { height } = this._cell.node.getBoundingClientRect();
    const margin = rect.height / 3;

    if (height > margin) {
      this._host.style.height = rect.height - margin + 'px';
      this._cell.node.style.height = margin + 'px';
      this._cell.node.style.overflowY = 'scroll';
    } else {
      this._host.style.height = rect.height - height + 'px';
      this._cell.node.style.overflowY = 'scroll';
    }

    Blockly.svgResize(this._workspace);
  }

  private _onManagerChanged(
    sender: BlocklyManager,
    change: BlocklyManager.Change
  ) {
    if (change === 'kernel') {
      // Serializing our workspace into the chosen language generator.
      const code = this._manager.generator.workspaceToCode(this._workspace);
      this._cell.model.sharedModel.setSource(code);
      this._cell.model.mimeType = this._manager.mimeType;
    }
  }
}
