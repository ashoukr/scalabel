import _ from 'lodash'
import * as THREE from 'three'
import { policyFromString } from '../../common/track_policies/track_policy'
import { LabelTypeName, TrackPolicyType } from '../../common/types'
import { makeState } from '../../functional/states'
import { CubeType, State } from '../../functional/types'
import { Box3D } from './box3d'
import { PURPLE } from './common'
import { TransformationControl } from './control/transformation_control'
import { Label3D } from './label3d'
import { Plane3D } from './plane3d'
import { Shape3D } from './shape3d'
/**
 * Make a new drawable label based on the label type
 * @param {string} labelType: type of the new label
 */
function makeDrawableLabel3D (
  labelType: string
): Label3D | null {
  switch (labelType) {
    case LabelTypeName.BOX_3D:
      return new Box3D()
    case LabelTypeName.PLANE_3D:
      return new Plane3D()
  }
  return null
}

/**s
 * List of drawable labels
 */
export class Label3DList {
  /** transformation control */
  public control: TransformationControl
  /** Scalabel id to labels */
  private _labels: {[labelId: number]: Label3D}
  /** ThreeJS Object id to labels */
  private _raycastMap: {[id: number]: Label3D}
  /** Recorded state of last update */
  private _state: State
  /** Scene for rendering */
  private _scene: THREE.Scene
  /** selected label Group */
  private _selectedLabelGroup: THREE.Group
  /** selected label Group bounding box */
  private _boundingBox: THREE.LineSegments
  /** List of ThreeJS objects for raycasting */
  private _raycastableShapes: Readonly<Array<Readonly<Shape3D>>>
  /** active camera */
  private _activeCamera?: THREE.Camera

  constructor () {
    this.control = new TransformationControl()
    this._labels = {}
    this._raycastMap = {}
    this._selectedLabelGroup = new THREE.Group()
    this._boundingBox = new THREE.LineSegments()
    this._scene = new THREE.Scene()
    this._raycastableShapes = []
    this._state = makeState()
  }

  /**
   * Return scene object
   */
  public get scene (): THREE.Scene {
    return this._scene
  }

  /**
   * Get selected label group
   */
  public get selectedLabelGroup (): THREE.Group {
    return this._selectedLabelGroup
  }

  /**
   * Get selected label group bounding box
   */
  public get boundingBox (): THREE.LineSegments {
    return this._boundingBox
  }

  /**
   * Get labels
   */
  public get labels (): {[labelId: number]: Label3D} {
    return this._labels
  }

  /**
   * Get id's of selected labels
   */
  public get selectedLabelIds (): {[index: number]: number[]} {
    return this._state.user.select.labels
  }

  /**
   * Get current policy type
   */
  public get policyType (): TrackPolicyType {
    return policyFromString(
      this._state.task.config.policyTypes[this._state.user.select.policyType]
    )
  }

  /**
   * Get index of current category
   */
  public get currentCategory (): number {
    return this._state.user.select.category
  }

  /**
   * update labels from the state
   */
  public updateState (state: State): void {
    this._state = state

    const newLabels: {[labelId: number]: Label3D} = {}
    const newRaycastableShapes: Array<Readonly<Shape3D>> = []
    const newRaycastMap: {[id: number]: Label3D} = {}
    const item = state.task.items[state.user.select.item]
    const prevItemLength = this._selectedLabelGroup.children.length

    for (const key of Object.keys(this._labels)) {
      const id = Number(key)
      if (!(id in item.labels)) {
        this._labels[id].detachFromPlane()
        this._labels[id].detachControl()

        for (const shape of Object.values(this._labels[id].shapes())) {
          this._scene.remove(shape)
        }
      }
    }
    for (const key of Object.keys(item.labels)) {
      const id = Number(key)
      if (id in this._labels) {
        newLabels[id] = this._labels[id]
      } else {
        const newLabel = makeDrawableLabel3D(item.labels[id].type)
        if (newLabel) {
          newLabels[id] = newLabel
        }
      }
      if (newLabels[id]) {
        newLabels[id].updateState(
          state, state.user.select.item, id, this._activeCamera
        )
        for (const shape of Object.values(newLabels[id].shapes())) {
          newRaycastableShapes.push(shape)
          newRaycastMap[shape.id] = newLabels[id]
          this._scene.add(shape)
        }

        newLabels[id].selected = false
      }
    }

    // Attach shapes to plane
    for (const key of Object.keys(item.labels)) {
      const id = Number(key)
      if (item.labels[id].type === LabelTypeName.BOX_3D) {
        const shape = item.shapes[item.labels[id].shapes[0]].shape as CubeType
        if (shape.surfaceId >= 0) {
          newLabels[id].attachToPlane(newLabels[shape.surfaceId] as Plane3D)
        }
      }
    }
    this._scene.remove(this._selectedLabelGroup)
    this._raycastableShapes = newRaycastableShapes
    this._labels = newLabels
    this._raycastMap = newRaycastMap

    const select = state.user.select
    if (select.item in select.labels) {
      const selectedLabelIds = select.labels[select.item]

      // Special behavior if there is only one label
      // axis align control, no bounding box
      if (selectedLabelIds.length === 1 &&
          selectedLabelIds[0] in this._labels) {
        this._selectedLabelGroup = new THREE.Group()

        this.addLabelsToGroup(selectedLabelIds)

        const cube = this._selectedLabelGroup.children[0]
        this._selectedLabelGroup.position.copy(cube.position)
        cube.position.sub(this._selectedLabelGroup.position)

        const cubeQuaternion = new THREE.Quaternion().copy(cube.quaternion)
        this._selectedLabelGroup.applyQuaternion(cubeQuaternion)
        cube.applyQuaternion(cubeQuaternion.inverse())
      } else {
        // Group has changed if labels have changed
        let groupChanged = false
        if (prevItemLength - 2 !== selectedLabelIds.length) {
          groupChanged = true
        } else {
          for (const cube of this._selectedLabelGroup.children) {
            if (cube === this.control || cube === this._boundingBox) {
              continue
            }
            const labelId = (cube as Shape3D).label.labelId
            if (!(selectedLabelIds.includes(labelId))) {
              groupChanged = true
              break
            }
          }
        }
        // Check if the group labels have changed
        if (groupChanged) {
          // Switch to rotation to ensure no group scaling
          this.control.onKeyDown(new KeyboardEvent('keydown', { key: 'r' }))

          this._selectedLabelGroup = new THREE.Group()
          this.addLabelsToGroup(selectedLabelIds)

          const bbox = new THREE.Box3().setFromObject(this._selectedLabelGroup)
          bbox.getCenter(this._selectedLabelGroup.position)
          for (const cube of this._selectedLabelGroup.children) {
            cube.position.sub(this._selectedLabelGroup.position)
          }

          const geometry = new THREE.BoxBufferGeometry(
            bbox.max.x - bbox.min.x,
            bbox.max.y - bbox.min.y,
            bbox.max.z - bbox.min.z)
          const edges = new THREE.EdgesGeometry(geometry)
          this._boundingBox = new THREE.LineSegments(edges,
            new THREE.LineBasicMaterial({ color: PURPLE }))
        } else {
          const groupMatrix = new THREE.Matrix4()
          groupMatrix.copy(this._selectedLabelGroup.matrix)
          this._selectedLabelGroup = new THREE.Group()
          this._selectedLabelGroup.applyMatrix(groupMatrix)
          this.addLabelsToGroup(selectedLabelIds)
          const groupMatrixInv = new THREE.Matrix4().getInverse(groupMatrix)
          for (const cube of this._selectedLabelGroup.children) {
            cube.applyMatrix(groupMatrixInv)
          }
        }
        this._selectedLabelGroup.add(this._boundingBox)
      }
      this._selectedLabelGroup.add(this.control)
      this.control.attach(this._selectedLabelGroup)
    } else {
      this._selectedLabelGroup = new THREE.Group()
      this._boundingBox = new THREE.LineSegments()
    }
    this._scene.add(this._selectedLabelGroup)
  }

  /**
   * Get raycastable list
   */
  public get raycastableShapes (): Readonly<Array<Readonly<Shape3D>>> {
    return this._raycastableShapes
  }

  /**
   * Get the label associated with the raycasted object 3d
   * @param obj
   */
  public getLabelFromRaycastedObject3D (
    obj: THREE.Object3D
  ): Label3D | null {
    while (obj.parent && !(obj.id in this._raycastMap)) {
      obj = obj.parent
    }

    if (obj.id in this._raycastMap) {
      return this._raycastMap[obj.id]
    }
    return null
  }

  /** Set active camera */
  public setActiveCamera (camera: THREE.Camera) {
    this._activeCamera = camera
  }

  /**
   * Get control if there is a group
   */
  private addLabelsToGroup (labelIds: number[]) {
    for (const labelId of labelIds) {
      this._labels[labelId].selected = true
      this._labels[labelId].addToSelectedGroup(this._selectedLabelGroup)
    }
  }
}
