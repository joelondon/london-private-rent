// For more information on data-driven styles, see https://www.mapbox.com/help/gl-dds-ref/
import colormap from 'colormap'

// eslint-disable-next-line
const viridis = colormap({
  colormap: 'viridis',
  nshades: 10
}).map((el,i)=>[i, el])

export const dataLayer = scheme=>{
  return {
    beforeId: 'Suburban names',
    id: 'data',
    type: 'fill',
    paint: {
      'fill-color': {
        property: 'percentile',
        stops: eval(scheme)// eslint-disable-line
      },
      'fill-opacity': 0.8
    }
  }
}
export const highlightLayer = scheme=>{
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
