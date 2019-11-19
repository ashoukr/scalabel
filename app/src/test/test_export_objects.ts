import { ItemExport } from '../js/functional/bdd_types'

export const sampleItemExportImage: ItemExport = {
  name: 'https://s3-us-west-2.amazonaws.com/scalabel-public/demo/frames/intersection-0000051.jpg',
  url: 'https://s3-us-west-2.amazonaws.com/scalabel-public/demo/frames/intersection-0000051.jpg',
  videoName: 'b',
  attributes: {},
  timestamp: 0,
  sensor: -1,
  labels: [
    {
      id: 0,
      category: 'person',
      attributes: {},
      manualShape: true,
      box2d: {
        x1: 317.9044230030514,
        y1: 192.46537396121883,
        x2: 676.9071930861539,
        y2: 411.85595567867034
      },
      poly2d: null,
      box3d: null
    },
    {
      id: 1,
      category: 'person',
      attributes: {},
      manualShape: true,
      box2d: {
        x1: 459.5110712024974,
        y1: 276.2326869806094,
        x2: 752.6966667703645,
        y2: 400.88642659279776
      },
      poly2d: null,
      box3d: null
    },
    {
      id: 2,
      category: 'person',
      attributes: {},
      manualShape: true,
      box2d: {
        x1: 746.7132872689795,
        y1: 137.61772853185596,
        x2: 1018.9570545819988,
        y2: 294.1828254847645
      },
      poly2d: null,
      box3d: null
    }
  ]
}

export const sampleStateExportImage: ItemExport[] =
  [
    {
      name: 'https://s3-us-west-2.amazonaws.com/scalabel-public/demo/frames/intersection-0000051.jpg',
      url: 'https://s3-us-west-2.amazonaws.com/scalabel-public/demo/frames/intersection-0000051.jpg',
      videoName: 'b',
      attributes: {},
      timestamp: 0,
      sensor: -1,
      labels: [
        {
          id: 0,
          category: 'person',
          attributes: {},
          manualShape: true,
          box2d: {
            x1: 317.9044230030514,
            y1: 192.46537396121883,
            x2: 676.9071930861539,
            y2: 411.85595567867034
          },
          poly2d: null,
          box3d: null
        },
        {
          id: 1,
          category: 'person',
          attributes: {},
          manualShape: true,
          box2d: {
            x1: 459.5110712024974,
            y1: 276.2326869806094,
            x2: 752.6966667703645,
            y2: 400.88642659279776
          },
          poly2d: null,
          box3d: null
        },
        {
          id: 2,
          category: 'person',
          attributes: {},
          manualShape: true,
          box2d: {
            x1: 746.7132872689795,
            y1: 137.61772853185596,
            x2: 1018.9570545819988,
            y2: 294.1828254847645
          },
          poly2d: null,
          box3d: null
        }
      ]
    },
    {
      name: 'https://s3-us-west-2.amazonaws.com/scalabel-public/demo/frames/intersection-0000052.jpg',
      url: 'https://s3-us-west-2.amazonaws.com/scalabel-public/demo/frames/intersection-0000052.jpg',
      videoName: 'b',
      attributes: {},
      timestamp: 1,
      labels: [],
      sensor: -1
    },
    {
      name: 'https://s3-us-west-2.amazonaws.com/scalabel-public/demo/frames/intersection-0000053.jpg',
      url: 'https://s3-us-west-2.amazonaws.com/scalabel-public/demo/frames/intersection-0000053.jpg',
      videoName: 'b',
      attributes: {},
      timestamp: 2,
      labels: [],
      sensor: -1
    },
    {
      name: 'https://s3-us-west-2.amazonaws.com/scalabel-public/demo/frames/intersection-0000054.jpg',
      url: 'https://s3-us-west-2.amazonaws.com/scalabel-public/demo/frames/intersection-0000054.jpg',
      videoName: 'b',
      attributes: {},
      timestamp: 3,
      labels: [],
      sensor: -1
    },
    {
      name: 'https://s3-us-west-2.amazonaws.com/scalabel-public/demo/frames/intersection-0000055.jpg',
      url: 'https://s3-us-west-2.amazonaws.com/scalabel-public/demo/frames/intersection-0000055.jpg',
      videoName: 'b',
      attributes: {},
      timestamp: 4,
      labels: [],
      sensor: -1
    }]

export const sampleItemExportImagePolygon: ItemExport = {
  name: 'https://s3-us-west-2.amazonaws.com/scalabel-public/demo/frames/intersection-0000051.jpg',
  url: 'https://s3-us-west-2.amazonaws.com/scalabel-public/demo/frames/intersection-0000051.jpg',
  videoName: 'b',
  attributes: {},
  timestamp: 0,
  sensor: -1,
  labels: [
    {
      id: 0,
      category: 'person',
      attributes: {},
      manualShape: true,
      box2d: null,
      poly2d: {
        points: [
          {
            x: 100.9044230030514,
            y: 100.46537396121883,
            type: 'vertex'
          },
          {
            x: 200.9044230030514,
            y: 100.46537396121883,
            type: 'vertex'
          },
          {
            x: 200.9044230030514,
            y: 200.46537396121883,
            type: 'vertex'
          }
        ]
      },
      box3d: null
    },
    {
      id: 1,
      category: 'person',
      attributes: {},
      manualShape: true,
      box2d: null,
      poly2d: {
        points: [
          {
            x: 300.9044230030514,
            y: 300.46537396121883,
            type: 'vertex'
          },
          {
            x: 400.9044230030514,
            y: 400.46537396121883,
            type: 'vertex'
          },
          {
            x: 350.9044230030514,
            y: 300.46537396121883,
            type: 'bezier'
          },
          {
            x: 325.9044230030514,
            y: 200.46537396121883,
            type: 'bezier'
          },
          {
            x: 400.9044230030514,
            y: 100.46537396121883,
            type: 'vertex'
          }
        ]
      },
      box3d: null
    },
    {
      id: 2,
      category: 'person',
      attributes: {},
      manualShape: true,
      box2d: null,
      poly2d: {
        points: [
          {
            x: 400.9044230030514,
            y: 400.46537396121883,
            type: 'vertex'
          },
          {
            x: 800.9044230030514,
            y: 100.46537396121883,
            type: 'vertex'
          },
          {
            x: 100.9044230030514,
            y: 100.46537396121883,
            type: 'vertex'
          }
        ]
      },
      box3d: null
    }
  ]
}

export const sampleStateExportImagePolygon: ItemExport[] =
  [
    {
      name: 'https://s3-us-west-2.amazonaws.com/scalabel-public/demo/frames/intersection-0000051.jpg',
      url: 'https://s3-us-west-2.amazonaws.com/scalabel-public/demo/frames/intersection-0000051.jpg',
      videoName: 'b',
      attributes: {},
      timestamp: 0,
      sensor: -1,
      labels: [
        {
          id: 0,
          category: 'person',
          attributes: {},
          manualShape: true,
          box2d: null,
          poly2d: {
            points: [
              {
                x: 100.9044230030514,
                y: 100.46537396121883,
                type: 'vertex'
              },
              {
                x: 200.9044230030514,
                y: 100.46537396121883,
                type: 'vertex'
              },
              {
                x: 200.9044230030514,
                y: 200.46537396121883,
                type: 'vertex'
              }
            ]
          },
          box3d: null
        },
        {
          id: 1,
          category: 'person',
          attributes: {},
          manualShape: true,
          box2d: null,
          poly2d: {
            points: [
              {
                x: 300.9044230030514,
                y: 300.46537396121883,
                type: 'vertex'
              },
              {
                x: 400.9044230030514,
                y: 400.46537396121883,
                type: 'vertex'
              },
              {
                x: 350.9044230030514,
                y: 300.46537396121883,
                type: 'bezier'
              },
              {
                x: 325.9044230030514,
                y: 200.46537396121883,
                type: 'bezier'
              },
              {
                x: 400.9044230030514,
                y: 100.46537396121883,
                type: 'vertex'
              }
            ]
          },
          box3d: null
        },
        {
          id: 2,
          category: 'person',
          attributes: {},
          manualShape: true,
          box2d: null,
          poly2d: {
            points: [
              {
                x: 400.9044230030514,
                y: 400.46537396121883,
                type: 'vertex'
              },
              {
                x: 800.9044230030514,
                y: 100.46537396121883,
                type: 'vertex'
              },
              {
                x: 100.9044230030514,
                y: 100.46537396121883,
                type: 'vertex'
              }
            ]
          },
          box3d: null
        }
      ]
    },
    {
      name: 'https://s3-us-west-2.amazonaws.com/scalabel-public/demo/frames/intersection-0000052.jpg',
      url: 'https://s3-us-west-2.amazonaws.com/scalabel-public/demo/frames/intersection-0000052.jpg',
      videoName: 'b',
      attributes: {},
      timestamp: 1,
      labels: [],
      sensor: -1
    },
    {
      name: 'https://s3-us-west-2.amazonaws.com/scalabel-public/demo/frames/intersection-0000053.jpg',
      url: 'https://s3-us-west-2.amazonaws.com/scalabel-public/demo/frames/intersection-0000053.jpg',
      videoName: 'b',
      attributes: {},
      timestamp: 2,
      labels: [],
      sensor: -1
    },
    {
      name: 'https://s3-us-west-2.amazonaws.com/scalabel-public/demo/frames/intersection-0000054.jpg',
      url: 'https://s3-us-west-2.amazonaws.com/scalabel-public/demo/frames/intersection-0000054.jpg',
      videoName: 'b',
      attributes: {},
      timestamp: 3,
      labels: [],
      sensor: -1
    },
    {
      name: 'https://s3-us-west-2.amazonaws.com/scalabel-public/demo/frames/intersection-0000055.jpg',
      url: 'https://s3-us-west-2.amazonaws.com/scalabel-public/demo/frames/intersection-0000055.jpg',
      videoName: 'b',
      attributes: {},
      timestamp: 4,
      labels: [],
      sensor: -1
    }]
