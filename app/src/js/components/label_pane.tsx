import * as React from 'react'
import SplitPane from 'react-split-pane'
import { PaneType } from '../functional/types'
import ViewerContainer, { viewerContainerReactKey } from './viewer_container'

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
      {...this.props.firstChild}
    />)

    return (
      <SplitPane
        split={this.props.split}
        minSize={`${this.props.minPrimarySize}%`}
        maxSize={`${this.props.maxPrimarySize}%`}
        size={`${this.props.primarySize}%`}
        primary={this.props.primary}
      >
        {firstChild}
        {secondChild}
      </SplitPane>
    )
  }
}

export default LabelPane
