// For more information on data-driven styles, see https://www.mapbox.com/help/gl-dds-ref/
import * as d3 from 'd3'

const stops = () => {
  const sequentialScale = d3.scaleSequential(d3.interpolateViridis).domain([1,10])
  return sequentialScale.ticks().map((el,i)  => [i,  sequentialScale(el)])
}

export const dataLayer = () => {

  return {
    beforeId: 'Suburban names',
    id: 'data',
    type: 'fill',
    paint: {
      'fill-color': {
        property: 'percentile',
        stops: stops()
      },
      'fill-opacity': 0.8
    }
  }
}

export const highlightLayer = () =>{
  return {
    beforeId: 'Suburban names',
    id: 'highlight',
    type: 'line',
    paint: {

      'line-color': '#fff',
      'line-width': 1,
      'line-opacity': 1
    }
  }
}
