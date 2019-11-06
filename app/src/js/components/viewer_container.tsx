import React from 'react'
import Session from '../common/session'
import * as types from '../common/types'
import { ImageViewerConfigType, ViewerConfigType } from '../functional/types'
import ViewerConfigUpdater from '../view_config/viewer_config'
import { Component } from './component'
import ImageViewer from './image_viewer'
import Label2dViewer from './label2d_viewer'
import Label3dViewer from './label3d_viewer'
// import MouseEventListeners from './mouse_event_listeners'
import PointCloudViewer from './point_cloud_viewer'

interface Props {
  /** id of the viewer, for referencing viewer config in state */
  id: number
}

/**
 * Canvas Viewer
 */
class ViewerContainer extends Component<Props> {
  /** Moveable container */
  private _container: HTMLDivElement | null
  /** viewer config */
  private _viewerConfig?: ViewerConfigType
  /** Manage viewer config */
  private _viewerConfigUpdater: ViewerConfigUpdater

  /** UI handler */
  private _keyDownHandler: (e: KeyboardEvent) => void
  /** UI handler */
  private _keyUpHandler: (e: KeyboardEvent) => void

  /**
   * Constructor
   * @param {Object} props: react props
   */
  constructor (props: Props) {
    super(props)
    this._container = null
    this._viewerConfigUpdater = new ViewerConfigUpdater()

    const state = Session.getState()
    if (this.props.id in state.user.viewerConfigs) {
      this._viewerConfig = state.user.viewerConfigs[this.props.id]
    }

    this._keyDownHandler = this.onKeyDown.bind(this)
    this._keyUpHandler = this.onKeyUp.bind(this)
  }

  /**
   * Run when component mounts
   */
  public componentDidMount () {
    super.componentDidMount()
    document.addEventListener('keydown', this._keyDownHandler)
    document.addEventListener('keyup', this._keyUpHandler)
  }

  /**
   * Run when component unmounts
   */
  public componentWillUnmount () {
    super.componentWillUnmount()
    document.removeEventListener('keydown', this._keyDownHandler)
    document.removeEventListener('keyup', this._keyUpHandler)
  }

  /**
   * Render function
   * @return {React.Fragment} React fragment
   */
  public render () {
    const id = this.props.id

    const views: React.ReactElement[] = []
    if (this._viewerConfig) {
      const config = this._viewerConfig
      switch (config.type) {
        case types.ViewerConfigType.IMAGE:
          views.push(
            <ImageViewer
              key={`imageView${id}`} display={this._container} id={id}
            />
          )
          views.push(
            <Label2dViewer
              key={`label2dView${id}`} display={this._container} id={id}
            />
          )
          break
        case types.ViewerConfigType.POINT_CLOUD:
          views.push(
            <PointCloudViewer
              key={`pointCloudView${id}`} display={this._container} id={id}
            />
          )
          views.push(
            <Label3dViewer
              key={`label3dView${id}`} display={this._container} id={id}
            />
          )
          break
        case types.ViewerConfigType.IMAGE_3D:
          views.push(
            <ImageViewer
              key={`imageView${id}`} display={this._container} id={id}
            />
          )
          views.push(
            <Label3dViewer
              key={`label3dView${id}`} display={this._container} id={id}
            />
          )
          break
      }
    }

    return (
          <div
            ref={(element) => {
              if (element && this._container !== element) {
                this._container = element
                this._viewerConfigUpdater.setContainer(this._container)
                this.forceUpdate()
              }
            }}
            style={{
              display: 'block',
              height: '100%',
              position: 'absolute',
              overflow: 'hidden',
              outline: 'none',
              width: '100%'
            }}
            onMouseDown={ (e) => this.onMouseDown(e) }
            onMouseUp={ (e) => this.onMouseUp(e) }
            onMouseMove={ (e) => this.onMouseMove(e) }
            onMouseEnter={ (e) => this.onMouseEnter(e) }
            onMouseLeave={ (e) => this.onMouseLeave(e) }
            onDoubleClick={ (e) => this.onDoubleClick(e) }
            onWheel ={ (e) => this.onWheel(e) }
          >
            {views}
          </div>
    )
  }

  /**
   * Run when state is updated
   * @param state
   */
  public componentDidUpdate (): void {
    const viewerConfig = this.state.user.viewerConfigs[this.props.id]
    this._viewerConfig = viewerConfig
    if (viewerConfig && this._container) {
      const viewerType = viewerConfig.type
      if (viewerType === types.ViewerConfigType.IMAGE ||
          types.ViewerConfigType.IMAGE_3D) {
        this._container.scrollTop =
          (viewerConfig as ImageViewerConfigType).displayTop
        this._container.scrollLeft =
          (viewerConfig as ImageViewerConfigType).displayLeft
      }
    }
    this._viewerConfigUpdater.updateState(this.state, this.props.id)
  }

  /**
   * Handle mouse down
   * @param e
   */
  private onMouseDown (e: React.MouseEvent) {
    this._viewerConfigUpdater.onMouseDown(e)
  }

  /**
   * Handle mouse up
   * @param e
   */
  private onMouseUp (e: React.MouseEvent) {
    this._viewerConfigUpdater.onMouseUp(e)
  }

  /**
   * Handle mouse move
   * @param e
   */
  private onMouseMove (e: React.MouseEvent) {
    this._viewerConfigUpdater.onMouseMove(e)
  }

  /**
   * Handle double click
   * @param e
   */
  private onDoubleClick (e: React.MouseEvent) {
    this._viewerConfigUpdater.onDoubleClick(e)
  }

  /**
   * Handle mouse leave
   * @param e
   */
  private onMouseEnter (_e: React.MouseEvent) {
    Session.activeViewerId = this.props.id
  }

  /**
   * Handle mouse leave
   * @param e
   */
  private onMouseLeave (_e: React.MouseEvent) {
    return
  }

  /**
   * Handle mouse wheel
   * @param e
   */
  private onWheel (e: React.WheelEvent) {
    this._viewerConfigUpdater.onWheel(e)
  }

  /**
   * Handle key down
   * @param e
   */
  private onKeyUp (e: KeyboardEvent) {
    if (Session.activeViewerId === this.props.id) {
      this._viewerConfigUpdater.onKeyUp(e)
    }
  }

  /**
   * Handle key down
   * @param e
   */
  private onKeyDown (e: KeyboardEvent) {
    if (Session.activeViewerId === this.props.id) {
      this._viewerConfigUpdater.onKeyDown(e)
    }
  }
}

export default ViewerContainer
