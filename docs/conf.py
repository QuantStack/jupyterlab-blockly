# Configuration file for the Sphinx documentation builder.
#
# This file only contains a selection of the most common options. For a full
# list see the documentation:
# https://www.sphinx-doc.org/en/master/usage/configuration.html

# -- Path setup --------------------------------------------------------------

# If extensions (or modules to document with autodoc) are in another directory,
# add these directories to sys.path here. If the directory is relative to the
# documentation root, use os.path.abspath to make it absolute, like shown here.
#
# import os
# import sys
# sys.path.insert(0, os.path.abspath('.'))

# -- Project information -----------------------------------------------------

project = 'jupyterlab-blockly'
copyright = '2022, Denisa Checiu'
author = 'Denisa Checiu'

# The full version, including alpha/beta/rc tags
release = '0.1.0'


# -- General configuration ---------------------------------------------------

# Add any Sphinx extension module names here, as strings. They can be
# extensions coming with Sphinx (named 'sphinx.ext.*') or your custom
# ones.
extensions = [
    'myst_parser',
    'sphinx.ext.autodoc',
    'sphinx.ext.napoleon',
    'jupyterlite_sphinx',
]

# Add any paths that contain templates here, relative to this directory.
templates_path = ['_templates']

# List of patterns, relative to source directory, that match files and
# directories to ignore when looking for source files.
# This pattern also affects html_static_path and html_extra_path.
exclude_patterns = ['_build', 'Thumbs.db', '.DS_Store']


# -- Options for HTML output -------------------------------------------------

# The theme to use for HTML and HTML Help pages.  See the documentation for
# a list of builtin themes.
html_theme = 'pydata_sphinx_theme'
html_theme_options = {
    'github_url': 'https://github.com/quantstack/jupyterlab-blockly',
    'use_edit_page_button': True,
    'icon_links': [
        {
            'name': 'PyPI',
            'url': 'https://pypi.org/project/jupyterlab-blockly',
            'icon': 'fa-solid fa-box',
        },
    ],
    'pygment_light_style': 'github-light',
    'pygment_dark_style': 'github-dark'
}
html_context = {
    'github_user': 'quantstack',
    'github_repo': 'jupyterlab-blockly',
    'github_version': 'main',
    'doc_path': 'docs',
}

# Add any paths that contain custom static files (such as style sheets) here,
# relative to this directory. They are copied after the builtin static files,
# so a file named "default.css" will overwrite the builtin "default.css".
# html_static_path = ['_static']

# Jupyterlite
jupyterlite_contents = ["example.jpblockly", "logic.jpblockly", "loops.jpblockly", "text_and_lists.jpblockly", "functions.jpblockly"]
jupyterlite_dir = "."
jupyterlite_config = "jupyterlite_config.json"
