import { Fields, Files } from 'formidable'
import * as fs from 'fs-extra'
import * as yaml from 'js-yaml'
import _ from 'lodash'
import { ItemTypeName, LabelTypeName } from '../common/types'
import { ItemExport } from '../functional/bdd_types'
import { makeDataSource, makeTask, makeTrack } from '../functional/states'
import {
  Attribute, ConfigType,
  DataSourceType, ItemType, TaskStatus, TaskType, TrackMapType } from '../functional/types'
import { convertItemToImport } from './import'
import Session from './server_session'
import * as types from './types'
import * as util from './util'

/**
 * convert fields to form and validate input
 * if invalid input is found, error is returned to user via alert
 */
export function parseForm (fields: Fields): Promise<types.CreationForm> {
  // Check that required fields were entered
  let projectName = fields[types.FormField.PROJECT_NAME] as string
  if (projectName === '') {
    return Promise.reject(Error('Please create a project name'))
  } else {
    projectName = projectName.replace(' ', '_')
  }

  const itemType = fields[types.FormField.ITEM_TYPE] as string
  if (itemType === '') {
    return Promise.reject(Error('Please choose an item type'))
  }

  const labelType = fields[types.FormField.LABEL_TYPE] as string
  if (labelType === '') {
    return Promise.reject(Error('Please choose a label type'))
  }

  // Task size is not required for videos
  let taskSize = 1 // video case
  if (fields[types.FormField.ITEM_TYPE] !== ItemTypeName.VIDEO) {
    if (fields[types.FormField.TASK_SIZE] === '') {
      return Promise.reject(Error('Please specify a task size'))
    } else {
      taskSize = parseInt(fields[types.FormField.TASK_SIZE] as string, 10)
    }
  }

  // Non-required fields
  const pageTitle = fields[types.FormField.PAGE_TITLE] as string
  const instructions = fields[types.FormField.INSTRUCTIONS_URL] as string

  // Ensure project name is not already in use
  return util.checkProjectName(projectName)
    .then((exists: boolean) => {
      if (exists) {
        return Promise.reject(Error('Project name already exists.'))
      }
      const demoMode = fields[types.FormField.DEMO_MODE] === 'true'
      const form = util.makeCreationForm(
        projectName, itemType, labelType, pageTitle, taskSize,
        instructions, demoMode
      )
      return form
    })
}

/**
 * Parses item, category, and attribute files from form
 */
export function parseFiles (labelType: string, files: Files)
  : Promise<types.FormFileData> {
  return Promise.all([
    parseItems(files),
    parseAttributes(files, labelType),
    parseCategories(files, labelType)])
    .then((result: [Array<Partial<ItemExport>>, Attribute[], string[]]) => {
      return {
        items: result[0],
        attributes: result[1],
        categories: result[2]
      }
    })
}

/**
 * Get default attributes if they weren't provided
 */
function getDefaultCategories (labelType: string): string[] {
  switch (labelType) {
    // TODO: add seg2d defaults (requires subcategories)
    case LabelTypeName.BOX_3D:
    case LabelTypeName.BOX_2D:
      return types.defaultBoxCategories
    case LabelTypeName.POLYLINE_2D:
      return types.defaultPolyline2DCategories
    default:
      return []
  }
}

/**
 * Read categories from yaml file at path
 */
function readCategoriesFile (path: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', (err: types.MaybeError, file: string) => {
      if (err) {
        reject(err)
        return
      }
      // TODO: support subcategories
      const categories = yaml.load(file)
      const categoriesList = []
      for (const category of categories) {
        categoriesList.push(category.name)
      }
      resolve(categoriesList)
    })
  })
}

/**
 * Load from category file
 * Use default if file is empty
 */
export function parseCategories (
  files: Files, labelType: string): Promise<string[]> {
  const categoryFile = files[types.FormField.CATEGORIES]
  if (util.formFileExists(categoryFile)) {
    return readCategoriesFile(categoryFile.path)
  } else {
    const categories = getDefaultCategories(labelType)
    return Promise.resolve(categories)
  }
}

/**
 * Get default attributes if they weren't provided
 */
function getDefaultAttributes (labelType: string): Attribute[] {
  switch (labelType) {
    case LabelTypeName.BOX_2D:
      return types.defaultBox2DAttributes
    default:
      return types.dummyAttributes
  }
}

/**
 * Read attributes from yaml file at path
 */
function readAttributesFile (path: string): Promise<Attribute[]> {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', (err: types.MaybeError, fileBytes: string) => {
      if (err) {
        reject(err)
        return
      }
      const attributes = yaml.load(fileBytes)
      resolve(attributes)
    })
  })
}

/**
 * Load from attributes file
 * Use default if file is empty
 */
export function parseAttributes (
  files: Files, labelType: string): Promise<Attribute[]> {
  const attributeFile = files[types.FormField.ATTRIBUTES]
  if (util.formFileExists(attributeFile)) {
    return readAttributesFile(attributeFile.path)
  } else {
    const defaultAttributes = getDefaultAttributes(labelType)
    return Promise.resolve(defaultAttributes)
  }
}

/**
 * Read items from yaml file at path
 */
function readItemsFile (path: string): Promise<Array<Partial<ItemExport>>> {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', (err: types.MaybeError, fileBytes: string) => {
      if (err) {
        reject(err)
        return
      }
      try {
        // might not have all fields defined, so use partial
        const items = yaml.load(fileBytes) as Array<Partial<ItemExport>>
        resolve(items)
      } catch {
        reject(Error('Improper formatting for items file'))
      }
    })
  })
}

/**
 * Load from items file
 * Group by video name
 */
export function parseItems (files: Files): Promise<Array<Partial<ItemExport>>> {
  const itemFile = files[types.FormField.ITEMS]
  if (util.formFileExists(itemFile)) {
    return readItemsFile(itemFile.path)
  } else {
    return Promise.reject(Error('No item file.'))
  }
}

/**
 * Marshal data into project format
 */
export function createProject (
  form: types.CreationForm,
  formFileData: types.FormFileData): Promise<types.Project> {

  const handlerUrl = util.getHandlerUrl(form.itemType, form.labelType)
  const bundleFile = util.getBundleFile(form.labelType)
  const [itemType, tracking] = util.getTracking(form.itemType)

  /* use arbitrary values for
   * submitTime, taskId, and policyTypes
   * assign these when tasks are created
   */
  const config: ConfigType = {
    projectName: form.projectName,
    itemType,
    labelTypes: [form.labelType],
    taskSize: form.taskSize,
    handlerUrl,
    pageTitle: form.pageTitle,
    instructionPage: form.instructions,
    bundleFile,
    categories: formFileData.categories,
    attributes: formFileData.attributes,
    taskId: '',
    submitTime: -1,
    submitted: false,
    tracking,
    policyTypes: [],
    demoMode: form.demoMode,
    autosave: true
  }

  // ensure that all videonames are set to default if empty
  let projectItems = formFileData.items
  projectItems.forEach((itemExport) => {
    if (itemExport.sequenceName === undefined) {
      itemExport.sequenceName = ''
    }
  })

  const dataSources: {[id: number]: DataSourceType} = {}
  if (itemType !== ItemTypeName.FUSION) {
    // Make default data source for single data type labeling
    dataSources[-1] = makeDataSource(-1, 'default', itemType)
  }

  // With tracking, order by videoname lexicographically and split according
  // to videoname. It should be noted that a stable sort must be used to
  // maintain ordering provided in the image list file
  projectItems = _.sortBy(projectItems, [(item) => item.sequenceName])
  const project: types.Project = {
    config,
    items: projectItems,
    dataSources: {}
  }
  return Promise.resolve(project)
}

/**
 * Save a project
 */
export function saveProject (project: types.Project): Promise<void> {
  const key = util.getProjectKey(project.config.projectName)
  const data = JSON.stringify(project, null, 2)
  return Session.getStorage().save(key, data)
}

/**
 * Create two maps for quick lookup of attribute data
 * @param configAttributes the attributes from config file
 * first RV: map from attribute name to attribute and its index
 * second RV: map from attribute value to its index within that attribute
 */
function getAttributeMaps (
  configAttributes: Attribute[]):
  [{[key: string]: [number, Attribute]}, {[key: string]: number}] {
  const attributeNameMap: {[key: string]: [number, Attribute]} = {}
  const attributeValueMap: {[key: string]: number} = {}
  for (let attrInd = 0; attrInd < configAttributes.length; attrInd++) {
    const configAttribute = configAttributes[attrInd]
    // map attribute name to its index and its value
    attributeNameMap[configAttribute.name] = [attrInd, configAttribute]
    // map attribute values to their indices (if its a list)
    if (configAttribute.toolType === 'list') {
      const values = configAttribute.values
      for (let valueInd = 0; valueInd < values.length; valueInd++) {
        const value = values[valueInd]
        attributeValueMap[value] = valueInd
      }
    }
  }
  return [attributeNameMap, attributeValueMap]
}

/**
 * Create a map for quick lookup of category data
 * @param configCategories the categories from config file
 * returns a map from category value to its index
 */
function getCategoryMap (
  configCategories: string[]): {[key: string]: number} {
  const categoryNameMap: {[key: string]: number} = {}
  for (let catInd = 0; catInd < configCategories.length; catInd++) {
    // map category names to their indices
    const category = configCategories[catInd]
    categoryNameMap[category] = catInd
  }
  return categoryNameMap
}

// /**
//  * gets the max of values and currMax
//  * @param values an array of numbers in string format
//  */
// function getMax (values: string[], oldMax: number): number {
//   const numericValues = values.map((value: string) => {
//     return parseInt(value, 10)
//   })
//   let currMax = -1
//   if (numericValues.length > 0) {
//     currMax = numericValues.reduce((a, b) => {
//       return Math.max(a, b)
//     })
//   }
//   return Math.max(currMax, oldMax)
// }

/**
 * Split project into tasks
 * Each consists of the task portion of a frontend state
 */
export function createTasks (project: types.Project): Promise<TaskType[]> {
  // Filter invalid items, condition depends on whether labeling fusion data
  const items = (project.config.itemType === ItemTypeName.FUSION) ?
    project.items.filter((itemExport) =>
      itemExport.dataType === undefined &&
      itemExport.dataSource !== undefined &&
      itemExport.timestamp !== undefined &&
      itemExport.dataSource in project.dataSources
    ) :
    project.items.filter((itemExport) =>
      !itemExport.dataType ||
      itemExport.dataType === project.config.itemType
    )
  let taskSize = project.config.taskSize

  /* create quick lookup dicts for conversion from export type
   * to external type for attributes/categories
   * this avoids lots of indexof calls which slows down creation */
  const [attributeNameMap, attributeValueMap] = getAttributeMaps(
    project.config.attributes)
  const categoryNameMap = getCategoryMap(project.config.categories)

  const dataSources: {[id: number]: DataSourceType} = project.dataSources
  if (project.config.itemType !== ItemTypeName.FUSION) {
    let maxDataSourceId =
      Math.max(...Object.keys(dataSources).map((key) => Number(key)))
    for (const itemExport of items) {
      if (itemExport.dataType) {
        dataSources[maxDataSourceId + 1] = makeDataSource(
          maxDataSourceId,
          '',
          itemExport.dataType,
          itemExport.sequenceName,
          itemExport.intrinsics,
          itemExport.extrinsics
        )
        itemExport.dataSource = maxDataSourceId
        itemExport.dataType = undefined
        maxDataSourceId++
      } else if (
        itemExport.dataSource === undefined ||
        !(itemExport.dataSource in project.dataSources)
      ) {
        itemExport.dataSource = -1
      }
    }
  }

  const tasks: TaskType[] = []
  // taskIndices contains each [start, stop) range for every task
  const taskIndices: number[] = []
  const sequenceNames: string[] = []
  if (project.config.tracking) {
    let prevSequenceName: string
    items.forEach((value, index) => {
      if (value.sequenceName !== undefined) {
        if (value.sequenceName !== prevSequenceName) {
          taskIndices.push(index)
          prevSequenceName = value.sequenceName
          sequenceNames.push(value.sequenceName)
        }
      }
    })
  } else {
    for (let i = 0; i < items.length; i += taskSize) {
      taskIndices.push(i)
    }
  }
  taskIndices.push(items.length)
  let taskStartIndex: number
  let taskEndIndex: number
  for (let i = 0; i < taskIndices.length - 1; i ++) {
    taskStartIndex = taskIndices[i]
    taskEndIndex = taskIndices[i + 1]
    const taskItemsExport = items.slice(taskStartIndex, taskEndIndex)

    // Map from data source id to list of item exports
    const itemExportsByDataSource:
      {[id: number]: Array<Partial<ItemExport>>} = {}
    for (const itemExport of taskItemsExport) {
      if (itemExport.dataSource !== undefined) {
        if (!(itemExport.dataSource in itemExportsByDataSource)) {
          itemExportsByDataSource[itemExport.dataSource] = []
        }
        itemExportsByDataSource[itemExport.dataSource].push(itemExport)
      }
    }

    taskSize = 0
    let largestDataSource = -1
    const dataSourceMatchingIndices: {[id: number]: number} = {}
    for (const key of Object.keys(itemExportsByDataSource)) {
      const dataSourceId = Number(key)
      itemExportsByDataSource[dataSourceId] = _.sortBy(
        itemExportsByDataSource[dataSourceId],
        [(itemExport) => (itemExport.timestamp === undefined) ?
          0 : itemExport.timestamp]
      )
      taskSize = Math.max(
        taskSize, itemExportsByDataSource[dataSourceId].length
      )
      if (taskSize === itemExportsByDataSource[dataSourceId].length) {
        largestDataSource = dataSourceId
      }
      dataSourceMatchingIndices[dataSourceId] = 0
    }

    /* assign task id,
     and update task size in case there aren't enough items */
    const config: ConfigType = {
      ...project.config,
      taskSize,
      taskId: util.index2str(i)
    }

    // based on the imported labels, compute max ids
    let maxLabelId = -1
    let maxShapeId = -1
    // max order is the total number of labels
    let maxOrder = 0

    // convert from export format to internal format
    const itemsForTask: ItemType[] = []
    const trackMap: TrackMapType = {}
    for (let itemInd = 0; itemInd < taskSize; itemInd += 1) {
      const timestampToMatch = itemExportsByDataSource[largestDataSource][
        dataSourceMatchingIndices[largestDataSource]
      ] as number
      const itemExportMap: {[id: number]: Partial<ItemExport>} = {}
      for (const key of Object.keys(dataSourceMatchingIndices)) {
        const dataSourceId = Number(key)
        let newIndex = dataSourceMatchingIndices[dataSourceId]
        const itemExports = itemExportsByDataSource[dataSourceId]
        while (newIndex < itemExports.length - 1 &&
               Math.abs(itemExports[newIndex + 1].timestamp as number -
                        timestampToMatch) <
               Math.abs(itemExports[newIndex].timestamp as number -
                        timestampToMatch)
        ) {
          newIndex++
        }
        dataSourceMatchingIndices[dataSourceId] = newIndex
        itemExportMap[dataSourceId] = itemExports[newIndex]
      }

      // id is not relative to task, unlike index
      const itemId = taskStartIndex + itemInd
      const [newItem, newMaxLabelId, newMaxShapeId] = convertItemToImport(
        sequenceNames[i],
        itemExportMap,
        itemInd,
        itemId,
        attributeNameMap,
        attributeValueMap,
        categoryNameMap,
        maxLabelId,
        maxShapeId,
        project.config.tracking
      )

      if (project.config.tracking) {
        for (const label of Object.values(newItem.labels)) {
          if (label.track >= 0 && !(label.track in trackMap)) {
            trackMap[label.track] = makeTrack(label.track)
          }
          trackMap[label.track].labels[label.item] = label.id
        }
      }

      maxLabelId = newMaxLabelId
      maxShapeId = newMaxShapeId
      maxOrder += Object.keys(newItem.labels).length

      itemsForTask.push(newItem)

      dataSourceMatchingIndices[largestDataSource]++
    }

    // update the num labels/shapes based on imports
    const taskStatus: TaskStatus = {
      maxLabelId,
      maxShapeId,
      maxOrder,
      maxTrackId: -1
    }

    const partialTask: Partial<TaskType> = {
      config,
      items: itemsForTask,
      status: taskStatus,
      dataSources,
      tracks: trackMap
    }
    const task = makeTask(partialTask)
    tasks.push(task)
  }
  return Promise.resolve(tasks)
}

/**
 * Saves a list of tasks
 */
export function saveTasks (tasks: TaskType[]): Promise<void[]> {
  const promises: Array<Promise<void>> = []
  for (const task of tasks) {
    const key = util.getTaskKey(task.config.projectName, task.config.taskId)
    const data = JSON.stringify(task, null, 2)
    promises.push(Session.getStorage().save(key, data))
  }
  return Promise.all(promises)
}
