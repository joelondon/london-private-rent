import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Slider from '@material-ui/core/Slider'

const useStyles = makeStyles(theme => ({
  root: {
    width: '80vw',
    'text-align': 'center',
    margin: '1em auto',
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
