import React, { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

const styles = {
  width: '100vw',
  height: 'calc(100vh - 80px)',
  position: 'absolute'
}

export const Mapbox = () => {
  const [map, setMap] = useState(null)
  const mapContainer = useRef(null)

  useEffect(() => {
    mapboxgl.accessToken =
      'pk.eyJ1IjoiYnJpYW5iYW5jcm9mdCIsImEiOiJsVGVnMXFzIn0.7ldhVh3Ppsgv4lCYs65UdA'
    const initializeMap = ({ setMap, mapContainer }) => {
      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
        center: [-0.01, 51.49],
        zoom: 9
      })

      map.on('load', () => {
        setMap(map)
        map.resize()

        map.addSource('rents', {
          type: 'geojson',
          data:
            'https://cors-anywhere.herokuapp.com/https://gist.github.com/joelondon/6068ee3ac8ad7184d6194840f38ebb0a/raw/d934812ccdcced7ddebf3eecd182181fd1a3d903/rents.json'
        })
        map.addLayer({
          id: 'rents',
          type: 'fill',
          source: 'rents',
          layout: {},
          paint: {
            'fill-color': '#088',
            'fill-opacity': 0.8
          }
        })
      })
    }

    if (!map) initializeMap({ setMap, mapContainer })
  }, [map])

  return <div ref={el => (mapContainer.current = el)} style={styles} />
}
