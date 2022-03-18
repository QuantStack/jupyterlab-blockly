import { SimplifiedOutputArea, OutputAreaModel } from '@jupyterlab/outputarea';
import { IRenderMimeRegistry } from '@jupyterlab/rendermime';
import { ISessionContext } from '@jupyterlab/apputils';

import { Message } from '@lumino/messaging';
import { PartialJSONValue } from '@lumino/coreutils';
import { PanelLayout, Widget } from '@lumino/widgets';
import { IIterator, ArrayIterator } from '@lumino/algorithm';

import * as Blockly from 'blockly';

import { BlocklyManager } from './manager';

/**
 * A blockly layout to host the Blockly editor.
 */
export class BlocklyLayout extends PanelLayout {
  private _host: HTMLElement;
  private _manager: BlocklyManager;
  private _workspace: Blockly.WorkspaceSvg;
  private _sessionContext: ISessionContext;
  private _outputArea: SimplifiedOutputArea;

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
    this._host = document.createElement('div');
    this._outputArea = new SimplifiedOutputArea({
      model: new OutputAreaModel({ trusted: true }),
      rendermime
    });
  }

  get workspace(): PartialJSONValue {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return Blockly.serialization.workspaces.save(this._workspace);
  }

  set workspace(workspace: PartialJSONValue) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    Blockly.serialization.workspaces.load(workspace, this._workspace);
  }

  /**
   * Dispose of the resources held by the widget.
   */
  dispose(): void {
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
    const code = this._manager.generator.workspaceToCode(this._workspace);
    SimplifiedOutputArea.execute(code, this._outputArea, this._sessionContext)
      .then(resp => {
        this.addWidget(this._outputArea);
        this._resizeWorkspace();
      })
      .catch(e => console.error(e));
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
    this._workspace = Blockly.inject(this._host, {
      toolbox: this._manager.toolbox
    });
  }

  private _resizeWorkspace(): void {
    const rect = this.parent.node.getBoundingClientRect();
    const { height } = this._outputArea.node.getBoundingClientRect();
    this._host.style.width = rect.width + 'px';
    const margin = rect.height / 3;

    if (height > margin) {
      this._host.style.height = rect.height - margin + 'px';
      this._outputArea.node.style.height = margin + 'px';
      this._outputArea.node.style.overflowY = 'scroll';
    } else {
      this._host.style.height = rect.height - height + 'px';
      this._outputArea.node.style.overflowY = 'hidden';
    }

    Blockly.svgResize(this._workspace);
  }
}
