import React, { useState, useEffect } from 'react'
import { Map } from './Map'
import { CategoryChooser } from './CategoryChooser'
import {
  makeStyles,
  createMuiTheme,
  ThemeProvider
} from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import { RangeSlider } from './RangeSlider'
import { Rugplot } from './Rugplot'
import { Boxplot } from './Boxplot'
import { EnhancedTable } from './EnhancedTable'
import { useMediaQuery } from '@material-ui/core'
import { FlyToInterpolator, WebMercatorViewport } from 'react-map-gl'
import { easeCubic } from 'd3'
import MatGeocoder from 'react-mui-mapbox-geocoder'

// import whyDidYouRender from '@welldone-software/why-did-you-render'

// whyDidYouRender(React, {
//   onlyLogs: true,
//   titleColor: 'green',
//   diffNameColor: 'darkturquoise'
// })

// Rugplot.whyDidYouRender = true
// Map.whyDidYouRender = true

const MAPBOX_TOKEN =
  'pk.eyJ1IjoiaHAtbnVuZXMiLCJhIjoiY2pqNHAxaHIxMDA3aTNrbW15OGx2NW4ybiJ9.pHzT2FAtpO-Xhnc3PzJsFA'

const geocoderApiOptions = {
  country: 'gb',
  proximity: { longitude: 0, latitude: 51.49 },
  bbox: [-0.489, 51.28, 0.236, 51.686]
}

export default props => {
  const { width, height } = props
  const [category, setCategory] = useState('3 Bed')
  const [colourScheme, setColourScheme] = useState('viridis')
  const [priceRange, setPriceRange] = useState([0, 1])
  const [budgetRange, setBudgetRange] = useState([0, 1])

  const [data, setData] = useState(null)
  const [hoveredFeature, setHoveredFeature] = useState(null)
  const [clickedFeature, setClickedFeature] = useState(null)

  const categories = ['Room', 'Studio', '1 Bed', '2 Bed', '3 Bed', '4+ Bed']

  const [viewport, setViewport] = useState(
    new WebMercatorViewport({
      width: width / 2 - 40,
      height: height,
      latitude: 51.49,
      longitude: -0.1,
      zoom: 8,
      bearing: 0,
      pitch: 0
    })
  )

  const _onViewportChange = viewport => setViewport(viewport)

  const _handleGeocoderSelect = result => {
    let feature
    if (result.id.indexOf('postcode') !== -1) {
      feature = data.features.filter(
        f => f.properties.district === result.text.split(' ').shift()
      )[0]
    } else {
      const matchingPostcodes = result.context.filter(
        res => res.id.indexOf('postcode') !== -1
      )
      if (matchingPostcodes.length > 0) {
        feature = data.features.filter(
          f =>
            f.properties.district ===
            matchingPostcodes[0].text.split(' ').shift()
        )[0]
      }
    }
    if (feature) {
      setHoveredFeature(feature)
      setClickedFeature(feature)
    }
    const newViewport = {
      ...viewport,
      longitude: result.center[0],
      latitude: result.center[1],
      zoom: 11,
      transitionDuration: 400,
      transitionInterpolator: new FlyToInterpolator(),
      transitionEasing: easeCubic
    }
    _onViewportChange(newViewport)
  }

  const _fitLondonBounds = () => {
    const [minLng, minLat, maxLng, maxLat] = [-0.489, 51.28, 0.236, 51.686]
    const { longitude, latitude, zoom } = viewport.fitBounds(
      [[minLng, minLat], [maxLng, maxLat]],
      {
        padding: 40
      }
    )
    const newViewport = {
      ...viewport,
      longitude: longitude,
      latitude: latitude,
      zoom: zoom,
      transitionDuration: 400,
      transitionInterpolator: new FlyToInterpolator(),
      transitionEasing: easeCubic
    }
    _onViewportChange(newViewport)
  }

  useEffect(() => {
    _fitLondonBounds()
  }, [])

  useEffect(() => {
    if (data) {
      const mins = data.features
        .map(el => el.properties[category + '-pc_lower'])
        .filter(el => el !== undefined)
      const maxs = data.features
        .map(el => el.properties[category + '-pc_upper'])
        .filter(el => el !== undefined)
      const min = Math.min(...mins)
      const max = Math.max(...maxs)
      // possible lowest/highest
      setPriceRange([min, max])
      // user lowest/highest
      setBudgetRange([min, max])
    }
  }, [data, category])

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
  const theme = React.useMemo(
    () =>
      createMuiTheme({
        palette: {
          type: prefersDarkMode ? 'dark' : 'light'
        }
      }),
    [prefersDarkMode]
  )

  const useStyles = makeStyles(theme => ({
    root: {
      flexGrow: 1
    }
  }))
  const classes = useStyles()

  return (
    <ThemeProvider theme={theme}>
      <div className={classes.root}>
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <Map
              viewport={viewport}
              setViewport={setViewport}
              data={data}
              setData={setData}
              hoveredFeature={hoveredFeature}
              setHoveredFeature={setHoveredFeature}
              clickedFeature={clickedFeature}
              setClickedFeature={setClickedFeature}
              category={category}
              colourScheme={colourScheme}
              setColourScheme={setColourScheme}
              budgetRange={budgetRange}
            />
          </Grid>
          <Grid item xs={6}>
            <div>
              <MatGeocoder
                inputPlaceholder="Search"
                accessToken={MAPBOX_TOKEN}
                onSelect={result => _handleGeocoderSelect(result)}
                showLoader={true}
                {...geocoderApiOptions}
              />

              <CategoryChooser
                categories={categories}
                category={category}
                setCategory={setCategory}
              />

              <RangeSlider
                title="Price range"
                value={budgetRange}
                theme={theme}
                min={priceRange[0]}
                max={priceRange[1]}
                onChange={setBudgetRange}
              />

              <Rugplot
                data={data}
                hoveredFeature={hoveredFeature}
                setHoveredFeature={setHoveredFeature}
                setClickedFeature={setClickedFeature}
                category={category}
              />

              <Boxplot
                min={priceRange[0]}
                max={priceRange[1]}
                data={data}
                clickedFeature={clickedFeature}
                category={category}
              />
              <EnhancedTable
                clickedFeature={clickedFeature}
                data={data}
                category={category}
              />
            </div>
          </Grid>
        </Grid>
      </div>
    </ThemeProvider>
  )
}
