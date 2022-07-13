import { ToolbarButton, ToolbarButtonComponent } from '@jupyterlab/apputils';
import { Widget } from '@lumino/widgets';

export class BlocklyButton extends ToolbarButton {
  constructor(props?: ToolbarButtonComponent.IProps) {
    super(props);
    this.addClass('jp-blockly-button');
  }
}

export class Spacer extends Widget {
  constructor() {
    super();
    this.addClass('jp-Toolbar-spacer');
  }
}
