import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './styles.css';

import errorIcon from './error-icon.png';
import downArrow from './down-arrow.png';
import refreshIcon from './refresh-icon.png';

export default class PullToRefresh extends Component {
  static propTypes = {
    options: PropTypes.object,
    children: PropTypes.node,
    onRefresh: PropTypes.func.isRequired,
    textError: PropTypes.string,
    textStart: PropTypes.string,
    textReady: PropTypes.string,
    textRefresh: PropTypes.string
  };

  constructor(props) {
    super(props)
    this.state = {
      isMounted: false,
      label: '',
      iconClass: '',
      style: {},
      height: 0,
      status: this.statusStart,
      canPull: false
    }
    this.pullDownContainer = React.createRef()
    this.pullDownHeader = React.createRef()
    this.pullDownLayer = React.createRef()
    this.iconPullDown = React.createRef()
  }

  statusError = -1;
  statusStart = 0;
  statusReady = 1;
  statusRefresh = 2;
  listLabel = ['Error', 'Start', 'Ready', 'Refresh'];
  animation = 'height .5s ease';

  checkListLabel() {
    this.listLabel[0] = this.props.textError || this.listLabel[0]
    this.listLabel[1] = this.props.textStart || this.listLabel[1]
    this.listLabel[2] = this.props.textReady || this.listLabel[2]
    this.listLabel[3] = this.props.textRefresh || this.listLabel[3]
  }

  componentDidMount() {
    this.setState({ isMounted: true })
    this.checkListLabel()

    const sleep = timeout =>
      new Promise(resolve => setTimeout(resolve, timeout))

    let _el = document
    let pullDownContainer = this.pullDownContainer.current
    let pullDownHeader = this.pullDownHeader.current
    let pullDownLayer = this.pullDownLayer.current
    let icon = this.iconPullDown.current

    let pullDownHeight =
      this.props.options && this.props.options.pullDownHeight
        ? this.props.options.pullDownHeight
        : 60
    let reset = withAnimation => {
      if (withAnimation) {
        pullDownHeader.style.transition = this.animation
      }
      if (this.state.isMounted) {
        this.setState({
          status: this.statusStart
        })
        this.setState({
          height: 0
        })
      }
      pullDownContainer.style.overflowY = 'auto';
      pullDownLayer.style.zIndex = -1
    };

    let touchPosition = {
      start: 0,
      distance: 0
    }
    let supportPassive = false
    let options = Object.defineProperty({}, 'passive', {
      get: () => {
        supportPassive = true
        return true
      }
    })
    _el.addEventListener('test', null, options)

    pullDownContainer.addEventListener(
      'touchstart',
      async e => {
        if (this.state.status !== this.statusRefresh) {
          if (this.state.isMounted) {
            this.setState({
              canPull: e.scrollTop === 0
            })
          }
          touchPosition.start = e.touches[0].pageY
          console.log('touchStart: ', touchPosition.start)
        }
      },
      supportPassive ? { passive: true } : false
    )

    pullDownContainer.addEventListener(
      'touchmove',
      async e => {
        if (this.state.status !== this.statusRefresh) {
          if (this.state.canPull) return
          let distance = e.touches[0].pageY - touchPosition.start
          distance = distance > 180 ? 180 : distance

          if (distance > 0) pullDownContainer.style.overflowY = 'hidden';
          touchPosition.distance = distance
          if (this.state.isMounted && distance > 10) {
            this.setState({
              height: distance
            })
          }

          if (distance > pullDownHeight) {
            if (this.state.isMounted) {
              this.setState({
                status: this.statusReady
              })
            }
            icon.style.transform = 'rotate(180deg)';
          } else {
            if (this.state.isMounted) {
              this.setState({
                status: this.statusStart
              })
            }
            icon.style.transform = 'rotate(' + distance + 'deg)';
          }
        }
      },
      supportPassive ? { passive: true } : false
    )

    pullDownContainer.addEventListener('touchend', async () => {
      if (this.state.status !== this.statusRefresh) {
        if (this.state.isMounted) {
          this.setState({
            canPull: false
          })
        }
        pullDownHeader.style.transition = this.animation

        if (
          touchPosition.distance - pullDownContainer.scrollTop >
          pullDownHeight
        ) {
          pullDownContainer.scrollTop = 0
          if (this.state.isMounted) {
            this.setState({
              height: pullDownHeight
            })
            this.setState({
              status: this.statusRefresh
            })
            pullDownLayer.style.zIndex = 10
          }
          if (
            this.props.onRefresh &&
            typeof this.props.onRefresh === 'function'
          ) {
            this.props
              .onRefresh()
              .then(async res => {
                if (!res) {
                  await sleep(1000)
                }
                reset(true)
              })
              .catch(err => {
                console.log('catch: ', err)
                reset(true)
                if (this.state.isMounted) {
                  this.setState({
                    status: this.statusError
                  })
                }
              })
          } else {
            await sleep(2500)
            reset(false)
          }
        } else {
          reset(false)
        }
        touchPosition.distance = 0
        touchPosition.start = 0
        console.log('touchEnd: ', this.state.height)
      }
    })

    pullDownHeader.addEventListener('transitionend', () => {
      pullDownHeader.style.transition = '';
    })

    pullDownHeader.addEventListener('webkitTransitionEnd', () => {
      pullDownHeader.style.transition = '';
    })
  }

  componentWillUnmount() {
    console.log('unmount component')
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.state.status !== prevState.status) {
      let icon = document.querySelector('.pull-down-content--icon')
      this.setState({
        label: this.listLabel[this.state.status + 1],
        iconClass:
          this.state.status === this.statusError
            ? 'pull-down-error'
            : this.state.status === this.statusRefresh
              ? 'pull-down-refresh'
              : ''
      })
      if (this.state.status === this.statusError) {
        icon.style.backgroundImage = 'url(' + errorIcon + ')';
      } else if (this.state.status === this.statusRefresh) {
        icon.style.backgroundImage = 'url(' + refreshIcon + ')';
      } else {
        icon.style.backgroundImage = 'url(' + downArrow + ')';
      }
    }
  }

  render() {
    return (
      <div className='pull-down-container' ref={this.pullDownContainer}>
        <div
          className='pull-down-header'
          style={{ height: this.state.height + 'px' }}
          ref={this.pullDownHeader}
        >
          <div className='pull-down-content'>
            <i
              className={'pull-down-content--icon ' + this.state.iconClass}
              ref={this.iconPullDown}
            />
            <div className='pull-down-content--label'>{this.state.label}</div>
          </div>
        </div>
        <div className={'pull-down-layer'} ref={this.pullDownLayer} />
        {this.props.children}
      </div>
    )
  }
}
