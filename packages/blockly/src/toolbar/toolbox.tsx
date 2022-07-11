import { ToolbarButtonComponent } from '@jupyterlab/apputils';
import { HTMLSelect } from '@jupyterlab/ui-components';

import React from 'react';

import { BlocklyManager } from './../manager';
import { BlocklyButton } from './utils';

export namespace SelectToolbox {
  export interface IOptions extends ToolbarButtonComponent.IProps {
    manager: BlocklyManager;
  }
}

export class SelectToolbox extends BlocklyButton {
  private _manager: BlocklyManager;

  constructor(props: SelectToolbox.IOptions) {
    super(props);
    this._manager = props.manager;
    this._manager.changed.connect(this.update, this);
  }

  dispose(): void {
    super.dispose();
    this._manager.changed.disconnect(this.update, this);
  }

  private handleChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    this._manager.setToolbox(event.target.value);
    this.update();
  };

  render(): JSX.Element {
    return (
      <HTMLSelect
        onChange={this.handleChange}
        value={this._manager.getToolbox()}
        options={this._manager.listToolboxes()}
      />
    );
  }
}
