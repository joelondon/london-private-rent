import React, { useRef, useEffect } from 'react'
import * as d3 from 'd3'
import colormap from 'colormap'

export const Boxplot = props => {
  /* The useRef Hook creates a variable that "holds on" to a value across rendering
  passes. In this case it will hold our component's SVG DOM element. It's
  initialized null and React will assign it later (see the return statement) */
  const d3Container = useRef(null)

  const { min, max, data, category, clickedFeature } = props

  /* The useEffect Hook is for running side effects outside of React,
  for instance inserting elements into the DOM using D3 */
  useEffect(
    () => {
      if (data && d3Container.current && clickedFeature) {
        const { properties } = clickedFeature
        const svg = d3.select(d3Container.current)
        const postcode = {}
        postcode.postcodeData = [
          [
            properties[`${category}-pc_lower`],
            properties[`${category}-pc_median`],
            properties[`${category}-pc_upper`]
          ],
          [
            properties[`${category}-borough_lower`],
            properties[`${category}-borough_median`],
            properties[`${category}-borough_upper`]
          ],
          [
            properties[`${category}-london_lower`],
            properties[`${category}-london_median`],
            properties[`${category}-london_upper`]
          ]
        ]
        const height = 100
        const yPos = i => i * 30 + 10
        const textPos = i => yPos(i) + 4
        const margin = { top: 0, right: 32, bottom: 0, left: 0 }
        const xPos = d3
          .scaleLinear()
          .domain([min, max])
          .range([
            margin.left,
            d3Container.current.getBoundingClientRect().width - margin.right
          ])
        const format = d3.format('.2s')
        const xAxis = g =>
          g
            .select('g.xAxis')
            .attr('transform', `translate(0,${height})`)
            .attr('style', `color:white`)
            .call(d3.axisBottom(xPos).tickFormat(d => `£${format(d)}`))
        const reverseTicks = g =>
          g
            .selectAll('.xAxis .tick line')
            .attr('y2', '0')
            .attr('y1', -120)
            .attr('stroke-opacity', 0.5)
            .attr('stroke-dasharray', '2,2')
            .attr('fill', 'white')
        svg.call(xAxis)
        svg.call(reverseTicks)

        const getMedian = geojsonFeature =>
          geojsonFeature.properties[category + '-pc_median']
        const decile = 10
        const medians = data.features
          .map(feature => getMedian(feature))
          .sort((a, b) => a - b)
        const stop = Math.round(medians.length / decile)
        const decileData = () => {
          let deciles = []
          for (let i = 1; i < decile; i = i + 1) {
            deciles.push(medians[i * stop])
          }
          return deciles
        }
        const colorScale = d3
          .scaleSequential()
          .domain([decileData().shift(), decileData().pop()]) // input bounds
          .interpolator(d3.interpolateViridis)

        //         const colorScale = d3
        //           .scaleQuantile()
        //           .domain(medians)
        //           .range(d3.range(0, 1.1, 0.1))

        //         const interpolateViridis =
        //           feature => d3.interpolateViridis//(colorScale(getMedian(feature)))

        const boxEnter = (selection, dataset, className, half) => {
          // LINEAR GRADIENT
          //         const defs = selection.select('defs')
          //         let gradientIdentifier = 'gradientLinear'
          const gradient = selection
            .select('#gradientLinear')
            //           .append('linearGradient')
            //           .attr('id', gradientIdentifier)
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '100%')
            .attr('y2', '0%')
            .attr('gradientUnits', 'userSpaceOnUse')
          //         // first stop on scale
          //         gradient
          //           .append('stop')
          //           .attr('offset', '0%')
          //           .attr('stop-color', '#440154')
          //           .attr('class', 'start')

          selection
            .append('line')
            .attr('stroke-width', `20px`)
            .attr('stroke', `url(#gradientLinear)`)
            .attr('class', className)
            .attr('y1', (dataset, i) => yPos(i))
            .attr('y2', (dataset, i) => yPos(i))
            .transition()
            .attr('x1', dataset =>
              half === 1 ? xPos(dataset[0]) : xPos(dataset[2])
            )
            .attr('x2', dataset =>
              half === 1 ? xPos(dataset[1]) - 0.25 : xPos(dataset[1]) + 0.25
            )

          if (half === 2) {
            selection
              .append('text')
              .text((d, i) => {
                switch (i) {
                  case 0:
                    return properties.district
                  case 1:
                    return properties.borough
                  default:
                    return 'London'
                }
              })
              .attr('class', 'boxLabel')
              .attr('x', d => xPos(d[2]) + 2)
              .attr('y', (d, i) => textPos(i))
              .style('text-anchor', 'start')
              .style('fill', 'white')
          }

          return selection
        }

        const boxUpdate = (selection, dataset, half) => {
          // could be log
          selection
            .transition()
            .attr('x1', dataset =>
              half === 1 ? xPos(dataset[0]) : xPos(dataset[2])
            )
            .attr('x2', dataset =>
              half === 1 ? xPos(dataset[1]) - 0.25 : xPos(dataset[1]) + 0.25
            )

          if (half === 2) {
            svg
              .selectAll('text.boxLabel')
              .transition()
              .attr('x', (d, i) => {
                if (dataset[i][1] > max / 2) {
                  return xPos(dataset[i][0] - 2)
                } else {
                  return xPos(dataset[i][2] + 2)
                }
              })
              .style('text-anchor', (d, i) => {
                if (dataset[i][1] > max / 2) {
                  return 'end'
                } else {
                  return 'start'
                }
              })
              .text((d, i) => {
                switch (i) {
                  case 0:
                    return properties.district
                  case 1:
                    return properties.borough
                  default:
                    return 'London'
                }
              })
          }

          return selection
        }

        const boxes = (className, half) => {
          svg
            .selectAll('line.' + className, 'text')
            .data(postcode.postcodeData)
            .join(
              enter => {
                enter.call(boxEnter, postcode.postcodeData, className, half)
              },
              update => {
                update.call(boxUpdate, postcode.postcodeData, half)
              },
              exit => exit.remove()
            )
        }
        boxes('left', 1)
        boxes('right', 2)

        const gradients = () => {
          svg
            .select('#gradientLinear')
            .selectAll('stop')
            .data(decileData())
            .join(
              enter => {
                enter
                  .append('stop')
                  .attr(
                    'offset',
                    d =>
                      (xPos(d) /
                        d3Container.current.getBoundingClientRect().width) *
                        100 +
                      '%'
                  )
                  .attr('stop-color', d => colorScale(d))
              },
              update => {
                update
                  .attr(
                    'offset',
                    d =>
                      (xPos(d) /
                        d3Container.current.getBoundingClientRect().width) *
                        100 +
                      '%'
                  )
                  .attr('stop-color', d => colorScale(d))
              },
              exit => exit.remove()
            )
        }
        gradients()
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
      clickedFeature
    ]
  )

  const style = {
    width: '100%',
    margin: '0 1em',
    height: 'auto',
    overflow: 'visible',
    position: 'relative'
  }
  return (
    <svg style={style} ref={d3Container}>
      <g className="xAxis" />
      <defs>
        <linearGradient id="gradientLinear" />
      </defs>
    </svg>
  )
}
