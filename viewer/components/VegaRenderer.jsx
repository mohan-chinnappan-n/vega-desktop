import { FORMAT } from '../utils/helper';
import PropTypes from 'prop-types';
import React from 'react';
import path from 'path';
const vg = require('vega');
const vl = require('vega-lite');

const propTypes = {
  className: PropTypes.string,
  renderer: PropTypes.string,
};
const defaultProps = {
  className: '',
  renderer: 'canvas',
};

class VegaRenderer extends React.PureComponent {
  constructor(props) {
    super(props);
    this.view = null;
  }

  componentDidMount() {
    this.update();
  }

  componentDidUpdate() {
    this.update();
  }

  exportFile(type) {
    if (this.view) {
      return this.view.toImageURL(type);
    }
    return Promise.reject('No input');
  }

  showError(msg) {
    this.container.innerHTML = msg;
  }

  update() {
    const { spec, format, filePath, renderer } = this.props;
    if(spec) {
      let vegaSpec;

      if (format === FORMAT.VEGA_LITE) {
        try {
          vegaSpec = vl.compile(spec).spec;
        } catch (ex) {
          this.showError(`Invalid vega-lite spec: ${ex.message}`);
          return;
        }
      } else if (format === FORMAT.UNKNOWN) {
        try {
          vegaSpec = vl.compile(spec).spec;
        } catch (ex) {
          vegaSpec = spec;
        }
      } else {
        vegaSpec = spec;
      }

      // Clear existing view
      if (this.view) {
        this.view.finalize();
      }
      this.container.innerHTML = '';

      try {
        const runtime = vg.parse(vegaSpec);

        // Tell loader to resolve data and image files
        // relative to the spec file
        const loader = new vg.loader({
          baseURL: path.dirname(filePath),
          mode: 'file'
        });

        window.VEGA_DEBUG.view = null;

        this.view = new vg.View(runtime, { loader })
          .initialize(this.container)
          .renderer(renderer)
          .hover()
          .run();

        window.VEGA_DEBUG.view = this.view;

      } catch (ex) {
        this.showError(`Invalid vega spec: ${ex.message}`);
      }
    }
  }

  render() {
    const { className, filePath } = this.props;
    return (
      <div
        className={className}
        ref={c => { this.container = c; }}
      />
    );
  }
}

VegaRenderer.propTypes = propTypes;
VegaRenderer.defaultProps = defaultProps;

export default VegaRenderer;
