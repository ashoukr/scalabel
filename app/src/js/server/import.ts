import _ from 'lodash'
import { AttributeToolType, LabelTypeName, ShapeTypeName } from '../common/types'
import { ItemExport, LabelExport } from '../functional/bdd_types'
import { makeItem, makeLabel } from '../functional/states'
import { Attribute, IndexedShapeType,
  ItemType, LabelType } from '../functional/types'

/**
 * Converts single exported item to frontend state format
 * @param item the item in export format
 * @param itemInd the item index (relative to task)
 * @param itemId the item id (relative to project)
 * @param attributesNameMap look up an attribute and its index from its name
 * @param attributeValueMap look up an attribute value's index
 * @param categoryNameMap look up a category's index from its name
 */
export function convertItemToImport (
  sequenceName: string,
  itemExportMap: {[id: number]: Partial<ItemExport>},
  itemInd: number, itemId: number,
  attributeNameMap: {[key: string]: [number, Attribute]},
  attributeValueMap: {[key: string]: number},
  categoryNameMap: {[key: string]: number},
  maxLabelId: number,
  maxShapeId: number,
  tracking: boolean
): [ItemType, number, number] {
  const urls: {[id: number]: string} = {}

  const labelExportIdToImportId: { [key: number]: number} = {}
  const labelImports: { [key: number]: LabelType } = {}
  const shapeImports: { [key: number]: IndexedShapeType } = {}
  for (const key of Object.keys(itemExportMap)) {
    const dataSourceId = Number(key)
    urls[dataSourceId] = itemExportMap[dataSourceId].url as string
    const labelsExport = itemExportMap[dataSourceId].labels
    if (labelsExport) {
      for (const labelExport of labelsExport) {
        if (tracking && labelExport.id in labelExportIdToImportId) {
          const labelId = labelExportIdToImportId[labelExport.id]
          labelImports[labelId].dataSources.push(dataSourceId)
          continue
        }

        const categories: number[] = []
        if (labelExport.category in categoryNameMap) {
          categories.push(categoryNameMap[labelExport.category])
        }

        const attributes = parseExportAttributes(
          labelExport.attributes,
          attributeNameMap,
          attributeValueMap
        )

        const [labelImport, indexedShapeImports, newMaxShapeId] =
          convertLabelToImport(
            labelExport,
            maxLabelId,
            itemInd,
            maxShapeId,
            dataSourceId,
            categories,
            attributes
          )

        if (tracking) {
          labelImport.track = labelExport.id
        }

        labelExportIdToImportId[labelExport.id] = labelImport.id
        labelImports[maxLabelId] = labelImport
        for (const indexedShape of indexedShapeImports) {
          shapeImports[indexedShape.id] = indexedShape
        }

        maxShapeId = newMaxShapeId
        maxLabelId++
      }
    }
  }

  const partialItemImport: Partial<ItemType> = {
    urls,
    index: itemInd,
    id: itemId
  }
  partialItemImport.sequenceName = sequenceName
  const itemImport = makeItem(partialItemImport)

  itemImport.labels = labelImports
  itemImport.shapes = shapeImports

  return [itemImport, maxLabelId, maxShapeId]
}

/**
 * parses attributes from BDD format (strings)
 * to internal format (index in config's attributes)
 * @param attributesExport the attributes to process
 * @param attributesNameMap look up an attribute and its index from its name
 * @param attributeValueMap look up an attribute value's index
 */
function parseExportAttributes (
  attributesExport: {[key: string]: (string[] | boolean) },
  attributeNameMap: {[key: string]: [number, Attribute]},
  attributeValueMap: {[key: string]: number}):
  {[key: number]: number[] } {
  const labelAttributes: {[key: number]: number[]} = {}
  Object.entries(attributesExport).forEach(([name, attributeList]) => {
    // get the config attribute that matches the exported attribute name
    if (name in attributeNameMap) {
      const [configIndex, currentAttribute] = attributeNameMap[name]
      // load the attribute based on its type
      if (currentAttribute.toolType === AttributeToolType.SWITCH) {
        // boolean attribute case- only two choices, not a list
        let value = 0
        const attributeVal = attributeList as boolean
        if (attributeVal === true) {
          value = 1
        }
        labelAttributes[configIndex] = [value]
      } else if (currentAttribute.toolType === AttributeToolType.LIST
        || currentAttribute.toolType === AttributeToolType.LONG_LIST) {
        // list attribute case- can choose multiple values
        const selectedIndices: number[] = []
        const attributeValues = attributeList as string[]
        attributeValues.forEach((value: string) => {
          // get the index of the selected value
          const valueIndex = attributeValueMap[value]
          if (valueIndex !== -1) {
            selectedIndices.push(valueIndex)
          }
        })
        labelAttributes[configIndex] = selectedIndices
      }
    }
  })
  return labelAttributes
}

 /**
  * based on the label in export format, create a label in internal formt
  * and update the corresponding shapes in the map
  * @param label the label in export format
  * @param shapesImport map to update, from shapeId to shape
  */
function convertLabelToImport (
  labelExport: LabelExport,
  labelId: number,
  item: number,
  maxShapeId: number,
  dataSourceId: number,
  category?: number[],
  attributes?: {[key: number]: number[]}
): [LabelType, IndexedShapeType[], number] {
  let shapeType = ShapeTypeName.UNKNOWN
  let labelType = LabelTypeName.EMPTY
  let shapeData = null

  if (labelExport.box2d) {
    shapeType = ShapeTypeName.RECT
    labelType = LabelTypeName.BOX_2D
    shapeData = labelExport.box2d
  } else if (labelExport.poly2d) {
    shapeType = ShapeTypeName.POLYGON_2D
    labelType = LabelTypeName.POLYGON_2D
    shapeData = labelExport.poly2d
  } else if (labelExport.box3d) {
    shapeType = ShapeTypeName.CUBE
    labelType = LabelTypeName.BOX_3D
    shapeData = labelExport.box3d
  }

  // if the label has any shapes, import them too
  const shapeIds: number[] = []
  const shapeImports: IndexedShapeType[] = []
  if (shapeData !== null) {
    shapeImports.push({
      id: maxShapeId + 1,
      label: [labelId],
      type: shapeType,
      shape: shapeData
    })
    maxShapeId++
    shapeIds.push(shapeImports[0].id)
  }

  const labelImport = makeLabel({
    id: labelId,
    type: labelType,
    item,
    shapes: shapeIds,
    manual: labelExport.manualShape,
    category,
    attributes,
    dataSources: [dataSourceId]
  })

  return [labelImport, shapeImports, maxShapeId]
}
