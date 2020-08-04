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
      'line-opacity': 1 // ['case', ['boolean', ['feature-state', 'hover'], false], 1, 0.5]
      //       'fill-extrusion-color': {
      //         property: 'percentile',
      //         stops: eval(scheme) // eslint-disable-line
      //       },
      //       'fill-extrusion-height': 
      //       {
      //         property: 'percentile',
      //         stops:  [[0,500],[1,1000],[2,1500],[3,2000],[4,2500],[5,3000],[6,4000],[7,4500],[8,5000],[9, 5500]] // eslint-disable-line
      //       }
    }
  }
}
