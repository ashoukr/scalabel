import { withStyles } from '@material-ui/styles'
import * as React from 'react'
import SplitPane from 'react-split-pane'
import { updateAll } from '../action/common'
import Session from '../common/session'
import { PaneType } from '../functional/types'
import { resizerStyles } from '../styles/split_pane'
import { Component } from './component'
import ViewerContainer, { viewerContainerReactKey } from './viewer_container'

interface ClassType {
  /** class name for resizer */
  resizer: string
}

interface Props extends PaneType {
  /** class names */
  classes: ClassType
}

/**
 * Wrapper for SplitPane
 */
class LabelPane extends Component<Props> {
  constructor (props: Props) {
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

    if (
      !this.props.firstChild ||
      !this.props.secondChild ||
      !(this.props.firstChild in this.state.user.layout.panes) ||
      !(this.props.secondChild in this.state.user.layout.panes)
    ) {
      return null
    }
    if (!this.props.split) {
      throw new Error('Missing split type')
    }
    if (!this.props.primarySize) {
      throw new Error('Missing primary size')
    }

    const firstPane = this.state.user.layout.panes[this.props.firstChild]
    const secondPane = this.state.user.layout.panes[this.props.secondChild]

    const firstChild = (<StyledLabelPane
      {...firstPane}
    />)
    const secondChild = (<StyledLabelPane
      {...secondPane}
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
        resizerClassName={this.props.classes.resizer}
      >
        {firstChild}
        {secondChild}
      </SplitPane>
    )
  }
}

const StyledLabelPane = withStyles(resizerStyles)(LabelPane)

export default StyledLabelPane
