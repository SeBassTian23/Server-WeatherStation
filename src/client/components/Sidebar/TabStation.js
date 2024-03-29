import React, {useState, useEffect} from 'react'

import Card from 'react-bootstrap/Card'
import TabPane from 'react-bootstrap/TabPane'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
dayjs.extend(localizedFormat);

import {LabelGetUnit} from '../../helpers/label-format'

import { MapContainer, TileLayer, Circle } from 'react-leaflet'

export default function TabStation(props) {

    const [device, setDevice] = useState({
        device_id: "N/A",
        description: "N/A",
        location: {
            lat: 0,
            lng: 0,
            alt: 0,
            elevation_unit: "Altitude [m]",
            timezone: "UTC"
        },
        voltage: "N/A",
        active: false
    });
    const [statistics, setStatistics] = useState({
        measurements: "N/A",
        days: "N/A",
        latest: "N/A",
        start: "N/A",
        size: "N/A"
    });
    const [battery, setBattery] = useState('');

    useEffect( ()=> {
        setStatistics( statistics => {return {...statistics, ...props.statistics}} )
    }, [props.statistics] )

    useEffect( ()=> {
        setDevice( device => {return {...device, ...props.device}})
        if(device.voltage === 'N/A' || !device.active){
            setBattery( <><i className='bi bi-battery' /> N/A</>  );
        }
        else if(device.voltage !== "N/A" & device.voltage > 3.8)
            setBattery(<><i className='bi bi-battery-full' /> {device.voltage} V</>);
        else if(device.voltage !== "N/A" & device.voltage > 3.3)
            setBattery(<><i className='bi bi-battery-half' /> {device.voltage} V</>);
        else
            setBattery(<><i className='bi bi-battery' /> N/A</>);
        
    }, [props.device] )

    return (
        <TabPane eventKey='station' mountOnEnter={true}>
            <Card>
                <Card.Body>
                    <Card.Title className='text-info'>Weather Station <small className='text-muted fw-light'>{device.device_id}</small></Card.Title>
                    <Card.Subtitle className='small fw-light'>
                        <ul className='list-inline mb-0'>
                            <li className='list-inline-item pe-2'>Elevation: {device.location.alt} {LabelGetUnit(device.location.elevation_unit)}</li>
                            <li className='list-inline-item pe-2'>{battery}</li>
                            <li className='list-inline-item'><i className={`${device.active ? 'bi-wifi' : 'bi-wifi-off'}`}></i> {`${device.active ? 'online' : 'offline'}`}</li>
                        </ul>
                    </Card.Subtitle>
                </Card.Body>
                <MapContainer center={[device.location.lat,device.location.lng]} zoom={12} scrollWheelZoom={false} id='mapid' style={{width:"100%", height:"200px", position: "relative", outline: "none" }}>
                    <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" detectRetina={true} crossOrigin={true} />
                    <Circle center={[device.location.lat,device.location.lng]} radius={500} pathOptions={{color:'red', weight: 1, fillColor: '#f03', fillOpacity: 0.5}} />
                </MapContainer>
                <Card.Body>
                    <Card.Subtitle className='mb-2 fw-light'>
                        <i className='bi-info-square' /> {device.description}
                    </Card.Subtitle>
                    <Row xs={2} className='small'>
                        <Col>
                            <strong>Data Sets</strong>
                            <p className='fw-ligher'>{statistics.measurements}</p>
                        </Col>
                        <Col>
                            <strong>Days Recorded</strong>
                            <p className='fw-ligher'>{statistics.days}</p>
                        </Col>
                        <Col>
                            <strong>Latest Entry</strong>
                            <p className='fw-ligher'>{statistics.latest !== "N/A" ? dayjs(statistics.latest).format('L LT'): "N/A"}</p>
                        </Col>
                        <Col>
                            <strong>Start Entry</strong>
                            <p className='fw-ligher'>{statistics.start !== "N/A" ? dayjs(statistics.start).format('L LT'): "N/A"}</p>
                        </Col>
                        <Col>
                            <strong>Timezone</strong>
                            <p className='fw-ligher'>{device.location.timezone}</p>
                        </Col>
                        <Col>
                            <strong>Database Size</strong>
                            <p className='fw-ligher'>{statistics.size}</p>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </TabPane>
    )
}