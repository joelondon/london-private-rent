import React, { useState, useEffect } from 'react'
import MapGL, {
  Source,
  Layer,
  NavigationControl,
  FlyToInterpolator
} from 'react-map-gl'
import { easeCubic } from 'd3'
import { dataLayer, highlightLayer } from './map-style'
import 'mapbox-gl/dist/mapbox-gl.css'
import { updatePercentiles } from './utils'

const MAPBOX_TOKEN =
  'pk.eyJ1IjoiaHAtbnVuZXMiLCJhIjoiY2pqNHAxaHIxMDA3aTNrbW15OGx2NW4ybiJ9.pHzT2FAtpO-Xhnc3PzJsFA'

export const Map = props => {
  const {
    viewport,
    setViewport,
    category,
    data,
    setData,
    hoveredFeature,
    setHoveredFeature,
    clickedFeature,
    setClickedFeature,
    budgetRange
  } = props
  const [x, setX] = useState(null)
  const [y, setY] = useState(null)
  const [mapboxFilterBudgetRange, setMapboxFilterBudgetRange] = useState(null)

  const [filterHighlight, setFilterHighlight] = useState(['in', 'district', ''])

  useEffect(() => {
    if (budgetRange !== null)
      setMapboxFilterBudgetRange([
        'all',
        ['>=', category + '-pc_median', budgetRange[0]],
        ['<=', category + '-pc_median', budgetRange[1]]
      ])
  }, [budgetRange, category])

  const _onViewportChange = viewport => setViewport(viewport)

  // FOR KEYBOARD USERS: HIGHLIGHT MAP WHEN TABBED TO, RUN THIS EFFECT ONCE ONLY
  useEffect(() => {
    const input = document.querySelector('.mapboxgl-canvas')
    const inputParent = input.parentNode.parentNode.parentNode.parentNode
    input.onblur = inputBlur
    input.onfocus = inputFocus
    inputParent.tabIndex = -1

    function inputBlur() {
      document.querySelector('.overlays').style.boxShadow = ''
      document.querySelector('#root').style.overflow = 'scroll'
    }

    function inputFocus() {
      document.querySelector('.overlays').style.boxShadow =
        'inset 0 0 2px 2px #0096ff'
      document.querySelector('#root').style.overflow = 'hidden'
    }
  }, []) // empty dep array = run once

  useEffect(() => {
    setData(updatePercentiles(f => f.properties[category + '-pc_median']))
  }, [category]) // eslint-disable-line

  useEffect(() => {
    if (hoveredFeature !== null && hoveredFeature !== undefined) {
      setFilterHighlight(['in', 'district', hoveredFeature.properties.district])
    }
  }, [hoveredFeature]) // eslint-disable-line

  const _onHover = event => {
    const {
      features,
      srcEvent: { offsetX, offsetY }
    } = event
    const hoveredArea = features && features.find(f => f.layer.id === 'data')

    if (hoveredArea !== null && hoveredArea !== undefined) {
      setHoveredFeature(hoveredArea)
    }

    setX(offsetX)
    setY(offsetY)
  }

  const _onClick = event => {
    const {
      features,
      srcEvent: { offsetX, offsetY }
    } = event
    const clickedFeature = features && features.find(f => f.layer.id === 'data')
    setClickedFeature(clickedFeature)
    setX(offsetX)
    setY(offsetY)
  }

  return (
    <div style={{ height: '100%' }}>
      <MapGL
        {...viewport}
        category={props.category}
        width="100vw"
        height="100vh"
        mapStyle="./os_night-no-label.json"
        onViewportChange={_onViewportChange}
        mapboxApiAccessToken={MAPBOX_TOKEN}
        onHover={_onHover}
        onClick={_onClick}
        scrollZoom={false}
      >
        <div style={{ position: 'absolute', right: '1rem', bottom: '1rem' }}>
          <NavigationControl showCompass={false} />
        </div>
        <Source type="geojson" data={data}>
          <Layer
            {...dataLayer(props.colour)}
            filter={mapboxFilterBudgetRange}
          />
          <Layer {...highlightLayer(props.colour)} filter={filterHighlight} />
        </Source>
      </MapGL>
    </div>
  )
}
