import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import ToggleButton from '@material-ui/lab/ToggleButton'
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup'
import { Grid, Typography } from '@material-ui/core'

const useStyles = makeStyles(theme => ({
  toggleContainer: {
    margin: theme.spacing(2, 0),
    'text-align': 'center',
    color: theme.palette.action.active
  }
}))

export const CategoryChooser = props => {
  const classes = useStyles()

  return (
    <Grid item xs={12} sm={12} md={12}>
      <div className={classes.toggleContainer}>
        <Typography
          id="range-label"
          variant="button"
          display="block"
          gutterBottom
        >
          Number of rooms
        </Typography>
        <ToggleButtonGroup
          aria-labelledby="range-label"
          value={props.category}
          exclusive
          onChange={(event, val) => props.setCategory(val)}
          aria-label="text alignment"
        >
          {props.categories.map((cat, i) => (
            <ToggleButton key={i} value={cat} name={cat}>
              {cat}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </div>
    </Grid>
  )
}
