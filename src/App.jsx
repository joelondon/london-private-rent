import React, { useState, useEffect } from 'react'
import { Map } from './Map'
import { CategoryChooser } from './CategoryChooser'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles'
import { RangeSlider } from './RangeSlider'
import { Rugplot } from './Rugplot'
import { Boxplot } from './Boxplot'

// import whyDidYouRender from '@welldone-software/why-did-you-render'

// whyDidYouRender(React, {
//   onlyLogs: true,
//   titleColor: 'green',
//   diffNameColor: 'darkturquoise'
// })

// Rugplot.whyDidYouRender = true
// Map.whyDidYouRender = true

export default () => {
  const [category, setCategory] = useState('Room')
  const [colour, setColour] = useState('viridis')
  const [priceRange, setPriceRange] = useState([0, 1])
  const [budgetRange, setBudgetRange] = useState([0, 1])

  const [data, setData] = useState(null)
  const [hoveredFeature, setHoveredFeature] = useState(null)
  const [clickedFeature, setClickedFeature] = useState(null)

  const categories = ['Room', 'Studio', '1 Bed', '2 Bed', '3 Bed', '4+ Bed']

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

  return (
    <ThemeProvider theme={theme}>
      <CategoryChooser
        categories={categories}
        category={category}
        setCategory={setCategory}
      />
      <div>
        <Map
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
        />
      </div>
      <div>
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
          width={document.querySelector('#root').offsetWidth * 0.8}
          category={category}
        />
        <Boxplot
          min={priceRange[0]}
          max={priceRange[1]}
          data={data}
          clickedFeature={clickedFeature}
          width={document.querySelector('#root').offsetWidth * 0.8}
          category={category}
        />
      </div>
    </ThemeProvider>
  )
}
