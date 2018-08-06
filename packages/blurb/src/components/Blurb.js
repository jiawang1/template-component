import React from 'react';
import PropTypes from 'prop-types';
import invariant from 'invariant';
import { BlurbConsumer } from './BlurbProvider';

let __key = 0;
const getKey = () => ++__key;

const defaultPlaceHolder = /(?:\^([^^]+)\^)/g;

function Blurb(props) {
  return (
    <BlurbConsumer>
      {({ blurb: { queryBlurb, ...consumerBlurb } }) => {
        const __props = { ...props, consumerBlurb };
        return <InnerBlurb {...__props} />;
      }}
    </BlurbConsumer>
  );
}

class InnerBlurb extends React.Component {
  constructor(props) {
    super(props);
    this.fullfillCb = false;
    const { blurbID, consumerBlurb } = props;
    this.unmount = false;
    this.state = {
      blurbID, // eslint-disable-line
      blurb: consumerBlurb.getBlurbByID(blurbID)
    };
  }
  static getDerivedStateFromProps(nextProps, prevState) {
    /* Blurb component only trigger query blurb in componnetWillMount method, so
     * this component can not update. here to make sure  blurbID is not updated */
    invariant(
      nextProps.blurbID === prevState.blurbID,
      `blurbID can not be changed, please add key props for blurb with id ${prevState.blurbID} and ${
        nextProps.blurbID
      }`
    );
    return null;
  }
  componentDidMount() {
    const { blurb } = this.state;
    if (blurb) {
      return;
    }
    const { consumerBlurb, blurbID, children, render } = this.props;
    const ids = [blurbID];

    invariant(
      typeof render !== 'function' || React.Children.count(children) === 0,
      `render blurb to attribute can not support blurb replacement now`
    );

    /**
     * if the children has Blurb, collect all blurbIDs recursively here to
     * query all blurbs in same round trip
     */
    this.collectBlurbID(children, ids);
    consumerBlurb.retrieveBlurb(ids).then(blurbs => {
      if (!this.unmount) {
        this.setState({ blurb: blurbs.find(__blurb => __blurb.id === blurbID) });
      }
    });

    /**
     * try to update async scope
     */
    if (typeof consumerBlurb.updateBlurb === 'function') {
      consumerBlurb.updateBlurb();
    }
  }
  componentDidUpdate() {
    const { finishedCb } = this.props;

    if (typeof finishedCb === 'function' && !this.fullfillCb) {
      const { blurb } = this.state;
      if (blurb && blurb.translation) {
        this.fullfillCb = true;
        finishedCb();
      }
    }
  }
  componentWillUnmount() {
    /**
     * this flag used to identify current component is unmounted, this flag
     * is used when burb promise is resolved after component has been
     * unmounted case
     */
    this.unmount = true;
  }
  removeBlurbkey(element) {
    const { props } = element;
    const { blurbKey, ...__props } = props;

    return blurbKey && element.ref === null && element.type !== Blurb
      ? React.createElement(element.type, __props)
      : element;
  }
  withValidateBlurbProps(prop) {
    return typeof prop === 'object' && prop !== null && Object.keys(prop).length > 0;
  }

  collectBlurbID(children, ids) {
    React.Children.toArray(children)
      .filter(ele => ele.type === Blurb)
      .forEach(chd => {
        ids.push(chd.props.blurbID);
        this.collectBlurbID(chd.props.children, ids);
      });
  }

  render() {
    // blurbKey here used to remove this prop from blurbProps
    const {
      blurbID,
      children,
      consumerBlurb,
      placeHolder,
      finishedCb,
      render,
      blurbKey,
      ...blurbProps
    } = this.props;
    const needWrapper = this.withValidateBlurbProps(blurbProps);

    if (this.state.blurb) {
      if (render) {
        return render(this.state.blurb.translation);
      }
      const childCount = React.Children.count(children);
      const __placeHolder = placeHolder ? new RegExp(placeHolder, 'g') : defaultPlaceHolder;
      if (childCount > 0) {
        const { translation } = this.state.blurb;

        if (childCount === 1) {
          invariant(
            React.isValidElement(children) || typeof children === 'string' || typeof children === 'number',
            'single child should be only react element, number or string'
          );

          if (typeof children === 'string' || typeof children === 'number') {
            const __text = translation.replace(__placeHolder, () => children);
            return needWrapper ? <span {...blurbProps}>{__text}</span> : __text;
          }
          const replacement = this.removeBlurbkey(children);

          const placeHolderInText = translation.match(__placeHolder);

          if (!placeHolderInText) {
            // exceptional case, no replacement in text
            return needWrapper ? <span {...blurbProps}>{translation}</span> : translation;
          }
          const contents = translation.split(placeHolderInText[0]);

          /**
           * one child maybe replace multiple holder, so still use map
           */
          const results = contents.map((cont, inx) => {
            if (inx === contents.length - 1) {
              return cont;
            }
            return (
              <React.Fragment key={getKey()}>
                {cont}
                {React.cloneElement(replacement, { key: getKey() })}
              </React.Fragment>
            );
          });
          return needWrapper ? <span {...blurbProps}>{results}</span> : results;
        }

        if (childCount > 1) {
          const oReplacement = React.Children.toArray(children).reduce((obj, current) => {
            const { props } = current;
            invariant(
              React.isValidElement(current) && props.blurbKey,
              'multiple children must be react element with blurbKey props'
            );
            const __replacement = this.removeBlurbkey(current);
            obj[current.props.blurbKey] = __replacement; // eslint-disable-line
            return obj;
          }, {});

          const results = [];
          let tmp = [];
          let tailStr = translation;
          // eslint-disable-next-line
          while ((tmp = __placeHolder.exec(translation))) {
            const splits = tailStr.split(tmp[0]);
            [, tailStr] = splits;
            results.push(splits[0]);
            if (oReplacement[tmp[1]]) {
              results.push(React.cloneElement(oReplacement[tmp[1]], { key: getKey() }));
            } else {
              results.push(tmp[1]);
            }
          }
          if (tailStr.length > 0) {
            results.push(tailStr);
          }
          return needWrapper ? <span {...blurbProps}>{results}</span> : results;
        }
      }
      return needWrapper ? (
        <span {...blurbProps}>{this.state.blurb.translation}</span>
      ) : (
        this.state.blurb.translation
      );
    }
    return null;
  }
}

InnerBlurb.propTypes = {
  blurbID: PropTypes.string.isRequired,
  children: PropTypes.node,
  blurbKey: PropTypes.string,
  placeHolder: PropTypes.string,
  render: PropTypes.func,
  consumerBlurb: PropTypes.shape({
    getBlurbByID: PropTypes.func.isRequired,
    updateBlurb: PropTypes.func
  }).isRequired,
  finishedCb: PropTypes.func
};

InnerBlurb.defaultProps = {
  children: [],
  placeHolder: null,
  finishedCb: null,
  blurbKey: undefined,
  render: null
};

export default Blurb;
