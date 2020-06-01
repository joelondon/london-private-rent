import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { InputLabel, MenuItem, FormControl, Select } from '@material-ui/core'

const useStyles = makeStyles(theme => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120
  },
  selectEmpty: {
    marginTop: theme.spacing(2)
  }
}))

function ColourChooser(props) {
  const classes = useStyles()

  return (
    <div>
      <FormControl className={classes.formControl}>
        <InputLabel id="demo-simple-select-label">Colour Chooser</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={props.colour}
          onChange={props.onChange}
        >
          {props.colours.map(entry => (
            <MenuItem key={entry.value} value={entry.value}>
              {entry.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  )
}

export { ColourChooser }
