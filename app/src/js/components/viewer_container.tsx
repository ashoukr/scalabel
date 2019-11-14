import * as fa from '@fortawesome/free-solid-svg-icons/index'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconButton, TextField } from '@material-ui/core'
import FormGroup from '@material-ui/core/FormGroup'
import Grid from '@material-ui/core/Grid'
import React from 'react'
import SplitPane from 'react-split-pane'
import { splitPane } from '../action/common'
import Session from '../common/session'
import * as types from '../common/types'
import { ImageViewerConfigType, SplitType, ViewerConfigType } from '../functional/types'
import ViewerConfigUpdater from '../view_config/viewer_config'
import { Component } from './component'
import ImageViewer from './image_viewer'
import Label2dViewer from './label2d_viewer'
import Label3dViewer from './label3d_viewer'
// import MouseEventListeners from './mouse_event_listeners'
import PointCloudViewer from './point_cloud_viewer'

/** Generate string to use for react component key */
export function viewerContainerReactKey (id: number) {
  return `viewerContainer${id}`
}

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
        case types.ViewerConfigTypeName.IMAGE:
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
        case types.ViewerConfigTypeName.POINT_CLOUD:
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
        case types.ViewerConfigTypeName.IMAGE_3D:
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
      <SplitPane
        split={'horizontal'}
        size={'60px'}
        allowResize={false}
      >
        <Grid justify={'flex-end'} container>
          <FormGroup row={true}>
            <TextField
              value={
                (this._viewerConfig) ? this._viewerConfig.type :
                  types.ViewerConfigTypeName.UNKNOWN
              }
              select
              label='Viewer Type'
              // onChange={
              //   this.handleItemTypeChange
              // }
              inputProps={{
                'data-testid': 'viewer-type'
              }}
              SelectProps={{
                native: true
              }}
            >
              <option value={types.ViewerConfigTypeName.IMAGE}>Image</option>
              <option value={types.ViewerConfigTypeName.POINT_CLOUD}>
                Point Cloud
              </option>
              <option value={types.ViewerConfigTypeName.IMAGE_3D}>
                Image 3D
              </option>
            </TextField>
            <TextField
              value={
                (this._viewerConfig) ? this._viewerConfig.sensor : null
              }
              select
              label='Sensor'
              // onChange={
              //   this.handleItemTypeChange
              // }
              inputProps={{
                'data-testid': 'sensor'
              }}
              SelectProps={{
                native: true
              }}
            >
              {Object.keys(this.state.task.sensors).filter((key) =>
                (this._viewerConfig) ?
                  this.state.task.sensors[Number(key)].type ===
                    this._viewerConfig.type :
                  false
              ).map((key) =>
                <option value={Number(key)}>{key}</option>
              )}
            </TextField>
            <IconButton
              data-testid={'split-vertical'}
              onClick={() => {
                if (this._viewerConfig) {
                  Session.dispatch(splitPane(
                    this._viewerConfig.pane,
                    SplitType.VERTICAL,
                    this.props.id
                  ))
                }
              }}
            >
              <FontAwesomeIcon icon={fa.faColumns} size='xs'/>
            </IconButton>
            <IconButton
              data-testid={'split-horizontal'}
              onClick={() => {
                if (this._viewerConfig) {
                  Session.dispatch(splitPane(
                    this._viewerConfig.pane,
                    SplitType.HORIZONTAL,
                    this.props.id
                  ))
                }
              }}
            >
              <FontAwesomeIcon icon={fa.faColumns} size='xs' rotation={90}/>
            </IconButton>
          </FormGroup>
        </Grid>
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
      </SplitPane>
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
      if (viewerType === types.ViewerConfigTypeName.IMAGE ||
          types.ViewerConfigTypeName.IMAGE_3D) {
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
