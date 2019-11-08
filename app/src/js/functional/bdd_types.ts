import {
  ConfigType,
  CubeType,
  ExtrinsicsType,
  IntrinsicsType,
  ItemType,
  PolygonType,
  RectType,
  TaskStatus,
  TrackType
} from './types'

export interface TaskData {
  /** task config data that's constant throughout a session */
  config: ConfigType,
  /** current status of task */
  status: TaskStatus,
  /** items in task */
  Items: ItemType[],
  /** tracks for task */
  Tracks: TrackType
}

export interface ItemExport {
  /** project name */
  name: string
  /** item url */
  url: string
  /** sequence name */
  sequenceName: string
  /** id of data source */
  dataSource: number
  /** data type, overrides data source if present */
  dataType?: string
  /** intrinsics, overrides data source if present */
  intrinsics?: IntrinsicsType
  /** extrinsics, overrides data source if present */
  extrinsics?: ExtrinsicsType
  /** item attributes */
  attributes: { [key: string]: string[] }
  /** submitted timestamp */
  timestamp: number
  /** item labels */
  labels: LabelExport[]
}

export interface LabelExport {
  /** label id */
  id: number
  /** category */
  category: string
  /** label attributes- can be list or switch type */
  attributes: { [key: string]: (string[] | boolean) }
  /** if shape was manual */
  manualShape: boolean
  /** box2d label */
  box2d: RectType | null
  /** poly2d label */
  poly2d: PolygonType | null
  /** box3d label */
  box3d: CubeType | null
}
