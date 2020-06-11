// For more information on data-driven styles, see https://www.mapbox.com/help/gl-dds-ref/
import colormap from 'colormap'

// eslint-disable-next-line
const viridis = colormap({ colormap: 'viridis', nshades: 10 }).map((el, i) => [
  i,
  el
])

export const dataLayer = scheme => {
  return {
    beforeId: 'Suburban names',
    id: 'data',
    type: 'fill',
    paint: {
//       'fill-outline-color': 'rgba(255, 255, 255, .1)', // CAUSES ARTIFACTS
      'fill-color': {
        property: 'percentile',
        stops: eval(scheme) // eslint-disable-line
      },
      'fill-opacity': 0.8
    }
  }
}
export const highlightLayer = scheme => {
  return {
    beforeId: 'Suburban names',
    id: 'highlight',
    type: 'line',
    paint: {
      'line-color': '#fff',
      'line-width': 3,
      'line-opacity': [
      'case',
      ['boolean', ['feature-state', 'hover'], false],
      1,
      0.5]
    }
  }
}
