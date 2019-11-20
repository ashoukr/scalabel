import { createStyles, IconButton } from '@material-ui/core'
import Grid from '@material-ui/core/Grid'
import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'
import CloseIcon from '@material-ui/icons/Close'
import ViewStreamIcon from '@material-ui/icons/ViewStream'
import { withStyles } from '@material-ui/styles'
import React from 'react'
import { deletePane, splitPane } from '../action/common'
import Session from '../common/session'
import * as types from '../common/types'
import { ImageViewerConfigType, SplitType, ViewerConfigType } from '../functional/types'
import ViewerConfigUpdater from '../view_config/viewer_config'
import { Component } from './component'
import ImageViewer from './image_viewer'
import Label2dViewer from './label2d_viewer'
import Label3dViewer from './label3d_viewer'
import PointCloudViewer from './point_cloud_viewer'

/** Generate string to use for react component key */
export function viewerContainerReactKey (id: number) {
  return `viewerContainer${id}`
}

const styles = () => createStyles({
  viewer_container_bar: {
    position: 'absolute',
    zIndex: 10
  },
  select: {
    'backgroundColor': 'rgba(34, 34, 34, 1)',
    'border': '1px solid #ced4da',
    'color': '#ced4da',
    'borderRadius': 4,
    'padding': '10px 26px 10px 12px',
    '&:focus': {
      borderRadius: 4
    },
    'margin-right': '5px'
  },
  icon: {
    color: '#ced4da'
  },
  icon90: {
    color: '#ced4da',
    transform: 'rotate(90deg)'
  }
})

interface ClassType {
  /** grid */
  viewer_container_bar: string
  /** select */
  select: string
  /** icon */
  icon: string
  /** icon rotated */
  icon90: string
}

interface Props {
  /** classes */
  classes: ClassType
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
      <div>
        <Grid
          justify={'flex-end'}
          container
          direction='row'
          classes={{
            container: this.props.classes.viewer_container_bar
          }}
        >
          <Select
            value={
              (this._viewerConfig) ? this._viewerConfig.type :
                types.ViewerConfigTypeName.UNKNOWN
            }
            // onChange={
            //   this.handleItemTypeChange
            // }
            classes={{ select: this.props.classes.select }}
            inputProps={{
              classes: {
                icon: this.props.classes.icon
              }
            }}
          >
            <MenuItem value={types.ViewerConfigTypeName.IMAGE}>Image</MenuItem>
            <MenuItem value={types.ViewerConfigTypeName.POINT_CLOUD}>
              Point Cloud
            </MenuItem>
            <MenuItem value={types.ViewerConfigTypeName.IMAGE_3D}>
              Image 3D
            </MenuItem>
          </Select>
          <Select
            value={
              (this._viewerConfig) ? this._viewerConfig.sensor : null
            }
            // onChange={
            //   this.handleItemTypeChange
            // }
            classes={{ select: this.props.classes.select }}
            inputProps={{
              classes: {
                icon: this.props.classes.icon
              }
            }}
          >
            {Object.keys(this.state.task.sensors).filter((key) =>
              (this._viewerConfig) ?
                this.state.task.sensors[Number(key)].type ===
                  this._viewerConfig.type :
                false
            ).map((key) =>
              <MenuItem value={Number(key)}>{key}</MenuItem>
            )}
          </Select>
          <IconButton
            className={this.props.classes.icon90}
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
            <ViewStreamIcon />
          </IconButton>
          <IconButton
            className={this.props.classes.icon}
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
            <ViewStreamIcon />
          </IconButton>
          <IconButton
            className={this.props.classes.icon}
            onClick={() => {
              if (this._viewerConfig) {
                Session.dispatch(deletePane(
                  this._viewerConfig.pane,
                  this.props.id
                ))
              }
            }}
          >
            <CloseIcon />
          </IconButton>
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

export default withStyles(styles, { withTheme: true })(ViewerContainer)
