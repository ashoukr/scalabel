import { createStyles } from '@material-ui/core'
import * as React from 'react'
import SplitPane from 'react-split-pane'
import { updateAll } from '../action/common'
import Session from '../common/session'
import { PaneType } from '../functional/types'
import ViewerContainer, { viewerContainerReactKey } from './viewer_container'
import { withStyles } from '@material-ui/styles'

/**
 * Wrapper for SplitPane
 */
class LabelPane extends React.Component<PaneType> {
  constructor (props: PaneType) {
    super(props)
  }

  /** Override render */
  public render () {
    if (this.props.viewerId >= 0) {
      // Leaf, render viewer container
      return (<ViewerContainer
        id={this.props.viewerId}
        key={viewerContainerReactKey(this.props.viewerId)}
      />)
    }

    if (!this.props.firstChild || !this.props.secondChild) {
      return null
    }
    if (!this.props.split) {
      throw new Error('Missing split type')
    }
    if (!this.props.primarySize) {
      throw new Error('Missing primary size')
    }

    const firstChild = (<LabelPane
      {...this.props.firstChild}
    />)

    const secondChild = (<LabelPane
      {...this.props.secondChild}
    />)

    return (
      <SplitPane
        split={this.props.split}
        minSize={`${this.props.minPrimarySize}%`}
        maxSize={`${this.props.maxPrimarySize}%`}
        size={`${this.props.primarySize}%`}
        primary={this.props.primary}
        onChange={() => Session.dispatch(updateAll())}
        allowResize
      >
        {firstChild}
        {secondChild}
      </SplitPane>
    )
  }
}

const styles = () => createStyles({
  Resizer: {
    'background': 'rgba(150, 150, 150, 1)',
    'opacity': 0.2,
    'zIndex': 1,
    '-moz-box-sizing': 'border-box',
    '-webkit-box-sizing': 'border-box',
    'box-sizing': 'border-box',
    '-moz-background-clip': 'padding',
    '-webkit-background-clip': 'padding',
    'background-clip': 'padding-box',
    '&:hover': {
      '-webkit-transition': 'all 2s ease',
      'transition': 'all 2s ease'
    },
    '&.horizontal': {
      'height': '11px',
      'margin': '-5px 0',
      'border-top': '5px solid rgba(255, 255, 255, 0)',
      'border-bottom': '5px solid rgba(255, 255, 255, 0)',
      'cursor': 'row-resize',
      'width': '100%'
    },
    '&.vertical': {
      'width': '11px',
      'margin': '0 -5px',
      'border-left': '5px solid rgba(255, 255, 255, 0)',
      'border-right': '5px solid rgba(255, 255, 255, 0)',
      'cursor': 'col-resize',
      '&:hover': {
        'border-top': '5px solid rgba(100, 100, 100, 1)',
        'border-bottom': '5px solid rgba(100, 100, 100, 1)'
      }
    },
    '&.disabled': {
      'cursor': 'not-allowed',
      '&:hover': {
        'border-color': 'transparent'
      }
    }
  }
})

export default withStyles(styles, { withTheme: true })(LabelPane)
