import { range } from 'd3-array'
import { scaleQuantile } from 'd3-scale'
import { interpolateViridis } from 'd3-scale-chromatic'
import featureCollection from './data/london-private-rents.json'

export function updatePercentiles(accessor) {
  let { features } = featureCollection

  const scale = scaleQuantile()
    .domain(features.map(accessor).filter(el => el !== undefined))
    .range(range(0,10,1))

  const returnVal = {
    type: 'FeatureCollection',
    features: features.filter(f => f.geometry !== undefined).map(f => {
      const value = accessor(f)
      const properties = {
        ...f.properties,
        value,
        percentile: scale(value),
        color: interpolateViridis(scale(value))
      }
      return { ...f, properties }
    })
  }
  return returnVal
}
