import React from 'react';
import PropTypes from 'prop-types';

const { Provider, Consumer: BlurbConsumer } = React.createContext();

class BlurbProvider extends React.Component {
  constructor(props) {
    super(props);
    const { blurbs } = this.props;
    this.blurbs = blurbs || []; // used to cache all blurbs
    this.flyingIDs = []; // cache retrieving blurb ID

    this.getBlurbByID = this.getBlurbByID.bind(this);
    this.queryBlurb = this.queryBlurb.bind(this);
    this.retrieveBlurb = this.retrieveBlurb.bind(this);
    this.updateBlurb = this.updateBlurb.bind(this);
    this.scheduled = false;
  }

  componentDidMount() {
    this.queryBlurb();
  }

  componentDidUpdate() {
    this.queryBlurb();
  }

  getBlurbByID(id) {
    const blurb = this.blurbs.find(__blurb => __blurb.id === id);
    return blurb ? blurb.value : null;
  }

  retrieveBlurb(ids = []) {
    const ret = [];
    ids.forEach(id => {
      let blurbWrapper = this.blurbs.find(_blurb => _blurb.id === id);
      if (blurbWrapper) {
        ret.push(blurbWrapper.promise);
      } else {
        blurbWrapper = {
          id,
          isNew: true,
          value: null
        };
        blurbWrapper.promise = new Promise((res, rej) => {
          blurbWrapper.success = obj => {
            res(obj);
          };
          blurbWrapper.failed = err => {
            rej(err);
          };
        });
        this.blurbs.push(blurbWrapper);
        ret.push(blurbWrapper.promise);
      }
    });
    return Promise.all(ret);
  }
  updateBlurb() {
    /**
     * this method called from inside blurb, if only current component is not in
     * updaating phase will trigger setState method
     *
     */
    if (!this.scheduled) {
      this.scheduled = true;
      this.setState({});
    }
  }

  queryBlurb() {
    const { queryBlurb } = this.props;
    const newIDs = this.blurbs
      .filter(_blurb => _blurb.isNew && !this.flyingIDs.some(id => id === _blurb.id))
      .map(_blurb => _blurb.id);

    this.scheduled = false;

    const findBlurbMapperByID = id => this.blurbs.find(__b => __b.id === id.slice(6));

    if (newIDs.length > 0) {
      this.flyingIDs = [...this.flyingIDs, ...newIDs];
      return queryBlurb(newIDs)
        .then(__blurbs => {
          __blurbs.forEach(__blurb => {
            const blurbWrapper = findBlurbMapperByID(__blurb.id);
            blurbWrapper.isNew = false;
            const blurb = {
              id: __blurb.id.slice(6),
              translation: __blurb.translation
            };
            blurbWrapper.value = blurb;
            blurbWrapper.success(blurb);
            this.flyingIDs.splice(this.flyingIDs.findIndex(id => id === __blurb.id), 1);
          });
        })
        .catch(error => {
          console.error(error); // eslint-disable-line
          newIDs.forEach(__id => {
            const blurbWrapper = findBlurbMapperByID(__id);
            if (blurbWrapper) {
              blurbWrapper.failed(error);
            }
          });
        });
    }
    return Promise.resolve([]);
  }
  render() {
    /**
     * update from outside, this kind of update will refresh Provider ,
     * also will call componentDidUpdate (Mount) to trigger query blurb,
     * so set schedule to true to avoid Blurb inside schedule update
     * again
     */

    this.scheduled = true;
    return (
      <Provider
        value={{
          blurb: {
            getBlurbByID: this.getBlurbByID,
            queryBlurb: this.queryBlurb,
            retrieveBlurb: this.retrieveBlurb,
            updateBlurb: this.updateBlurb
          }
        }}
      >
        {this.props.children}
      </Provider>
    );
  }
}

BlurbProvider.propTypes = {
  queryBlurb: PropTypes.func.isRequired,
  blurbs: PropTypes.arrayOf(String),
  children: PropTypes.node.isRequired
};

BlurbProvider.defaultProps = {
  blurbs: []
};

export { BlurbProvider, BlurbConsumer, Provider };
