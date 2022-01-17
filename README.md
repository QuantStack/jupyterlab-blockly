# jupyterlab_blockly

[![Github Actions Status](https://github.com/quantstack/jupyterlab-blockly/workflows/Build/badge.svg)](https://github.com/quantstack/jupyterlab-blockly/actions/workflows/build.yml)[![Binder](https://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/gh/quantstack/jupyterlab-blockly/main?urlpath=lab)

Blockly extension for JupyterLab.

## Blockly
Blockly is a library from Google for building beginner-friendly block-based programming languages.

Docs: https://developers.google.com/blockly/guides/overview
Repo: https://github.com/google/blockly


## Requirements

* JupyterLab >= 3.0

## Install

To install the extension, execute:

```bash
micromamba create -n blockly -c conda-forge python
micromamba activate blockly
pip install jupyterlab --pre
pip install jupyterlab_blockly
```

## Uninstall

To remove the extension, execute:

```bash
pip uninstall jupyterlab_blockly
```


## Contributing

### Development install

Note: You will need NodeJS to build the extension package.

The `jlpm` command is JupyterLab's pinned version of
[yarn](https://yarnpkg.com/) that is installed with JupyterLab. You may use
`yarn` or `npm` in lieu of `jlpm` below.

```bash
micromamba create -n blockly -c conda-forge python nodejs yarn
micromamba activate blockly
pip install jupyterlab --pre
# Clone the repo to your local environment
# Change directory to the jupyterlab-blockly directory
# Install package in development mode
pip install -e .
# Link your development version of the extension with JupyterLab
jupyter labextension develop . --overwrite
# Rebuild extension Typescript source after making changes
jlpm run build
```

You can watch the source directory and run JupyterLab at the same time in different terminals to watch for changes in the extension's source and automatically rebuild the extension.

```bash
# Watch the source directory in one terminal, automatically rebuilding when needed
jlpm run watch
# Run JupyterLab in another terminal
jupyter lab
```

With the watch command running, every saved change will immediately be built locally and available in your running JupyterLab. Refresh JupyterLab to load the change in your browser (you may need to wait several seconds for the extension to be rebuilt).

By default, the `jlpm run build` command generates the source maps for this extension to make it easier to debug using the browser dev tools. To also generate source maps for the JupyterLab core extensions, you can run the following command:

```bash
jupyter lab build --minimize=False
```

### Development uninstall

```bash
pip uninstall jupyterlab_blockly
```

In development mode, you will also need to remove the symlink created by `jupyter labextension develop`
command. To find its location, you can run `jupyter labextension list` to figure out where the `labextensions`
folder is located. Then you can remove the symlink named `jupyterlab-blockly` within that folder.

### Packaging the extension

See [RELEASE](RELEASE.md)
