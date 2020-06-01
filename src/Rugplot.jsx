import React, { useRef, useState, useEffect } from 'react'
import * as d3 from 'd3'
import colormap from 'colormap'

export const Rugplot = props => {
  /* The useRef Hook creates a variable that "holds on" to a value across rendering
  passes. In this case it will hold our component's SVG DOM element. It's
  initialized null and React will assign it later (see the return statement) */
  const d3Container = useRef(null)

  const {
    data,
    category,
    hoveredFeature,
    setHoveredFeature,
    setClickedFeature
  } = props

  /* The useEffect Hook is for running side effects outside of React,
  for instance inserting elements into the DOM using D3 */
  useEffect(
    () => {
      if (data && d3Container.current) {

        // HELPER for acessing geojson properties
        const getMedian = geojsonFeature =>
          geojsonFeature.properties[category + '-pc_median']

        const features = data.features.filter(el => getMedian(el) !== undefined)

        const svg = d3.select(d3Container.current)

        const xQuantile = d3
          .scaleQuantile()
          .domain(features.map(el => getMedian(el)))
          .range(d3.range(10))
        const viridis = colormap({ colormap: 'viridis', nshades: 10 }).map(
          (el, i) => [i, el]
        )

        const margin = { top: 0, right: 32, bottom: 0, left: 0 }

        svg.selectAll('rect').data(features)

        const xPos = d3
          .scaleLinear()
          .domain([
            Math.min(
              ...data.features
                .map(el => el.properties[category + '-pc_lower'])
                .filter(el => el !== undefined)
            ),
            Math.max(
              ...data.features
                .map(el => el.properties[category + '-pc_upper'])
                .filter(el => el !== undefined)
            )
          ])
          .range([margin.left, d3Container.current.getBoundingClientRect().width - margin.right])

        const callout = (g, value) => {
          if (!value) return g.style('display', 'none')

          g.style('display', null)
            .style('pointer-events', 'none')
            .style('font', '10px sans-serif')

          const path = g
            .selectAll('path')
            .data([null])
            .join('path')
            .attr('fill', 'white')

          const text = g
            .selectAll('text')
            .data([null])
            .join('text')
            .call(text =>
              text
                .selectAll('tspan')
                .data((value + '').split(/\n/))
                .join('tspan')
                .attr('x', 0)
                .attr('y', (d, i) => `${i * 1.1}em`)
                .style('font-weight', (_, i) => (i ? null : 'bold'))
                .text(d => d)
            )

          const { y, width: w, height: h } = text.node().getBBox()

          text.attr('transform', `translate(${-w / 2},${y * 2})`)
          path.attr(
            'd',
            `M${-w / 2 - 10},5H-5l5,5l5,-5H${w / 2 + 10}v-${h + 20}h-${w + 20}z`
          )
          path.attr('transform', `translate(0,${y * 1.1})`)
        }

        svg
          .selectAll('rect')
          .data(features)
          .join(
            enter => {
              enter
                .append('rect')
                .attr(
                  'fill',
                  feature => viridis[xQuantile(getMedian(feature))][1]
                )
                .attr('fill-opacity', 0.5)
                .attr('x', feature => xPos(getMedian(feature)))
                .attr('width', feature => 2)
                .attr('y', feature => (feature.length !== 0 ? 0 : 0))
                .attr('height', 20)
            },
            update => {
              update
                .transition()
                .attr('x', feature => xPos(getMedian(feature)))
                .attr(
                  'fill',
                  feature => viridis[xQuantile(getMedian(feature))][1]
                )
            },
            exit => exit.remove()
          )

        const format = d3.format('.2s')

        const xAxis = svg =>
          svg
            .select('g#axis')
            .attr('transform', `translate(0,20)`)
            .attr('style', `color:white`)
            .call(d3.axisBottom(xPos).tickFormat(d => `£${format(d)}`))
        svg.call(xAxis)

        const tooltip = svg.select('g#tooltip')

        svg
          .selectAll('rect')
          .on('touchmove mousemove', feature => {
            tooltip
              .attr('transform', `translate(${xPos(getMedian(feature))},0)`)
              .call(callout, feature.properties['district'])
            setHoveredFeature(feature)
          })
          .on('touchend mouseleave', () => tooltip.call(callout, null))
          .on('click', feature => setClickedFeature(feature))

        if (hoveredFeature) {
          tooltip.call(callout, null)
          tooltip
            .attr(
              'transform',
              `translate(${xPos(getMedian(hoveredFeature))},0)`
            )
            .call(callout, hoveredFeature.properties['district'])
        }
      }
    },
    /*
    useEffect has a dependency array (below). It's a list of dependency
    variables for this useEffect block. The block will run after mount
    and whenever any of these variables change. We still have to check
    if the variables are valid, but we do not have to compare old props
    to next props to decide whether to rerender.
  */ [
      data,
      category,
      hoveredFeature,
      setHoveredFeature
    ]
  )

  const style = {
    width: '100%',
    margin: '0 1em',
    height: '38px',
    overflow: 'visible',
    position: 'relative'
  }
  return (
    <svg style={style} ref={d3Container}>
      <g id="tooltip" />
      <g id="axis" />
    </svg>
  )
}
