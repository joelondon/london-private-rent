import React, { useState, useEffect, useRef } from 'react'
import { Map } from './Map'
import { Mapbox } from  './Mapbox'
import { CategoryChooser } from './CategoryChooser'
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles'
import { RangeSlider } from './RangeSlider'
import { Rugplot } from './Rugplot'
import { Boxplot } from './Boxplot'
import { EnhancedTable } from './EnhancedTable'
import {
  useMediaQuery,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  InputBase
} from '@material-ui/core'
import { fade, makeStyles } from '@material-ui/core/styles'
import MenuIcon from '@material-ui/icons/Menu'
import SearchIcon from '@material-ui/icons/Search'
import MapGL, {
  Source,
  Layer,
  NavigationControl,
  FlyToInterpolator,
  WebMercatorViewport
} from 'react-map-gl'
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

export default () => {
  const [category, setCategory] = useState('Room')
  const [colour, setColour] = useState('viridis')
  const [priceRange, setPriceRange] = useState([0, 1])
  const [budgetRange, setBudgetRange] = useState([0, 1])

  const [data, setData] = useState(null)
  const [hoveredFeature, setHoveredFeature] = useState(null)
  const [clickedFeature, setClickedFeature] = useState(null)

  const categories = ['Room', 'Studio', '1 Bed', '2 Bed', '3 Bed', '4+ Bed']

  const [viewport, setViewport] = useState(
    new WebMercatorViewport({
      width: 800,
      height: 600,
      latitude: 51.49,
      longitude: 0,
      zoom: 8,
      bearing: 0,
      pitch: 40
    })
  )

  const _onViewportChange = viewport => setViewport(viewport)

  const _handleGeocoderSelect = result => {
    const newViewport = {
      ...viewport,
      longitude: result.center[0],
      latitude: result.center[1],
      zoom: 14,
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
      setPriceRange([min, max])
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
    },
    menuButton: {
      marginRight: theme.spacing(2)
    },
    title: {
      flexGrow: 1,
      display: 'none',
      [theme.breakpoints.up('sm')]: {
        display: 'block'
      }
    },
    search: {
      position: 'relative',
      borderRadius: theme.shape.borderRadius,
      backgroundColor: fade(theme.palette.common.white, 0.15),
      '&:hover': {
        backgroundColor: fade(theme.palette.common.white, 0.25)
      },
      marginLeft: 0,
      width: '100%',
      [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(1),
        width: 'auto'
      }
    },
    searchIcon: {
      padding: theme.spacing(0, 2),
      height: '100%',
      position: 'absolute',
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    inputRoot: {
      color: 'inherit'
    },
    inputInput: {
      padding: theme.spacing(1, 1, 1, 0),
      // vertical padding + font size from searchIcon
      paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
      transition: theme.transitions.create('width'),
      width: '100%',
      [theme.breakpoints.up('sm')]: {
        width: '12ch',
        '&:focus': {
          width: '20ch'
        }
      }
    }
  }))

  const classes = useStyles()

  return (
    <ThemeProvider theme={theme}>
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
        colour={colour}
        setColour={setColour}
        budgetRange={budgetRange}
        width="100%"
      />
      
      <div id="panel" style={{position:"absolute", top:0, right:0, width: "50vw", height:"100vh", overflowX: "visible", overflowY: "scroll"}}>
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
//           width={document.querySelector('#root').offsetWidth / 2}
          category={category}
        />

        <Boxplot
          min={priceRange[0]}
          max={priceRange[1]}
          data={data}
          clickedFeature={clickedFeature}
          category={category}
        />
        <EnhancedTable data={data} category={category} />
      </div>
    </ThemeProvider>
  )
}
