import grey from '@material-ui/core/colors/grey'

const theme = {
  palette: {
    type: 'dark',
    background: {
      paper: grey[900],
      default: grey[900]
    },
    primary: { dark: '#50E98D', main: '#50E98D' },
    secondary: { dark: '#50E98D', main: '#50E98D' },
    text: {
      primary: '#ffffff',
      secondary: '#ffffff',
      disabled: '#ffffff',
      hint: '#ffffff'
    }
  },
  typography: {
    fontWeightLight: 400,
    fontWeightRegular: 500,
    fontWeightMedium: 600,
    useNextVariants: true,
    // Use the system font instead of the default Roboto font.
    fontFamily: "'IBM Plex Mono', monospace",
    h1: {
      fontFamily: 'Poppins'
    },
    h2: {
      fontFamily: 'Poppins'
    }
  },
  breakpoints: [576, 768, 992, 1200, 1540],
  gutter: 20,
  overrides: {
    MuiFormControl: {
      root: {
        marginBottom: '40px'
      }
    },
    MuiInput: {
      root: {
        lineHeight: '24px'
      }
    },
    MuiInputLabel: {
      shrink: {
        transform: 'translateY(0)',
        position: 'relative'
      }
    },
    MuiFormLabel: {
      root: {
        fontSize: 16,
        fontWeight: 500
      }
    },
    MuiRadio: {
      root: {
        paddingTop: 0,
        paddingBottom: 0
      }
    },
    MuiFormGroup: {
      root: {
        marginTop: 24
      }
    },
    MuiButton: {
      root: {
        paddingLeft: 24,
        paddingRight: 24
      },
      label: {
        fontFamily: "'IBM Plex Mono', monospace"
      }
    }
  }
}

export default theme
