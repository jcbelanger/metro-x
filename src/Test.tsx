import {
    Button, 
    Typography, 
    Paper,
    FormControlLabel,
    FormControl,
    FormLabel,
    RadioGroup,
    Radio,
    Grid,
    Box,
    Avatar
} from '@mui/material';
import DirectionsTransitSharpIcon from '@mui/icons-material/DirectionsTransitSharp';


export default function Test() {
    return <>
        <Grid container component="main" sx={{ height: '100svh' }}>
            <Grid item xs={false} sm={4} md={7} 
                sx={{
                    backgroundImage: 'url(https://source.unsplash.com/random?subway,metro,underground)',
                    backgroundRepeat: 'no-repeat',
                    backgroundColor: (t) => t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    justifyContent: 'center',
                    height: '100%'
                }}
            >
                <Paper square
                    sx={{
                        my: 9,
                        mx: 0,
                        display: 'flex',
                        flexWrap: 'nowrap',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backdropFilter: 'blur(7px)',
                        background: 'rgba(16, 20, 24, 0.6)',
                        color: (t) => t.palette.grey[50]
                    }}
                >
                    <Typography component="h1" noWrap
                        sx={{
                            display: {
                                xs: 'none',
                                sm: 'block'
                            },
                            typography: {
                                sm: "h5",
                                md: "h2"
                            }
                        }}>
                        Metro X
                    </Typography>
                </Paper>
            </Grid>

            <Grid item xs={12} sm={8} md={5} component={Paper} elevation={8} square>
                <Box
                    sx={{
                    my: 8,
                    mx: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    }}
                >
                    <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                        <DirectionsTransitSharpIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">New Game</Typography>
                    
                    <FormControl variant="filled">
                        <FormLabel id="map-group-label">Map</FormLabel>
                        <RadioGroup
                            row
                            aria-labelledby="map-group-label"
                            defaultValue="metro-city"
                            name="map"
                        >
                            <FormControlLabel 
                                label="Metro City"
                                value="metro-city"
                                control={<Radio />}
                            />
                            <FormControlLabel
                                label="Tube Town"
                                value="tube-town"
                                control={<Radio />}
                            />
                        </RadioGroup>
                    </FormControl>

                    <FormControl>
                        <FormLabel id="players-group-label">Players</FormLabel>
                    </FormControl>

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ 
                            mt: 3, 
                            mb: 2
                        }}
                    >
                        Play
                    </Button>
                </Box>
            </Grid>
        </Grid>
    </>;
}
  