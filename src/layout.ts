import { SimplifiedOutputArea, OutputAreaModel } from '@jupyterlab/outputarea';
import { IRenderMimeRegistry } from '@jupyterlab/rendermime';
import { ISessionContext } from '@jupyterlab/apputils';
import { ITranslator } from '@jupyterlab/translation';

import { Message } from '@lumino/messaging';
import { PartialJSONValue } from '@lumino/coreutils';
import { PanelLayout, Widget } from '@lumino/widgets';
import { IIterator, ArrayIterator } from '@lumino/algorithm';

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
  private _outputArea: SimplifiedOutputArea;
  private _language: ITranslator;

  /**
   * Construct a `BlocklyLayout`.
   *
   */
  constructor(
    manager: BlocklyManager,
    sessionContext: ISessionContext,
    rendermime: IRenderMimeRegistry,
    language: ITranslator
  ) {
    super();
    this._manager = manager;
    this._sessionContext = sessionContext;
    this._language = language;

    // Creating the container for the Blockly editor
    // and the output area to render the execution replies.
    this._host = document.createElement('div');

    // Creating a SimplifiedOutputArea widget to render the
    // outputs from the execution reply.
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
    const data = workspace === null ? { variables: [] } : workspace;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    Blockly.serialization.workspaces.load(data, this._workspace);
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
    // Serializing our workspace into the chosen language generator.
    const code = this._manager.generator.workspaceToCode(this._workspace);

    // Execute the code using the kernel, by using a static method from the
    // same class to make an execution request.
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
    //inject Blockly with appropiate JupyterLab theme.
    this._workspace = Blockly.inject(this._host, {
      toolbox: this._manager.toolbox,
      theme: THEME
    });
  }

  private _resizeWorkspace(): void {
    // this._language.load('jupyterlab');
    // LOGIC for listening to change of language in Juypter Lab.
    // current_language = 

    // LOGIC for changing the language in Blockly.
    //this._manager.language(current_language);
    
    //Resize logic.
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
