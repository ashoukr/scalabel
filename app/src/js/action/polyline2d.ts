import { LabelTypeName, ShapeTypeName } from '../common/types'
import { makeLabel, makePolyline } from '../functional/states'
import { PathPoint2DType } from '../functional/types'
import * as actions from './common'
import { AddLabelsAction } from './types'

/**
 * Create AddLabelAction to create a polyline2d label
 * @param itemIndex
 * @param category
 * @param points list of the control points
 * @param types list of the type of the control points
 * @return {AddLabelAction}
 */
export function addPolyine2dLabel (
  itemIndex: number,
  sensor: number,
  category: number[],
  points: PathPoint2DType[]
)
  : AddLabelsAction {
  const polyline = makePolyline({ points })
  const label = makeLabel({
    type: LabelTypeName.POLYLINE_2D, category, sensors: [sensor]
  })
  return actions.addLabel(
    itemIndex, label, [ShapeTypeName.POLYLINE_2D], [polyline]
  )
}
