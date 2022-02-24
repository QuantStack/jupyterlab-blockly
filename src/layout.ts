import { Layout, Widget } from '@lumino/widgets';

import { PartialJSONValue } from '@lumino/coreutils';

import { IIterator, ArrayIterator } from '@lumino/algorithm';

import { Message } from '@lumino/messaging';

import * as Blockly from 'blockly';

import { TOOLBOX } from './utils';

/**
 * A blockly layout to host the Blockly editor.
 */
export class BlocklyLayout extends Layout {
  private _workspace: Blockly.WorkspaceSvg;
  private _host: HTMLElement;

  /**
   * Construct a `BlocklyLayout`.
   *
   */
  constructor() {
    super();
    console.debug('[BlocklyLayout]');

    // Creating the container for the Blockly editor
    this._host = document.createElement('div');
    this._host.className = 'grid-stack';
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
    console.debug('[BlocklyLayout] init');
    // Add the blockly container into the DOM
    this.parent!.node.appendChild(this._host);
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

  /**
   * Handle `update-request` messages sent to the widget.
   */
  protected onUpdateRequest(msg: Message): void {
    console.debug('[BlocklyLayout] onUpdateRequest');
    // TODO: write the resize logic
  }

  /**
   * Handle `resize-request` messages sent to the widget.
   */
  protected onResize(msg: Message): void {
    console.debug('[BlocklyLayout] onResize');
    // TODO: write the resize logic
    const rect = this.parent.node.getBoundingClientRect();
    this._host.style.width = rect.width + 'px';
    this._host.style.height = rect.height + 'px';
    Blockly.svgResize(this._workspace);
  }

  /**
   * Handle `fit-request` messages sent to the widget.
   */
  protected onFitRequest(msg: Message): void {
    console.debug('[BlocklyLayout] onFitRequest');
    // TODO: write the resize logic
    //
  }

  /**
   * Handle `after-attach` messages sent to the widget.
   */
  protected onAfterAttach(msg: Message): void {
    console.debug('[BlocklyLayout] onAfterAttach');
    this._workspace = Blockly.inject(this._host, {
      toolbox: TOOLBOX
    });
  }

  /**
   * Handle `after-show` messages sent to the widget.
   */
  protected onAfterShow(msg: Message): void {
    console.debug('[BlocklyLayout] onAfterShow');
  }
}
