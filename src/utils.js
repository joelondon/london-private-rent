import { range } from 'd3-array'
import { scaleQuantile } from 'd3-scale'
// import * as d3 from 'd3'
import featureCollection from './data/london-private-rents-detailed.json'
// import featureCollection from './data/london-private-rents.json'

// ATTEMPT TO COMBINE JSON AND CSV
// import featureCollection from './data/london-postcode-districts.json'
// import csv from './data/london-private-rents.csv'

export function updatePercentiles(accessor) {
  let { features } = featureCollection

  // d3.csv(csv, d3.autoType).then(data => {
  // features = features.map(feature => {
  //   feature.properties = {
  //     ...feature.properties,
  //     ...data
  //       .filter(district => district.district === feature.properties.district)
  //       .pop()
  //   }
  //   if (feature) return feature
  // })

  const scale = scaleQuantile()
    .domain(features.map(accessor))
    .range(range(10))

  const returnVal = {
    type: 'FeatureCollection',
    features: features.map(f => {
      const value = accessor(f)
      const properties = {
        ...f.properties,
        value,
        percentile: scale(value)
      }
      return { ...f, properties }
    })
  }
  return returnVal
  // })
}
