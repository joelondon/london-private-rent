import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Typography, Slider } from '@material-ui/core'

const useStyles = makeStyles(theme => ({
  root: {
    'text-align': 'center',
    margin: '1em 1em',
    color: theme.palette.action.active
  },
  pad: {
    padding: '2em 0 0'
  }
}))

function valuetext(value) {
  return `${value}`
}

export const RangeSlider = props => {
  const classes = useStyles(props.theme)

  const handleChange = (event, newValue) => {
    props.onChange(newValue)
  }

  return (
    <div className={classes.root}>
      <Slider
        style={{ padding: '3rem 0 0' }}
        value={props.value}
        onChange={handleChange}
        valueLabelDisplay="on"
        aria-labelledby="range-slider"
        getAriaValueText={valuetext}
        min={props.min}
        step={10}
        max={props.max}
      />
      <Typography id="range-slider" variant="button" gutterBottom>
        {props.title}
      </Typography>
    </div>
  )
}
