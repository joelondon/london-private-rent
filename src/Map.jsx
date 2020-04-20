import React, { useState, useEffect } from 'react'
import MapGL, {
  Source,
  Layer,
  NavigationControl,
  FlyToInterpolator
} from 'react-map-gl'
import { easeCubic } from 'd3'
import MatGeocoder from 'react-mui-mapbox-geocoder'
import { dataLayer, highlightLayer } from './map-style'
import 'mapbox-gl/dist/mapbox-gl.css'
import { updatePercentiles } from './utils'

const MAPBOX_TOKEN =
  'pk.eyJ1IjoiaHAtbnVuZXMiLCJhIjoiY2pqNHAxaHIxMDA3aTNrbW15OGx2NW4ybiJ9.pHzT2FAtpO-Xhnc3PzJsFA'

export const Map = props => {
  const {
    category,
    data,
    setData,
    hoveredFeature,
    setHoveredFeature,
    clickedFeature,
    setClickedFeature,
    budgetRange
  } = props
  const [viewport, setViewport] = useState({
    latitude: 51.49,
    longitude: 0,
    zoom: 8,
    bearing: 0,
    pitch: 10
  })
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

  const geocoderApiOptions = {
    country: 'gb',
    proximity: { longitude: 0, latitude: 51.49 },
    bbox: [-0.489, 51.28, 0.236, 51.686]
  }

  const _handleGeocoderSelect = result => {
    const newViewport = {
      ...viewport,
      longitude: result.center[0],
      latitude: result.center[1],
      zoom: 10,
      transitionDuration: 400,
      transitionInterpolator: new FlyToInterpolator(),
      transitionEasing: easeCubic
    }
    _onViewportChange(newViewport)
  }

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

  const _onViewportChange = viewport => setViewport(viewport)

  const _onHover = event => {
    const {
      features,
      srcEvent: { offsetX, offsetY }
    } = event
    const hoveredArea = features && features.find(f => f.layer.id === 'data')

    if (hoveredArea !== null && hoveredArea !== undefined) {
      if (
        hoveredFeature &&
        hoveredFeature.properties.district !== hoveredArea.properties.district
      )
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
    <div>
      <div className="geocoder">
        <MatGeocoder
          inputPlaceholder="Search"
          accessToken={MAPBOX_TOKEN}
          onSelect={result => _handleGeocoderSelect(result)}
          showLoader={true}
          {...geocoderApiOptions}
        />
      </div>

      <div style={{ height: '100%' }}>
        <MapGL
          {...viewport}
          category={props.category}
          width="100vw"
          height="40vh"
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
    </div>
  )
}
