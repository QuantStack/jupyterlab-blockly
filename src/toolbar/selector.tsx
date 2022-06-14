import { ToolbarButtonComponent } from '@jupyterlab/apputils';
import { HTMLSelect } from '@jupyterlab/ui-components';

import React from 'react';

import { BlocklyManager } from './../manager';
import { BlocklyButton } from './utils';

export namespace SelectGenerator {
  export interface IOptions extends ToolbarButtonComponent.IProps {
    manager: BlocklyManager;
  }
}

export class SelectGenerator extends BlocklyButton {
  private _manager: BlocklyManager;

  constructor(props: SelectGenerator.IOptions) {
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
    this._manager.selectKernel(event.target.value);
    this.update();
  };

  render(): JSX.Element {
    const kernels = this._manager.listKernels();
    if (this._manager.kernel === 'No kernel') {
      kernels.push({ label: 'No kernel', value: 'No kernel' });
    }

    return (
      <HTMLSelect
        onChange={this.handleChange}
        value={this._manager.kernel}
        options={kernels}
      />
    );
  }
}
