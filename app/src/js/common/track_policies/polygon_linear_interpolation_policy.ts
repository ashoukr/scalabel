import { Track } from '../track'
import * as types from '../types'
import { TrackPolicy } from './track_policy'
/**
 * Class for linear interpolating polygon's
 */
export class LinearInterpolationPolygonPolicy extends TrackPolicy {
  constructor (track: Track) {
    super(track)
    this._policyType = types.TrackPolicyType.LINEAR_INTERPOLATION_POLYGON
  }
}
